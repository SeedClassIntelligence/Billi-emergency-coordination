# BILLI PLATFORM ARCHITECTURE (DOMAIN-DRIVEN DESIGN)

## CTO Technical Overview & Systems Philosophy

### Executive Summary

Billi is **not** a panic-button application, a wearable product, or an AI assistant. Billi is a **human-centered emergency orchestration platform**. The platform's purpose is to reduce the time between an emergency occurring and meaningful assistance beginning by orchestrating technologies that already exist into a coordinated response system.

The organizing principle is **not** technology components—it is the **Emergency Lifecycle**:
1. **Identity:** Who is this person?
2. **Safety Protocol:** What has already been authorized and configured?
3. **Incident:** What is happening right now?
4. **Orchestration:** Which capabilities and communication paths should be engaged?
5. **Response:** How do the trusted network and responders act?
6. **Resolution:** How did the incident conclude?
7. **Learning:** What recommendations improve future preparedness?

---

## 🏛️ Evolved DDD Domain Architecture

```text
                                  Identity Service
                                         │
                                         ▼
                              Safety Protocol Service
                                         │
                                         ▼
                            Orchestration Engine (Coordinator)
  ├── Capability Registry (GPS, BLE, Mic, Fall Detection, Crash Detection)
  │
  ├── Communication Engine  ├── Context Engine (AI)  ├── Emergency Packet  ├── Timeline Service
  │   (Transport Router)    │   (Summarizer/AI)      │   (Living Data)     │   (Event Stream)
  │                         │                        │                     │
  └─────────────────────────┴────────────────────────┴─────────────────────┘
                                         │
                                         ▼
                                  Trusted Network
                                         │
                                         ▼
                             Emergency Response
                                         │
                                         ▼
                              Feedback Engine (Learning)
                                         │
                                         ▼
                             Safety Protocol Updates
```

---

## 1. Kubernetes-Style Orchestration Engine (`services/orchestration-engine`)

The **Orchestration Engine** acts strictly as a lightweight coordinator (analogous to Kubernetes). It does **not** perform communications, call Gemini directly, or write to databases. It answers ONLY three questions:

1. **What is happening?** (Ingests state updates)
2. **What should happen next?** (Determines next state transition)
3. **Who is responsible for doing it?** (Dispatches tasks to domain services)

---

## 2. Capability Registry (`services/capability-registry`)

Instead of asking *"Is this an iPhone or a Tesla?"*, the Orchestration Engine queries the **Capability Registry**:

```text
Device/Hardware → Capability Registry → Available Capabilities
  ├── Phone: [GPS, BLE, Microphone, Camera, Cellular, Wi-Fi]
  ├── Vehicle: [Crash Detection, GPS, Occupancy Sensor]
  └── Watch: [Heart Rate, Fall Detection, Motion]
```

This abstraction allows future hardware (drones, smart homes, medical IoT, satellite relays) to plug into Billi without altering the orchestration foundation.

---

## 3. Bounded Context Services Overview

| Microservice | Bounded Context Responsibility |
|---|---|
| `identity-service` | User profiles, guardian relationships, family networks, role permissions, device bindings. |
| `safety-protocol` | Central backend protocol evaluation, medical access permissions, escalation matrices. |
| `emergency-packet` | Canonical living packet state manager bridging Cloud Spanner and Firestore. |
| `capability-registry` | Device capability inventory provider (GPS, BLE, Mic, Motion, Telematics). |
| `orchestration-engine` | State-machine coordinator (What is happening? What next? Who is responsible?). |
| `context-engine` | AI domain service housing Gemini models, context summarizers, translators, and recommenders. |
| `communication-engine` | Multi-transport strategy router (`BleAdapter`, `WifiDirectAdapter`, `CellularAdapter`, `SmsAdapter`). |
| `telemetry-processor` | High-throughput Pub/Sub stream worker ingesting sensor updates. |
| `incident-timeline` | Append-only event-sourcing log for forensic auditability and real-time sync. |
| `feedback-engine` | Post-incident operational analytics feeding back adaptive protocol recommendations. |
| `gateway` | External REST API Gateway routing client traffic to internal domain services. |

---

## 4. Post-Incident Feedback Loop & Learning

```text
Incident Concluded → Timeline Locked → Family Outcome Input → Transport Efficiency Analysis → Adaptive Protocol Recommendation
```

The platform becomes more resilient over time without overriding user control, surfacing actionable recommendations to guardians based on real incident data.
