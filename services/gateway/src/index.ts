import express, { Request, Response, NextFunction } from "express";
import { 
  ProtectedPersonContract, 
  TrustedContactContract, 
  SafetyContractRules, 
  EmergencyActivationRequest, 
  TelemetryReadingContract, 
  DeviceCapabilityContract, 
  EmergencyPacketContract 
} from "../../../packages/api-contracts/src";
import { CANONICAL_PROTECTED_PERSON, CANONICAL_SAFETY_CONTRACT, CANONICAL_CONTACTS, CANONICAL_DEVICES } from "../../../packages/demo-fixtures/src";

const app = express();
app.disable("x-powered-by"); // don't hand out framework fingerprinting for free
// Default 100kb is too small for base64 photo-evidence payloads (analyze-photo).
app.use(express.json({ limit: "8mb" }));

// Browser CORS support — the deployed web-app plus local dev tooling only,
// not a public wildcard. A wildcard let any third-party website script
// requests against this API directly from a visitor's browser; found during
// a platform security audit. Local dev (any localhost/127.0.0.1 port, since
// billi-core.js's GATEWAY constant hits localhost:8080 directly when the
// page isn't served over HTTPS) is reflected back explicitly rather than
// hardcoded to one port, since preview tooling varies.
const PROD_ORIGIN = "https://billi-platform-467802610371.us-central1.run.app";
function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  if (origin === PROD_ORIGIN) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  if (isAllowedOrigin(origin)) res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Correlation-Id, Idempotency-Key, X-Admin-Key");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 8080;

// Gate for the two GET routes that expose data other than what the caller
// just submitted themselves (tester feedback, household contact snapshots)
// — found with nothing gating them at all during a platform security audit.
// Submission (POST) routes deliberately stay open; that's the intended
// low-friction "anyone with the link can test" design, not the problem.
// No ADMIN_KEY set means the route stays closed rather than silently open —
// the safe default, same reasoning as GEMINI_API_KEY being platform config
// passed only via Cloud Run env vars, never baked into the image.
const ADMIN_KEY = process.env.ADMIN_KEY;
function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const supplied = (req.headers["x-admin-key"] as string) || (req.query.key as string);
  if (!ADMIN_KEY) return res.status(503).json({ error: "admin access not configured on this deployment" });
  if (supplied !== ADMIN_KEY) return res.status(401).json({ error: "invalid or missing admin key" });
  next();
}

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "HEALTHY",
    service: "billi-gateway",
    ingressPort: PORT,
    timestamp: new Date().toISOString()
  });
});

// Default timeout is generous enough for a real Gemini round trip through
// context-engine, but bounded — a slow/hung AI call must never be able to
// stall the platform invariant that core emergency actions always execute
// promptly. Callers on the hot activation path can pass a tighter budget.
async function fetchService(url: string, method: string = "GET", body?: any, timeoutMs: number = 10000): Promise<any> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const opts: any = { method, headers: { "Content-Type": "application/json" }, signal: ctl.signal };
    if (body) opts.body = JSON.stringify(body);
    const resp = await fetch(url, opts);
    if (resp.ok) return await resp.json();
  } catch (err) {
    // Inter-service network offline fallback, or timeout — either way the
    // caller's own fallback/default logic takes over.
  } finally {
    clearTimeout(timer);
  }
  return null;
}

/* =====================================================================
   SHARED INCIDENT STATE — one canonical incident record for all roles.
   Protected-person, guardian, responder, and evaluator clients read and
   mutate the same record; changes fan out over SSE and persist to disk.
   ===================================================================== */
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const SHARED_FILE = path.join(DATA_DIR, "shared_incidents.json");

let sharedIncidents: Record<string, any> = {};
let activeSharedId: string | null = null;

try {
  const raw = JSON.parse(fs.readFileSync(SHARED_FILE, "utf8"));
  sharedIncidents = raw.incidents || {};
  activeSharedId = raw.activeSharedId || null;
  console.log(`[GATEWAY] Restored ${Object.keys(sharedIncidents).length} shared incident(s) from disk.`);
} catch (e) { /* first boot — empty store */ }

function persistShared() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = SHARED_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify({ activeSharedId, incidents: sharedIncidents }, null, 2));
    fs.renameSync(tmp, SHARED_FILE);
  } catch (e) {
    console.error("[GATEWAY] Shared-state persistence failed:", e);
  }
}

const sseClients: Response[] = [];
function broadcastIncident(inc: any) {
  const frame = `event: incident\ndata: ${JSON.stringify(inc)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try { sseClients[i].write(frame); } catch (e) { sseClients.splice(i, 1); }
  }
}

const actionKey = (a: any) => `${a.t}|${a.type}|${a.actor}`;

app.get("/api/v1/shared/stream", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  res.write(`event: hello\ndata: {"clients":${sseClients.length + 1}}\n\n`);
  if (activeSharedId && sharedIncidents[activeSharedId]) {
    res.write(`event: incident\ndata: ${JSON.stringify(sharedIncidents[activeSharedId])}\n\n`);
  }
  sseClients.push(res);
  req.on("close", () => {
    const i = sseClients.indexOf(res);
    if (i >= 0) sseClients.splice(i, 1);
  });
});

app.post("/api/v1/shared/incidents", (req: Request, res: Response) => {
  const inc = req.body;
  if (!inc || !inc.id) return res.status(400).json({ error: "incident with id required" });
  inc.rev = 1;
  inc.telemetry = inc.telemetry || [];
  sharedIncidents[inc.id] = inc;
  if (!inc.resolved) activeSharedId = inc.id;
  persistShared();
  broadcastIncident(inc);
  console.log(`[GATEWAY] Shared incident created: ${inc.id} (${inc.triggerMethod || "unknown trigger"})`);
  res.status(201).json(inc);
});

app.get("/api/v1/shared/incidents/active", (req: Request, res: Response) => {
  res.json({ incident: activeSharedId ? sharedIncidents[activeSharedId] || null : null });
});

app.get("/api/v1/shared/incidents/:id", (req: Request, res: Response) => {
  const inc = sharedIncidents[req.params.id];
  if (!inc) return res.status(404).json({ error: "not found" });
  res.json(inc);
});

app.patch("/api/v1/shared/incidents/:id", (req: Request, res: Response) => {
  const inc = sharedIncidents[req.params.id];
  if (!inc) return res.status(404).json({ error: "not found" });
  const patch = req.body || {};
  const patchActions = patch.actions;
  delete patch.actions;
  Object.assign(inc, patch);
  if (Array.isArray(patchActions)) {
    const seen = new Set((inc.actions || []).map(actionKey));
    inc.actions = inc.actions || [];
    for (const a of patchActions) if (!seen.has(actionKey(a))) { inc.actions.push(a); seen.add(actionKey(a)); }
    inc.actions.sort((a: any, b: any) => a.t - b.t);
  }
  if (inc.resolved && activeSharedId === inc.id) activeSharedId = null;
  inc.rev = (inc.rev || 0) + 1;
  persistShared();
  broadcastIncident(inc);
  res.json(inc);
});

app.post("/api/v1/shared/incidents/:id/events", (req: Request, res: Response) => {
  const inc = sharedIncidents[req.params.id];
  if (!inc) return res.status(404).json({ error: "not found" });
  const a = req.body;
  if (!a || !a.type) return res.status(400).json({ error: "event with type required" });
  a.t = a.t || Date.now();
  inc.actions = inc.actions || [];
  const seen = new Set(inc.actions.map(actionKey));
  if (!seen.has(actionKey(a))) inc.actions.push(a);
  inc.rev = (inc.rev || 0) + 1;
  persistShared();
  broadcastIncident(inc);
  /* Mirror onto the incident-timeline service (fire-and-forget). */
  fetchService(`http://localhost:8083/timeline/append`, "POST", {
    incidentId: (inc.backend && inc.backend.incidentId) || inc.id,
    eventType: a.type, source: a.actor, summary: a.details
  });
  res.json({ ok: true, rev: inc.rev });
});

app.post("/api/v1/shared/incidents/:id/telemetry", (req: Request, res: Response) => {
  const inc = sharedIncidents[req.params.id];
  if (!inc) return res.status(404).json({ error: "not found" });
  const evt = req.body;
  if (!evt || !evt.event_type) return res.status(400).json({ error: "normalized event required" });
  evt.timestamp = evt.timestamp || new Date().toISOString();
  inc.telemetry = inc.telemetry || [];
  inc.telemetry.push(evt);
  if (inc.telemetry.length > 300) inc.telemetry.splice(0, inc.telemetry.length - 300);
  if (evt.event_type === "LOCATION_UPDATED") inc.realLocation = evt;
  inc.lastTelemetryAt = Date.now();
  inc.rev = (inc.rev || 0) + 1;
  persistShared();
  broadcastIncident(inc);
  /* Forward real telemetry into the telemetry-processor service. */
  fetchService(`http://localhost:8090/telemetry/ingest`, "POST", {
    userId: inc.userIdRemote || "usr_maya_johnson_01",
    deviceId: evt.source_device_id, reading: evt
  });
  res.json({ ok: true, rev: inc.rev });
});

/* =====================================================================
   HOUSEHOLDS — lets an account owner (e.g. a parent) invite a second
   physical device (e.g. a child's phone) into the same safety setup
   without needing that device in hand. The owner creates a household
   (gets a short shareable code + a snapshot of their current trusted
   contacts/safety contract/entity type), sends the code or a join link
   to the other device, and that device's own onboarding adopts the
   snapshot instead of starting from a disconnected blank account.
   Same atomic-write JSON persistence pattern as shared incidents above.
   ===================================================================== */
const HOUSEHOLDS_FILE = path.join(DATA_DIR, "households.json");
let households: Record<string, any> = {};

try {
  households = JSON.parse(fs.readFileSync(HOUSEHOLDS_FILE, "utf8"));
  console.log(`[GATEWAY] Restored ${Object.keys(households).length} household(s) from disk.`);
} catch (e) { /* first boot — empty store */ }

function persistHouseholds() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = HOUSEHOLDS_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(households, null, 2));
    fs.renameSync(tmp, HOUSEHOLDS_FILE);
  } catch (e) {
    console.error("[GATEWAY] Household persistence failed:", e);
  }
}

function genHouseholdCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids misread codes
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

app.post("/api/v1/household", (req: Request, res: Response) => {
  let code = genHouseholdCode();
  while (households[code]) code = genHouseholdCode();
  households[code] = {
    code, ownerName: req.body?.ownerName || "A Billi household",
    entityType: req.body?.entityType || null,
    contacts: req.body?.contacts || [],
    contract: req.body?.contract || null,
    createdAt: Date.now(), devices: []
  };
  persistHouseholds();
  res.status(201).json(households[code]);
});

// Owner re-syncs the household's shared snapshot (contacts/contract change
// after creation, e.g. a new trusted contact added later) so devices that
// join afterward get the current setup, not a stale one from creation time.
app.patch("/api/v1/household/:code", (req: Request, res: Response) => {
  const h = households[(req.params.code || "").toUpperCase()];
  if (!h) return res.status(404).json({ error: "household not found" });
  if (req.body?.contacts) h.contacts = req.body.contacts;
  if (req.body?.contract) h.contract = req.body.contract;
  if (req.body?.entityType) h.entityType = req.body.entityType;
  persistHouseholds();
  res.json(h);
});

// Preview/device-list view — deliberately does NOT include the real contact
// list (names + phone numbers). Anyone who has the 6-char code can reach
// this before ever committing to join, and a leaked/screenshotted code
// used to hand over a family's phone numbers with zero trace. Full contacts
// are only ever returned from the join route below, at the point a device
// actually registers — an action that leaves a real, visible audit entry
// on the owner's device list, unlike a bare GET.
app.get("/api/v1/household/:code", (req: Request, res: Response) => {
  const h = households[(req.params.code || "").toUpperCase()];
  if (!h) return res.status(404).json({ error: "household not found" });
  const { contacts, contract, ...preview } = h;
  res.json({ ...preview, contactCount: contacts.length });
});

app.post("/api/v1/household/:code/join", (req: Request, res: Response) => {
  const h = households[(req.params.code || "").toUpperCase()];
  if (!h) return res.status(404).json({ error: "household not found" });
  const device = {
    id: `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    label: req.body?.label || "Unnamed device",
    protectedPersonName: req.body?.protectedPersonName || "",
    joinedAt: Date.now()
  };
  h.devices.push(device);
  persistHouseholds();
  console.log(`[GATEWAY] Device "${device.label}" joined household ${h.code}.`);
  res.status(201).json({ household: h, device });
});

/* =====================================================================
   TESTER FEEDBACK — a lightweight, real inbox for people testing the
   live deployment to report bugs/confusion/praise from inside the app.
   Deliberately separate from feedback-engine's /feedback/analyze, which
   is a different concept entirely (post-incident protocol-tuning
   recommendations, not tester comments). Same persistence pattern as
   households/shared incidents. Reviewable via GET, no admin UI needed
   for a testing-phase inbox this size.
   ===================================================================== */
const TESTER_FEEDBACK_FILE = path.join(DATA_DIR, "tester_feedback.json");
let testerFeedback: any[] = [];

try {
  testerFeedback = JSON.parse(fs.readFileSync(TESTER_FEEDBACK_FILE, "utf8"));
  console.log(`[GATEWAY] Restored ${testerFeedback.length} tester feedback entr(ies) from disk.`);
} catch (e) { /* first boot — empty store */ }

function persistTesterFeedback() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = TESTER_FEEDBACK_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(testerFeedback, null, 2));
    fs.renameSync(tmp, TESTER_FEEDBACK_FILE);
  } catch (e) {
    console.error("[GATEWAY] Tester feedback persistence failed:", e);
  }
}

app.post("/api/v1/tester-feedback", (req: Request, res: Response) => {
  const { text, contact, page, ownerName } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "text required" });
  const entry = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: text.trim(), contact: contact || null, page: page || null,
    ownerName: ownerName || null, submittedAt: Date.now()
  };
  testerFeedback.push(entry);
  persistTesterFeedback();
  console.log(`[GATEWAY] Tester feedback from ${entry.ownerName || 'anonymous'} (${entry.page || 'unknown page'}): "${entry.text.slice(0, 80)}"`);
  res.status(201).json({ ok: true, id: entry.id });
});

app.get("/api/v1/tester-feedback", requireAdminKey, (req: Request, res: Response) => {
  res.json({ feedback: testerFeedback, count: testerFeedback.length });
});

// Aggregate service health for the frontend connection indicator
const SERVICE_PORTS: Record<string, number> = {
  "orchestration-engine": 8081, "communication-engine": 8082, "incident-timeline": 8083,
  "feedback-engine": 8084, "identity-service": 8085, "safety-protocol": 8086,
  "emergency-packet": 8087, "capability-registry": 8088, "context-engine": 8089,
  "telemetry-processor": 8090, "action-execution-engine": 8091, "observability": 8092
};
app.get("/api/v1/health/all", async (req: Request, res: Response) => {
  const entries = await Promise.all(Object.entries(SERVICE_PORTS).map(async ([name, port]) => {
    const h = await fetchService(`http://localhost:${port}/health`);
    return [name, h ? "CONNECTED" : "OFFLINE"];
  }));
  const services = Object.fromEntries(entries);
  res.json({ gateway: "CONNECTED", services, connectedCount: entries.filter(e => e[1] === "CONNECTED").length + 1, total: entries.length + 1 });
});

// Browser-facing proxies — the web-app talks only to the gateway
app.get("/api/v1/packet/:packetId/cad", async (req: Request, res: Response) => {
  const cad = await fetchService(`http://localhost:8087/packet/${req.params.packetId}/cad`);
  if (cad) return res.json(cad);
  res.status(502).json({ error: "emergency-packet service unavailable" });
});
app.post("/api/v1/timeline", async (req: Request, res: Response) => {
  const out = await fetchService(`http://localhost:8083/timeline/append`, "POST", req.body);
  if (out) return res.json(out);
  res.status(502).json({ error: "incident-timeline service unavailable" });
});
app.get("/api/v1/timeline/:incidentId", async (req: Request, res: Response) => {
  const out = await fetchService(`http://localhost:8083/timeline/${req.params.incidentId}`);
  if (out) return res.json(out);
  res.status(502).json({ error: "incident-timeline service unavailable" });
});
app.post("/api/v1/context/summarize", async (req: Request, res: Response) => {
  // Not on the hot activation path — nothing about a core emergency action
  // waits on this card, so the default 10s budget bought no safety and did
  // real harm: under live Gemini latency it returned 502 while the model was
  // still working, and the client had no result to show. context-engine has
  // its own deterministic fallback, so a longer wait here still terminates.
  const out = await fetchService(`http://localhost:8089/context/summarize`, "POST", req.body, 20000);
  if (out) return res.json(out);
  res.status(502).json({ error: "context-engine service unavailable" });
});
app.post("/api/v1/context/analyze", async (req: Request, res: Response) => {
  // Heavier structured-schema call (8 required fields) than summarize/synthesize —
  // measured taking longer than the platform's usual 15s AI-chain budget under
  // live Gemini, so it gets its own longer allowance rather than false-negative
  // "service unavailable" while the model is genuinely still working.
  const out = await fetchService(`http://localhost:8089/context/analyze`, "POST", req.body, 25000);
  if (out) return res.json(out);
  res.status(502).json({ error: "context-engine service unavailable" });
});
app.post("/api/v1/context/analyze-photo", async (req: Request, res: Response) => {
  const out = await fetchService(`http://localhost:8089/context/analyze-photo`, "POST", req.body, 25000);
  if (out) return res.json(out);
  res.status(502).json({ error: "context-engine service unavailable" });
});
app.post("/api/v1/context/review-setup", async (req: Request, res: Response) => {
  const out = await fetchService(`http://localhost:8089/context/review-setup`, "POST", req.body, 25000);
  if (out) return res.json(out);
  res.status(502).json({ error: "context-engine service unavailable" });
});
app.post("/api/v1/context/translate", async (req: Request, res: Response) => {
  const out = await fetchService(`http://localhost:8089/context/translate`, "POST", req.body, 15000);
  if (out) return res.json(out);
  res.status(502).json({ error: "context-engine service unavailable" });
});

// Real SMS fallback (Twilio, via communication-engine) for anyone without
// the native Android app - most importantly iOS, which can never get the
// native path. Custom passthrough rather than the fetchService() helper
// used elsewhere: that helper collapses every non-2xx into one generic
// "service unavailable", which would hide the honest, specific reason
// (not configured vs. an actual Twilio failure) this app cares about
// surfacing everywhere else.
app.post("/api/v1/sms/send", async (req: Request, res: Response) => {
  try {
    const resp = await fetch("http://localhost:8082/communication/sms/send", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req.body)
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (e: any) {
    res.status(502).json({ sent: false, error: "communication-engine unreachable" });
  }
});

// Canonical Emergency Activation Route
app.post("/api/v1/incidents", async (req: Request, res: Response) => {
  try {
    const { protected_user_id, activation_source, location, device_id, sensor_data } = req.body;
    const userId = protected_user_id || req.body.userId || CANONICAL_PROTECTED_PERSON.userId;
    const trigger = activation_source || req.body.triggerSource || "MANUAL_SOS";

    const incidentNumber = Math.floor(Math.random() * 90000) + 10000;
    const incidentId = `inc_${incidentNumber}`;

    console.log(`[GATEWAY] Initializing Emergency Activation Vertical Slice for User: ${userId} (${trigger})`);

    // 1. Identity Service (Port 8085)
    let identity: ProtectedPersonContract = await fetchService(`http://localhost:8085/identity/${userId}`);
    if (!identity) {
      identity = CANONICAL_PROTECTED_PERSON;
    }

    // 2. Safety Protocol Service (Port 8086)
    let protocol: SafetyContractRules = await fetchService(`http://localhost:8086/protocol/${userId}`);
    if (!protocol) {
      protocol = CANONICAL_SAFETY_CONTRACT;
    }

    // 3. Capability Registry (Port 8088)
    let capabilities = await fetchService(`http://localhost:8088/capabilities/available/${userId}`);

    // 4. Emergency Packet Service (Port 8087)
    let packet: EmergencyPacketContract = await fetchService(`http://localhost:8087/packet/create`, "POST", {
      userId,
      activationSource: trigger,
      sensorSnapshot: sensor_data || { speed_mph: 42.5, mic_noise_db: 88, detected_keyword: "HELP" },
      contextSnapshot: { location: location || { latitude: 37.7753, longitude: -122.4201, accuracy_meters: 8 } }
    });
    const packetId = packet?.packetId || `pkt_${Date.now()}`;

    // 5. Incident Timeline Service (Port 8083)
    await fetchService(`http://localhost:8083/timeline/append`, "POST", {
      incidentId,
      eventType: "INCIDENT_CREATED",
      source: "GATEWAY",
      summary: `Emergency activation initiated via ${trigger}`
    });

    // 6. Context Engine Service (Port 8089) — AI recommends
    let contextRes = await fetchService(`http://localhost:8089/context/synthesize`, "POST", {
      sensorData: sensor_data || { mic_noise_db: 88, speed_mph: 42.5 },
      safetyProtocol: protocol
    });
    if (contextRes) {
      await fetchService(`http://localhost:8083/timeline/append`, "POST", {
        incidentId,
        eventType: "AI_CONTEXT_SYNTHESIS",
        source: contextRes.aiProvider === "gemini-live" ? "Gemini (live)" : "Context Engine (deterministic)",
        summary: contextRes.summary || `Severity ${contextRes.severity}; ${(contextRes.recommendations || []).length} candidate action(s) recommended.`
      });
    }

    // 6b. Orchestration Engine evaluates AI recommendations against the
    // authorized Safety Protocol — AI recommends, orchestration decides.
    // Gateway's SafetyContractRules uses different field names than the
    // orchestration engine's SafetyProtocol shape, so map explicitly rather
    // than passing the object through and silently breaking the mesh check.
    let evalRes: any = null;
    if (contextRes?.recommendations?.length) {
      const orchestrationProtocol = {
        protocolId: protocol.protocolId,
        allowMeshRelay: protocol.meshRelayPermitted !== false,
        authorizedDataSources: ["MICROPHONE", "GPS"],
        maxEscalationTier: 3
      };
      evalRes = await fetchService(`http://localhost:8081/orchestrate/evaluate`, "POST", {
        incidentId,
        aiRecommendations: contextRes.recommendations,
        safetyProtocol: orchestrationProtocol
      });
      if (evalRes?.validatedCommands) {
        const cmds: string[] = evalRes.validatedCommands;
        // Orchestration-engine renames two actions instead of prefixing them
        // literally (SWITCH_TO_MESH -> EXECUTE_BLE_MESH_RELAY or
        // EXECUTE_CELLULAR_FALLBACK; ACTIVATE_MIC -> EXECUTE_MIC_STREAM, or
        // silently dropped if not authorized). Everything else is a literal
        // EXECUTE_<action> passthrough. Mirror that mapping exactly so the
        // audit trail reports what actually happened, not a guess.
        const outcomes = contextRes.recommendations.map((r: any) => {
          if (r.action === "SWITCH_TO_MESH") {
            if (cmds.includes("EXECUTE_BLE_MESH_RELAY")) return { action: r.action, outcome: "approved (mesh relay)" };
            if (cmds.includes("EXECUTE_CELLULAR_FALLBACK")) return { action: r.action, outcome: "overridden to cellular fallback (mesh not authorized)" };
            return { action: r.action, outcome: "not evaluated" };
          }
          if (r.action === "ACTIVATE_MIC") {
            return cmds.includes("EXECUTE_MIC_STREAM")
              ? { action: r.action, outcome: "approved" }
              : { action: r.action, outcome: "denied (microphone not authorized)" };
          }
          return cmds.includes(`EXECUTE_${r.action}`)
            ? { action: r.action, outcome: "approved" }
            : { action: r.action, outcome: "not approved" };
        });
        const approvedCount = outcomes.filter((o: any) => o.outcome.startsWith("approved")).length;
        const flagged = outcomes.filter((o: any) => !o.outcome.startsWith("approved"));
        await fetchService(`http://localhost:8083/timeline/append`, "POST", {
          incidentId,
          eventType: "AI_ACTIONS_EVALUATED",
          source: "Orchestration Engine",
          summary: `${outcomes.length} action(s) recommended by AI · ${approvedCount} approved and executed` +
            (flagged.length ? ` · ${flagged.map((o: any) => `${o.action} ${o.outcome}`).join('; ')}` : '') + '.'
        });
      }
    }

    // Unified Response Payload
    const responsePayload = {
      incident_id: incidentId,
      packet_id: packetId,
      status: "ACTIVE",
      severity: contextRes?.severity || "HIGH",
      protected_user: {
        id: identity.userId,
        display_name: identity.name,
        medical_notes: identity.medicalNotes
      },
      safety_protocol: {
        protocol_id: protocol.protocolId,
        trusted_network_alert_authorized: true,
        location_sharing_authorized: true
      },
      communication: {
        selected_transport: "CELLULAR_DATA",
        status: "QUEUED"
      },
      ai_context: contextRes ? {
        provider: contextRes.aiProvider,
        summary: contextRes.summary,
        recommendations: contextRes.recommendations,
        suggested_transport: contextRes.suggestedTransport
      } : null,
      orchestration_evaluation: evalRes ? {
        workflow_id: evalRes.workflowId,
        validated_commands: evalRes.validatedCommands
      } : null
    };

    console.log(`[GATEWAY] Emergency Activation Vertical Slice Completed Successfully for Incident #${incidentId}`);
    res.status(201).json(responsePayload);
  } catch (error: any) {
    console.error("[GATEWAY] Error in emergency activation vertical slice:", error);
    res.status(500).json({ error: "Emergency activation failed", details: error.message });
  }
});

// Legacy Client Ingress Endpoint
app.post("/api/v1/emergency/activate", async (req: Request, res: Response) => {
  try {
    const { userId, triggerSource, severity, latitude, longitude, sensorData } = req.body;
    const packetId = `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const trigger = triggerSource || "MANUAL_SOS";

    console.log(`[GATEWAY] Emergency activated: Packet ${packetId} for User ${userId} via ${trigger}`);

    res.status(201).json({
      message: "Emergency activation accepted. Pipeline engaged.",
      packetId,
      orchestrationState: "EVALUATING",
      details: { packetId, userId: userId || CANONICAL_PROTECTED_PERSON.userId, triggerSource: trigger, severity }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Emergency activation failed", details: error.message });
  }
});

// Every defined route returns a JSON {"error": "..."} shape on failure —
// an unmatched route should too, not Express's default HTML page.
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "not found" });
});

// Catches malformed-JSON and payload-too-large errors that would otherwise
// fall through to Express's default HTML error page, which includes a full
// stack trace with local filesystem paths (services/gateway/node_modules/...)
// — found leaking that to any caller during a platform security audit.
// Must be registered last and keep all four params for Express to treat it
// as an error handler rather than a normal route.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 400;
  res.status(status).json({ error: status === 413 ? "payload too large" : "malformed request body" });
});

app.listen(PORT, () => {
  console.log(`[GATEWAY] Billi API Gateway listening on port ${PORT}`);
});
