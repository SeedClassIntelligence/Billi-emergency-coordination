import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8090;

/**
 * TELEMETRY PROCESSOR
 * High-throughput stream processor ingesting continuous mobile hardware sensor updates
 * (accelerometer G-force, ambient microphone decibels, GPS vectors, BLE peer counts).
 */

interface SensorTelemetry {
  incidentId: string;
  sensorType: "ACCELEROMETER" | "MICROPHONE" | "GPS" | "BLE" | "TELEMETER" | "COMPOSITE";
  speedMph?: number;
  micNoiseDb?: number;
  detectedKeyword?: string;
  movementDescription?: string;
  gForce?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsSignal?: number;
  cellularSignal?: string;
  blePeersCount?: number;
  timestamp?: string;
}

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "HEALTHY",
    service: "billi-telemetry-processor",
    timestamp: new Date().toISOString()
  });
});

// Ingest direct high-frequency sensor readings
app.post("/telemetry/ingest", (req: Request, res: Response) => {
  try {
    const telemetry: SensorTelemetry = req.body;

    if (!telemetry.incidentId || !telemetry.sensorType) {
      return res.status(400).json({ error: "Missing required fields: incidentId and sensorType" });
    }

    const telemetryId = `tel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = telemetry.timestamp || new Date().toISOString();

    console.log(`[TELEMETRY_PROCESSOR] Ingested ${telemetry.sensorType} payload for Incident #${telemetry.incidentId} (ID: ${telemetryId})`);

    res.status(202).json({
      status: "INGESTED",
      telemetryId,
      incidentId: telemetry.incidentId,
      timestamp
    });
  } catch (error: any) {
    console.error("[TELEMETRY_PROCESSOR] Stream ingestion error:", error);
    res.status(500).json({ error: "Telemetry ingestion failed", details: error.message });
  }
});

// Pub/Sub Push Subscription Handler
app.post("/telemetry/push", (req: Request, res: Response) => {
  try {
    const message = req.body.message;
    if (!message || !message.data) {
      return res.status(400).json({ error: "Invalid Pub/Sub payload structure" });
    }

    const decoded = Buffer.from(message.data, "base64").toString("utf-8");
    const payload = JSON.parse(decoded);

    console.log(`[TELEMETRY_PROCESSOR] Pub/Sub push received for incident: ${payload.incidentId || payload.incident_id || "UNKNOWN"}`);

    res.status(200).json({
      status: "PROCESSED",
      messageId: message.messageId || `msg_${Date.now()}`,
      processedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[TELEMETRY_PROCESSOR] Pub/Sub push processing error:", error);
    res.status(500).json({ error: "Pub/Sub telemetry push failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[TELEMETRY_PROCESSOR] Billi Telemetry Processor listening on port ${PORT}`);
});
