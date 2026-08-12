const { VertexAI } = require('@google-cloud/vertexai');

const PROJECT_ID = process.env.GCP_PROJECT || process.env.PROJECT_ID || 'billi-safety-platform';
const LOCATION = process.env.LOCATION || 'us-central1';

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    response_mime_type: 'application/json',
    temperature: 0.1,
    max_output_tokens: 1024
  }
});

/**
 * Billi Emergency Context & Decision Provider Engine
 * Analyzes mobile sensor streams to synthesize situational context and produce candidate action recommendations.
 * Recommends candidate actions; the deterministic Orchestration Rule Engine evaluates and executes.
 *
 * @param {Object} sensorData Raw hardware sensor data (accelerometer, mic, GPS, BLE)
 * @param {Object} safetyProtocol Authorized protocol & escalation rules
 * @returns {Promise<Object>} Structured JSON context & recommendations
 */
async function generateContextAndRecommendations(sensorData, safetyProtocol) {
  const prompt = `
You are the Billi Emergency Context Engine. You are responsible for synthesizing raw mobile sensor streams into operational context and generating candidate action recommendations.

INPUT SENSOR TELEMETRY:
${JSON.stringify(sensorData, null, 2)}

AUTHORIZED SAFETY PROTOCOL:
${JSON.stringify(safetyProtocol, null, 2)}

INSTRUCTIONS:
Analyze the sensor inputs against the user's Safety Protocol.
Synthesize the operational situation and recommend candidate actions.
You MUST output valid JSON following this exact structure:

{
  "incident_severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "situation_summary": "One-sentence natural language summary of the current situation",
  "ai_recommendations": [
    {
      "action": "SWITCH_TO_MESH" | "ALERT_GUARDIAN" | "ACTIVATE_MIC" | "DISPATCH_EMS" | "INCREASE_GPS_POLLING" | "TRIGGER_SILENT_MODE",
      "target": "String (e.g. 'Mother', 'BLE_Peers', 'System')",
      "reason": "String explaining the technical/safety rationale"
    }
  ],
  "suggested_transport": "INTERNET" | "CELLULAR_DATA" | "VOICE" | "SMS" | "BLE_MESH_RELAY"
}
`;

  try {
    const response = await model.generateContent(prompt);
    const candidate = response.response?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response received from Gemini Context Engine');
    }

    const contextPayload = JSON.parse(text);
    console.log('[CONTEXT_ENGINE] Synthesized Context & Recommendations:', JSON.stringify(contextPayload, null, 2));
    return contextPayload;
  } catch (error) {
    console.error('[CONTEXT_ENGINE] Error generating context recommendations:', error);
    return {
      incident_severity: 'HIGH',
      situation_summary: 'Emergency activated; AI decision fallback engaged.',
      ai_recommendations: [
        {
          action: 'ALERT_GUARDIAN',
          target: 'Primary_Guardian',
          reason: 'Emergency triggered; fallback rule active.'
        }
      ],
      suggested_transport: sensorData?.gps_signal === 0 ? 'BLE_MESH_RELAY' : 'CELLULAR_DATA'
    };
  }
}

module.exports = {
  generateContextAndRecommendations
};
