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

## Where to demo from

**Live, no setup required: <https://billi-platform-467802610371.us-central1.run.app/landing.html>**

This is the same 13-service platform this repo runs locally, deployed to Cloud Run — judges can
open it cold with nothing installed. Every page referenced in the walkthrough below works there:
`landing.html`, `protected.html`, `incident.html`, `admin.html`. The Android APK
is served from the same host at `/billi.apk` and is hardcoded to load this URL, so the app and the
browser hit identical backends.

**Cold start is real and will bite you.** The service scales to zero, so the first request after an
idle period returns `{"error":"gateway unreachable through cloud proxy"}` for anywhere from 15
seconds to about a minute while the 13 internal services boot. Open the URL a couple of minutes
before you present. If you're handing the link to someone who'll click it unattended, keep an
instance warm for the judging window instead:

```bash
gcloud run services update billi-platform --region us-central1 --min-instances=1
```

Set it back to `--min-instances=0` afterward — that flag is the only setting here that costs money
while idle.

Demo locally instead (`npm start`) only if you specifically need real device GPS/mic/camera over the
HTTPS LAN URL. For everything else the live URL is the better showing, because it proves the thing
actually runs somewhere other than your laptop.

## Which "demo" is which (read this before recording)

**A scenario card now launches the real product, not a summary of it.** Clicking one seeds a
sandboxed demo account, triggers the incident, and drops you on `protected.html` — the actual
protected person's screen — then moves you to `incident.html`, the actual Guardian Command Center,
on the scenario's own schedule. A guide bar along the bottom names the panel each beat is about and
rings it. Nothing in a demo is a separate re-implementation of the product; it *is* the product,
with the persona and the timing scripted.

There are **five** scenarios, not nine. The four old capability-only demos (duress, signal loss,
phone power-off, escalation ladder) had no person in them — each is now folded into a scenario
about a real situation, so nothing was lost and every demo carries several capabilities. Each card
lists what it proves.

Two older screens still exist and are **not** what a card launches:

- **`demo_30s.html`** — a leftover from an earlier build generation, hardcoded fake data, not
  linked from `landing.html`. **Do not use this for the video.**
- **`demo-live.html`** — the compact single-viewport summary the scenario cards used to land on.
  Still runs on real engine data, but it describes the incident from outside rather than showing
  the product, which is exactly why cards no longer route to it. Nothing links to it now.

## ⚡ 40-second hands-off auto-play (no clicking, no narration required)

Launched-scenario incidents now walk themselves through the entire lifecycle on a fixed schedule
— purely a demo convenience (`inc.scenario` gates it; a real triggered emergency never
auto-progresses or auto-resolves itself, that always requires an actual human guardian action).
Good for a quick loop/GIF, the cold-open of a longer video, or anywhere you want to just point a
camera at the screen and let it play:

1. **0:00** — Open `landing.html`, click any scenario card. Lands on `protected.html`, the
   protected person's own screen. `EMERGENCY TRIGGERED` lights up immediately and the guide bar
   names the first thing to watch.
2. **0:03** — `TRUSTED NETWORK NOTIFIED` lights up (this hop is time-based, not scripted — the
   real notification-fanout timing).
3. **0:08** — `GUARDIAN ACKNOWLEDGED` — the primary contact's name appears as having responded.
4. **0:15** — `HELP RESPONDING`.
5. **0:30** — `INCIDENT STABILIZED`.
6. **0:40** — `RESOLVED`, closing on "✓ Protected person confirmed safe."

Every stage pill fills in on screen with no clicks — just start recording, launch the scenario,
and stop at 0:40. The guide bar moves you from `protected.html` to the Guardian Command Center on
its own partway through and rings whichever panel it is talking about, so the camera doesn't need
a driver.

Two scenarios deliberately run longer than 0:40 because their point takes longer:
**Scenario 02** holds the acknowledgement back to 0:48 so the full 45-second escalation ladder
fires on camera (finishes about 1:20), and **Scenario 03** opens with the real ten-second
confirmation window before anything is sent (everything after shifts ten seconds later).

Use this as a companion to the full walkthrough below, not a replacement — it shows the
*lifecycle* moving end to end but doesn't stop on any of the 6 Gemini touchpoints in the depth the
3-minute version does.

## 🎥 3-minute video recording script (exact timing)

Record your own screen; read the narration lines as you click. Practice once un-recorded first —
the Gemini calls (especially sentiment/photo analysis) take a few real seconds to resolve, so
pause on each card until its content actually appears rather than talking over a loading state.

**0:00–0:20 — Landing page, the pitch.** Open `landing.html`. Narrate the 30-second pitch above
(condense to ~15s: "person-centric," "one trigger, four simultaneous actions," "Gemini recommends,
rules decide"). Point at the 5 scenario cards — distinct people in distinct situations, and each
card lists what it proves.

**0:20–0:35 — Launch, and you're inside the product.** Click **Scenario 01, Rideshare Driver**
(chosen deliberately: it's the lone-worker story the submission is built on, and its evidence audio
gives Gemini something real to reason about). You land on `protected.html` — the driver's own
screen. Narrate: "this isn't a video of the product, it's the product; the guide along the bottom
is telling me what to watch." Let the four core-action rows go green on camera.

**0:35–0:45 — The tour moves itself.** The guide bar moves you to the Guardian Command Center and
rings the duress banner. Say: "he was made to cancel it — his screen says cancelled, and location
and audio never stopped."

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

**Verify Gemini against whatever you're actually demoing from.** This matters more than it sounds:
the key is supplied two different ways, so a working local setup proves nothing about the live URL.
Locally it comes from the gitignored repo-root `.env`; on Cloud Run it's a runtime env var set at
deploy time. Production once ran for days on the literal placeholder string `YOUR_GEMINI_API_KEY`
while local was fine — every AI card silently served its deterministic fallback, and nothing in the
UI looked broken.

Run this against the host you'll present from, and confirm `"aiProvider":"gemini-live"`:

```bash
curl -s -X POST https://billi-platform-467802610371.us-central1.run.app/api/v1/context/summarize \
  -H "Content-Type: application/json" \
  -d '{"incidentId":"PROBE","protectedPerson":{"name":"Maya Johnson","age":11},"timelineEvents":[{"event":"Maya: Help me!"}]}'
```

A sub-second response reading `"deterministic-fallback"` means no successful model call happened —
either the key is wrong or quota is tapped. A real call takes several seconds. To inspect the key
Cloud Run is actually holding (prints only that one variable, truncated, so nothing else leaks):

```bash
gcloud run services describe billi-platform --region us-central1 \
  --format='value(spec.template.spec.containers[0].env)' | tr ';' '\n' | grep GEMINI_API_KEY | cut -c1-52
```

To replace it, use an interactive prompt rather than pasting the key into a command — `-s` keeps it
off screen, and `--update-env-vars` merges instead of wiping the other variables the way
`--set-env-vars` would:

```bash
read -s -p "Paste Gemini key: " K && echo && gcloud run services update billi-platform \
  --region us-central1 --update-env-vars GEMINI_API_KEY="$K"
```

Note that `gcloud run deploy --image` carries the existing environment forward unchanged, so
redeploying does **not** fix or alter a bad key.

**The rest:**

- Warm the live URL (see "Where to demo from" above) or start `npm start` locally and wait for
  `✓ BILLI PLATFORM READY — 13/13 services connected`.
- If demoing on a phone for real GPS/camera/mic, either install `/billi.apk` or use the HTTPS LAN
  URL printed at startup — and accept the self-signed certificate warning in advance, not live in
  front of judges.
- Have a fresh browser profile or `Billi.resetPlatform()` ready so you're not demoing on top of
  leftover test data.
