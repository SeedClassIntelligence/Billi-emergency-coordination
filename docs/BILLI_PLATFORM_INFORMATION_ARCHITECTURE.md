# BILLI PLATFORM INFORMATION ARCHITECTURE

**Document Date:** 2026-08-01  
**Status:** Single Source of Truth Platform Architecture & Integration Audit  
**Target Workspace:** `c:\Users\SEEDN\Downloads\Billi-emergency-coordination-main`  

---

## 🏛️ EXECUTIVE PLATFORM VISION

Billi is an **Enterprise Safety Coordination Platform** designed as **One Cohesive Ecosystem** structured across **9 Operational Surfaces**:

```text
                                ROUTING RULE
                           Create Account / Log In
                                     │
                 Does account have completed safety ecosystem?
                                     │
               ┌─────────────────────┴─────────────────────┐
               ▼                                           ▼
      Surface 2A (Uninitialized)                  Surface 2B (Operational)
      - "Welcome to Billi"                        - "Good evening, Evelyn"
      - 9-Step Ecosystem Setup Wizard             - Maya Johnson (Age 11)
      - Guided Onboarding & Activation            - 7 Connected Hardware Nodes
               │                                  - Armed Telemetry Status
               ▼                                           ▲
      Complete Setup & Activate ───────────────────────────┘
```

---

## 🏛️ SURFACE 2 STATE-AWARENESS (2A INITIALIZATION vs 2B OPERATIONAL)

### Surface 2A — Uninitialized Account (Initialization Journey)
When an account has no configured entity or protected person, Surface 2 displays:
> **"Welcome to Billi — Let’s build your safety ecosystem."**

**The 9-Step Guided Setup Progress**:
1. **Choose Entity**: Family, School District, Enterprise Business, Campus, or Community.
2. **Create Account Owner**: Primary administrator and priority contact (e.g. Evelyn Johnson).
3. **Add Protected Person**: The person whose safety Billi will monitor (e.g. Maya Johnson, Age 11).
4. **Add Medical & Emergency Info**: Medical conditions (Mild Asthma) and rescue instructions (Albuterol inhaler in backpack).
5. **Build Trusted Network**: Priority hierarchy (Mom = Priority 1, Dad = Priority 2, Officer Davis = Priority 3, Grandma Clara = Priority 4).
6. **Configure Safety Contract**: Permissions, spoken safe words (`"Blue Folder"`), safe PIN (`1234`), duress PIN (`9999`), and primary geofence (Pine School 100m).
7. **Register Available Devices**: Bind 7 connected hardware nodes.
8. **Test Readiness**: Diagnostic telemetry check and Gemini 2.0 AI Copilot readiness.
9. **Review & Activate**: Verification checklist before unlocking Surface 2B.

### Surface 2B — Operational Account (Armed Operational Dashboard)
Only after completing Surface 2A setup does the Operational Dashboard display:
- *"Good evening, Evelyn"*
- Maya Johnson card (Age 11, Mild Asthma)
- 7 Connected Devices · 3 Safe Zones · 4 Trusted Contacts · 9 Detection Paths
- 100% Armed Baseline Status

---

## 🔍 TRUTHFUL CONNECTIVITY & INTEGRATION STATUS AUDIT (THE 9 SURFACES)

| Surface ID | Surface Name | Primary Responsibility | Target Backend Microservice | Current Implementation Status | Connectivity Details |
|---|---|---|---|---|---|
| **Surface 1** | **Public Landing & Demos** | Pre-Auth Hero & 9 Interactive Scenario Launchers | `gateway` (:8080) | `interactive local prototype` | Renders 9 real-world scenarios in local client engine; connects to demo fixtures in `packages/demo-fixtures`. |
| **Surface 2A**| **Initialization Journey** | 9-Step Ecosystem Setup Wizard & Activation | `identity-service` (:8085) & `safety-protocol` (:8086) | `interactive local prototype` | 9-step wizard state engine active in `web-app/app.js`; ready for REST POST binding to services 8085 & 8086. |
| **Surface 2B**| **Operational Dashboard** | Armed Baseline Overview & Family Telemetry Metrics | `identity-service` (:8085) & `telemetry-processor` (:8090) | `interactive local prototype` | Population engine ready; consumes `packages/domain-models` contracts locally. |
| **Surface 3** | **Protected Person View** | 100% Armed Baseline Display & SOS Button Charm | `gateway` (:8080) & `action-execution-engine` (:8091) | `interactive local prototype` | Renders 100% Armed status, geofence status (`INSIDE PERIMETER`), and 2s hold SOS button. |
| **Surface 4** | **Guardian Operations** | Trusted Network Hierarchy & Priority Matrix | `communication-engine` (:8082)| `connected to backend` | Bound to `communication-engine` Express routes on Port 8082 for contact channels. |
| **Surface 5** | **Active Incident** | Live Trajectory Map, 4 Action Buttons, 45s Timer, CAD Exporter | `orchestration-engine` (:8081) & `emergency-packet` (:8087) | `verified end to end` | Verified via real service execution audit suite (`real_service_execution_audit.test.ts`). Atomic file store writes `.data/packets.json`. |
| **Surface 6** | **Responder Console** | First Responder Tactical Map & Ground Unit Dispatch (`ON_SCENE`) | `gateway` (:8080) & `responder-models` | `connected to backend` | Ground unit dispatch routes through Gateway Port 8080 to update scene status. |
| **Surface 7** | **Safety Contracts** | Medical Dossier, Safe Words (`"Blue Folder"`), Dual PINs (`1234`/`9999`) | `safety-protocol` (:8086) | `connected to backend` | Protocol engine running on Port 8086 evaluating PIN hashes and safe zone radiuses. |
| **Surface 8** | **Hardware & Devices** | 7 Hardware Nodes Binding & P2P BLE Mesh Failover | `capability-registry` (:8088)| `connected to backend` | Capability Registry running on Port 8088 providing device inventory and capability maps. |
| **Surface 9** | **Analytics & History** | Event-Sourced Immutable Incident Timeline Stream | `incident-timeline` (:8083) & `feedback-engine` (:8084) | `connected to backend` | Append-only event log streaming on Port 8083; feedback logged on Port 8084. |

---

## 🎨 DESIGN SYSTEM TOKENS

Every surface strictly adheres to the single unified design system:
- **Background Root**: Deep near-black `#0a0a0f`
- **Card Surface**: Dark surface `#111118` (1px subtle border `#1e1e2e`)
- **Typography**: Inter (Headlines/Body) + JetBrains Mono (Data/Telemetry)
- **Accents**: Emergency Red `#ef4444`, Active Indigo `#6366f1`, Teal `#14b8a6`, Green `#22c55e`, Amber `#f59e0b`
- **Navigation**: Persistent Top Bar shell with Surface Switcher Pills and Surface 2A/2B Account State Toggle.
