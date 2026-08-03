import express, { Request, Response, NextFunction } from "express";

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

const PORT = process.env.PORT || 8084;

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-feedback-engine", timestamp: new Date().toISOString() });
});

/**
 * POST-INCIDENT FEEDBACK LOOP & OPERATIONAL LEARNING
 * Evaluates concluded incidents to generate adaptive Safety Protocol recommendations for guardians.
 */
app.post("/feedback/analyze", (req: Request, res: Response) => {
  try {
    const { incidentId, outcome, transportLog, durationSeconds } = req.body;

    const cellularFailures = transportLog?.filter((t: string) => t === "CELLULAR_FAILED")?.length || 0;
    const meshHopsUsed = transportLog?.filter((t: string) => t.includes("BLE_MESH"))?.length || 0;

    const recommendations: string[] = [];

    if (cellularFailures > 0) {
      recommendations.push(
        "Cellular coverage dropped to 0% during transit. Recommended Action: Add an secondary trusted school contact or enable Wi-Fi Direct peer discovery."
      );
    }

    if (meshHopsUsed > 0) {
      recommendations.push(
        "Mesh network successfully relayed emergency payload across peer devices. Recommended Action: Enable Bluetooth background scanning permanently on protected device."
      );
    }

    console.log(`[FEEDBACK_ENGINE] Incident #${incidentId} analyzed. Generated ${recommendations.length} adaptive protocol recommendations.`);

    res.status(200).json({
      incidentId,
      outcome: outcome || "RESOLVED_SAFE",
      durationSeconds: durationSeconds || 420,
      protocolRecommendations: recommendations,
      analyzedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[FEEDBACK_ENGINE] Error analyzing incident outcome:", error);
    res.status(500).json({ error: "Post-incident analysis failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[FEEDBACK_ENGINE] Billi Feedback Engine listening on port ${PORT}`);
});
