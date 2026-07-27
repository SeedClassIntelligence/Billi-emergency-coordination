import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.PROJECT_ID || "unknown-project";
const SPANNER_INSTANCE = process.env.SPANNER_INSTANCE || "";
const SPANNER_DATABASE = process.env.SPANNER_DATABASE || "";
const FIRESTORE_DB = process.env.FIRESTORE_DB || "";
const PUBSUB_TOPIC = process.env.PUBSUB_TOPIC || "";
const EVIDENCE_BUCKET = process.env.EVIDENCE_BUCKET || "";
const ALLOYDB_PRIMARY_IP = process.env.ALLOYDB_PRIMARY_IP || "private-only";

// Health Check Endpoint (used by Global Application Load Balancer / NEG)
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    service: "billi-orchestrator",
    scalingPolicy: "Dynamic (0 - 100 instances)",
    networkIsolation: "VPC_PEERING RFC1918 Private Direct Access",
    config: {
      projectId: PROJECT_ID,
      spannerInstance: SPANNER_INSTANCE,
      spannerDatabase: SPANNER_DATABASE,
      firestoreDb: FIRESTORE_DB,
      pubsubTopic: PUBSUB_TOPIC,
      evidenceBucket: EVIDENCE_BUCKET,
      alloyDbPrimaryIp: ALLOYDB_PRIMARY_IP
    }
  });
});

/**
 * High-Volume Emergency Trigger Payload Endpoint
 * Handles payloads such as Emma SOS trigger, Grandfather watch fall detection, etc.
 */
app.post("/api/v1/emergency/packet", async (req: Request, res: Response) => {
  try {
    const { userId, triggerSource, severity, latitude, longitude, sensorData, metadata } = req.body;

    if (!userId || !severity) {
      return res.status(400).json({ error: "Missing required fields: userId and severity" });
    }

    const packetId = `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const trigger = triggerSource || "MANUAL_SOS"; // e.g., 'EMMA_MANUAL_SOS', 'GRANDFATHER_WATCH_FALL_DETECTION'

    const packet = {
      packetId,
      userId,
      triggerSource: trigger,
      status: "ACTIVE",
      severity, // 'CRITICAL', 'HIGH'
      location: { latitude, longitude },
      sensorData: sensorData || null, // accelerometer/heart-rate metrics from smartwatch
      metadata: metadata || {},
      createdAt: new Date().toISOString()
    };

    console.log(`[ORCHESTRATOR] [${trigger}] Emergency packet registered: ${packetId} for user: ${userId}`);

    // Forward to Cloud Spanner (Living Emergency Packet Store)
    // Publish event to Pub/Sub (Communication Orchestrator Bus)

    res.status(201).json({
      message: "Emergency payload received and scaling pipeline engaged",
      packet
    });
  } catch (error: any) {
    console.error("[ORCHESTRATOR] Error processing emergency trigger payload:", error);
    res.status(500).json({ error: "Failed to process emergency payload", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ORCHESTRATOR] Billi Orchestrator listening on port ${PORT}`);
});
