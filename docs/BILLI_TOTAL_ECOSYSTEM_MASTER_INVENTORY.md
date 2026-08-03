# BILLI TOTAL ECOSYSTEM MASTER INVENTORY & SINGLE SOURCE OF TRUTH

**Document Date:** 2026-08-01  
**Status:** Complete Un-Truncated Platform Master Audit  
**Target Repository:** `c:\Users\SEEDN\Downloads\Billi-emergency-coordination-main`  

---

## 🏛️ SECTION 1: CANONICAL USER PERSONAS & ROLES (6 ROLES)

| Persona Name | Role | Primary Device Node | Medical & Emergency Dossier | Operational Responsibilities |
|---|---|---|---|---|
| **Maya Johnson** | Protected Individual (Age 11) | iPhone 15 Pro Hub + Wearables | Mild Asthma, rescue Albuterol inhaler in backpack, Peanut allergy. | Silent 1-tap/voice SOS, masked secret vault, duress PIN defense (`9999`), ambient status display. |
| **Evelyn Johnson** | Primary Guardian (Mother) | Guardian Command Center | Primary emergency contact (+15550192834). Priority Order 1. | Live map & trajectory tracking, "I AM RESPONDING" button, live audio monitoring, 45s escalation control, CAD packet exporter. |
| **Marcus Johnson** | Secondary Guardian (Father) | Guardian Command Center | Secondary contact (+15550199988). Priority Order 2. | Real-time map view, call campus admin office, send quiet message, receive backup SMS alerts. |
| **Officer Davis** | Campus Safety Officer (Badge #402) | Responder Console | School Safety Officer (+15550114022). Priority Order 3. | High-priority dispatch alert, 1-click ground unit dispatch, medical dossier access, tactical map pin. |
| **Grandma Clara** | Extended Circle (Grandmother) | Voice / Call Gateway | Extended contact (+15550183321). Priority Order 4. | Receives backup voice phone calls during escalated emergencies. |
| **System Evaluator** | Platform Auditor / Developer | Crisis Simulator & Audit Dock | Evaluator mode. | Trigger controlled simulation events (GPS loss, fall impact, duress PIN, signal drop) and inspect audit logs. |

---

## 📱 SECTION 2: CONNECTED HARDWARE DEVICES & SENSORS (9 HARDWARE UNITS)

1. **iPhone 15 Pro Hub** — Primary gateway node (`GPS`, `BLE`, `MICROPHONE`, `CAMERA`, `CELLULAR`, `WIFI`, `ACCELEROMETER`, `GYROSCOPE`).
2. **Apple Watch Ultra 2** — Wearable node (`HEART_RATE`, `FALL_DETECTION`, `DOUBLE_TAP_GESTURE`, `SECONDARY_GPS`, `BLE`).
3. **Garmin Fenix 7 Pro** — Fitness node (`DOUBLE_BUTTON_SQUEEZE`, `HEART_SPIKE_BROADCAST`, `CRASH_DECELEROMETER`).
4. **Samsung Galaxy Ring** — Smart ring (`DOUBLE_PINCH_GESTURE`, `HEART_RATE_MONITOR`, `BLE_PROXIMITY`).
5. **Pixel Watch 3 LTE** — Secondary watch (`HIGH_G_DECELEROMETER`, `LTE_SATELLITE_BACKUP`).
6. **Ray-Ban Meta Smart Glasses** — Audio node (`VOICE_PHRASE_LISTENER`, `AMBIENT_AUDIO_STREAM`, `PHOTO_CAPTURE`).
7. **Sennheiser Accentum** — Audio headset (`DUAL_CHANNEL_VOICE_WAKEUP`, `NOISE_SUPPRESSION`).
8. **Billi Smart Tag** — Tactile beacon (`TACTILE_PANIC_BUTTON`, `BLE_PEER_BEACON`, `CRASH_ACCELEROMETER`).
9. **Automotive Vehicle Unit** — Connected vehicle (`8.5G_CRASH_DECELEROMETER`, `AIRBAG_SENSOR`, `SEAT_OCCUPANCY`).

---

## 🗣️ SECTION 3: SPOKEN SAFE WORDS & SECRET VAULT MECHANICS

- **Spoken Safe Word 1**: `"Blue Folder"`
- **Spoken Safe Word 2**: `"Call Grandma"`
- **Spoken Safe Word 3**: `"Billi Now"`
- **Spoken Safe Word 4**: `"Code cobalt silent"`
- **5-Stage Voice Print Calibration**:
  `Not Enrolled` → `Recording 3s...` → `Processing Calibration...` → `Enrolled` → `Re-Record`
- **Masked Vault UI**: Inputs masked with `obscureText: true`, visibility eye icon toggles, PIN confirmation field, and warning text not to reuse lock screen PIN.

---

## ⚡ SECTION 4: EMERGENCY ACTIVATION PATHS (9 TRIGGER METHODS)

1. **Spoken Safe Word Phrase Match**: Acoustic keyword detection (`"Blue Folder"`).
2. **2-Second Hold SOS Charm**: Central button press with SVG radial progress ring (`strokeDashoffset`).
3. **Smartwatch Hard Fall Impact**: 15s unresponsive countdown trigger.
4. **Automotive Crash Impact**: High-G decelerometer spike (8.5g).
5. **Geofence Exit Breach**: Device crosses Pine Middle School perimeter while moving at 18+ mph.
6. **Billi Smart Tag Squeeze**: Tactile button press on BLE tag.
7. **Accessibility Volume Shortcut**: Physical volume rocker combo press.
8. **Wearable Gesture Match**: Apple Watch double-tap or Galaxy Ring double-pinch gesture.
9. **Acoustic Noise Spike**: Ambient microphone noise exceeding 80dB threshold.

---

## 🚨 SECTION 5: FOUR SIMULTANEOUS CORE ACTIONS & TRUTHFUL STATUS

Upon activation, the system executes and displays:
1. `✓ Location acquired` — High-precision GPS lock (37.7753, -122.4201).
2. `✓ Audio recording active` — Ambient microphone stream active.
3. `○ Video unavailable in prototype` — Truthful prototype status (no video checkmark).
4. `✓ Alert delivered to Sarah/Evelyn` — Multi-channel dispatch queued.

---

## 🛡️ SECTION 6: COERCION DEFENSE & DUAL PIN MECHANICS

- **Normal Safe PIN (`1234`)**: Resolves incident, marks safe, notifies guardians.
- **Silent Duress PIN (`9999`)**:
  - Feigns cancellation on child screen ("Alert canceled").
  - Silently escalates emergency state to guardians.
  - Activates flashing crimson hazard border across the app (`border-4 border-red-600 animate-pulse`).
  - Logs `duressCodeEntered: true` in emergency packet.

---

## 👥 SECTION 7: GUARDIAN COORDINATION & CONTROLS

- **Live Trajectory Map**: Moving speed (42.5 mph SB), direction, and high-precision location lock.
- **Loved One Dossier**: Maya Johnson photo, age 11, Asthma notes, Albuterol inhaler location, Peanut allergy.
- **"I AM RESPONDING" Button**: Calculates 3m ETA, broadcasts acknowledgment to Maya ("Your guardian received the alert").
- **Tactical Actions**:
  - Live Route Guidance & Navigation
  - Direct Phone Uplink ("Call Maya")
  - Send Quiet Message
  - Monitor Live Ambient Microphone Feed
  - Export 911 CAD Digital Packet
- **4-Contact Response Matrix**: Evelyn (Mom `Driving ETA 3m`), Marcus (Dad `Calling`), Officer Davis (`Searching`), Grandma Clara (`Alerted`).

---

## ⏱️ SECTION 8: 45-SECOND PROGRESSIVE ESCALATION & CAD PACKET

- **45-Second Countdown Bar**: Timer (45s → 0s) running in `orchestration-engine` (Port 8081).
- **Automated Co-Dispatch**: If unacknowledged after 45s, system fires `ESCALATION_REQUIRED` and co-dispatches Officer Davis and 911 dispatch.
- **Dynamic 911 CAD Packet**:
  - Serialized via `emergency-packet` (Port 8087) `GET /packet/:packetId/cad`.
  - Serializes: Packet ID, incident number, protected person dossier, medical notes, GPS fix, battery/signal state, evidence list, and timeline events.
  - 1-click **Copy CAD Packet to Clipboard** button.

---

## 🔄 SECTION 9: RESILIENCY & FAILOVER SCENARIOS

- **Cellular Outage / Tunnel Dead-Zone**: Automatic failover to encrypted Bluetooth Low Energy (BLE) peer-to-peer mesh tag routing.
- **Phone Power-Off / Dead Battery**: Fallback active tracking to Apple Watch Ultra 2, Smart Tag, or Ray-Ban Glasses.
- **Signal Degradation Indicators**: Tracking `gpsLost`, `phoneOff`, `cellLost`, `watchDisconnected`, `tagDisconnected`, `batteryCrit`.

---

## 🎬 SECTION 10: THE 9 CORE HUMAN DEMONSTRATION SCENARIOS

1. **Protect a Child (Maya / Emma - Age 11)**: Safe word `"Blue Folder"`, geofence breach, mother response `Driving ETA 3m`.
2. **Help After a Fall (Elderly Robert - Age 78)**: Smartwatch fall sensor, 15s unresponsive countdown.
3. **Vehicle Crash (Driver David)**: Automotive 8.5g impact decelerometer, airbag deployment, spouse notification.
4. **Medical Emergency (Lisa / Maya - Severe Asthma)**: Acoustic distress, pre-authorized medical notes, Albuterol inhaler instructions.
5. **Campus Emergency (Student Jasmine & Officer Davis)**: Silent BLE beacon, school officer alert, ground unit dispatch.
6. **Coercive Duress Defense (Coercion Scenario)**: Duress PIN `9999`, fake cancel screen, silent guardian escalation, crimson hazard border.
7. **Cellular Signal Loss & BLE Failover**: Tunnel cellular drop, fallback to BLE peer mesh.
8. **Direct Phone Power-Off Fallback**: Phone battery dies, fallback to Apple Watch, Tag, and Glasses.
9. **45-Second Progressive Escalation**: Guardian unacknowledged after 45s, auto co-dispatch to campus security & 911.

---

## 🧠 SECTION 11: AI & ANALYTICS INTELLIGENCE

- **Google Gemini 2.0 Multimodal AI Copilot**: Directives in `context-engine` (Port 8089).
- **Deterministic Clean AI Summary**:
  *"Situation Summary (AI-Assisted • 10:02 AM): Maya activated Billi on Interstate 15 South near Las Vegas. Her device is moving at 42 mph. Her mother Sarah Miller has received the alert. Cellular connection is stable."*
- **Incident Timeline**: Event-sourced chronological audit log (`incident-timeline` Port 8083).
- **Post-Mortem Logger**: Rating & feedback aggregator (`feedback-engine` Port 8084).
- **Observability**: Metrics and system health monitor (`observability` Port 8092).

---

## ⚙️ SECTION 12: 13 DDD MICROSERVICES BACKEND ARCHITECTURE

1. `gateway` (Port 8080) — Ingress router (`/api/v1/emergency/activate`).
2. `orchestration-engine` (Port 8081) — State machine (`EXECUTE_CORE_ACTIONS`).
3. `communication-engine` (Port 8082) — Multi-channel notification dispatcher.
4. `incident-timeline` (Port 8083) — Event-sourced chronological log.
5. `feedback-engine` (Port 8084) — Incident post-mortem logger.
6. `identity-service` (Port 8085) — Identity repository (`UserIdentity`).
7. `safety-protocol` (Port 8086) — Rules engine (`ProtocolRules`).
8. `emergency-packet` (Port 8087) — Living packet manager with atomic file persistence (`.data/packets.json`, `.tmp`, `.bak`).
9. `capability-registry` (Port 8088) — Hardware abstraction provider.
10. `context-engine` (Port 8089) — AI context provider wrapper.
11. `telemetry-processor` (Port 8090) — Telemetry stream pipeline.
12. `action-execution-engine` (Port 8091) — Command execution router.
13. `observability` (Port 8092) — Telemetry monitor & metrics dashboard.
