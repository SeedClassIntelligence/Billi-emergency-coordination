const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');
const { PubSub } = require('@google-cloud/pubsub');
const { runAutonomousDispatcher } = require('./dispatcher');

admin.initializeApp();
const db = admin.firestore();
const pubsub = new PubSub();

const PROJECT_ID = process.env.GCP_PROJECT || process.env.PROJECT_ID || 'billi-safety-platform';
const LOCATION = process.env.LOCATION || 'us-central1';

// Initialize Vertex AI with Gemini 1.5 Flash for rapid context summarization
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { response_mime_type: 'application/json' }
});

/**
 * Cloud Function triggered when an Incident document is updated in Firestore.
 * Analyzes sensor data, invokes Gemini for context enrichment and autonomous dispatching,
 * updates the Dynamic Emergency Packet, and publishes alerts to Pub/Sub.
 */
exports.enrichIncidentContext = functions.firestore
  .document('incidents/{incidentId}')
  .onUpdate(async (change, context) => {
    const incidentId = context.params.incidentId;
    const newData = change.after.data();
    const previousData = change.before.data();

    // Avoid infinite triggers if summary was just updated by this function
    if (newData.metadata?.last_ai_processed === previousData.metadata?.last_ai_processed) {
      console.log(`[ENRICH_CONTEXT] Skipping duplicate processing for incident: ${incidentId}`);
      return null;
    }

    console.log(`[ENRICH_CONTEXT] Processing sensor update for Incident #${incidentId}`);

    const sensorData = newData.sensor_layer || {};
    const identity = newData.identity_layer || {};
    const medical = newData.medical_layer || {};
    const contextLayer = newData.context_layer || {};

    // 1. Run Gemini Context Summarization Prompt
    const summaryPrompt = `
You are the Billi Emergency Context Engine. Synthesize this emergency telemetry into a concise 1-2 sentence operational summary for first responders and guardians.

Telemetry:
- Protected User: ${identity.name || 'Unknown'}, Age: ${identity.age || 'N/A'}
- Medical Notes: ${medical.notes || 'None listed'}, Allergies: ${medical.allergies?.join(', ') || 'None'}
- Sensor State: Speed=${sensorData.speed_mph || 0} MPH, Mic noise=${sensorData.mic_noise_db || 0} dB, Keyword='${sensorData.detected_keyword || 'none'}'
- Signal/Connectivity: Cellular=${contextLayer.cellular_signal || 'Low'}, GPS Signal=${contextLayer.gps_signal || 0}, Nearby BLE Peers=${contextLayer.ble_peers_count || 0}
- Movement Vector: ${sensorData.movement_description || 'stationary'}

OUTPUT JSON FORMAT:
{
  "summary": "1-2 sentence situational synthesis",
  "priority": "HIGH" | "MEDIUM" | "CRITICAL",
  "distress_detected": true | false
}
`;

    let aiSummary = 'Emergency trigger registered. Context synthesis pending.';
    let priority = 'HIGH';

    try {
      const aiResult = await generativeModel.generateContent(summaryPrompt);
      const textResponse = aiResult.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        const parsed = JSON.parse(textResponse);
        aiSummary = parsed.summary || aiSummary;
        priority = parsed.priority || priority;
      }
    } catch (err) {
      console.error('[ENRICH_CONTEXT] Gemini Flash summarization error:', err);
    }

    // 2. Run Gemini Autonomous Dispatcher (JSON Command Engine)
    const safetyProtocol = newData.safety_protocol || { silent_activation: false, allow_mesh_relay: true };
    const autonomousPlan = await runAutonomousDispatcher(sensorData, safetyProtocol);

    // 3. Update Firestore Dynamic Emergency Packet with new summary & timeline event
    const timestamp = new Date().toISOString();
    const updatePayload = {
      'ai_context.current_summary': aiSummary,
      'ai_context.priority': priority,
      'ai_context.autonomous_plan': autonomousPlan,
      'metadata.last_ai_processed': timestamp,
      'metadata.updated_at': timestamp
    };

    await db.collection('incidents').doc(incidentId).update(updatePayload);

    // Append to incident timeline subcollection
    await db.collection('incidents').doc(incidentId).collection('timeline').add({
      timestamp: timestamp,
      event_type: 'AI_CONTEXT_SYNTHESIS',
      summary: aiSummary,
      priority: priority,
      autonomous_command: autonomousPlan.recommended_actions?.[0]?.action || 'NONE'
    });

    // 4. Publish alert to Cloud Pub/Sub Communication Engine
    await notifyTrustedNetwork(incidentId, aiSummary, priority, autonomousPlan);

    return null;
  });

/**
 * Publishes urgent notifications to the billi-comm-engine Pub/Sub topic
 */
async function notifyTrustedNetwork(incidentId, summary, priority, autonomousPlan) {
  const topicName = process.env.PUBSUB_TOPIC || 'billi-comm-engine';
  const messageData = JSON.stringify({
    incident_id: incidentId,
    message: `BILLI ALERT [${priority}]: ${summary}`,
    urgency: priority,
    autonomous_plan: autonomousPlan,
    timestamp: new Date().toISOString()
  });

  try {
    const dataBuffer = Buffer.from(messageData);
    const messageId = await pubsub.topic(topicName).publishMessage({ data: dataBuffer });
    console.log(`[NOTIFY] Broadcasted incident #${incidentId} to Pub/Sub topic '${topicName}' with msgId: ${messageId}`);
  } catch (error) {
    console.error(`[NOTIFY] Error publishing to Pub/Sub topic '${topicName}':`, error);
  }
}

module.exports = {
  notifyTrustedNetwork
};
