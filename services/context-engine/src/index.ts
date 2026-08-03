import path from "path";
import dotenv from "dotenv";
// Platform-level Gemini configuration: one .env at the repo root powers
// Gemini for the whole platform. This is not a per-user setting — the
// submission runs on the platform's own key, not a key each operator
// supplies themselves.
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import express, { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8089;

/**
 * CONTEXT ENGINE — AI Domain Service
 *
 * Sub-domains:
 *   /context/synthesize  — Gemini contextual reasoning & candidate recommendations
 *   /context/summarize   — Gemini incident timeline → operational summary
 *   /context/translate   — Gemini multi-language emergency communication
 *
 * Every route calls live Gemini when GEMINI_API_KEY is set, and falls back to
 * deterministic rule-based output when it is not (or when the call fails).
 * Callers can tell which happened from the `aiProvider` field on the response:
 * "gemini-live" or "deterministic-fallback". AI RECOMMENDS. THE ORCHESTRATION
 * ENGINE DECIDES — this service never executes actions itself.
 */

// --- Lazy Gemini client (same pattern as the legacy reference server) ---
let geminiClient: GoogleGenAI | null = null;
let geminiInitAttempted = false;

function getGeminiClient(): GoogleGenAI | null {
  if (geminiInitAttempted) return geminiClient;
  geminiInitAttempted = true;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("[CONTEXT_ENGINE] GEMINI_API_KEY not set — running on deterministic fallback only.");
    return null;
  }
  try {
    geminiClient = new GoogleGenAI({ apiKey: key });
    console.log("[CONTEXT_ENGINE] Gemini client initialized — live AI enabled.");
  } catch (e) {
    console.error("[CONTEXT_ENGINE] Failed to initialize Gemini client:", e);
    geminiClient = null;
  }
  return geminiClient;
}

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "HEALTHY",
    service: "billi-context-engine",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

interface AiRecommendation { action: string; target: string; reason: string; }
interface ContextResponse {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  recommendations: AiRecommendation[];
  suggestedTransport: string;
  aiProvider: "gemini-live" | "deterministic-fallback";
}

const ACTIONS = ["SWITCH_TO_MESH", "ALERT_GUARDIAN", "ACTIVATE_MIC", "DISPATCH_EMS", "INCREASE_GPS_POLLING", "TRIGGER_SILENT_MODE"];
const TRANSPORTS = ["INTERNET", "CELLULAR_DATA", "VOICE", "SMS", "BLE_MESH_RELAY"];

// Deterministic rule-based synthesis — used whenever Gemini is unavailable.
function deterministicSynthesize(sensors: any): ContextResponse {
  if (sensors.gps_signal === 0 && (sensors.ble_peers_count || 0) > 0) {
    return {
      severity: "CRITICAL",
      summary: `Signal lost. ${sensors.ble_peers_count} BLE peer relay nodes detected nearby. Recommending mesh transport switch.`,
      recommendations: [
        { action: "SWITCH_TO_MESH", target: "BLE_Peers", reason: "Cellular and GPS signals dropped to zero; peer relay nodes available" },
        { action: "ALERT_GUARDIAN", target: "Primary_Guardian", reason: "Critical signal loss requires immediate guardian notification" }
      ],
      suggestedTransport: "BLE_MESH_RELAY",
      aiProvider: "deterministic-fallback"
    };
  }
  if ((sensors.mic_noise_db || 0) > 80) {
    return {
      severity: "HIGH",
      summary: `Distress audio detected at ${sensors.mic_noise_db}dB. Keyword "${sensors.detected_keyword || "none"}" identified. Speed: ${sensors.speed_mph || 0} mph.`,
      recommendations: [
        { action: "ACTIVATE_MIC", target: "System", reason: `Ambient noise ${sensors.mic_noise_db}dB exceeds distress threshold` },
        { action: "ALERT_GUARDIAN", target: "All_Guardians", reason: "High-severity audio distress pattern detected" },
        { action: "INCREASE_GPS_POLLING", target: "System", reason: "Movement detected; increase location accuracy" }
      ],
      suggestedTransport: "CELLULAR_DATA",
      aiProvider: "deterministic-fallback"
    };
  }
  return {
    severity: "MEDIUM",
    summary: "Emergency activated. Sensors within normal range. Monitoring for changes.",
    recommendations: [{ action: "ALERT_GUARDIAN", target: "Primary_Guardian", reason: "Standard emergency activation protocol" }],
    suggestedTransport: "INTERNET",
    aiProvider: "deterministic-fallback"
  };
}

// AI Provider: contextual reasoning over sensor telemetry (live Gemini, ported
// from cloud-functions/dispatcher.js + context_engine.js — those were never
// wired to a running service; this is the real integration).
app.post("/context/synthesize", async (req: Request, res: Response) => {
  try {
    const { sensorData, safetyProtocol } = req.body;
    const sensors = sensorData || {};
    const ai = getGeminiClient();

    if (!ai) {
      const response = deterministicSynthesize(sensors);
      console.log(`[CONTEXT_ENGINE] Synthesized (fallback): severity=${response.severity}`);
      return res.status(200).json(response);
    }

    try {
      const result = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `You are the Billi Emergency Context Engine. Synthesize raw mobile sensor telemetry into operational context and candidate action recommendations for a live safety incident.

SENSOR TELEMETRY:
${JSON.stringify(sensors, null, 2)}

AUTHORIZED SAFETY PROTOCOL:
${JSON.stringify(safetyProtocol || {}, null, 2)}

Analyze the sensor inputs against the authorized safety protocol and produce a structured assessment. Be concise, objective, and avoid speculative labels.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
              summary: { type: Type.STRING, description: "One-sentence operational summary of the current situation" },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING, enum: ACTIONS },
                    target: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ["action", "target", "reason"]
                }
              },
              suggestedTransport: { type: Type.STRING, enum: TRANSPORTS }
            },
            required: ["severity", "summary", "recommendations", "suggestedTransport"]
          }
        }
      });

      const text = result.text;
      if (!text) throw new Error("Empty response from Gemini");
      const parsed = JSON.parse(text.trim());
      const response: ContextResponse = { ...parsed, aiProvider: "gemini-live" };
      console.log(`[CONTEXT_ENGINE] Synthesized (LIVE GEMINI): severity=${response.severity}`);
      return res.status(200).json(response);
    } catch (aiError) {
      console.error("[CONTEXT_ENGINE] Gemini call failed, using deterministic fallback:", aiError);
      const response = deterministicSynthesize(sensors);
      return res.status(200).json(response);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[CONTEXT_ENGINE] Synthesis error:", message);
    res.status(500).json({ error: "Context synthesis failed", details: message });
  }
});

// Summarizer: incident context + timeline → operational summary for guardians/responders.
app.post("/context/summarize", async (req: Request, res: Response) => {
  try {
    const { incidentId, timelineEvents, protectedPerson, medical, duress } = req.body;
    const events = Array.isArray(timelineEvents) ? timelineEvents : [];
    const ai = getGeminiClient();

    const fallbackSummary = () =>
      `Incident #${incidentId}: ${events.length} events recorded. Emergency is active with ongoing sensor monitoring and trusted network engagement.`;

    if (!ai) {
      const summary = fallbackSummary();
      console.log(`[CONTEXT_ENGINE] Summarized (fallback) incident ${incidentId}`);
      return res.status(200).json({ incidentId, summary, aiProvider: "deterministic-fallback" });
    }

    try {
      const result = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `You are the Billi Cognitive Co-Dispatch Engine. Write a professional, scannable, 1-2 sentence operational summary of this active emergency incident for guardians and responders.

Protected person: ${JSON.stringify(protectedPerson || {})}
Medical notes: ${JSON.stringify(medical || {})}
Duress indicator present: ${!!duress}
Timeline events (chronological): ${JSON.stringify(events.slice(-15))}

State only confirmed operational facts. Do not speculate or diagnose. Do not use alarmist language.`
      });
      const summary = (result.text || "").trim() || fallbackSummary();
      console.log(`[CONTEXT_ENGINE] Summarized (LIVE GEMINI) incident ${incidentId}`);
      return res.status(200).json({ incidentId, summary, aiProvider: "gemini-live" });
    } catch (aiError) {
      console.error("[CONTEXT_ENGINE] Gemini summarize failed, using deterministic fallback:", aiError);
      return res.status(200).json({ incidentId, summary: fallbackSummary(), aiProvider: "deterministic-fallback" });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Summarization failed", details: message });
  }
});

// Translator: multi-language emergency communication support.
app.post("/context/translate", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;
    const ai = getGeminiClient();
    const lang = targetLanguage || "es";

    if (!ai) {
      const translated = `[Translated to ${lang}]: ${text}`;
      return res.status(200).json({ original: text, targetLanguage: lang, translated, aiProvider: "deterministic-fallback" });
    }

    try {
      const result = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Translate the following emergency-response text directly into language code "${lang}". Output ONLY the translation, no commentary:\n\n${text}`
      });
      const translated = (result.text || "").trim() || `[Translated to ${lang}]: ${text}`;
      console.log(`[CONTEXT_ENGINE] Translated (LIVE GEMINI) to ${lang}`);
      return res.status(200).json({ original: text, targetLanguage: lang, translated, aiProvider: "gemini-live" });
    } catch (aiError) {
      console.error("[CONTEXT_ENGINE] Gemini translate failed, using deterministic fallback:", aiError);
      const translated = `[Translated to ${lang}]: ${text}`;
      return res.status(200).json({ original: text, targetLanguage: lang, translated, aiProvider: "deterministic-fallback" });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Translation failed", details: message });
  }
});

app.listen(PORT, () => {
  console.log(`[CONTEXT_ENGINE] Billi Context Engine listening on port ${PORT} — Gemini ${process.env.GEMINI_API_KEY ? "ENABLED" : "not configured (fallback mode)"}`);
});
