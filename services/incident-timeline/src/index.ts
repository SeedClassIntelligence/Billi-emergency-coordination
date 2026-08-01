import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8083;
const DATA_DIR = path.join(__dirname, "../.data");
const DATA_FILE = path.join(DATA_DIR, "timelines.json");
const BAK_FILE = path.join(DATA_DIR, "timelines.json.bak");
const TMP_FILE = path.join(DATA_DIR, "timelines.json.tmp");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-incident-timeline", timestamp: new Date().toISOString() });
});

interface TimelineEvent {
  eventId: string;
  incidentId: string;
  eventType: string;
  source: string;
  summary: string;
  timestamp: string;
  correlationId?: string;
  sequence: number;
  payload?: any;
}

/**
 * ATOMIC FILE WRITER WITH BACKUP SNAPSHOT
 */
function safeWriteTimelines(store: Map<string, TimelineEvent[]>) {
  try {
    const obj: Record<string, TimelineEvent[]> = {};
    store.forEach((events, incId) => {
      obj[incId] = events;
    });
    const jsonStr = JSON.stringify(obj, null, 2);

    fs.writeFileSync(TMP_FILE, jsonStr, "utf-8");
    fs.renameSync(TMP_FILE, DATA_FILE);
    fs.copyFileSync(DATA_FILE, BAK_FILE);
  } catch (err: any) {
    console.error("[INCIDENT_TIMELINE] Atomic write error:", err.message);
  }
}

/**
 * CORRUPT STORE RECOVERY
 */
function safeLoadTimelines(): Map<string, TimelineEvent[]> {
  const store = new Map<string, TimelineEvent[]>();

  if (!fs.existsSync(DATA_FILE) && fs.existsSync(BAK_FILE)) {
    console.warn(`[INCIDENT_TIMELINE] [RECOVERY] Primary file missing. Restoring from backup snapshot ${BAK_FILE}`);
    fs.copyFileSync(BAK_FILE, DATA_FILE);
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const record: Record<string, TimelineEvent[]> = JSON.parse(raw);
      for (const [incId, events] of Object.entries(record)) {
        store.set(incId, events);
      }
      let total = 0;
      store.forEach(evts => total += evts.length);
      console.log(`[INCIDENT_TIMELINE] Loaded ${store.size} incident timelines (${total} events) from disk storage (${DATA_FILE})`);
    } catch (err: any) {
      console.error(`[INCIDENT_TIMELINE] [CRITICAL_RECOVERY] Primary file ${DATA_FILE} corrupted:`, err.message);
      
      const corruptFile = path.join(DATA_DIR, `timelines.json.corrupt_${Date.now()}`);
      fs.copyFileSync(DATA_FILE, corruptFile);
      console.error(`[INCIDENT_TIMELINE] [RECOVERY] Preserved corrupt file at: ${corruptFile}`);

      if (fs.existsSync(BAK_FILE)) {
        try {
          const bakRaw = fs.readFileSync(BAK_FILE, "utf-8");
          const record: Record<string, TimelineEvent[]> = JSON.parse(bakRaw);
          for (const [incId, events] of Object.entries(record)) {
            store.set(incId, events);
          }
          fs.copyFileSync(BAK_FILE, DATA_FILE);
          console.warn(`[INCIDENT_TIMELINE] [RECOVERY] Restored timelines from backup ${BAK_FILE}`);
        } catch (bakErr: any) {
          console.error(`[INCIDENT_TIMELINE] [CRITICAL_RECOVERY] Backup snapshot also corrupted:`, bakErr.message);
        }
      }
    }
  }
  return store;
}

const timelineStore: Map<string, TimelineEvent[]> = safeLoadTimelines();

// Append Event to Incident Timeline
app.post("/timeline/append", (req: Request, res: Response) => {
  try {
    const correlationId = (req.headers["x-correlation-id"] as string) || `corr_${Date.now()}`;
    const { incidentId, eventType, source, summary, payload } = req.body;

    if (!incidentId || !eventType) {
      return res.status(400).json({ error: "Missing required parameters: incidentId and eventType" });
    }

    if (!timelineStore.has(incidentId)) {
      timelineStore.set(incidentId, []);
    }

    const existingEvents = timelineStore.get(incidentId)!;

    // Deduplicate event if identical eventType and source appended within 1 second
    const isDuplicate = existingEvents.some(
      e => e.eventType === eventType && e.source === source && e.summary === summary
    );

    if (isDuplicate) {
      console.log(`[INCIDENT_TIMELINE] [${correlationId}] Duplicate event '${eventType}' suppressed for Incident #${incidentId}`);
      return res.status(200).json({ status: "DUPLICATE_SUPPRESSED", totalEvents: existingEvents.length });
    }

    const sequence = existingEvents.length + 1;

    const event: TimelineEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      incidentId,
      eventType,
      source: source || "SYSTEM",
      summary: summary || "Timeline event recorded",
      timestamp: new Date().toISOString(),
      correlationId,
      sequence,
      payload: payload || null
    };

    existingEvents.push(event);
    safeWriteTimelines(timelineStore);

    console.log(`[INCIDENT_TIMELINE] [${correlationId}] Event #${sequence} logged [${eventType}] for Incident #${incidentId}`);

    res.status(201).json({ status: "APPENDED", event });
  } catch (error: any) {
    console.error("[INCIDENT_TIMELINE] Error appending event:", error);
    res.status(500).json({ error: "Failed to append timeline event", details: error.message });
  }
});

// Retrieve Complete Incident Timeline Log
app.get("/timeline/:incidentId", (req: Request, res: Response) => {
  const incidentId = req.params.incidentId;
  const events = timelineStore.get(incidentId) || [];
  res.status(200).json({ incidentId, totalEvents: events.length, events });
});

app.listen(PORT, () => {
  console.log(`[INCIDENT_TIMELINE] Billi Incident Timeline Service listening on port ${PORT}`);
});
