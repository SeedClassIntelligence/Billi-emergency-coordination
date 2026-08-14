# Where Billi Sits in the Safety Industry

Researched 2026-08-13, sources at the bottom.

This is a real industry with real companies solving real parts of the problem. Billi is one
of them. The point of this document is not to argue nobody else does anything — it is to
say precisely **where Billi sits and what's distinct about it**, so the answer is the same
whether it's asked by a judge, an investor, or someone in line at a coffee shop.

---

## The one-sentence answer

> Life360 protects a family circle. Blackline and Peoplesafe protect an employer's
> workforce. Noonlight and Hollie Guard protect an individual with a panic button.
> **Billi protects the person who is both — someone who works alone and has a family — on
> one account they can buy themselves.**

---

## The industry, honestly mapped

| Segment | Who's there | What they're built around |
|---|---|---|
| **Family location** | Life360 | A circle of family members sharing location |
| **Personal panic button** | Noonlight, Hollie Guard, bSafe, Silent Beacon | One person, one button, one alert |
| **Medical alert (PERS)** | Bay Alarm Medical, Life Alert, MobileHelp | A monitoring centre and a wearable |
| **Elopement / autism** | AngelSense | A tracked device and a caregiver |
| **Enterprise lone worker** | Blackline Safety, Peoplesafe, SoloProtect, StaySafe | An employer protecting a workforce |
| **Billi** | — | **One person who works alone, and their family, on one account** |

Everyone here is solving a version of "someone needs help and can't easily ask." The
segments differ in **who buys it and who it wraps around**, and that's where Billi's
position comes from.

---

## The four distinctions worth leading with

### 1. One account covers work and family

This is the strongest one and it's structural, not a feature.

Enterprise lone-worker platforms are bought by an employer and stop at the worker — the
protection ends when the shift does, and it never extends to their kid. Family apps are
bought by a parent and stop at the family — they aren't built around someone alone on a job.

Billi's second-device invite crosses that line on one $14.99 seat. A driver protected on
the road extends the same account to their kid without buying a second product. **Nobody
else is shaped this way**, because everyone else's business model picks a side.

### 2. Bought like a consumer app, built for working alone

The lone-worker products are sold through procurement — contract, seat count, account
manager. None of Blackline, Peoplesafe, SoloProtect or StaySafe publishes a per-user price;
you request a quote.

A sole proprietor is not a procurement department. So the products designed for how they
work aren't sold in a way they can buy, and the products they *can* buy are designed for
families. Billi is built for the first and sold like the second.

### 3. Duress that lives inside a shared incident

Coerced-cancellation protection exists elsewhere — Hollie Guard has a duress PIN that shows
a cancelled alarm while confirming to responders, and Noonlight escalates if you release
the button without a PIN. Good ideas, and we're not the first to have them.

**The distinction is what happens next.** In a monitoring-centre model, duress sends a
signal to an operator. In Billi, duress flips a state on a live incident that every
guardian is already watching — the protected person's screen shows a calm cancellation
while the guardian's screen shows a red duress banner, the location keeps moving, and the
audio keeps recording, all in the same record. It's the difference between raising an alarm
and running a coordinated response.

### 4. AI recommends. The rules decide.

Gemini reads the live incident and returns recommendations. A separate deterministic rule
engine validates each one against the Safety Contract configured during setup, and only
then approves it. Withhold audio consent and a recommendation to open the microphone is
refused, regardless of model confidence. The UI names which model answered and when it fell
back to deterministic logic.

That's an architecture, not a feature toggle, and it's ours to describe.

---

## Life360 specifically — the question that keeps coming up

The most common comparison, so have a crisp answer ready.

Life360 is a strong product at real scale. Crash detection is in their free tier; Gold at
**$14.99/month — the same price as Billi** — adds emergency dispatch with live agents,
roadside assistance, 30-day location history and theft/ID protections. They report
dispatching over 100 ambulances a day.

**Say this:**

> "Life360 is good at what it's for — knowing where your family is and getting help if
> there's a crash. It's a family circle product. Billi is built around one protected person
> who's alone at work: a safe word nobody nearby notices, a duress PIN for when someone's
> making you cancel it, and a trusted network that includes your dispatcher and your wife
> in the same incident. And when you're off shift, the same account covers your kid.
> They're different shapes, not different quality."

**Don't say** Billi is cheaper or better value — at the same price they bundle more
services, backed by a monitoring operation Billi doesn't have. Competing on bundle size is
a fight we'd lose and don't need. Compete on shape.

---

## What we don't have, and say so

Answer these directly when asked. It costs nothing and buys credibility for everything else.

- **No monitoring centre.** Nobody watches a screen on your behalf. Billi coordinates the
  people you chose. That's a deliberate design, and it's also a real limitation.
- **No live 911/CAD integration.** The packet is an export a human hands over.
- **iPhone SMS.** Apple permits no third-party app to send a text without a manual tap. The
  carrier-gateway path is built and pending a paid account.
- **Scale.** Life360 has years and millions of users. We have a working product and a
  clear position.

---

## Sources

- [Life360 plans & pricing](https://www.life360.com/plans-pricing)
- [Life360 crash detection](https://www.life360.com/crash-detection)
- [Life360 crash detection & emergency dispatch terms](https://legal.corp.life360.com/hc/en-us/articles/16044048651031-Crash-Detection-and-Emergency-Dispatch-Services)
- [Timeero — Life360 for business](https://timeero.com/reviews/life360-app-review)
- [SafeWise — safety apps roundup](https://www.safewise.com/blog/free-apps-can-call-help-youre-ever-danger/) (Hollie Guard duress PIN)
- [WhistleOut — Noonlight](https://www.whistleout.com/CellPhones/Guides/noonlight-panic-button-for-solo-travel-safety)
- [SafetyCulture — lone worker apps 2026](https://safetyculture.com/apps/lone-worker-app)
- [Everbridge — lone worker software guide](https://www.everbridge.com/blog/lone-worker-employee-safety-software-guide/)
