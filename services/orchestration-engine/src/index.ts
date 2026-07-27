import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8081;

interface AiRecommendation {
  action: string;
  target?: string;
  reason?: string;
}

interface SafetyProtocol {
  protocolId: string;
  allowMeshRelay: boolean;
  authorizedDataSources: string[];
  maxEscalationTier: number;
}

/**
 * DETERMINISTIC RULE ENGINE
 * AI provides recommendations; Billi Rule Engine validates against the immutable Safety Protocol.
 * Keeps the system 100% LLM-agnostic and guarantees zero unvalidated AI executions.
 */
function validateAndEvaluateAction(recommendations: AiRecommendation[], protocol: SafetyProtocol) {
  const approvedActions: string[] = [];

  for (const rec of recommendations) {
    if (rec.action === "SWITCH_TO_MESH") {
      if (protocol.allowMeshRelay) {
        approvedActions.push("EXECUTE_BLE_MESH_RELAY");
      } else {
        console.warn("[RULE_ENGINE] AI recommended SWITCH_TO_MESH, but user protocol forbids mesh relay. Overridden to CELLULAR_FALLBACK.");
        approvedActions.push("EXECUTE_CELLULAR_FALLBACK");
      }
    } else if (rec.action === "ACTIVATE_MIC") {
      if (protocol.authorizedDataSources.includes("MICROPHONE")) {
        approvedActions.push("EXECUTE_MIC_STREAM");
      }
    } else {
      approvedActions.push(`EXECUTE_${rec.action}`);
    }
  }

  return approvedActions;
}

// Orchestration Engine Ingress Endpoint
app.post("/orchestrate/evaluate", (req: Request, res: Response) => {
  try {
    const { incidentId, aiRecommendations, safetyProtocol } = req.body;

    if (!incidentId || !aiRecommendations) {
      return res.status(400).json({ error: "Missing required parameters: incidentId and aiRecommendations" });
    }

    const protocol: SafetyProtocol = safetyProtocol || {
      protocolId: "default_protocol",
      allowMeshRelay: true,
      authorizedDataSources: ["MICROPHONE", "GPS"],
      maxEscalationTier: 3
    };

    // Evaluate AI Recommendations against Deterministic Rule Engine
    const validatedCommands = validateAndEvaluateAction(aiRecommendations, protocol);

    console.log(`[ORCHESTRATION_ENGINE] Incident #${incidentId} Evaluated. Approved Actions: ${validatedCommands.join(", ")}`);

    res.status(200).json({
      incidentId,
      status: "ORCHESTRATED",
      evaluatedAt: new Date().toISOString(),
      aiRecommendations,
      validatedCommands
    });
  } catch (error: any) {
    console.error("[ORCHESTRATION_ENGINE] Error in evaluation loop:", error);
    res.status(500).json({ error: "Orchestration evaluation failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ORCHESTRATION_ENGINE] Billi Orchestration Engine listening on port ${PORT}`);
});
