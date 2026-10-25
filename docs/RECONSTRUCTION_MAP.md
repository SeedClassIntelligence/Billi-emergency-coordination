# Billi Reconstruction Map

**Status:** proposal for owner review. Nothing here has been implemented.
**Basis:** a read of this repository (web-app, 13 services, native shell, docs) and of
`bilawalsidhu/gods-eye-view` (MIT). Every "today" claim cites a file. Where something was
not traced, it says so (section 9).

---

## 1. What Billi was

Billi was designed as an **Emergency Lifecycle** (`docs/BILLI_CTO_ARCHITECTURE.md`):
Identity → Safety Protocol → Incident → Orchestration → Response → Resolution → Learning,
with AI that recommends and a deterministic layer that decides.

As built, it is a high-fidelity **prototype**. The repo's own `ENGINEERING_GUARANTEES.md`
classifies it as a "Local Software Engineering Prototype" with live push, hardware sensing,
BLE and 911 as "Non-Production Roadmap Boundaries". That classification is accurate. The
product thinking is ahead of the implementation: the **client** (`web-app/billi-core.js`)
carries the incident engine, and the backend is largely a scaffold around it.

The reconstruction keeps the design and moves the guarantees to where they can be trusted.

---

## 2. Triage

### 2.1 Keep — validated product and design

| Item | Where |
|---|---|
| Emergency Lifecycle as the product spine | `docs/BILLI_CTO_ARCHITECTURE.md` |
| Four core actions as an invariant that never waits on AI | `orchestration-engine` (concept) |
| "AI recommends, rules decide" | README, `orchestration-engine` |
| Duress PIN with feigned cancellation and silent escalation | `billi-core.js` `enterDuress` |
| Fail-safe confirmation window for sensor-inferred triggers (silence escalates) | `billi-core.js` `PASSIVE_TRIGGERS` |
| Per-contact permission matrix (medical, evidence, location, duress visibility) | `billi-core.js` FIXTURE contacts |
| Honest labelling of AI provider and model; labelled deterministic fallback | `context-engine`, `incident.html` |
| Onboarding that asks "Just me / family / team" first | `onboarding.html` |
| Readiness gating, safe-zone Haversine math, 29 passing tests | `web-app/test/core.test.js` |
| Six Gemini routes with two-model failover | `services/context-engine` |
| 911/CAD packet concept and serialization shape | `emergency-packet` |
| Native Android SMS through the phone's own SIM | `BilliNativeBridge.java` |
| Shared incident over SSE across guardian / protected / responder | `gateway` |
| **Scenario packs** — repurpose as synthetic incident logs for the simulator and replay tests | `billi-core.js` `SCENARIO_PACKS` |

### 2.2 Should work, but doesn't — ranked by safety criticality

| # | Expected behaviour | Today (evidence) |
|---|---|---|
| 1 | Escalation proceeds if the protected person's phone dies or the app closes | The ladder is computed in the browser from elapsed time (`incidentView`). SMS fires from a render tick. No server timer exists. |
| 2 | Protection continues with the screen off | `AndroidManifest.xml` declares no foreground service. The app is a WebView in an Activity. |
| 3 | The real position reaches the packet, Gemini and the 911 export | `activateRemote` sends `SIM_PATH[0]`, a hardcoded San Francisco coordinate (`billi-core.js:530`). The CAD packet hardcodes identity, `speedMph: 42.5`, battery 82, signal GOOD (`emergency-packet/src/index.ts:228-245`). |
| 4 | "DELIVERED" means a receipt exists | It is a timer: `elN < 6 ? 'SENT' : 'DELIVERED'` (`billi-core.js`). |
| 5 | The user's Safety Contract governs every action | The gateway hardcodes `authorizedDataSources: ["MICROPHONE","GPS"]` (`gateway/src/index.ts`). `safety-protocol` and `identity-service` return a fixed canonical record for any user. |
| 6 | Only authorized people see an incident | Auth is simulated (`auth.html`). `GET /shared/incidents/active` returns the live incident, with location and medical data, to anyone. The sample Firestore rules let any signed-in user read and write any incident. |
| 7 | Telemetry is retained and processed | `telemetry-processor` logs and returns 202; it stores nothing. |
| 8 | Incident state survives redeploys | JSON files on a scale-to-zero container. |
| 9 | Signal loss and phone-off are detected | They come from a scripted timer (`degradeAt`), not from detection. |
| 10 | The responder map shows real positions | `incident.html` draws CSS dots scaled to a scripted path; the responder dot is fixed at `left:18%; top:80%`. |
| 11 | Orchestration checkpoints and recovers workflows | `/orchestrate/recover` moves a pending step to completed. `executeCoreActions` returns constants. |
| 12 | Actions execute | `action-execution-engine` logs strings. |
| 13 | Fall, crash and wearable triggers fire | Devices are fixture rows labelled SIMULATED. No native detector exists. |
| 14 | Operational metrics reflect reality | `observability` initialises metrics to constants (`incidentsCreatedTotal: 1`, `deliverySuccessRatePercent: 100`). Updates were not traced. |

Items 1–5 are the ones a person's safety depends on. Everything spatial in this document
is worth little until they hold.

### 2.3 Retire or archive

`mobile-app/` (superseded Flutter), `cloud-functions/`, root-level Terraform duplicates,
`.srt1/` tooling state, committed `.data/` runtime files, and overlapping demo pages
(`demo_30s.html`, `demo-live.html`) once one guided demo remains.

---

## 3. What God's Eye View clarifies

GEV is a viewer of public feeds, so it clarifies **how to understand a situation**, not how
to guarantee an alert. It sharpens six ideas.

| Idea | GEV evidence | What it clarifies for Billi |
|---|---|---|
| The incident is a fused picture over time, not a bag of timers and actions | Layer system fusing many sources | Billi's incident should be an append-only log of observations with projections (trail, status, packet, timeline) |
| Every datum carries its state and age | `feedState.js`, `layerSnapshot.js`: nominal / stale / fallback / unavailable | Billi already does this for Gemini only; it should apply to every fix and every device |
| Silence is signal | `aisWatchdog.js`: liveness by data arrival, "stale" vs "recycle" budgets, classified failures. Video 5:57–6:23 | Loss of fixes is a first-class derived event with its own marker and timer |
| Three clocks | `contactPlayback.js` flags: VEHICLE_TIME, FEED_TIME, RECEIPT_TIME | Device time, server receipt time and derived time must be separate fields. Billi logs `Date.now()` from clients. |
| Estimates are drawn and named as estimates | Launch replay labelled `RECONSTRUCTED ESTIMATE`, scrubbable 0.25×–4× (`layers/launches`) | The convention for reconstructed movement and for incident replay |
| Sources declare availability; absence degrades, not crashes | `sourceComposition.js` | Billi's capability registry should report honest states |

**What GEV does not clarify:** escalation guarantees, background execution, authentication,
durable storage, or consent. Those are Billi's gaps (2.2 items 1–8) and need no GEV code.

---

## 4. Target map

### 4.1 Principle

> The incident is an **append-only log of observations**. Everything a person sees — trail,
> status, packet, summary, replay — is a **projection** of that log.

Three planes sit over the existing lifecycle:

- **Observation** — acquire from authorized devices and sources
- **Understanding** — maintain a spatially and temporally consistent picture
- **Coordination** — contract, escalation, communication, action

### 4.2 The observation record

```
observationId   stable, unique (replaces the `t|type|actor` dedupe key)
entityId        the protected person (entityType reserved: person | vehicle | …)
incidentId
class           OBSERVED | DERIVED | ESTIMATED | AI_INFERRED
source          device id, service, or person
kind            LOCATION | MOTION | AUDIO | HEARTBEAT | ACK | DELIVERY_RECEIPT | …
deviceTime      as reported by the device
receivedAt      stamped by the server
derivedFrom     [observationId]   (required for DERIVED / ESTIMATED / AI_INFERRED)
payload         kind-specific
quality         accuracy_meters, confidence, or null
```

| Class | Meaning | Examples |
|---|---|---|
| OBSERVED | Reported by a device or person | GPS fix, acknowledgement, provider receipt |
| DERIVED | Deterministic arithmetic on observed data | speed, bearing, zone exit, straight line between fixes |
| ESTIMATED | Position not observed | dead-reckoned extension after the last fix, road-snapped path |
| AI_INFERRED | A model's reading | Gemini summary or risk classification |

Rules: UI state that is a timer ("DELIVERED" by elapsed time) is never recorded as
OBSERVED. A DERIVED or ESTIMATED record without `derivedFrom` is rejected. AI_INFERRED
records are text only and are never drawn as geometry.

### 4.3 Observability states

Computed server-side from heartbeat and fix arrival. A server sees only silence, so causes
are **inferred** from the last observed device state and labelled as such.

| State | Basis | Class of the conclusion |
|---|---|---|
| LIVE | Fixes arriving within budget | OBSERVED |
| DEGRADED_GPS | Fixes arriving, `accuracy_meters` large | OBSERVED |
| SENSOR_STOPPED | Heartbeat continues, one stream stopped | OBSERVED |
| SILENT_PROBABLE_CONNECTIVITY | Silence; last heartbeat showed weak signal | AI_INFERRED-style hypothesis (labelled) |
| SILENT_PROBABLE_BATTERY | Silence; last heartbeat or event showed low battery | hypothesis (labelled) |
| SILENT_UNKNOWN | Silence, no supporting evidence | stated as unknown |

Pattern from GEV: separate a fast "tell the user" budget from a slow "act" budget.
Depends on the device agent (Phase 2); in a WebView the OS may suspend the app, so silence
would otherwise mean little.

### 4.4 Services

Responsibilities from the original design are preserved. Each stays a **logical module with
its own interface**; whether it deploys as its own process is a separate decision, made
module by module as each becomes real (not pre-merged).

| Service | Today | Role in target | Disposition |
|---|---|---|---|
| gateway | Real: routes, SSE, households, shared incidents | API edge + auth. Shared-incident state moves to the incident authority; the client can no longer overwrite it | Keep; narrow |
| orchestration-engine | Evaluates AI recommendations (~20 lines); fake recovery | Coordinator + **policy gate**: every action, AI-recommended or not, is checked against the stored Safety Contract | Keep name; implement |
| safety-protocol | Returns a constant | Owns each user's real Safety Contract; geofence evaluation | Implement |
| identity-service | Returns a constant | Real profiles, consent records, roles for guardian / responder | Implement |
| telemetry-processor | Logs; stores nothing | **Observation intake**: validate, assign IDs, stamp receipt time, persist, run the observability watchdog | Implement; promote |
| incident-timeline | Append-only log (real, file-backed) | The incident log itself; the ledger of record | Keep; extend schema |
| emergency-packet | Hardcodes identity, speed, battery | A **projection** of the log (latest fix, device status, evidence counts, medical) | Rewrite as projection |
| context-engine | Real Gemini calls with fallback | Understanding: receives a structured, cited geography block; returns cited output | Keep; extend |
| communication-engine | Delivery states simulated; real SMS only via `/sms/send` | Sends via native SMS or provider; records **provider receipts** | Implement receipts |
| action-execution-engine | Logs only | Executes gate-approved actions and writes outcomes to the log | Implement |
| capability-registry | Returns fixture devices | Real device inventory with honest availability states | Implement |
| feedback-engine | Not reviewed in depth | Post-incident review driven by replay metrics | Keep; revisit |
| observability | Constant metrics | Real metrics (alert latency, time-to-ack) | Implement |
| **new:** escalation worker | — | Durable timers; executes the ladder server-side; survives client loss | New |
| **new:** device agent (Android) | — | Foreground service, background location, heartbeat, offline queue, fall/crash detection | New |

### 4.5 Clients

- **Android:** keep the web UI in a WebView for speed of iteration; add a native service
  module that owns location, heartbeat, queue and SMS. The UI becomes a renderer.
- **Web (guardian / responder):** renderer of server projections over SSE.
- **iOS:** unchanged position (no native SMS path). State it plainly in the product.

### 4.6 Gemini

Stays the intelligence layer, with no change to the six routes' purpose. Additions:

1. Input is a **structured block of cited facts** (observation IDs), not a free sensor bag.
2. Output cites the IDs it relied on; the server **validates** that cited IDs exist and
   that quoted values match, and flags uncited claims.
3. Every output is stored as AI_INFERRED with `derivedFrom`.

A thin provider seam can be added later; it is not a goal now.

### 4.7 Spatial understanding

| Capability | Source | Status |
|---|---|---|
| Real basemap, roads, intersections | 2D vector map (not GEV) | Build |
| Trail with accuracy circles, last confirmed position | Billi telemetry | Build |
| Playback with report-time semantics | Pattern from `contactPlayback.js` (pure, MIT) | Adapt |
| Dead-reckoned estimate with uncertainty | Math from `motionModel.js` (MIT, adapted from skylight MIT); re-tune for walking and driving | Adapt |
| Route and ETA for responders | `routeSteps.js` (pure) + OSRM proxy pattern | Adapt; self-host or paid router for production |
| Place names for Gemini | `regionalModel.js` + reverse geocode through Billi's own gateway | Adapt |
| Road snapping, "approaching an intersection" | **Not in GEV** (`groundSnap.js` is terrain height) | Build |
| Multi-party picture with consent | **Not in GEV** | Build |
| Replay from the incident log | Pattern only (`RECONSTRUCTED ESTIMATE`) | Build |

---

## 5. Build order and acceptance tests

Order is by dependency. A better map of an unreliable alert is worse than a plain screen
that always alerts.

| Phase | Work | Done when |
|---|---|---|
| 0 | Decisions in §6. Simulator that replays scenario packs as synthetic incident logs. Contract tests for the observation record. | A scenario replays deterministically from a log |
| 1 | Auth and storage. Incident authority and clock on the server. Escalation worker. Real Safety Contract in the policy gate. Provider receipts. | Kill the client mid-incident: alerts still go out in order. "DELIVERED" appears only with a receipt. A denied data source is refused regardless of AI confidence. Unauthenticated callers cannot read an incident. |
| 2 | Android device agent: foreground service, background location, heartbeat with device state, offline queue. | Screen off and app swiped away on a real device: fixes continue at cadence. Network cut: queued and flushed on reconnect. |
| 3 | Observation ledger. Telemetry-processor persists. Observability watchdog. Real fix flows to packet, CAD export and Gemini. | CAD export shows the real last fix, with age and class. Silence produces the correct labelled state within budget. |
| 4 | Spatial understanding (§4.7): real map, classed trail, accuracy circles, derived values, place context, routes/ETA, estimate cone. | A recorded drive renders as confirmed segments, a dashed estimate through a gap, and the last confirmed position |
| 5 | Grounded Gemini with citations. Incident replay. Feedback-engine metrics. | An answer to "where did the signal drop?" cites observation IDs that validate. Replay matches the log. |
| 6 | Trusted-network live picture (responder positions with consent). Second application only after this. | Positions shown only to roles the contract allows |

---

## 6. Decisions needed

| # | Decision | Recommended default |
|---|---|---|
| 1 | Storage and hosting | Firestore (matches `schemas/`) on Cloud Run; Cloud Tasks / Scheduler for escalation timers; at least one warm instance for the escalation worker |
| 2 | Auth | Managed identity with phone-number sign-in; guardians and responders join by scoped invite |
| 3 | Android shape | Keep WebView UI + native service module |
| 4 | Deployment units | Keep logical modules; decide process boundaries per module as each becomes real |
| 5 | Basemap | MapLibre GL with a tile provider whose terms permit a commercial app |
| 6 | Model | Gemini remains primary; no abstraction work until needed |

---

## 7. Non-goals

Tactical or military-style UI. Unrelated public feeds (CCTV, ALPR, flights, vessels).
Public-camera "ground truth". Fleet and livestock applications before the emergency core
is trustworthy. 3D globe rendering on the phone. Live 911 integration.

---

## 8. Licensing and privacy

- GEV code is MIT; any copied or adapted code carries its notice, including math adapted
  from skylight (MIT).
- Cesium ion's free token is for personal, non-commercial use; Billi is commercial.
- OSM data is ODbL: attribution required; storing derived extracts may carry share-alike
  duties (needs legal review).
- Public Nominatim and OSRM demo servers are not production services.
- Google 3D Tiles and Places are proprietary and billed.
- Sending a child's coordinates to a third-party geocoder discloses a minor's location.
  Route lookups through Billi's gateway to a provider under contract or self-hosted.
- GEV's bundled Nepal flood data is non-commercial; exclude it.

---

## 9. Not verified

Neither system was run end to end. GEV's tests were not run. For GEV I read module
headers and doc comments, not every function. `feedback-engine` and the update path of
`observability` metrics were not traced. The live Cloud Run deployment and the APK were
not tested. Claims about the YouTube transcripts come from the text pasted by the owner.
