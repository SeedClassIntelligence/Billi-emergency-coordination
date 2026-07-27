import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8089;

/**
 * CONTEXT ENGINE — AI Domain Service
 *
 * This is NOT a Cloud Function trigger. This is a proper bounded context
 * housing all AI provider interactions as a domain service.
 *
 * Sub-domains:
 *   /context/synthesize  — AI Provider: Gemini contextual reasoning & recommendation
 *   /context/summarize   — Summarizer: incident timeline → 1-sentence synthesis
 *   /context/translate   — Translator: multi-language emergency communication
 *
 * In production, each sub-domain calls Vertex AI (Gemini 1.5 Pro/Flash).
 * Here they provide deterministic mock responses for development & demo.
 *
 * AI RECOMMENDS. THE ORCHESTRATION ENGINE DECIDES.
 */

interface AiRecommendation {
  action: string;
  target: string;
  reason: string;
}

interface ContextResponse {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  recommendations: AiRecommendation[];
  suggestedTransport: string;
}

// AI Provider: Contextual reasoning over sensor telemetry
app.post("/context/synthesize", (req: Request, res: Response) => {
  try {
    const { sensorData, safetyProtocol } = req.body;
    const sensors = sensorData || {};

    let response: ContextResponse;

    // Dead-zone with mesh peers available
    if (sensors.gps_signal === 0 && (sensors.ble_peers_count || 0) > 0) {
      response = {
        severity: "CRITICAL",
        summary: `Signal lost. ${sensors.ble_peers_count} BLE peer relay nodes detected nearby. Recommending mesh transport switch.`,
        recommendations: [
          { action: "SWITCH_TO_MESH", target: "BLE_Peers", reason: "Cellular and GPS signals dropped to zero; peer relay nodes available" },
          { action: "ALERT_GUARDIAN", target: "Primary_Guardian", reason: "Critical signal loss requires immediate guardian notification" }
        ],
        suggestedTransport: "BLE_MESH_RELAY"
      };
    }
    // Distress audio detected
    else if ((sensors.mic_noise_db || 0) > 80) {
      response = {
        severity: "HIGH",
        summary: `Distress audio detected at ${sensors.mic_noise_db}dB. Keyword "${sensors.detected_keyword || "none"}" identified. Speed: ${sensors.speed_mph || 0} mph.`,
        recommendations: [
          { action: "ACTIVATE_MIC", target: "System", reason: `Ambient noise ${sensors.mic_noise_db}dB exceeds distress threshold` },
          { action: "ALERT_GUARDIAN", target: "All_Guardians", reason: "High-severity audio distress pattern detected" },
          { action: "INCREASE_GPS_POLLING", target: "System", reason: "Movement detected; increase location accuracy" }
        ],
        suggestedTransport: "CELLULAR_DATA"
      };
    }
    // Default context
    else {
      response = {
        severity: "MEDIUM",
        summary: "Emergency activated. Sensors within normal range. Monitoring for changes.",
        recommendations: [
          { action: "ALERT_GUARDIAN", target: "Primary_Guardian", reason: "Standard emergency activation protocol" }
        ],
        suggestedTransport: "INTERNET"
      };
    }

    console.log(`[CONTEXT_ENGINE] Synthesized: severity=${response.severity}, recommendations=${response.recommendations.length}`);
    res.status(200).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[CONTEXT_ENGINE] Synthesis error:", message);
    res.status(500).json({ error: "Context synthesis failed", details: message });
  }
});

// Summarizer: timeline events → 1-sentence natural language summary
app.post("/context/summarize", (req: Request, res: Response) => {
  try {
    const { incidentId, timelineEvents } = req.body;
    const eventCount = Array.isArray(timelineEvents) ? timelineEvents.length : 0;

    // In production: send timeline to Gemini 1.5 Flash for synthesis
    const summary = `Incident #${incidentId}: ${eventCount} events recorded. Emergency is active with ongoing sensor monitoring and trusted network engagement.`;

    console.log(`[CONTEXT_ENGINE] Summarized incident ${incidentId} (${eventCount} events)`);
    res.status(200).json({ incidentId, summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Summarization failed", details: message });
  }
});

// Translator: multi-language emergency communication support
app.post("/context/translate", (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;
    // In production: Gemini translation API
    const translated = `[Translated to ${targetLanguage || "en"}]: ${text}`;

    console.log(`[CONTEXT_ENGINE] Translated to ${targetLanguage}: "${text?.substring(0, 40)}..."`);
    res.status(200).json({ original: text, targetLanguage, translated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Translation failed", details: message });
  }
});

app.listen(PORT, () => {
  console.log(`[CONTEXT_ENGINE] Billi Context Engine listening on port ${PORT}`);
});
