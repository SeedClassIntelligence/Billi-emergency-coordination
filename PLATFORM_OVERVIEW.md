# BILLI EMERGENCY COORDINATION PLATFORM: MASTER OVERVIEW

**Doc Version:** 1.8.0  
**Current Milestone:** Human Experience & UI Truth Alignment Phase  
**Real-Device Verification Report:** [REAL_DEVICE_MVP_VERIFICATION_2026-08-01.md](file:///c:/Users/SEEDN/Downloads/Billi-emergency-coordination-main/REAL_DEVICE_MVP_VERIFICATION_2026-08-01.md)  
**Single Source of Truth:** [ENGINEERING_GUARANTEES.md](file:///c:/Users/SEEDN/Downloads/Billi-emergency-coordination-main/ENGINEERING_GUARANTEES.md)  
**Canonical Capability Recovery:** [CANONICAL_CAPABILITY_RECOVERY_MATRIX.md](file:///c:/Users/SEEDN/Downloads/Billi-emergency-coordination-main/CANONICAL_CAPABILITY_RECOVERY_MATRIX.md)  

---

## 🏛️ CANONICAL DEMO FIXTURE: EMMA'S FREEWAY SOS

Every component, screen, and test suite is aligned around one canonical fixture:

```text
Protected User:  Emma Miller (Age 10)
Medical Notes:   Mild asthma (requires Albuterol inhaler)
Primary Guardian: Sarah Miller (Mother)
Safe Word:       "Red Balloon" (Hardware Vault Masked)
Duress PIN:      "4321" (Coercion Defense Masked)
Scenario:        Child Safety SOS
Location:        Interstate 15 South, Las Vegas area (36.1699° N, -115.1398° W)
Movement Vector: 42 mph Southbound
Transport Path:  Cellular Data → Simulated Nearby Mesh Relay (Tunnel Dead-Zone)
```

---

## 📱 PRIORITY UI & TRUTH CORRECTIONS DELIVERED

1. **Masked Secrets & Coercion Defense**:
   - Safe word (`Red Balloon`) and Duress PIN (`4321`) are masked (`••••••••••`) with visibility toggle (`Icons.visibility`), PIN confirmation entry, and a warning never to reuse normal phone PINs.
2. **Real Voice Print State Progression**:
   - Acoustic calibration widget tracks real state: `Not Enrolled` → `Recording (3s)...` → `Processing Calibration...` → `Enrolled` → `Re-Record`.
3. **Demo Scenario Selector vs. Home Screen**:
   - Screen clearly labeled `CHOOSE A DEMONSTRATION` with `Start Demo` buttons (removing confusion with active emergency responses).
4. **Truthful 4 Core Action States**:
   - Displays honest, stateful progression:
     - `✓ Location acquired (GPS)`
     - `✓ Audio recording active (Microphone)`
     - `○ Video unavailable in prototype` (Honest Status)
     - `✓ Alert delivered to Sarah Miller`
5. **Guardian Dashboard Map at Top**:
   - Live route map container positioned at the **very top** of `GuardianIncidentDashboard`.
6. **Valid & Deterministic Gemini AI Summary**:
   - Replaced all malformed text with clean, timestamped AI summary:  
     *"Emma activated Billi on Interstate 15 South near Las Vegas. Her device is moving at 42 mph. Her mother Sarah Miller has received the alert. Cellular connection is stable."*
7. **Removed Unconfirmed First-Responder Claims**:
   - Removed "Contacting First Responders" until direct PSAP CAD integration is confirmed.
8. **Guardian Response Action Bar**:
   - Action controls: `I AM RESPONDING`, `Live Route`, `Call Emma`, `Send Quiet Message`, and `Resolve Incident`.
9. **Role Identity Clarity**:
   - Clear visual headers distinguishing `PROTECTED MODE: EMMA MILLER` from `GUARDIAN MODE: SARAH MILLER (MOTHER)`.

---

## 🏛️ BILLI ENGINEERING COMMANDMENTS

1. **Protect the person.** Everything else is secondary.
2. **The Four Core Actions always execute.** (GPS, Audio, Video-deferred, Trusted Network).
3. **Onboarding is the Safety Contract.** No emergency-time permission dialogs. All decisions made before emergency.
4. **AI assists.** AI provides context/summaries; people make decisions.
5. **The incident stays alive.** Continuous updates until resolution.
