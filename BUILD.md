# BILLI PLATFORM: CANONICAL BUILD & DEPLOYMENT GUIDE

**Doc Version:** 2.1.0 (DDD v2 Architecture)  
**Target Platform:** Google Cloud Platform (GCP) & Flutter Mobile/SDK Ecosystem  
**Engineering Guarantees:** [ENGINEERING_GUARANTEES.md](file:///c:/Users/SEEDN/Downloads/Billi-emergency-coordination-main/ENGINEERING_GUARANTEES.md)  
**Architecture Specification:** [docs/BILLI_CTO_ARCHITECTURE.md](file:///c:/Users/SEEDN/Downloads/Billi-emergency-coordination-main/docs/BILLI_CTO_ARCHITECTURE.md)

---

## 1. Overview & System Philosophy

Billi is a **human-centered emergency orchestration platform**. The platform reduces the time between danger occurring and meaningful help beginning by coordinating existing hardware sensors, communication channels, AI context models, and trusted networks.

The canonical execution flow is centered on the deterministic **Orchestration Engine**:

```text
Safety Protocol
       ↓
Emergency Activation
       ↓
Orchestration Engine (State Coordinator & Workflow Checkpointer)
       ↓
├── Capability Registry (Hardware Abstraction)
├── Context Engine (Vertex AI Gemini 1.5)
├── Communication Engine (Multi-Transport Router & State Machine)
├── Incident Timeline (Event-Sourcing Log)
├── Dynamic Emergency Packet (Living State Engine)
├── Action Execution Engine (Verified Commands)
└── Observability Service (Metrics, Tracing & Operational Health)
       ↓
Trusted Network / Emergency Response
       ↓
Feedback Engine (Post-Incident Learning)
```

---

## 2. Prerequisites

* **Node.js**: `v20.x` or higher
* **TypeScript**: `v5.3.x`
* **Google Cloud SDK (`gcloud`)**: Configured with project owner permissions
* **Terraform**: `v1.5+`
* **Flutter SDK**: `v3.19+` (for mobile app & SDK layer)

---

## 3. 13 Core Domain Services Build Matrix

The platform consists of **13 Core Domain Services**:

| Core Domain Service | Assigned Port | Purpose | Build Command |
|---|---|---|---|
| `gateway` | `8080` | REST Ingress Gateway & Activation Router | `npm run build` |
| `orchestration-engine` | `8081` | Central State Machine, Rule Evaluator & Workflow Checkpointer | `npm run build` |
| `communication-engine` | `8082` | Multi-Transport Strategy Router & Delivery State Machine | `npm run build` |
| `incident-timeline` | `8083` | Event-Sourcing Append-Only Audit Log | `npm run build` |
| `feedback-engine` | `8084` | Post-Incident Analytics & Protocol Adaptation | `npm run build` |
| `identity-service` | `8085` | User Identity, Guardians, and Device Bindings | `npm run build` |
| `safety-protocol` | `8086` | Pre-Authorized Protocol & Permission Matrix | `npm run build` |
| `emergency-packet` | `8087` | Living Emergency Packet Manager | `npm run build` |
| `capability-registry` | `8088` | Hardware Capability Abstraction Layer | `npm run build` |
| `context-engine` | `8089` | Vertex AI Gemini Context Provider | `npm run build` |
| `telemetry-processor` | `8090` | High-Throughput Stream Ingestion Worker | `npm run build` |
| `action-execution-engine`| `8091` | Verified Command Execution & Dispatch | `npm run build` |
| `observability` | `8092` | Metrics, Distributed Tracing & Operational Health Aggregator | `npm run build` |

To build all 13 services in sequence:

```powershell
$services = @("gateway","orchestration-engine","communication-engine","incident-timeline","feedback-engine","identity-service","safety-protocol","emergency-packet","capability-registry","context-engine","telemetry-processor","action-execution-engine","observability")
foreach ($svc in $services) {
    Write-Output "Building services/$svc..."
    Set-Location "services/$svc"
    npm install
    npm run build
    Set-Location "../.."
}
```

---

## 4. Verification Suites (`verification/`)

Automated verification suites prove system guarantees across 6 dedicated test domains:

```bash
# 1. Telemetry Verification Suite
node verification/telemetry/test_emergency.js

# 2. End-to-End Vertical Slice Verification Suite
node verification/vertical_slice/test_vertical_slice.js

# 3. Persistent Restart Recovery Verification Suite
node verification/restart_recovery/test_restart_recovery.js

# 4. Failure-Safe Idempotent Activation Verification Suite
node verification/failure_recovery/test_failure_recovery.js

# 5. Deterministic Workflow Recovery & Replay Verification Suite
node verification/workflow/test_workflow_recovery.js

# 6. System Safety Guarantees & Edge-Cases Verification Suite
node verification/safety_guarantees/test_safety_guarantees.js
```
