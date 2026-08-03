# UNIFIED BILLI PRODUCT & JOURNEY MAPPING

**Document Date:** 2026-08-01  
**Phase:** Phase 2 — Unified Product & Journey Architecture  
**Target Platform:** Billi Consolidated Platform (`c:\Users\SEEDN\Downloads\Billi-emergency-coordination-main`)  

---

## 🏛️ SECTION 1: SYSTEM ROLES & ACCESS MATRIX

Billi defines **6 distinct user roles** with specific permission boundaries and operational contexts:

| Role | User Persona Example | Access Level | Primary Objectives & Controls |
|---|---|---|---|
| **1. Protected Individual** | Maya Johnson (Age 11) | Personal Mobile Device / Wearable Node | Silent 1-tap/voice SOS, masked secret vault, duress PIN defense (`9999`), ambient status display. Zero clutter. |
| **2. Primary Guardian** | Evelyn Johnson (Mother) | Guardian Command Center (Web/Mobile) | Real-time map & trajectory tracking, "I AM RESPONDING" button, live audio monitoring, 45s escalation control, CAD packet exporter. |
| **3. Secondary Guardian** | Marcus Johnson (Father) | Guardian Command Center (Secondary) | Real-time map view, call campus admin office, send quiet message, receive backup SMS alerts. |
| **4. Extended Circle** | Grandma Clara | Voice / Call Gateway | Receives backup voice phone calls during escalated emergencies. |
| **5. Campus Responder** | Officer Davis (Badge #402) | Responder Command Console | High-priority dispatch alert, 1-click ground unit dispatch, medical dossier access, tactical map pin. |
| **6. Administrator / Evaluator** | System Developer / Auditor | Crisis Simulator & Audit Dock | Trigger controlled simulation events (GPS loss, fall impact, duress PIN, signal drop) and inspect audit logs. |

---

## 🔄 SECTION 2: END-TO-END 15-STAGE PRODUCT JOURNEY MAP

```text
[STAGE 1: SIGNUP & ONBOARDING] ──► [STAGE 2: TRUSTED NETWORK CONSTRUCTION] ──► [STAGE 3: SAFETY CONTRACT CREATION]
                                                                                        │
[STAGE 6: EMERGENCY ACTIVATION] ◄── [STAGE 5: NORMAL READY STATE] ◄── [STAGE 4: HARDWARE & DEVICE SETUP]
          │
          ▼
[STAGE 7: FOUR CORE ACTIONS] ──► [STAGE 8: CONTINUOUS AWARENESS] ──► [STAGE 9: GUARDIAN COORDINATION]
                                                                                    │
[STAGE 12: EMERGENCY PACKET EXPORT] ◄── [STAGE 11: RESPONDER PARTICIPATION] ◄── [STAGE 10: 45S PROGRESSIVE ESCALATION]
          │
          ▼
[STAGE 13: AUTHORIZED RESOLUTION] ──► [STAGE 14: DURESS DEFENSE HANDLING] ──► [STAGE 15: POST-INCIDENT REVIEW]
```

---

### Detailed Stage Breakdown

1. **Signup & Onboarding**: Account creation (`identity-service` 8085). Setup masked safe words (`"Blue Folder"`), safe PIN (`1234`), and duress PIN (`9999`). 5-stage voice print calibration state machine.
2. **Trusted-Network Construction**: Build contact network (*Mom, Dad, Officer Davis, Grandma Clara*) with notification channels (SMS, Push, Call, Multi-Broadcast).
3. **Safety Contract Creation**: Protected dossier (Maya Johnson, Age 11, Asthma, Albuterol inhaler, Peanut allergy) and Geofenced Safe Zones (Pine Middle School 100m, Home 150m, Grandma Clara's 200m) stored in `safety-protocol` (8086).
4. **Devices & Capability Setup**: Bind 7 connected hardware devices (*iPhone 15 Pro, Apple Watch Ultra 2, Garmin Fenix 7 Pro, Samsung Galaxy Ring, Pixel Watch 3 LTE, Ray-Ban Meta Glasses, Sennheiser Accentum*) merged via `capability-registry` (8088).
5. **Normal Ready-State Experience**: Armed baseline displaying 100% Armed status, geofence status (`INSIDE PERIMETER`), and low-power telemetry.
6. **Emergency Activation Paths**: 6 trigger paths (*Spoken Safe Word, 2s Hold Charm, Fall Impact, Geofence Exit Breach, Smart Tag Squeeze, Accessibility Shortcut*) routed to `gateway` (8080).
7. **Four Simultaneous Core Actions**: Truthful status progression:
   - `✓ Location acquired`
   - `✓ Audio recording active`
   - `○ Video unavailable in prototype`
   - `✓ Alert delivered to Sarah/Evelyn`
8. **Continuous Location & Incident Awareness**: Continuous stream to `telemetry-processor` (8090) tracking GPS position, moving trajectory, speed (42.5 mph SB), battery (82%), and degradation states (`phoneOff`, `gpsLost`).
9. **Guardian Coordination**: Evelyn (Mom) receives alert, clicks **"I AM RESPONDING"** (ETA 3 mins), and accesses live audio monitoring, quiet messaging, and route guidance.
10. **45-Second Multi-Tier Progressive Escalation**: Real-time timer (45s → 0s) in `orchestration-engine` (8081) auto co-dispatching campus security and 911 if unacknowledged.
11. **Responder Participation**: Officer Davis receives tactical dispatch alert, clicks **DISPATCH GROUND UNIT** (`ON_SCENE`), and accesses medical notes.
12. **Emergency Packet Export**: Dynamic 911 CAD digital packet serialized by `emergency-packet` (8087) `GET /packet/:packetId/cad` with 1-click copy to clipboard.
13. **Authorized Resolution**: Incident resolved by guardian or user entering safe PIN `1234` with resolution reason and notes.
14. **Duress PIN Defense Handling**: Coercion PIN `9999` feigns cancellation on child screen while silently escalating to guardians, flashing red hazard borders, and logging `duressCodeEntered: true`.
15. **Post-Incident Review**: Full event-sourced timeline from `incident-timeline` (8083) and post-mortem log in `feedback-engine` (8084).

---

## 🎬 SECTION 4: THE 9 CORE HUMAN DEMONSTRATION SCENARIOS

The unified product design natively supports **9 Human Demonstration Stories**:

| # | Demonstration Scenario | Target Persona | Trigger & Sequence | Platform Capabilities Demonstrated |
|---|---|---|---|---|
| **1** | **Protect a Child** | Maya / Emma (Age 11) | Spoken Safe Word (`"Blue Folder"`) or 2s Hold SOS | Silent voice trigger, geofence exit breach, mother response (`"Driving ETA 3m"`), CAD packet export. |
| **2** | **Help After a Fall** | Elderly Robert (Age 78) | Smartwatch Hard Fall Sensor | 15s unresponsive alert countdown, accelerometry spike telemetry, family notification. |
| **3** | **Vehicle Crash** | Driver David | Automotive 8.5g High-G Impact Decelerometer | Airbag sensor deployment, rapid trajectory deceleration (42 mph → 0 mph), spouse emergency alert. |
| **4** | **Medical Emergency** | Lisa / Maya (Severe Asthma) | Acoustic Distress / Voice Command | Pre-authorized medical notes (*Albuterol inhaler in backpack*), rescue instructions, guardian coordination. |
| **5** | **Campus Emergency** | Student Jasmine & Officer Davis | Silent BLE Beacon Activation | School resource officer alert, tactical location map pin, campus safety co-dispatch. |
| **6** | **Coercive Duress Defense** | Coercion Scenario | User enters Duress PIN `9999` | Screen feigns cancellation ("Alert canceled"), silent guardian escalation, pulsing crimson hazard border. |
| **7** | **Cellular Signal Loss & BLE Failover** | Tunnel / Dead Zone | Cellular signal drops to 0 bars | Automatic failover to encrypted Bluetooth Low Energy (BLE) peer-to-peer mesh relay. |
| **8** | **Phone Power-Off Fallback** | Power-Off Event | Primary phone battery dies | Direct phone tracking drops; active tracking falls back to Apple Watch Ultra 2, Smart Tag, or Ray-Ban Glasses. |
| **9** | **45-Second Progressive Escalation** | Unacknowledged Emergency | 45-second timer expires | Guardian fails to respond within 45s; system automatically escalates to campus security & 911. |

---

## 🎨 SECTION 5: DESIGN SYSTEM GUIDELINES FOR FUTURE UI

1. **Zero Congestion & Box Soup**: Spacious padding, high-contrast dark mode (`bg-slate-950`), clean typography (Inter/Outfit).
2. **Side-by-Side Studio Mode**: Pinned simulator dock so simulation triggers update active views in real-time side-by-side without scrolling.
3. **Truthful Status Messaging**: Clear, honest indicator states (no fake green checkmarks).
4. **Cohesive Persona Switching**: Header navigation bar allowing instant switching between Protected Person, Guardian Console, Hardware Hub, and Responder views.
