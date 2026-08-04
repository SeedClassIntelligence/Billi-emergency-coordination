# Billi — Emergency Coordination Platform

**The protected person is the persistent entity.** Billi coordinates a protected person's
devices, trusted network, and responders into one shared, continuously-updated incident —
from activation through resolution — with live Gemini AI assisting every step of the way.

## Quick start

```bash
npm start
```

That single command boots the entire platform: all 13 backend microservices plus an HTTPS
server for the web app. Wait for the `✓ BILLI PLATFORM READY — 13/13 services connected`
banner, then open:

- **Phone-ready (HTTPS, unlocks real GPS/mic):** `https://localhost:8443/landing.html`
- **Desktop (plain HTTP):** open `web-app/landing.html` via your preview tool of choice

Press `Ctrl+C` to stop everything.

### Enabling live Gemini

Copy `.env.example` to `.env` and set `GEMINI_API_KEY` (get one free at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey)). This is **platform-level
configuration** — one key powers Gemini for every session and every role (protected person,
guardian, responder), not something each person running the platform needs to supply
themselves. Without a key, every AI-assisted route falls back to honest, clearly-labeled
deterministic logic — nothing ever silently pretends to be AI-generated when it isn't.

## Architecture

```
web-app/ (9 surfaces, plain HTML/CSS/JS)
        │  talks only to the gateway — no other service is browser-facing
        ▼
services/gateway (:8080)
        │  fans out to, and aggregates responses from:
        ├─ orchestration-engine (:8081)   state machine, core-actions invariant,
        │                                  AI-recommendation rule engine
        ├─ communication-engine (:8082)   transport selection, delivery-state tracking
        ├─ incident-timeline (:8083)      append-only event log
        ├─ feedback-engine (:8084)        post-incident review
        ├─ identity-service (:8085)       protected-person profiles
        ├─ safety-protocol (:8086)        Safety Contract rules, geofence evaluation
        ├─ emergency-packet (:8087)       Living Emergency Packet + CAD serialization
        ├─ capability-registry (:8088)    device/sensor inventory
        ├─ context-engine (:8089)         live Gemini — synthesis, summarization, translation
        ├─ telemetry-processor (:8090)    real device telemetry ingest
        ├─ action-execution-engine (:8091) dispatches approved actions
        └─ observability (:8092)          service health, tracing
```

Every service is a small Express/TypeScript process with its own atomic-write JSON persistence
(`.data/` per service) — no external database required to run the full platform locally.

## What's real vs. simulated

Billi is built to be honest about this everywhere in the UI (look for `CONNECTED` / `SIMULATED`
/ `LOCAL` / `UNAVAILABLE` labels), not just in this file:

| Capability | State |
|---|---|
| Incident lifecycle, Safety Contract, Trusted Network, duress branch, escalation ladder | Real, running, backend-verified |
| Shared incident state across guardian/protected/responder sessions | Real — SSE-pushed through the gateway |
| Gemini context synthesis, summarization, action recommendations | Real, live, when `GEMINI_API_KEY` is set |
| Real device GPS, motion, audio recording, speech output | Real, via browser APIs (`web-app/billi-adapters.js`) — needs HTTPS |
| Video capture | Honestly unavailable in this prototype — never faked |
| Push notifications, carrier SMS/voice, live 911/CAD dispatch | Simulated — no external integration exists yet |
| BLE mesh relay | Simulated — strategy selection is real, physical radio relay is not |

See [PLATFORM_DESIGN_BUILD_REPORT.md](PLATFORM_DESIGN_BUILD_REPORT.md) for the full build history
and verification log, [MOBILE_CAPABILITY_EXECUTION_MATRIX.md](MOBILE_CAPABILITY_EXECUTION_MATRIX.md)
for the capability-by-capability breakdown of what's wired to native device APIs today versus
what a native mobile app would still need to add, and [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for a
walkthrough covering exactly where and how Gemini is used, including what to say if its free-tier
quota is exhausted mid-demo.

## Project structure

```
.
├── start-all.js              # One-command startup for all 13 services + HTTPS server
├── services/                 # 13 backend microservices (the running architecture)
├── web-app/                  # Frontend — 9 surfaces, plain HTML/CSS/JS, no build step
├── packages/                 # Shared TypeScript contracts + demo fixtures
├── tools/https-server.js     # HTTPS static server + gateway proxy (phone-testable)
├── PLATFORM_DESIGN_BUILD_REPORT.md
├── MOBILE_CAPABILITY_EXECUTION_MATRIX.md
└── archive/                  # Earlier architecture generations, superseded — kept for
                               # reference only, not part of the running platform
```

`archive/` contains two earlier, no-longer-running attempts (a React+Firebase monolith and a
2-service Cloud Run design) — kept for reference only; real business logic has been ported out
of the monolith where useful (e.g. the Gemini 911/CAD analysis schema). A third earlier
generation — orphaned Firebase Cloud Functions and duplicate Terraform infra — was deleted
outright as dead code rather than archived, since nothing referenced it. The `services/`
directory above is the one real, complete, currently running system.

## Running an individual service

Each service can also be started on its own during development:

```bash
cd services/<service-name>
npx ts-node-dev --transpile-only src/index.ts
```

## Tests

```bash
npm test
```

Runs the safety-critical logic in `billi-core.js` (readiness gating, duress/PIN cancellation,
the accidental-trigger confirmation window) under Node's built-in test runner — no test
framework dependency, in keeping with the rest of the project having no build step. See
`web-app/test/harness.js` for how it loads a `<script>`-tag-style file into a sandboxed context.
