# Billi — Demo Script & Submission Walkthrough

A practical script for presenting Billi live, plus what to say if Gemini's free-tier quota is
tapped mid-demo. Two recording options below — a 40-second hands-off auto-play showing the full
incident lifecycle with zero clicks, and a fuller 3-minute narrated walkthrough that stops to show
each of the 6 Gemini touchpoints in depth. Use either or both.

## 30-second pitch

Billi is a person-centric emergency protection platform: the protected person is the persistent
entity, not the alert. One trigger — spoken safe word, hold-to-SOS, fall detection, whatever fits
the moment — activates four things at once (location, audio evidence, photo evidence, and Trusted
Network notification), while a live Gemini-backed context engine assesses severity, verifies
genuine distress from the evidence, and recommends actions that a **deterministic rule engine**
approves or denies. AI recommends. The rules decide. That split is deliberate: the actions that
have to fire reliably every time never depend on a model call succeeding.

## Where Gemini actually shows up (6 live touchpoints)

Say this explicitly — it's the judged criterion, and it's easy to miss if you only watch the UI:

1. **Context synthesis** (`/context/synthesize`) — fires the instant an incident triggers. Reads
   sensor telemetry against the Safety Contract, returns severity + recommended actions.
2. **Operational summarization** (`/context/summarize`) — the live "AI-assisted summary" card on
   the Guardian Command Center, updated as the incident evolves.
3. **Sentiment & 911/CAD analysis** (`/context/analyze`) — genuinely reads the evidence audio
   transcript and rates whether this is real distress or a false alarm, with a structured
   risk/category/directive breakdown that feeds the exportable 911-ready packet.
4. **Multimodal photo analysis** (`/context/analyze-photo`) — sends an actual sealed camera
   snapshot (base64 image, not text) to Gemini for a scene description. This is the one place
   real image bytes leave the device; everywhere else only the text description travels.
5. **Setup review** (`/context/review-setup`) — the only touchpoint that isn't incident-time. It
   reviews a guardian's Safety Contract/readiness config and explains *why* specific gaps matter,
   not just that a checkbox is empty.
6. **Live translation** (`/context/translate`) — Billi's spoken reassurance output, translated
   into 9 languages, with correct TTS pronunciation.

Every one of these has an honest, clearly-labeled deterministic fallback (`aiProvider:
"deterministic-fallback"` vs `"gemini-live"`) — nothing in the UI ever pretends a rule-based
answer came from the model.

## Which "demo" is which (read this before recording — this is the confusing part)

Three different screens in this repo could all reasonably be called "the demo." Only one is the
real, current, engine-driven one:

- **`demo_30s.html`** — a leftover from an earlier build generation. Not linked from the current
  `landing.html` at all, runs on hardcoded fake data. **Do not use this for the video.**
- **`demo-live.html`** — where every scenario card on `landing.html` actually lands. A compact,
  single-viewport, phone-sized summary (stage pills, four key facts, one-line AI summary). Real
  engine data, but deliberately does **not** show the Gemini sentiment analysis, photo vision, or
  setup review cards — those don't fit a compact view. Good for ~10 seconds of "here's the mobile
  experience," not the whole story.
- **The full app** (`dashboard.html` / `incident.html` / `protected.html` / `admin.html`) — reached
  from `demo-live.html` via its **"Full Command Center →"** button, or by just using the app
  directly instead of the canned demo personas. This is where all the Gemini depth actually lives,
  and it's what the recording below spends most of its time on.

## ⚡ 40-second hands-off auto-play (no clicking, no narration required)

Launched-scenario incidents now walk themselves through the entire lifecycle on a fixed schedule
— purely a demo convenience (`inc.scenario` gates it; a real triggered emergency never
auto-progresses or auto-resolves itself, that always requires an actual human guardian action).
Good for a quick loop/GIF, the cold-open of a longer video, or anywhere you want to just point a
camera at the screen and let it play:

1. **0:00** — Open `landing.html`, click any scenario card. Lands on `demo-live.html`.
   `EMERGENCY TRIGGERED` lights up immediately.
2. **0:03** — `TRUSTED NETWORK NOTIFIED` lights up (this hop is time-based, not scripted — the
   real notification-fanout timing).
3. **0:08** — `GUARDIAN ACKNOWLEDGED` — the primary contact's name appears as having responded.
4. **0:15** — `HELP RESPONDING`.
5. **0:30** — `INCIDENT STABILIZED`.
6. **0:40** — `RESOLVED`, closing on "✓ Protected person confirmed safe."

Every stage pill fills in on screen with no clicks — just start recording, launch the scenario,
and stop at 0:40. Use this as a companion to the full walkthrough below, not a replacement — it
shows the *lifecycle* moving end to end but doesn't stop to show any of the 6 Gemini touchpoints
in depth the way the 3-minute version does.

## 🎥 3-minute video recording script (exact timing)

Record your own screen; read the narration lines as you click. Practice once un-recorded first —
the Gemini calls (especially sentiment/photo analysis) take a few real seconds to resolve, so
pause on each card until its content actually appears rather than talking over a loading state.

**0:00–0:20 — Landing page, the pitch.** Open `landing.html`. Narrate the 30-second pitch above
(condense to ~15s: "person-centric," "one trigger, four simultaneous actions," "Gemini recommends,
rules decide"). Point at the 9 scenario cards — distinct personas, not one demo reused.

**0:20–0:35 — Launch and the compact view.** Click **Scenario 04, Lisa Tran / Medical Emergency**
(chosen deliberately — it has real distress evidence audio for Gemini to reason about). You land
on `demo-live.html`. Narrate: "this is the phone-sized live view — real engine data." Let the stage
pills and key facts sit on screen for a few seconds.

**0:35–0:45 — The hop judges need to see.** Click **"Full Command Center →."** Say: "the compact
view is deliberately light — here's where the AI actually lives."

**0:45–1:30 — Sentiment analysis (the centerpiece).** On `incident.html`, scroll to the **Audio
sentiment analysis** card and stop talking until it resolves to a `LIVE GEMINI` chip if it hasn't
already. Read the risk classification, category, and "Distress verified" badge aloud. Say plainly:
"Gemini actually read the evidence transcript and made this call — it isn't a template." Glance at
the **AI-assisted summary** card next to it (touchpoint #2) and the backend timeline's
`AI CONTEXT SYNTHESIS` / `AI ACTIONS EVALUATED` entries — "recommend, then a separate rule engine
approved these specific actions."

**1:30–2:00 — Multimodal photo analysis.** Switch to `protected.html` for the same incident, open
the **Photo evidence** panel, tap **"Analyze latest photo"** if needed. While it resolves, narrate:
"this sends an actual camera frame to Gemini — the only point in the whole platform where real
image bytes leave the device. Everywhere else, only Gemini's text description travels." Read the
description aloud once it lands.

**2:00–2:25 — Setup-phase Gemini.** Open `admin.html`, tap **"Review my setup."** Say: "every other
Gemini call happens during an incident — this one happens before anything's wrong," and read one
of the prioritized recommendations aloud.

**2:25–2:55 — The safe-fail (close on this, not on AI).** Go to `protected.html`'s SOS panel, tap
**"Simulate fall."** Show the 10-second countdown. Narrate: "sensor-inferred triggers — fall,
crash, geofence, acoustic — get this window because they can be wrong. Deliberate triggers, like
hold-to-SOS, never do — a real emergency can't wait ten seconds." Let it either auto-confirm or tap
"Yes, I need help," and say: "silence here escalates. It never cancels."

**2:55–3:00 — Out.** One line: "AI recommends, rules decide, and the person being protected is
always the one thing the system is built around." Cut.

## If you only have 60 seconds

The 0:45–1:30 sentiment-analysis beat and the 2:25–2:55 safe-fail beat alone tell the whole story:
real Gemini reasoning over real evidence, wrapped in a safety-critical system that never lets AI
gate the actions that must always fire.

## If Gemini's quota is exhausted when you demo

This will happen — the free tier is 20 requests/day, shared across the whole Gemini 3.x-flash
model family, and it recovers in well under a day despite the "daily" label. Don't hide it if it
happens live. Say this instead: *every AI-assisted route has a deterministic fallback that keeps
the full incident lifecycle working end-to-end — trigger, escalation, duress protection, evidence
capture, notification — none of that depends on a model call succeeding. The `aiProvider` field on
every response tells you honestly which path served this response.* Then point at a chip reading
`Deterministic fallback` as proof the honesty claim is real, not just asserted. A platform that
degrades honestly under a real external constraint is a stronger showing than one that would
silently break or fake it.

## Before you demo

- Confirm `.env`'s `GEMINI_API_KEY` is set and has headroom (test with one `curl` call to
  `/api/v1/context/summarize` a few minutes before — see README's Quick Start).
- Run `npm start` and wait for `✓ BILLI PLATFORM READY — 13/13 services connected`.
- If demoing on a phone for real GPS/camera/mic, use the HTTPS LAN URL printed at startup and
  accept the self-signed certificate warning in advance, not live in front of judges.
- Have a fresh browser profile or `Billi.resetPlatform()` ready so you're not demoing on top of
  leftover test data.
