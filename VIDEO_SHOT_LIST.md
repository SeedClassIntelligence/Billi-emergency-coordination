# Billi — 3-Minute Submission Video: Shot List

Record with **Win + G** (Xbox Game Bar) — built into Windows, captures screen and
microphone to MP4, no install. One take, narrated live.

Target **2:55**. The rules say judges are not required to watch past three minutes,
so nothing important goes after 2:30.

Judging is three equally-weighted criteria: **business viability**, **AI-native
operations**, **category impact**. This runs hits all three deliberately —
most feature demos only hit the third.

---

## Pre-flight (do these BEFORE you hit record)

1. **Warm the service.** Open the live URL and wait for the nav chip to read
   `LIVE · 13/13`. Cold start takes 30-40 seconds and shows a gateway error
   until it finishes. Recording that would be the worst possible first frame.

   <https://billi-platform-467802610371.us-central1.run.app/landing.html>

2. **Confirm Gemini is live** — this should say `gemini-live`, not
   `deterministic-fallback`:

   ```bash
   curl -s -X POST https://billi-platform-467802610371.us-central1.run.app/api/v1/context/summarize -H "Content-Type: application/json" -d '{"incidentId":"PRE","protectedPerson":{"name":"Maya Johnson","age":11},"timelineEvents":[{"event":"Maya: Help me!"}]}'
   ```

3. **Clear state** so you start on a genuine blank account. In the browser console (F12):

   ```javascript
   localStorage.removeItem('billi_platform_v1'); location.href='landing.html';
   ```

4. **Close other tabs**, silence notifications, set the browser to about 1280 wide.

5. **Practice once un-recorded.** The Gemini cards take 3-7 real seconds. You need
   to know where the pauses are so you are not talking over a loading state.

---

## 0:00 – 0:20 · The problem

**Screen:** `landing.html`, top of page.

Say this in your own words — it is your story and it will sound like it:

> "Billi started with bullying. A kid being hurt where no adult can see it, who
> can't call for help without making it worse. That's why Billi has a safe word,
> silent activation, and a duress PIN that looks like you're giving in.
>
> Then I drove for Uber, and it was the same problem wearing different clothes.
> Alone in a car with a stranger, on a route nobody's watching, and no one who'd
> know if the trip ended somewhere wrong. It's the same for truckers, home health
> aides, contractors, anyone closing up at midnight.
>
> Different jobs, one problem: a person is alone, something goes wrong, and nobody
> who cares about them knows in time. And almost every one of those people is a
> small business — a driver, an aide, a solo agent. They *are* the business, and
> the safety infrastructure a corporate employer buys was never available to them."

Let the hero footage play behind you. It is real screen capture of the product.

**Why this opening:** the category is Small Business Services. Establishing in the
first twenty seconds that your buyer is a sole proprietor — and that you were one —
is what makes the rest of the video count against the right criterion.

---

## 0:15 – 0:40 · Setup is the product

**Screen:** click **Create Account** → onboarding → hit **⚡ Evaluator quick-fill**.

Move through steps **1 → 5 → 6 → 9** only. Do not walk all nine.

> "Setup is where every decision gets made — who responds, in what order, and
> what Billi is permitted to do."

**Pause on step 6, the Safety Contract.** Read the line on screen:

> "No permission dialogs at emergency time. Every decision is made here, now."

**On step 9**, point at the readiness split:

> "Four items are required. Five are optional and never block activation — real
> testers quit when safe-word enrollment felt mandatory, so nothing optional
> locks a parent out of arming basic protection."

If the Gemini setup review has rendered, read one recommendation aloud:

> "And this is Gemini reviewing the setup itself — explaining why a gap matters,
> before anything has gone wrong."

---

## 0:40 – 0:55 · One trigger, four actions

**Screen:** activate → `protected.html`. Hold the **SOS** button for 2 seconds.

> "One trigger. Location, audio evidence, photo evidence, and the Trusted Network
> all fire at once — not in sequence, not waiting on each other."

Let the four rows go green on camera. That is the product's whole thesis in five
seconds.

---

## 0:55 – 1:35 · The shared incident

**Screen:** `incident.html` — Guardian Command Center.

> "Every guardian, every responder, and the protected person are looking at one
> continuously-updated incident — not separate notification streams."

Point at, in order:
- the **lifecycle pills** filling in
- the **Trusted Network response matrix** — who was alerted, who acknowledged
- the **AI-assisted summary** card with its `LIVE GEMINI` chip

> "That summary is Gemini reading the live incident, not a template."

---

## 1:35 – 2:05 · The centerpiece — AI recommends, rules decide

**Screen:** scroll to **Audio sentiment analysis**. Wait for `LIVE GEMINI`.

Read the badges aloud: risk classification, category, distress verified.

> "Gemini read the evidence transcript and the speed data as separate inputs, and
> correlated them itself — the acceleration followed the screams. It classified
> this as abduction risk, and deliberately did not state it as fact."

**Then the architectural point — this is the most important sentence in the video:**

> "But Gemini never executes anything. It returns recommendations. A separate
> deterministic rule engine validates each one against the Safety Contract the
> guardian configured, and only then approves it. If audio consent was withheld,
> a recommendation to open the microphone is refused — no matter how confident
> the model is. AI recommends. The rules decide."

---

## 2:05 – 2:25 · The safe-fail

**Screen:** back to `protected.html` → **🧪 Simulate fall**.

> "Fall, crash, geofence and acoustic triggers are sensor-inferred. They can be
> wrong — a phone in a backpack. So those get a ten-second confirmation window
> before the network is told anything. Deliberate triggers, like hold-to-SOS,
> never wait."

Let the countdown ring drain.

> "And silence escalates. It never cancels."

---

## 2:25 – 2:45 · A real business

**Screen:** `landing.html` → **Pricing**.

> "Fourteen ninety-nine a month, per account — up to five people, and it clears on
> a personal card with no purchase order. That matters, because commercial
> lone-worker monitoring is sold through procurement. You can't buy it on a
> personal card. That's the reason people who work alone go without it — not that
> they don't want it, but that every existing option is sold through a process
> they're too small to enter.
>
> And one account covers work and family. A driver protected on the road can
> extend it to their kid without buying a second product."

Point at the Android requirement notice:

> "And we tell people what doesn't work yet. Text alerts are real on Android
> today. On iPhone they aren't, so we say so above the buy button — we'd rather
> lose the sale than have a family find out during an emergency."

That honesty beat is worth more to judges than one more feature.

---

## 2:45 – 2:55 · Close

> "AI recommends. The rules decide. And the person being protected is the one
> thing the entire system is built around. Billi was developed to protect you
> better."

---

## If Gemini falls back mid-recording

Don't hide it, don't re-shoot. Say:

> "That's the deterministic fallback — every AI route has one, and the platform
> labels which path served the response. The four core actions never depend on a
> model call succeeding."

Then point at the `Deterministic fallback` chip. A system that degrades honestly
under a real constraint is a stronger showing than one that would fake it.

---

## What to cut if you run long

In this order: the setup review at 0:40, the response matrix at 1:15, the
lifecycle pills. **Never cut** the sentiment analysis or the
AI-recommends/rules-decide line — that is the entire AI-Native Operations
criterion in one beat.
