import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8082;
const DATA_DIR = path.join(__dirname, "../.data");
const DATA_FILE = path.join(DATA_DIR, "deliveries.json");
const BAK_FILE = path.join(DATA_DIR, "deliveries.json.bak");
const TMP_FILE = path.join(DATA_DIR, "deliveries.json.tmp");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-communication-engine", timestamp: new Date().toISOString() });
});

export type DeliveryState = "CREATED" | "QUEUED" | "ATTEMPTED" | "FAILED_RETRYABLE" | "RETRY_SCHEDULED" | "FAILED_FINAL" | "ESCALATION_REQUIRED" | "SENT" | "DELIVERED" | "ACKNOWLEDGED";

export interface DeliveryAttempt {
  attemptNumber: number;
  attemptId: string;
  state: DeliveryState;
  timestamp: string;
  errorReason?: string;
}

export interface TransportDeliveryRecord {
  deliveryId: string;
  incidentId: string;
  recipient: string;
  selectedTransport: string;
  deliveryState: DeliveryState;
  attemptsCount: number;
  maxAttempts: number;
  correlationId?: string;
  updatedAt: string;
  attempts: DeliveryAttempt[];
}

interface TransportStatus {
  internetAvailable: boolean;
  cellularSignalBars: number;
  blePeersDetected: number;
  wifiDirectPeers: number;
}

function determineOptimalTransport(status: TransportStatus): string {
  if (status.internetAvailable && status.cellularSignalBars > 1) {
    return "INTERNET_ENCRYPTED_CLOUD";
  }
  if (status.cellularSignalBars > 0) {
    return "CELLULAR_DATA_PAYLOAD";
  }
  if (status.blePeersDetected > 0) {
    return "BLE_MESH_PEER_RELAY";
  }
  if (status.wifiDirectPeers > 0) {
    return "WIFI_DIRECT_PEER_RELAY";
  }
  return "SMS_FALLBACK_PAYLOAD";
}

function safeWriteDeliveries(store: Map<string, TransportDeliveryRecord>) {
  try {
    const list = Array.from(store.values());
    const jsonStr = JSON.stringify(list, null, 2);

    fs.writeFileSync(TMP_FILE, jsonStr, "utf-8");
    fs.renameSync(TMP_FILE, DATA_FILE);
    fs.copyFileSync(DATA_FILE, BAK_FILE);
  } catch (err: any) {
    console.error("[COMMUNICATION_ENGINE] Atomic write error:", err.message);
  }
}

function safeLoadDeliveries(): Map<string, TransportDeliveryRecord> {
  const store = new Map<string, TransportDeliveryRecord>();

  if (!fs.existsSync(DATA_FILE) && fs.existsSync(BAK_FILE)) {
    console.warn(`[COMMUNICATION_ENGINE] [RECOVERY] Primary file missing. Restoring from backup snapshot ${BAK_FILE}`);
    fs.copyFileSync(BAK_FILE, DATA_FILE);
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const list: TransportDeliveryRecord[] = JSON.parse(raw);
      for (const item of list) {
        store.set(item.deliveryId, item);
      }
      console.log(`[COMMUNICATION_ENGINE] Loaded ${store.size} delivery records from disk (${DATA_FILE})`);
    } catch (err: any) {
      console.error(`[COMMUNICATION_ENGINE] [CRITICAL_RECOVERY] Primary file ${DATA_FILE} corrupted:`, err.message);
      
      const corruptPrimary = path.join(DATA_DIR, `deliveries.json.corrupt_primary_${Date.now()}`);
      fs.copyFileSync(DATA_FILE, corruptPrimary);

      if (fs.existsSync(BAK_FILE)) {
        try {
          const bakRaw = fs.readFileSync(BAK_FILE, "utf-8");
          const list: TransportDeliveryRecord[] = JSON.parse(bakRaw);
          for (const item of list) {
            store.set(item.deliveryId, item);
          }
          fs.copyFileSync(BAK_FILE, DATA_FILE);
          console.warn(`[COMMUNICATION_ENGINE] [RECOVERY] Restored deliveries from backup snapshot ${BAK_FILE}`);
        } catch (bakErr: any) {
          const corruptBak = path.join(DATA_DIR, `deliveries.json.corrupt_bak_${Date.now()}`);
          fs.copyFileSync(BAK_FILE, corruptBak);
          console.error(`[COMMUNICATION_ENGINE] [CRITICAL_INTEGRITY_FAILURE] Both primary AND backup files corrupted! Preserved at ${corruptPrimary} and ${corruptBak}. Refusing silent wipe.`);
          throw new Error("CRITICAL_INTEGRITY_FAILURE: Both primary and backup delivery stores corrupted. Unsafe to start without manual inspection.");
        }
      }
    }
  }
  return store;
}

const deliveryStore: Map<string, TransportDeliveryRecord> = safeLoadDeliveries();
const incidentDeliveryMap: Map<string, string> = new Map();
deliveryStore.forEach(rec => {
  if (rec.incidentId) {
    incidentDeliveryMap.set(rec.incidentId, rec.deliveryId);
  }
});

// Route & Dispatch Transport Delivery (Retry-Safe & Escalation-Enabled)
app.post("/communication/route", (req: Request, res: Response) => {
  try {
    const correlationId = (req.headers["x-correlation-id"] as string) || `corr_${Date.now()}`;
    const { incidentId, transportStatus, recipient, simulateFailure, retryDeliveryId } = req.body;
    const targetIncidentId = incidentId || "inc_unknown";
    const now = new Date().toISOString();

    let record: TransportDeliveryRecord | undefined;
    const existingDeliveryId = retryDeliveryId || incidentDeliveryMap.get(targetIncidentId);

    if (existingDeliveryId && deliveryStore.has(existingDeliveryId)) {
      record = deliveryStore.get(existingDeliveryId)!;
      console.log(`[COMMUNICATION_ENGINE] [${correlationId}] Found existing logical delivery ${record.deliveryId} for Incident #${targetIncidentId} (Current State: ${record.deliveryState})`);
    }

    if (record) {
      record.attemptsCount += 1;
      const attemptNum = record.attemptsCount;

      if (simulateFailure) {
        if (attemptNum >= record.maxAttempts) {
          record.deliveryState = "FAILED_FINAL";
          record.updatedAt = now;
          record.attempts.push({
            attemptNumber: attemptNum,
            attemptId: `att_${attemptNum}_${Date.now()}`,
            state: "FAILED_FINAL",
            timestamp: now,
            errorReason: `Retry limit reached (${attemptNum}/${record.maxAttempts}). Escalating to fallback transport.`
          });
          record.attempts.push({
            attemptNumber: attemptNum,
            attemptId: `att_${attemptNum}_${Date.now()}`,
            state: "ESCALATION_REQUIRED",
            timestamp: now
          });
          console.error(`[COMMUNICATION_ENGINE] [${correlationId}] Delivery Attempt #${attemptNum} FAILED_FINAL! Escalation engaged for delivery ${record.deliveryId}`);
        } else {
          record.deliveryState = "FAILED_RETRYABLE";
          record.updatedAt = now;
          record.attempts.push({
            attemptNumber: attemptNum,
            attemptId: `att_${attemptNum}_${Date.now()}`,
            state: "FAILED_RETRYABLE",
            timestamp: now,
            errorReason: "Simulated transport connection timeout"
          });
          console.warn(`[COMMUNICATION_ENGINE] [${correlationId}] Delivery Attempt #${attemptNum} FAILED (FAILED_RETRYABLE) for delivery ${record.deliveryId}`);
        }
      } else {
        record.deliveryState = "DELIVERED";
        record.updatedAt = now;
        record.attempts.push({
          attemptNumber: attemptNum,
          attemptId: `att_${attemptNum}_${Date.now()}`,
          state: "RETRY_SCHEDULED",
          timestamp: now
        });
        record.attempts.push({
          attemptNumber: attemptNum,
          attemptId: `att_${attemptNum}_${Date.now()}`,
          state: "DELIVERED",
          timestamp: now
        });
        console.log(`[COMMUNICATION_ENGINE] [${correlationId}] Delivery Attempt #${attemptNum} SUCCEEDED (DELIVERED) for delivery ${record.deliveryId}`);
      }

      deliveryStore.set(record.deliveryId, record);
      safeWriteDeliveries(deliveryStore);

      return res.status(200).json({
        deliveryId: record.deliveryId,
        incidentId: targetIncidentId,
        selectedTransport: record.selectedTransport,
        deliveryState: record.deliveryState,
        attemptsCount: record.attemptsCount,
        maxAttempts: record.maxAttempts,
        attempts: record.attempts,
        resumedExistingDelivery: true
      });
    }

    // New Initial Delivery Creation
    const status: TransportStatus = transportStatus || {
      internetAvailable: false,
      cellularSignalBars: 0,
      blePeersDetected: 3,
      wifiDirectPeers: 1
    };

    const selectedTransport = determineOptimalTransport(status);
    const deliveryId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const attempts: DeliveryAttempt[] = [
      { attemptNumber: 1, attemptId: `att_1_${Date.now()}`, state: "CREATED", timestamp: now },
      { attemptNumber: 1, attemptId: `att_1_${Date.now()}`, state: "QUEUED", timestamp: now },
      { attemptNumber: 1, attemptId: `att_1_${Date.now()}`, state: "ATTEMPTED", timestamp: now }
    ];

    let initialState: DeliveryState = "DELIVERED";

    if (simulateFailure) {
      initialState = "FAILED_RETRYABLE";
      attempts.push({ attemptNumber: 1, attemptId: `att_1_${Date.now()}`, state: "FAILED_RETRYABLE", timestamp: now, errorReason: "Initial transport attempt failed" });
      console.warn(`[COMMUNICATION_ENGINE] [${correlationId}] Initial Delivery Attempt FAILED (FAILED_RETRYABLE) for delivery ${deliveryId}`);
    } else {
      attempts.push({ attemptNumber: 1, attemptId: `att_1_${Date.now()}`, state: "SENT", timestamp: now });
      attempts.push({ attemptNumber: 1, attemptId: `att_1_${Date.now()}`, state: "DELIVERED", timestamp: now });
      console.log(`[COMMUNICATION_ENGINE] [${correlationId}] Initial Delivery Attempt SUCCEEDED (DELIVERED) for delivery ${deliveryId}`);
    }

    record = {
      deliveryId,
      incidentId: targetIncidentId,
      recipient: recipient || "Primary_Guardian",
      selectedTransport,
      deliveryState: initialState,
      attemptsCount: 1,
      maxAttempts: 3,
      correlationId,
      updatedAt: now,
      attempts
    };

    deliveryStore.set(deliveryId, record);
    incidentDeliveryMap.set(targetIncidentId, deliveryId);
    safeWriteDeliveries(deliveryStore);

    res.status(200).json({
      deliveryId,
      incidentId: targetIncidentId,
      selectedTransport,
      deliveryState: record.deliveryState,
      attemptsCount: 1,
      maxAttempts: 3,
      availableAdapters: ["BLE", "WIFI_DIRECT", "CELLULAR", "VOICE", "SMS"],
      attempts: record.attempts,
      timestamp: now
    });
  } catch (error: any) {
    console.error("[COMMUNICATION_ENGINE] Transport selection error:", error);
    res.status(500).json({ error: "Communication routing failed", details: error.message });
  }
});

// Query Delivery Status Lifecycle for an Incident
app.get("/communication/status/:incidentId", (req: Request, res: Response) => {
  const { incidentId } = req.params;
  const deliveryId = incidentDeliveryMap.get(incidentId);
  const record = deliveryId ? deliveryStore.get(deliveryId) : undefined;
  if (!record) {
    return res.status(404).json({ error: `No delivery record found for incident ${incidentId}` });
  }
  res.status(200).json(record);
});

app.listen(PORT, () => {
  console.log(`[COMMUNICATION_ENGINE] Billi Communication Engine listening on port ${PORT}`);
});
