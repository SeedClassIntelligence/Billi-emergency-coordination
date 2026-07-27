import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.PROJECT_ID || "unknown-project";
const SPANNER_INSTANCE = process.env.SPANNER_INSTANCE || "";
const SPANNER_DATABASE = process.env.SPANNER_DATABASE || "";
const FIRESTORE_DB = process.env.FIRESTORE_DB || "";
const PUBSUB_TOPIC = process.env.PUBSUB_TOPIC || "";

// Health Check Endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    service: "billi-event-processor",
    config: {
      projectId: PROJECT_ID,
      spannerInstance: SPANNER_INSTANCE,
      spannerDatabase: SPANNER_DATABASE,
      firestoreDb: FIRESTORE_DB,
      pubsubTopic: PUBSUB_TOPIC
    }
  });
});

// Pub/Sub Push Handler or Event Webhook
app.post("/events/push", async (req: Request, res: Response) => {
  try {
    const message = req.body.message;
    if (!message || !message.data) {
      return res.status(400).json({ error: "Invalid Pub/Sub message payload" });
    }

    const payloadString = Buffer.from(message.data, "base64").toString("utf-8");
    const event = JSON.parse(payloadString);

    console.log(`[EVENT_PROCESSOR] Processing event: ${event.eventType || "UNKNOWN"} for packet: ${event.packetId}`);

    // Process event safety protocols & Spanner updates...

    res.status(200).json({ status: "SUCCESS", eventId: event.eventId || "processed" });
  } catch (error: any) {
    console.error("[EVENT_PROCESSOR] Error processing event push:", error);
    res.status(500).json({ error: "Failed to process event", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[EVENT_PROCESSOR] Billi Event Processor listening on port ${PORT}`);
});
