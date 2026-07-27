const { VertexAI } = require('@google-cloud/vertexai');

const PROJECT_ID = process.env.GCP_PROJECT || process.env.PROJECT_ID || 'billi-safety-platform';
const LOCATION = process.env.LOCATION || 'us-central1';

// Initialize Vertex AI client with Gemini 1.5 Pro
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
 * Billi Autonomous Dispatcher
 * Analyzes raw mobile sensor inputs against user's Safety Protocol
 * and outputs structured JSON action commands.
 *
 * @param {Object} sensorData Raw hardware sensor data (accelerometer, mic, GPS, BLE)
 * @param {Object} safetyProtocol Authorized protocol & escalation rules
 * @returns {Promise<Object>} Structured JSON command plan
 */
async function runAutonomousDispatcher(sensorData, safetyProtocol) {
  const prompt = `
You are the Billi Autonomous Safety Dispatcher. You are responsible for orchestrating mobile hardware capabilities and safety protocols during emergencies.

INPUT SENSOR TELEMETRY:
${JSON.stringify(sensorData, null, 2)}

AUTHORIZED SAFETY PROTOCOL & RULES:
${JSON.stringify(safetyProtocol, null, 2)}

INSTRUCTIONS:
Analyze the sensor inputs against the user's Safety Protocol.
Synthesize the operational situation and decide the exact hardware/communication actions required.
You MUST output valid JSON following this exact structure:

{
  "incident_severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "situation_summary": "One-sentence natural language summary of the current situation",
  "recommended_actions": [
    {
      "action": "SWITCH_TO_MESH" | "ALERT_GUARDIAN" | "ACTIVATE_MIC" | "DISPATCH_EMS" | "INCREASE_GPS_POLLING" | "TRIGGER_SILENT_MODE",
      "target": "String (e.g. 'Mother', 'BLE_Peers', 'System')",
      "reason": "String explaining the technical/safety rationale"
    }
  ],
  "communication_channel": "INTERNET" | "CELLULAR_DATA" | "VOICE" | "SMS" | "BLE_MESH_RELAY"
}
`;

  try {
    const response = await model.generateContent(prompt);
    const candidate = response.response?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response received from Gemini Pro Dispatcher');
    }

    const jsonActionPlan = JSON.parse(text);
    console.log('[BILLI_DISPATCHER] Autonomous Decision:', JSON.stringify(jsonActionPlan, null, 2));
    return jsonActionPlan;
  } catch (error) {
    console.error('[BILLI_DISPATCHER] Error generating autonomous action plan:', error);
    // Fallback default action plan if AI inference is interrupted
    return {
      incident_severity: 'HIGH',
      situation_summary: 'Emergency activated; AI decision fallback engaged.',
      recommended_actions: [
        {
          action: 'ALERT_GUARDIAN',
          target: 'Primary_Guardian',
          reason: 'Emergency triggered; fallback rule active.'
        }
      ],
      communication_channel: sensorData?.gps_signal === 0 ? 'BLE_MESH_RELAY' : 'CELLULAR_DATA'
    };
  }
}

module.exports = {
  runAutonomousDispatcher
};
