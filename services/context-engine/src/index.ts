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
// Default 100kb is too small for base64 photo-evidence payloads (analyze-photo).
app.use(express.json({ limit: "8mb" }));

const PORT = process.env.PORT || 8089;

/**
 * CONTEXT ENGINE — AI Domain Service
 *
 * Sub-domains:
 *   /context/synthesize  — Gemini contextual reasoning & candidate recommendations
 *   /context/summarize   — Gemini incident timeline → operational summary
 *   /context/analyze     — Gemini structured 911/CAD analysis + audio sentiment verification
 *   /context/analyze-photo — Gemini MULTIMODAL: scene description from a sealed photo
 *   /context/review-setup — Gemini reviews a Safety Contract/readiness config for prioritized gaps
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
        model: "gemini-3.5-flash",
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
        model: "gemini-3.5-flash",
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

// Structured 911/CAD analysis, ported from archive/legacy-web-reference/server.ts's
// /api/gemini/analyze — that endpoint was real and wired (AiAnalysisPanel.tsx →
// GuardianDashboard's E911 CAD modal) but only existed in the legacy generation.
// This is the same schema and prompt intent, adapted to this service's live/
// fallback pattern instead of a hardcoded single-persona mock. The distinguishing
// piece versus /context/summarize: this performs acoustic/verbal SENTIMENT
// ANALYSIS on evidence transcripts to assess genuine-distress vs. accidental
// trigger, and returns a structured, responder-actionable object rather than
// prose — this is what feeds the "911-Ready Packet" export.
interface AnalysisResponse {
  summary: string;
  riskClassification: "low" | "medium" | "high" | "critical";
  suggestedCategory: string;
  audioSentimentVerification: string;
  isRealDistressVerified: boolean;
  keyObservations: string[];
  responderDirectives: string[];
  distressLevel: string;
  translation?: string;
  aiProvider: "gemini-live" | "deterministic-fallback";
}

function deterministicAnalyze(incidentData: any): AnalysisResponse {
  const name = (incidentData.protectedPerson && incidentData.protectedPerson.name) || "Protected person";
  const method = incidentData.activationMethod || "unknown trigger";
  const hasEvidence = Array.isArray(incidentData.evidence) && incidentData.evidence.length > 0;
  return {
    summary: `Incident analyzed without live Gemini: ${name} activated Billi via ${method}. ${incidentData.events?.length || 0} timeline events recorded. Trusted Network engaged per Safety Contract.`,
    riskClassification: incidentData.duress ? "critical" : "medium",
    suggestedCategory: /fall/i.test(method) ? "fall" : /crash/i.test(method) ? "vehicle_incident" : "unknown",
    audioSentimentVerification: hasEvidence ? "Not evaluated — deterministic fallback, no live sentiment model available" : "No audio evidence available for sentiment analysis",
    isRealDistressVerified: !!incidentData.duress || hasEvidence,
    keyObservations: ["Deterministic fallback mode — live Gemini not connected, no model-derived observations available"],
    responderDirectives: ["Follow standard escalation ladder", "Verify protected person status directly when contact is established"],
    distressLevel: incidentData.duress ? "Unknown — duress indicator present, treat as critical pending human verification" : "Unknown — deterministic fallback cannot assess distress level",
    translation: incidentData.targetLanguage ? `[Translation unavailable — deterministic fallback]` : undefined,
    aiProvider: "deterministic-fallback"
  };
}

app.post("/context/analyze", async (req: Request, res: Response) => {
  try {
    const incidentData = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      const response = deterministicAnalyze(incidentData);
      console.log(`[CONTEXT_ENGINE] Analyzed (fallback): risk=${response.riskClassification}`);
      return res.status(200).json(response);
    }

    try {
      const systemPrompt = `You are the Billi Cognitive Co-Dispatch Engine.
Analyze the provided JSON payload of an active emergency incident. Perform acoustic & verbal sentiment analysis on the ambient audio transcript buffers (evaluating vocal panic cadence, distress arousal, screams, versus accidental pocket rustling or peacetime banter) to determine whether this is a genuine distress emergency or an accidental trigger.
Your response must be extremely objective, concise, professional, and omit all speculative labels (e.g. do NOT confirm 'kidnapping' or 'abduction' — label it as 'abduction_risk' or 'physical_threat'). Create a structured operational assessment suitable for a 911/CAD handoff packet.
If a target translation language code is provided, translate the summary directly into that language in the translation field.`;

      const userPrompt = `Incident details:
- Protected person: ${JSON.stringify(incidentData.protectedPerson || {})}
- Medical notes: ${JSON.stringify(incidentData.medical || {})}
- Activation: ${incidentData.activationMethod || "unknown"}
- Duress indicator present: ${!!incidentData.duress}
- Location trail: ${JSON.stringify(incidentData.locations || [])}
- Evidence transcripts: ${JSON.stringify(incidentData.evidence || [])}
- Timeline events (chronological): ${JSON.stringify((incidentData.events || []).slice(-15))}
- Target translation language: ${incidentData.targetLanguage || "none"}`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A professional, scannable, high-level operational summary of the active incident for responders." },
              riskClassification: { type: Type.STRING, enum: ["low", "medium", "high", "critical"], description: "Risk assessment severity rating." },
              suggestedCategory: { type: Type.STRING, enum: ["physical_threat", "vehicle_incident", "medical_emergency", "fall", "fire", "lost_person", "abduction_risk", "unknown"], description: "Emergency type classification." },
              audioSentimentVerification: { type: Type.STRING, description: "Vocal and acoustic sentiment analysis evaluation (e.g. 'High-Arousal Panic & Verbal Distress Confirmed' or 'Calm Conversational / Accidental Trigger Suspected')." },
              isRealDistressVerified: { type: Type.BOOLEAN, description: "True if sentiment analysis confirms genuine distress; False if false alarm." },
              keyObservations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific tactical observations from telemetry, voice, and media." },
              responderDirectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable, step-by-step tactical directives for guardians and first responders." },
              distressLevel: { type: Type.STRING, description: "A 1-10 numerical distress evaluation with qualitative justification." },
              translation: { type: Type.STRING, description: "Direct translation of the summary into the requested target language (or empty if none requested)." }
            },
            required: ["summary", "riskClassification", "suggestedCategory", "audioSentimentVerification", "isRealDistressVerified", "keyObservations", "responderDirectives", "distressLevel"]
          }
        }
      });

      const text = result.text;
      if (!text) throw new Error("Empty response from Gemini");
      const parsed = JSON.parse(text.trim());
      const response: AnalysisResponse = { ...parsed, aiProvider: "gemini-live" };
      console.log(`[CONTEXT_ENGINE] Analyzed (LIVE GEMINI): risk=${response.riskClassification}, distressVerified=${response.isRealDistressVerified}`);
      return res.status(200).json(response);
    } catch (aiError) {
      console.error("[CONTEXT_ENGINE] Gemini analyze failed, using deterministic fallback:", aiError);
      return res.status(200).json(deterministicAnalyze(incidentData));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Analysis failed", details: message });
  }
});

// Photo evidence analysis — genuine Gemini MULTIMODAL usage (image input, not
// just text). A sealed photo snapshot never leaves the capturing device as
// image bytes over the shared incident (same honest local-only-evidence
// limitation as audio) — this route is the one place those bytes are sent
// anywhere, and only on-demand, straight from the browser to this service,
// for a single descriptive analysis. No image is persisted server-side.
app.post("/context/analyze-photo", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, protectedPerson, activationMethod } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });
    const ai = getGeminiClient();

    const fallbackText = "Photo captured and sealed as evidence. Live scene description unavailable — Gemini not connected.";
    if (!ai) {
      console.log("[CONTEXT_ENGINE] Photo analysis (fallback) — no Gemini client");
      return res.status(200).json({ description: fallbackText, aiProvider: "deterministic-fallback" });
    }

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: `You are the Billi Emergency Context Engine. This photo was captured automatically during an active safety incident (trigger: ${activationMethod || "unknown"}, protected person: ${(protectedPerson && protectedPerson.name) || "unknown"}).

Describe what is visible in 2-3 objective, factual sentences for a guardian or responder reviewing evidence: the environment/setting, whether other people are visible, and any visible hazards or notable safety-relevant details. Do not speculate about identities, intent, or events outside the frame. If the image is dark, blurry, or unclear, say so plainly rather than guessing.` },
          { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } }
        ]
      });
      const description = (result.text || "").trim() || fallbackText;
      console.log("[CONTEXT_ENGINE] Photo analyzed (LIVE GEMINI VISION)");
      return res.status(200).json({ description, aiProvider: "gemini-live" });
    } catch (aiError) {
      console.error("[CONTEXT_ENGINE] Gemini photo analysis failed, using deterministic fallback:", aiError);
      return res.status(200).json({ description: fallbackText, aiProvider: "deterministic-fallback" });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Photo analysis failed", details: message });
  }
});

// Setup review — extends Gemini beyond incident-time into the SETUP phase of
// the product. Reviews the current Safety Contract + readiness configuration
// and returns prioritized, plain-language gaps grounded in what's actually
// missing (not a generic checklist restated) — e.g. explaining WHY a missing
// duress PIN matters, not just that it's unset.
interface SetupReviewResponse {
  summary: string;
  recommendations: { priority: "high" | "medium" | "low"; recommendation: string }[];
  aiProvider: "gemini-live" | "deterministic-fallback";
}

function deterministicReviewSetup(readiness: any[]): SetupReviewResponse {
  const gaps = (Array.isArray(readiness) ? readiness : []).filter((r) => !r.ok);
  const required = gaps.filter((r) => r.required);
  const optional = gaps.filter((r) => !r.required);
  return {
    summary: gaps.length
      ? `${gaps.length} setup item(s) still open (${required.length} required, ${optional.length} optional).`
      : "All setup items complete.",
    recommendations: gaps.map((r) => ({
      priority: r.required ? "high" : "medium",
      recommendation: `${r.label} is not yet configured.`
    })),
    aiProvider: "deterministic-fallback"
  };
}

app.post("/context/review-setup", async (req: Request, res: Response) => {
  try {
    const { readiness, contract, protectedPerson, contactCount, hasNormalPin, hasDuressPin, voiceEnrolled, zoneCount, deviceCount } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      const response = deterministicReviewSetup(readiness);
      console.log(`[CONTEXT_ENGINE] Setup review (fallback): ${response.recommendations.length} gap(s)`);
      return res.status(200).json(response);
    }

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the Billi Cognitive Co-Dispatch Engine reviewing a guardian's safety setup BEFORE any emergency — this is a setup/onboarding review, not an active incident.

Protected person configured: ${protectedPerson ? "yes" : "no"}
Trusted Network contacts: ${contactCount || 0}
Safety Contract permissions: ${JSON.stringify(contract || {})}
Readiness checklist (ok=true means configured): ${JSON.stringify(readiness || [])}
Cancellation PIN configured: ${!!hasNormalPin}
Duress (coercion-safe) PIN configured: ${!!hasDuressPin}
Voice/safe-word enrolled: ${!!voiceEnrolled}
Safe zones configured: ${zoneCount || 0}
Devices registered: ${deviceCount || 0}

Identify the most impactful gaps first, in plain language for a worried guardian setting this up — explain WHY each gap matters for real protection, not just that a checkbox is unchecked. Do not restate items that are already configured. If everything meaningful is configured, say so briefly and don't invent gaps.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "One-sentence overall assessment of this setup's readiness." },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
                    recommendation: { type: Type.STRING, description: "Plain-language, specific — explains why it matters." }
                  },
                  required: ["priority", "recommendation"]
                }
              }
            },
            required: ["summary", "recommendations"]
          }
        }
      });
      const text = result.text;
      if (!text) throw new Error("Empty response from Gemini");
      const parsed = JSON.parse(text.trim());
      const response: SetupReviewResponse = { ...parsed, aiProvider: "gemini-live" };
      console.log(`[CONTEXT_ENGINE] Setup review (LIVE GEMINI): ${response.recommendations.length} recommendation(s)`);
      return res.status(200).json(response);
    } catch (aiError) {
      console.error("[CONTEXT_ENGINE] Gemini setup review failed, using deterministic fallback:", aiError);
      return res.status(200).json(deterministicReviewSetup(readiness));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Setup review failed", details: message });
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
        model: "gemini-3.5-flash",
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
