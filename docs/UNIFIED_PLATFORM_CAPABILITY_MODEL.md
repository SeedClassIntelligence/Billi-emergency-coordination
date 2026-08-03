# UNIFIED PLATFORM CAPABILITY MODEL

**Document Date:** 2026-08-01  
**Target Architecture:** Billi V2 Single Consolidated Platform  

---

## 🏛️ ARCHITECTURE OVERVIEW

The Billi Unified Platform consolidates the human-facing capabilities proven in the legacy application with the 13 domain-driven microservices running under `services/`.

```text
                                BILLI UNIFIED CONSOLIDATED ARCHITECTURE
                                                   │
  ┌────────────────────────────────────────────────┼────────────────────────────────────────────────┐
  ▼                                                ▼                                                ▼
SHARED PACKAGES (`packages/`)             13 DDD MICROSERVICES (`services/`)              PARITY SUITES (`verification/`)
  ├── api-contracts                        ├── Gateway (Port 8080)                          ├── legacy-capability-parity
  ├── domain-models                        ├── Orchestration Engine (Port 8081)             └── automated verification suites
  ├── safety-contract                      ├── Communication Engine (Port 8082)
  ├── incident-models                      ├── Incident Timeline (Port 8083)
  ├── device-capabilities                  ├── Identity Service (Port 8085)
  ├── responder-models                     ├── Safety Protocol (Port 8086)
  └── demo-fixtures (Maya Johnson)         ├── Emergency Packet (Port 8087)
                                           ├── Capability Registry (Port 8088)
                                           ├── Context Engine (Port 8089)
                                           ├── Telemetry Processor (Port 8090)
                                           ├── Action Execution Engine (Port 8091)
                                           └── Observability Service (Port 8092)
```

---

## 🔒 CANONICAL FIXTURE STANDARDIZATION

All tests, UI models, and microservices utilize **Maya Johnson** as the single canonical protected person fixture:
- **Name**: Maya Johnson (Age 11)
- **Medical Notes**: Mild Asthma, rescue Albuterol inhaler in backpack, Peanut allergy.
- **Primary Guardian**: Evelyn Johnson (Mother, Priority 1)
- **Secondary Guardian**: Marcus Johnson (Father, Priority 2)
- **Campus Officer**: Officer Davis (School Safety Officer, Badge #402)
- **Grandparent**: Grandma Clara (Priority 4)
- **Safe Zones**: Pine Middle School (100m), Home Zone (150m), Grandma Clara's House (200m)
