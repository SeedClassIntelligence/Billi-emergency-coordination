# BILLI — Build with Gemini XPRIZE Submission

**Billi is lone-worker protection for the smallest businesses in the economy.**

A real estate agent showing an empty house to a stranger. A home health aide entering an
unfamiliar home alone. A contractor on a site with nobody else there. A retail worker closing
at midnight. These people work alone, they are the business, and none of them has what a
corporate employee has — a security desk, a duress alarm, a colleague who notices.

Billi gives them one: a protected person, a trusted network, automatic evidence capture, and
escalation that runs whether or not they can reach a phone. One trigger fires four things at
once — location, audio evidence, photo evidence, and network notification — while live Gemini
reasoning assesses the situation and a deterministic rule engine decides what actually executes.

The same platform protects families, which is where the consumer wedge lives. The architecture
does not change: the protected person is the persistent entity, and everything else exists to
serve that one individual.

| | |
|---|---|
| **Video** | <https://youtu.be/CIdecRU1-T4> |
| **Live product** | <https://billi-platform-467802610371.us-central1.run.app/landing.html> |
| **Source** | <https://github.com/SeedClassIntelligence/Billi-emergency-coordination> (`master`) |
| **Android app** | `/billi.apk` from the landing page |
| **Category** | **Small Business Services** |
| **Walkthrough** | [DEMO_SCRIPT.md](DEMO_SCRIPT.md) |

No login gate. Anyone can create an account and run a real incident end to end.

---

## 1. Business Viability

### The product being sold

**$14.99 / month, per account.** One subscription covers up to 5 protected people, unlimited
trusted contacts, 9 activation paths, duress protection, live location and safe zones, automatic
evidence capture, Gemini-assisted incident context, and full incident history.

The same SKU serves two buyers:

- **Sole proprietors and micro-businesses** — the agent, the aide, the contractor, the notary.
  They *are* the business. They buy on a personal card with no procurement cycle, which is why
  this segment is reachable in days rather than quarters.
- **Families** — the consumer wedge, same product, same price.

Priced per account rather than per person, because the buyer already owns the sensors. They are
not paying for hardware; they are paying for the devices they already carry to act as one
coordinated system.

Multi-seat business licensing — a brokerage covering 40 agents, an agency covering its aides —
is priced separately on protected population, responder seats and service level. That is where
the larger business lives, and it is a sales motion, not a checkout button.

### Why this price

$14.99 sits deliberately at an established, understood consumer price point. Life360's ladder runs
$7.99 / $14.99 / $24.99, with Gold at $14.99 already combining family location, crash detection and
emergency dispatch. Adjacent categories price higher: AngelSense around $39.99/month for an
additional device plan, Bay Alarm Medical $27.95–$34.95+, ADT professional monitoring from about
$29.99 plus equipment.

For a sole proprietor the more relevant comparison is not the price at all — it is how the
product is bought. Commercial lone-worker monitoring is sold through procurement: a contract, a
purchase order, a seat count, an account manager. Billi clears on a personal card. The reason
micro-businesses go without worker safety is not that they do not value it, it is that every
existing option is sold through a process they are too small to enter.

It also leaves room to move up as professional monitoring, real wearable integration and responder
capabilities come online.

### The employee's family is the same system

An account holder can invite a second real device into their protected group — this is built and
working (`join-household.html`, `/api/v1/household/*`). The joining device gets its own GPS,
microphone and camera scoped to whoever it protects, inheriting the trusted contacts and Safety
Contract at join time.

The consequence is that a driver protected through his work account can extend that protection to
his daughter without buying a second product. Nothing in the architecture changes — the protected
person is still the persistent entity, the trusted network is just pointed at different people.

That is unusual in this market. Lone-worker products stop at the employee. Family products stop at
the family. Billi is one platform where the same seat covers both, which makes a business
subscription materially more valuable to the person actually carrying the phone.

### Competitive position

The buyer already owns the sensors. A phone in a work vehicle contains GPS, a microphone, a
camera, an accelerometer, Bluetooth and a cellular radio. What is missing is not hardware — it is
anything that coordinates them, notices when something is wrong, and tells the right people.

Billi does not replace those technologies. It is the coordination layer between them. The pricing
question is therefore not "what is another tracker worth" but "what will someone who works alone
pay for the devices they already carry to act as one system that knows when to raise the alarm."

### Growth path

Multi-seat licensing for brokerages, home-care agencies, small fleets and campuses is priced on
protected population, responder seats and service level. That is a sales motion rather than a
checkout button, and it is where the larger business lives.

### Actuals

The rules require collected revenue, not projections. These are actuals as of submission:

| Metric | Value |
|---|---|
| Total Revenue | `<FILL IN>` |
| Revenue by Month | `<FILL IN>` |
| Total Expenses | `<FILL IN>` |
| Marketing & Customer Acquisition Spend | `<FILL IN>` |
| Paying households | `<FILL IN>` |
| Individual users | `<FILL IN>` |
| Customer testimonials | `<FILL IN>` |

Known expense lines: Google Cloud Run hosting, Gemini API usage, Twilio messaging, developer
accounts. Customer acquisition to date has been direct and unpaid — if that spend is $0, it is
reported as $0 rather than left blank, because customer acquisition cost is a real and favourable
number here, not a missing one.

---

## 2. AI-Native Operations

Gemini is live in production on the public URL, not staged for a demo. Every route reports which
path served the response via an `aiProvider` field (`gemini-live` or `deterministic-fallback`), so
the claim is externally checkable rather than asserted.

### Six live Gemini touchpoints

All run on `gemini-3.5-flash` in `services/context-engine`, proxied through the gateway.

| # | Route | What it does |
|---|---|---|
| 1 | `/context/synthesize` | Fires the instant an incident triggers. Reads telemetry against the Safety Contract, returns severity and recommended actions. |
| 2 | `/context/summarize` | The live AI-assisted summary on the Guardian Command Center, updated as the incident evolves. |
| 3 | `/context/analyze` | Acoustic and verbal sentiment analysis over the evidence transcript — genuine distress vs. accidental trigger — as a structured risk/category/directive object feeding the 911-ready packet. |
| 4 | `/context/analyze-photo` | **Multimodal.** Sends real image bytes from a sealed camera frame for scene description. The only point in the platform where an image leaves the device. |
| 5 | `/context/review-setup` | Not incident-time. Reviews a guardian's configuration and explains *why* specific gaps matter. This is AI performing customer onboarding. |
| 6 | `/context/translate` | Billi's spoken reassurance, translated into 9 languages with correct TTS pronunciation. |

### AI recommends. The rules decide.

This is the architectural commitment that matters most, and it is the opposite of letting a model
drive a safety-critical system.

Gemini never executes anything. It returns *recommendations*. Those recommendations are passed to
`services/orchestration-engine`, a deterministic rule engine that validates each one against the
household's Safety Protocol — the consent and permission contract the guardian configured — and
approves or denies it. A recommendation to open the microphone is denied outright if the contract
withholds audio consent, regardless of how confident the model is.

The four core actions that must fire every single time — location, audio, photo, notification —
never wait on a model call and never depend on one succeeding. Every AI route has a deterministic
fallback that produces a usable result when Gemini is unavailable, and the UI labels it honestly
instead of silently degrading.

That split is what makes AI safe to run in production here: the model widens what the system can
understand without ever widening what it is permitted to do.

### Verify it yourself

```bash
curl -s -X POST https://billi-platform-467802610371.us-central1.run.app/api/v1/context/analyze \
  -H "Content-Type: application/json" \
  -d '{"protectedPerson":{"name":"Maya Johnson","age":11},"evidence":["Maya: No! Let me go! [Screaming] Help me!","[Door slam, engine acceleration]"],"locations":[{"speed":"5 mph"},{"speed":"25 mph"}]}'
```

Returns `"aiProvider":"gemini-live"` with a structured assessment that correlates the audio
evidence against the speed change in the location trail.

---

## 3. Category Impact — Small Business Services

### Where this came from

Billi started with bullying — a child being hurt where no adult could see it, and no way for that
child to summon help without making the situation worse. Hence the safe word, the silent
activation, the duress PIN that looks like compliance.

What became clear while building it is that the same shape appears everywhere someone is alone and
cannot safely ask for help. Rideshare driving, most directly: I drove for Uber myself, and a
driver is alone in a vehicle with a stranger, on a route nobody is watching, with no colleague who
notices when the trip ends somewhere wrong. Long-haul trucking carries the same exposure, and for
Black drivers routed through parts of the country where stopping is not safe, worse. Home health
aides entering unfamiliar homes alone. Contractors on empty sites. Retail workers closing at
midnight.

These look like different problems and are one problem: **a person is alone, something goes wrong,
and nobody who cares about them knows in time.**

Almost all of them are also small businesses. A rideshare driver is a sole proprietor. So is an
owner-operator trucker, a solo agent, an independent aide. They *are* the business, and the safety
infrastructure a corporate employer provides was never available to them.

### The category problem

**Worker safety is infrastructure that small businesses cannot buy.**

A hospital gives its staff duress badges. A warehouse has a security desk. A corporate office has
a lobby, a camera system, and someone who notices when you do not come back. The protections that
make working alone survivable are all enterprise infrastructure — priced, procured and installed
at a scale a two-person business will never reach.

So the smallest businesses simply go without. A solo agent texts a friend the address and hopes.
An aide tells dispatch she arrived. A contractor tells nobody. The standard mitigation in these
industries is a colleague agreeing to check in later, which is not a safety system — it is a
person remembering.

Billi's contribution is that **the call is not the trigger.** A spoken safe word, a held button, a
detected fall, or a duress PIN entered under coercion all produce the same coordinated response —
location, evidence, notification, escalation — without the worker having to reach a phone,
speak clearly, or be believed.

Two design decisions carry most of the real-world value, and both were built for exactly this
buyer:

**Duress protection.** A cancellation PIN entered under coercion appears to dismiss the emergency
on screen while keeping the trusted network silently alerted. Someone forced to "call it off"
in front of a person threatening them can comply and still be helped.

**Accidental-trigger safe-fail.** Sensor-inferred triggers — fall, crash, geofence, acoustic — open
a 10-second confirmation window before anyone is notified, because a phone in a work bag can be
wrong. Deliberate triggers never wait. Silence always escalates; it never cancels. A safety tool
that cries wolf gets switched off, and a switched-off tool protects nobody.

The same mechanisms serve families — a child leaving a safe zone, an elderly parent falling — which
is why the consumer wedge and the business market run on one platform rather than two.

Two design decisions carry most of the real-world value:

**Duress protection.** A cancellation PIN entered under coercion appears to dismiss the emergency
on screen while keeping the trusted network silently alerted. The attacker sees a cancelled alert.
The guardians do not.

**Accidental-trigger safe-fail.** Sensor-inferred triggers — fall, crash, geofence, acoustic — open
a 10-second confirmation window before anyone is notified, because a phone in a backpack can be
wrong. Deliberate triggers never wait. And silence always escalates; it never cancels.

---

## 4. Architecture as built

Thirteen Node/TypeScript services behind one gateway, deployed as a single Cloud Run container.
The browser talks only to the gateway.

```
web-app (10 surfaces)  ──►  gateway :8080  ──►  orchestration-engine :8081
  landing / auth /                              communication-engine :8082
  onboarding / dashboard /                      incident-timeline    :8083
  protected / incident /                        feedback-engine      :8084
  responder / network /                         identity-service     :8085
  devices / admin / help                        safety-protocol      :8086
                                                emergency-packet     :8087
  mobile-native (Android)                       capability-registry  :8088
  └─ real SmsManager bridge                     context-engine       :8089 ◄── Gemini
                                                telemetry-processor  :8090
                                                action-execution     :8091
                                                observability        :8092
```

Shared incident state is distributed over SSE, so a guardian, a responder and the protected person
see one continuously-updated incident rather than separate notification streams.

---

## 5. What is real, and what is not

Stated plainly, because a safety product that overstates itself is worse than one that admits its
edges. Everything below was verified on the deployed system.

**Real**
- Live Gemini on all six routes in production
- Real GPS, motion classification, microphone capture and camera capture from the phone
- Real SMS from the phone's own SIM on Android via `SmsManager` — no third-party gateway
- Real 13-service backend with persisted incidents, timelines and packets
- Real safe zones with live map, address search, and genuine exit-breach
  detection — Haversine distance against the live GPS stream, with an
  accuracy band so a jittery fix near a boundary is never treated as an exit.
  Works while Billi is open on the device; OS-level background geofencing
  would need a native service and is not built.
- Household invite so a second real device joins the same protected household

**Simulated or not yet built — and labelled as such in the product**
- Apple Watch, BLE smart tags and smart glasses appear in the interface but are not connected
  hardware. The phone is the real sensor.
- Peer-to-peer proximity alerting to nearby users is on the roadmap, not implemented.
- The 911/CAD output is a prepared handoff packet, not an integration with a dispatch system.
- Evidence audio and photos stay local to the capturing device. Only metadata — and, for the one
  on-demand vision call, a single image — leaves it. There is no encrypted evidence uplink.
- iOS cannot send SMS autonomously. Apple permits no third-party app to do so, wrapped or not.
  iPhone alerts remain in-app while carrier-based delivery is being brought online.
- Billi is not professionally monitored and is not a replacement for 911.

---

## 6. Pre-existing work disclosure

Billi was created after the submission period opened; the earliest commit in this repository is
2026-07-21.

An earlier React/Firebase prototype of the same concept exists in the repository history and is
retained as `archive/legacy-web-reference/`. It is not part of the running system. Two pieces of
logic were deliberately ported forward from it into the current platform: the structured Gemini
911/CAD analysis schema, and the guardian help/glossary content. Everything else in `services/`,
`web-app/` and `mobile-native/` was written for this submission.

Standard open-source dependencies are used throughout — Express, TypeScript, and the `@google/genai`
SDK. No template, boilerplate or starter kit was used for the application itself.

---

## 7. Reproducing the system

```bash
npm start
```

Brings up all 13 services locally and prints `✓ BILLI PLATFORM READY — 13/13 services connected`.
Set `GEMINI_API_KEY` in a repo-root `.env` to enable live Gemini; without it every route falls back
deterministically and says so.

```bash
npm test
```

See [README.md](README.md) for architecture depth and [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the
guided walkthrough and pre-demo checklist.

---

*Billi was developed to protect you better.*
