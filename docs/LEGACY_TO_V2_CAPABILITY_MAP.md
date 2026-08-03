# LEGACY TO V2 CAPABILITY MAP

**Document Date:** 2026-08-01  
**Status:** Authoritative Mapping Matrix  

---

## 🏛️ CAPABILITY MAPPING TABLE

| Capability Domain | Source Legacy File | Extracted Logic / Model | Clean Platform Location | Owning V2 Service | Status Classification |
|---|---|---|---|---|---|
| **Protected-Person Dossier** | `ActiveUserView.tsx` | Maya Johnson profile, medical notes, emergency instructions | `packages/api-contracts` & `packages/demo-fixtures` | `identity-service` (Port 8085) | `WORKING END TO END` |
| **Spoken Safe Words** | `PlanConfigModal.tsx` | Spoken phrase array (`"Blue Folder"`), safe word matcher | `packages/safety-contract` | `safety-protocol` (Port 8086) | `BACKEND IMPLEMENTED` |
| **Duress PIN Cancellation (`9999`)** | `ActiveUserView.tsx` | Dual PIN validator (`1234` safe vs `9999` silent duress) | `packages/domain-models` | `emergency-packet` (Port 8087) | `WORKING END TO END` |
| **Geofenced Safe Zones** | `PlanConfigModal.tsx` | Haversine distance calculator, safe zone radius matcher | `packages/safety-contract` | `safety-protocol` (Port 8086) & `telemetry-processor` (8090) | `BACKEND IMPLEMENTED` |
| **Guardian Response Matrix** | `GuardianDashboard.tsx` | 4-contact priority matrix, multi-channel dispatch rules | `packages/api-contracts` & `packages/demo-fixtures` | `communication-engine` (Port 8082) | `WORKING END TO END` |
| **45s Progressive Escalation** | `ConnectedDevicesView.tsx` | Escalation countdown timer, auto co-dispatch rule | `packages/api-contracts` | `orchestration-engine` (Port 8081) | `BACKEND IMPLEMENTED` |
| **Dynamic 911 CAD Packet** | `GuardianDashboard.tsx` | CAD digital packet JSON serializer | `packages/incident-models` | `emergency-packet` (Port 8087) | `WORKING END TO END` |
| **7-Device Hardware Hub** | `ConnectedDevicesView.tsx` | Device inventory, battery gauges, signal indicators | `packages/device-capabilities` | `capability-registry` (Port 8088) | `WORKING END TO END` |
| **BLE Mesh Failover** | `ConnectedDevicesView.tsx` | Hardware failover evaluator, mesh relay status | `packages/device-capabilities` | `action-execution-engine` (Port 8091) | `SIMULATED` |
| **Crisis Telemetry Simulation** | `EnvironmentControls.tsx` | Controlled verification inputs, degradation triggers | `packages/demo-fixtures` & `verification/` | `telemetry-processor` (Port 8090) | `WORKING END TO END` |
| **First Responder Console** | `ResponderDashboard.tsx` | Tactical location data, ground unit dispatch action | `packages/responder-models` | `gateway` (Port 8080) | `BACKEND IMPLEMENTED` |
| **Google Gemini Threat Intelligence** | `AiAnalysisPanel.tsx` | Multimodal threat classification & action recommendation | `packages/api-contracts` | `context-engine` (Port 8089) | `BACKEND IMPLEMENTED` |
