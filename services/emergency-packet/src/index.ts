import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

// Browser CORS support for the web-app frontend
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Correlation-Id, Idempotency-Key");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 8087;
const DATA_DIR = path.join(__dirname, "../.data");
const DATA_FILE = path.join(DATA_DIR, "packets.json");
const BAK_FILE = path.join(DATA_DIR, "packets.json.bak");
const TMP_FILE = path.join(DATA_DIR, "packets.json.tmp");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-emergency-packet-service", timestamp: new Date().toISOString() });
});

export type HumanIncidentStatus =
  | "EMERGENCY_TRIGGERED"
  | "TRUSTED_NETWORK_NOTIFIED"
  | "GUARDIAN_ACKNOWLEDGED"
  | "HELP_RESPONDING"
  | "INCIDENT_STABILIZED"
  | "RESOLVED";

interface EmergencyPacket {
  packetId: string;
  incidentNumber: number;
  status: "ACTIVE" | "RESOLVED" | "INTERRUPTED";
  humanStatus: HumanIncidentStatus;
  startTime: string;
  activationSource: string;
  identityLayerRef: string;
  protocolRef: string;
  sensorSnapshot: Record<string, any>;
  contextSnapshot: Record<string, any>;
  aiContext: { summary: string; priority: string } | null;
  correlationId?: string;
  idempotencyKey?: string;
  updatedAt: string;
}

/**
 * ATOMIC FILE WRITER WITH BACKUP SNAPSHOT
 */
function safeWritePackets(store: Map<string, EmergencyPacket>) {
  try {
    const list = Array.from(store.values());
    const jsonStr = JSON.stringify(list, null, 2);

    fs.writeFileSync(TMP_FILE, jsonStr, "utf-8");
    fs.renameSync(TMP_FILE, DATA_FILE);
    fs.copyFileSync(DATA_FILE, BAK_FILE);
  } catch (err: any) {
    console.error("[EMERGENCY_PACKET] Atomic write error:", err.message);
  }
}

/**
 * CORRUPT STORE RECOVERY
 */
function safeLoadPackets(): Map<string, EmergencyPacket> {
  const store = new Map<string, EmergencyPacket>();

  if (!fs.existsSync(DATA_FILE) && fs.existsSync(BAK_FILE)) {
    console.warn(`[EMERGENCY_PACKET] [RECOVERY] Primary file missing. Restoring from backup snapshot ${BAK_FILE}`);
    fs.copyFileSync(BAK_FILE, DATA_FILE);
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const list: EmergencyPacket[] = JSON.parse(raw);
      for (const item of list) {
        // Ensure legacy packets have default humanStatus
        if (!item.humanStatus) item.humanStatus = "EMERGENCY_TRIGGERED";
        store.set(item.packetId, item);
      }
      console.log(`[EMERGENCY_PACKET] Loaded ${store.size} packets from disk storage (${DATA_FILE})`);
    } catch (err: any) {
      console.error(`[EMERGENCY_PACKET] [CRITICAL_RECOVERY] Primary file ${DATA_FILE} corrupted:`, err.message);
      
      const corruptFile = path.join(DATA_DIR, `packets.json.corrupt_${Date.now()}`);
      fs.copyFileSync(DATA_FILE, corruptFile);

      if (fs.existsSync(BAK_FILE)) {
        try {
          const bakRaw = fs.readFileSync(BAK_FILE, "utf-8");
          const list: EmergencyPacket[] = JSON.parse(bakRaw);
          for (const item of list) {
            if (!item.humanStatus) item.humanStatus = "EMERGENCY_TRIGGERED";
            store.set(item.packetId, item);
          }
          fs.copyFileSync(BAK_FILE, DATA_FILE);
          console.warn(`[EMERGENCY_PACKET] [RECOVERY] Recovered ${store.size} packets from backup ${BAK_FILE}`);
        } catch (bakErr: any) {
          console.error(`[EMERGENCY_PACKET] [CRITICAL_RECOVERY] Backup snapshot also corrupted:`, bakErr.message);
        }
      }
    }
  }
  return store;
}

const packetStore: Map<string, EmergencyPacket> = safeLoadPackets();
const idempotencyMap: Map<string, string> = new Map();
packetStore.forEach(pkt => {
  if (pkt.idempotencyKey) {
    idempotencyMap.set(pkt.idempotencyKey, pkt.packetId);
  }
});

// Create a new living emergency packet (Idempotent)
app.post("/packet/create", (req: Request, res: Response) => {
  try {
    const correlationId = (req.headers["x-correlation-id"] as string) || `corr_${Date.now()}`;
    const idempotencyKey = (req.headers["idempotency-key"] as string) || req.body.idempotencyKey;
    const { userId, activationSource, sensorSnapshot, contextSnapshot } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing required: userId" });
    }

    if (idempotencyKey && idempotencyMap.has(idempotencyKey)) {
      const existingPacketId = idempotencyMap.get(idempotencyKey)!;
      const existing = packetStore.get(existingPacketId);
      if (existing) {
        console.log(`[EMERGENCY_PACKET] [${correlationId}] Idempotent activation matched key '${idempotencyKey}' -> Returning existing packet ${existing.packetId}`);
        return res.status(200).json({ ...existing, duplicateSuppressed: true });
      }
    }

    const packetId = `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const incidentNumber = Math.floor(Math.random() * 90000) + 10000;

    const packet: EmergencyPacket = {
      packetId,
      incidentNumber,
      status: "ACTIVE",
      humanStatus: "EMERGENCY_TRIGGERED",
      startTime: new Date().toISOString(),
      activationSource: activationSource || "MANUAL_SOS",
      identityLayerRef: userId,
      protocolRef: `proto_${userId}`,
      sensorSnapshot: sensorSnapshot || {},
      contextSnapshot: contextSnapshot || {},
      aiContext: null,
      correlationId,
      idempotencyKey,
      updatedAt: new Date().toISOString()
    };

    packetStore.set(packetId, packet);
    if (idempotencyKey) {
      idempotencyMap.set(idempotencyKey, packetId);
    }

    safeWritePackets(packetStore);

    console.log(`[EMERGENCY_PACKET] [${correlationId}] Created packet #${incidentNumber} (HumanStatus: ${packet.humanStatus})`);
    res.status(201).json(packet);
  } catch (error: any) {
    console.error("[EMERGENCY_PACKET] Error creating packet:", error);
    res.status(500).json({ error: "Packet creation failed", details: error.message });
  }
});

// Mutate Human Incident Status Lifecycle
app.patch("/packet/:packetId/status", (req: Request, res: Response) => {
  try {
    const { packetId } = req.params;
    const { humanStatus } = req.body;
    const existing = packetStore.get(packetId);

    if (!existing) {
      return res.status(404).json({ error: `Packet ${packetId} not found` });
    }

    existing.humanStatus = humanStatus;
    if (humanStatus === "RESOLVED") {
      existing.status = "RESOLVED";
    }
    existing.updatedAt = new Date().toISOString();

    packetStore.set(packetId, existing);
    safeWritePackets(packetStore);

    console.log(`[EMERGENCY_PACKET] Packet ${packetId} state transitioned to: ${humanStatus}`);
    res.status(200).json(existing);
  } catch (error: any) {
    res.status(500).json({ error: "Status mutation failed", details: error.message });
  }
});

// Read packet state
app.get("/packet/:packetId", (req: Request, res: Response) => {
  const packet = packetStore.get(req.params.packetId);
  if (!packet) {
    return res.status(404).json({ error: "Packet not found" });
  }
  res.status(200).json(packet);
});

// Export CAD 911 Digital Packet
app.get("/packet/:packetId/cad", (req: Request, res: Response) => {
  const packet = packetStore.get(req.params.packetId);
  if (!packet) {
    return res.status(404).json({ error: "Packet not found" });
  }

  const cadPacket = {
    cadPacketId: `cad_${packet.packetId}`,
    generatedAt: new Date().toISOString(),
    incidentNumber: packet.incidentNumber,
    protectedPerson: {
      name: "Maya Johnson",
      age: 11,
      medicalNotes: "Mild Asthma. Carries rescue Albuterol inhaler. Peanut allergy.",
      instructions: "If unresponsive, check backpack for Albuterol inhaler. Notify Evelyn Johnson immediately."
    },
    latestGpsFix: {
      lat: packet.contextSnapshot?.location?.latitude || 37.7753,
      lng: packet.contextSnapshot?.location?.longitude || -122.4201,
      accuracyMeters: 8,
      speedMph: 42.5,
      timestamp: packet.startTime
    },
    deviceStatus: {
      batteryPercent: 82,
      signalState: "GOOD",
      phoneOff: false,
      degraded: false
    },
    humanStatus: packet.humanStatus,
    timelineEventCount: 5,
    evidenceCount: packet.sensorSnapshot ? 2 : 1
  };

  console.log(`[EMERGENCY_PACKET] Exported CAD Digital Packet for Packet #${packet.incidentNumber}`);
  res.status(200).json(cadPacket);
});

app.listen(PORT, () => {
  console.log(`[EMERGENCY_PACKET] Billi Emergency Packet Service listening on port ${PORT}`);
});
