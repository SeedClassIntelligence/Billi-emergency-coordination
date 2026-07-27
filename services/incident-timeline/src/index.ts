import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8083;

interface TimelineEvent {
  eventId: string;
  incidentId: string;
  eventType: string;
  source: string;
  summary: string;
  timestamp: string;
  payload?: any;
}

// In-memory append-only log store (Backed by Cloud Spanner / Firestore in production)
const timelineStore: Map<string, TimelineEvent[]> = new Map();

// Append Event to Incident Timeline
app.post("/timeline/append", (req: Request, res: Response) => {
  try {
    const { incidentId, eventType, source, summary, payload } = req.body;

    if (!incidentId || !eventType) {
      return res.status(400).json({ error: "Missing required parameters: incidentId and eventType" });
    }

    const event: TimelineEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      incidentId,
      eventType,
      source: source || "SYSTEM",
      summary: summary || "Timeline event recorded",
      timestamp: new Date().toISOString(),
      payload: payload || null
    };

    if (!timelineStore.has(incidentId)) {
      timelineStore.set(incidentId, []);
    }

    timelineStore.get(incidentId)!.push(event);

    console.log(`[INCIDENT_TIMELINE] Event logged [${eventType}] for Incident #${incidentId}: ${summary}`);

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
