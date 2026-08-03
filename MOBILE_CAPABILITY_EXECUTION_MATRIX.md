# BILLI MOBILE CAPABILITY EXECUTION MATRIX

**Date:** 2026-08-02 · **Phase:** Shared-state + capability-adapter execution
**Adapter layer:** `web-app/billi-adapters.js` — every capability emits the normalized event shape
`{event_type, source_device_id, timestamp, …payload, permission_state, execution_state}` and routes:

    Native API → Capability Adapter → Billi.pushTelemetry → Gateway shared incident
    → telemetry-processor (:8090) → SSE → all authorized clients

Execution states tracked: `FOREGROUND / BACKGROUND / SUSPENDED / LOCKED / APP_TERMINATED /
DEVICE_REBOOTED / LOW_POWER_MODE / PERMISSION_REVOKED` (web layer reports FOREGROUND/BACKGROUND
today; the rest apply to the native builds).

Status legend: **BUILT-WEB** = implemented now via browser API and verified where the environment
permits · **NATIVE-NEXT** = requires the iOS/Android build · **PARTNER** = requires partner SDK/hardware.

| # | Capability | Web API (now) | Native API (later) | Permission | Background (native) | Data produced | Receiving service | Scenarios | Status | Physical test needed |
|---|---|---|---|---|---|---|---|---|---|---|
| 1a | Location — armed low power | `geolocation.getCurrentPosition` (coarse) | iOS Core Location significant-change / Android fused passive | Location (while-in-use) | iOS: yes w/ background mode; Android: all-the-time perm + throttling | LOCATION_UPDATED (lat/lng/accuracy/speed/heading) | telemetry-processor → packet | all | **BUILT-WEB** (`ARMED_LOW_POWER`) | Phone browser over HTTPS, then native |
| 1b | Location — incident high accuracy | `geolocation.watchPosition` enableHighAccuracy | Core Location best-accuracy / Android FusedLocation HIGH_ACCURACY | Location | Same as above; must not run indefinitely | Continuous route points | telemetry-processor, packet, timeline | 1,3,4,5,7 | **BUILT-WEB** (`INCIDENT_HIGH_ACCURACY`) | Yes — moving-vehicle test |
| 1c | Geofence entry/exit | Haversine vs zones on fix (client) | iOS region monitoring / Android Geofencing API | Location (always, for native) | Native OS geofencing wakes app | GEOFENCE_ENTER/EXIT | safety-protocol (:8086 evaluate-geofence) | 1,5 | **BUILT-WEB (evaluation)**, NATIVE-NEXT (OS wake) | Yes |
| 2 | Accelerometer/gyroscope | `devicemotion` events (+iOS `requestPermission`) | Core Motion / Android SensorManager | Motion (iOS 13+ prompt) | Limited; native background modes needed | HARD_IMPACT / SUDDEN_MOVEMENT / MOTIONLESS_PERIOD / MOTION_SAMPLE | telemetry-processor → context-engine | 2,3,1 | **BUILT-WEB** (classifier thresholds 12/24 m/s², 15 s stillness) | Yes — real drop/drive tests |
| 3 | Magnetometer/heading | `heading` from geolocation fixes; `deviceorientation` | Core Location heading / Android rotation vector | Motion/none | With location session | heading_degrees on LOCATION_UPDATED | packet (movement vector) | 1,7 | **BUILT-WEB** (via GPS heading) | Yes |
| 4 | Barometer | Not exposed to web | CMAltimeter / Android pressure sensor | None | Yes | Floor/altitude change enrichment | context-engine | 2,5 | NATIVE-NEXT | Yes |
| 5a | Safe-word listening (VOICE_TRIGGER_LISTENING) | Web Speech API `SpeechRecognition` (foreground only, Chrome) | iOS custom keyword spotting / Android foreground service | Microphone (distinct consent) | Very constrained; wake-word needs native/DSP | PHRASE_MATCHED | safety-protocol (phrase match exists :8086) | 1,4,6 | NATIVE-NEXT (web foreground demo possible) | Yes |
| 5b | Incident audio evidence (INCIDENT_AUDIO_RECORDING) | `getUserMedia` + `MediaRecorder`, 10 s sealed segments | AVAudioSession / MediaRecorder foreground service | Microphone (separate from 5a in UI + Safety Contract) | iOS audio background mode; Android foreground svc | AUDIO_RECORDING_STARTED / AUDIO_SEGMENT_SEALED {bytes,mime} / AUDIO_ERROR | packet evidence refs | 1,2,3,4,5,6 | **BUILT-WEB** — verified honest PERMISSION_DENIED reporting when blocked | Yes — HTTPS + user grant |
| 5c | Audio context analysis | Deferred (send transcripts/levels) | On-device or server (Gemini) | Same as 5b + AI consent | n/a (server) | Distress indicators | context-engine (:8089) | 1,4 | NATIVE-NEXT + live Gemini | No (server-side) |
| 6 | Speaker / TTS (SPOKEN_OUTPUT) | `speechSynthesis` | AVSpeechSynthesizer / Android TTS | None | Audio session config | SPOKEN_OUTPUT {text,mode} — spoken ONLY on confirmed state; QUEUED ≠ DELIVERED enforced; suppressed in silent mode AND during duress | telemetry (audit of what was said) | 1,2,4,9 | **BUILT-WEB & VERIFIED** — "Your mother is responding." spoke on real cross-session ack | Audibility check on phone |
| 7 | Camera | `getUserMedia({video})` + MediaRecorder (foreground, permission) | AVCapture / CameraX | Camera | Heavily OS-restricted; locked-screen capture NOT possible — report BLOCKED_BY_OS | States NOT_AUTHORIZED…FAILED; evidence refs | packet | 1,3,5 | NATIVE-NEXT (UI already reports "UNAVAILABLE IN THIS PROTOTYPE") | Yes |
| 8 | Bluetooth LE | Web Bluetooth (Chrome, user-gesture pairing, central-only) | Core Bluetooth (central+peripheral, bg modes) / Android BLE | Bluetooth | iOS bg modes for specific events; Android fg service | BLE_PEER_DISCOVERED → RELAY_CONFIRMED ladder (each state separate — software strategy ≠ physical mesh) | capability-registry, comm-engine | 5,7,8 | PARTNER/NATIVE-NEXT (strategy selection BUILT-WEB, honestly labelled SIMULATED) | Yes — two-device relay w/ app-layer encryption |
| 9 | Network awareness | `online/offline` events + `navigator.connection` | NWPathMonitor / ConnectivityManager | None | Yes | NETWORK_CHANGED / NETWORK_STATE | comm-engine, packet | 7,8 | **BUILT-WEB** | Airplane-mode test |
| 10 | Cellular channels | Data: fetch (BUILT). `tel:`/`sms:` composer links | CallKit-adjacent dialer intents; server-side SMS/voice via provider | Varies | Push via APNS/FCM (server) | DATA_TRANSMISSION vs PUSH vs SMS vs VOICE_CALL vs IN_APP_EVENT kept distinct | comm-engine (:8082) | 9, all | DATA **BUILT-WEB**; push/SMS/voice NATIVE-NEXT + provider | Yes |
| 11 | NFC | Web NFC (Android Chrome only) | Core NFC / Android NFC | NFC | Foreground only | Tag enrollment, responder tap-to-identify | capability-registry | 5, setup | NATIVE-NEXT | Yes |
| 12 | Biometric/device security | WebAuthn (platform authenticator) | Face ID/Touch ID via LocalAuthentication / BiometricPrompt | Biometric | n/a | Gate: reveal safe words, edit duress, resolve, export packet | identity-service | 6, admin | NATIVE-NEXT (PIN gates BUILT-WEB) | Yes |
| 13 | Notifications | Notification API (local, permission) | UNUserNotificationCenter / NotificationManager + APNS/FCM | Notifications | Remote push wakes device | Incident updates device-to-device | comm-engine | 9, all | Local NATIVE-NEXT/web-partial; remote push separate from shared-state layer | Yes |
| 14 | Background execution matrix | Page Visibility API (FOREGROUND/BACKGROUND reported on every event) | BGTaskScheduler, bg modes / WorkManager, fg services | n/a | Per-capability rows above | execution_state on every normalized event | all | all | **BUILT-WEB (reporting)**; native matrix NATIVE-NEXT | Yes |

## Scenario → capability coverage (from the directive, mapped to rows)

- **Protect a Child:** 1b, 5a/5b, 6, 9, 13, shared state ✅, duress ✅
- **Help After a Fall:** 2 (MOTIONLESS_PERIOD built), countdown (engine ✅), 1b, 6, 13
- **Vehicle Crash:** 2 (HARD_IMPACT built), 1b, 5b, 13, partner occupancy (PARTNER)
- **Medical Emergency:** manual/5a, 1b, 5b, 6 ✅, dossier ✅
- **Campus Emergency:** silent trigger ✅, 1b, 8 (tag PARTNER), quiet messages ✅
- **Duress Defense:** PIN ✅, covert local ✅, shared hidden state ✅ (verified cross-session), 12
- **Signal Loss:** 9 ✅, last-confirmed ✅, 8 relay (labelled SIMULATED), store-and-forward (gateway persistence ✅)
- **Phone Power-Off:** disconnect detection (9 partial), device inventory ✅, multi-source attribution (source_device_id on every event ✅)
- **Progressive Escalation:** delivery-state ladder ✅, shared timer ✅ (verified), retry/channel fallback NATIVE-NEXT

## Verified this session (real browser, 3 role sessions, 2 origins)

1. Maya (localhost) activates → gateway creates shared incident `BIL-2026-4069` (+ vertical-slice `inc_27748`)
2. Evelyn (127.0.0.1 — separate storage) joins live, sees Maya's incident + context, clicks I AM RESPONDING
3. Maya's session receives the ack over SSE and **speaks "Your mother is responding."** (real speechSynthesis; SPOKEN_OUTPUT telemetry recorded on the shared record)
4. Officer Davis acknowledges + marks en route on the responder surface → both sessions receive
5. Refreshing either client preserves the incident (localStorage + gateway adopt); no repeated speech after refresh
6. Adapters reported honest states where the environment blocked hardware: `PERMISSION_DENIED` for mic/GPS in the embedded pane (real API attempted, real block recorded as AUDIO_ERROR/LOCATION_ERROR telemetry)
7. Gateway record survived at rev 9 with full action + telemetry history on disk (`services/gateway/.data/shared_incidents.json`)

**Remaining for the physical-phone leg of the milestone:** serve the web-app over HTTPS on the LAN
(mic/GPS require a secure context on real phones), open `protected.html` on the phone, tap Enable —
the same adapters then feed real GPS fixes, motion classification, and sealed audio segments into the
same shared incident. No code changes required for that test; only the HTTPS serving step.
