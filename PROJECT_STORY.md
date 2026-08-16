# Billi — Project Story

Written to answer the submission form directly. Each section maps to one question, so it
can be pasted across without rewriting. Figures marked `<FILL IN>` are yours — I have left
them blank rather than estimate revenue that only you can report.

---

## When did this start?

**Work began in mid-July 2026 — roughly 30 days before submission.** The git history opens
on **1 August 2026**, which is the day the platform was brought under version control, not
the day the work started; the first commit message is "preserve Billi v2 baseline," because
there was already a baseline to preserve.

**75 commits.** The platform as submitted — 13 backend services, 18 front-end surfaces, six
live Gemini routes, a native Android build, and a public deployment — was built inside that
window.

Some groundwork predates it and is disclosed in the submission: earlier cloud architecture
work, and an earlier React/Firebase generation whose business logic was ported forward
rather than rebuilt. What is running today is not that earlier system.

---

## How does the product use AI?

Gemini is not a feature bolted onto Billi. It is the reasoning layer of the incident engine,
and it runs in production on the public URL right now.

**Six live Gemini routes**, all in `services/context-engine`, all real `@google/genai` calls:

| Route | What it does | Where a judge sees it |
|---|---|---|
| `/context/synthesize` | Reads telemetry at the moment of activation, returns severity and recommended actions | Feeds the rule engine; `AI_CONTEXT_SYNTHESIS` in the incident timeline |
| `/context/analyze` | Structured 911/CAD analysis — risk classification, category, distress verification, responder directives | "Audio sentiment analysis" card |
| `/context/summarize` | Plain-language incident summary, updated as the incident evolves | "AI-assisted summary" card |
| `/context/analyze-photo` | **Multimodal** — reasons over real image bytes from a sealed camera frame | Evidence panel |
| `/context/review-setup` | Reviews a user's configuration *before* anything goes wrong and explains why gaps matter | Onboarding step 10, and Settings |
| `/context/translate` | Translates Billi's spoken reassurance into 9 languages with correct TTS pronunciation | The protected person's device |

### The part that matters: AI recommends, the rules decide

Gemini never executes anything. It returns *recommendations*. A separate deterministic rule
engine (`orchestration-engine`) validates every recommendation against the Safety Contract
the user configured during setup, and only then approves it.

If a user withheld audio consent, a Gemini recommendation to open the microphone is
**refused** — regardless of how confident the model is. The four core emergency actions
(location, audio, photo, network notification) never wait on a model call succeeding.

That is the architecture, and it is the answer to "should AI be trusted with safety
decisions." It isn't. It is trusted to *reason*, and a deterministic layer decides.

### Honest by construction

Every AI response carries `aiProvider` (`gemini-live` or `deterministic-fallback`) and
`aiModel`. The interface displays which path served the response and which model answered.
When Gemini is unavailable, the product says so on screen rather than silently substituting
a template. That is externally checkable with a single curl — the command is in the
submission.

---

## To what extent is AI live in production and executing key decisions?

**Live, in production, on the public URL, executing decisions inside real incidents.**

- Gemini's severity assessment sets the incident severity a guardian sees.
- Gemini's recommended actions are what the rule engine evaluates — the approve/deny
  decisions in the timeline are decisions about *Gemini's* output.
- Gemini's risk classification and distress verification are written into the 911-Ready
  Packet that a responder would be handed.
- Gemini's setup review changes what a new user is told to fix before arming.

Verifiable without an account:

```bash
curl -s -X POST https://billi-platform-467802610371.us-central1.run.app/api/v1/context/summarize \
  -H "Content-Type: application/json" \
  -d '{"incidentId":"PROBE","protectedPerson":{"name":"Maya Johnson","age":11},"timelineEvents":[{"event":"Maya: Help me!"}]}'
```

Look for `"aiProvider":"gemini-live"` and the `aiModel` field.

---

## Which Google Cloud products were used?

| Product | How it is used |
|---|---|
| **Gemini API** (`@google/genai`) | The only LLM in the product. Models `gemini-3.5-flash` and `gemini-3.5-flash-lite`, split across two tiers so a spent quota on one fails over to the other before falling back to deterministic logic. |
| **Cloud Run** | Hosts the entire platform. One container runs all 13 services internally, scale-to-zero, real HTTPS at the edge. |
| **Cloud Build** | Builds the container and deploys it. `cloudbuild.yaml` in the repo root; a push to `master` publishes to production. |
| **Artifact Registry** | Stores the built images (`us-central1-docker.pkg.dev/billi-503602/...`). |
| **Google AI Studio** | Where the Gemini API key is issued and models were evaluated. |

No non-Gemini LLM is used anywhere in the product. When the model is unavailable the
fallback is deterministic code, not another provider — a deliberate choice, since a
Gemini-branded competition entry that quietly routes around Gemini is not an honest entry.

---

## Which AI tools did you leverage while building this?

No budget. Every one of these was chosen because it was free or close to it, which is the
same constraint the customer has and is worth saying out loud.

| Tool | Share of the build | What it did |
|---|---|---|
| **Google Antigravity** | ~50% | Primary development environment. The 13-service backend, the front-end surfaces, the capability recovery and the architecture work. Its audit checkpoint ([ANTIGRAVITY_REPOSITORY_AUDIT.md](ANTIGRAVITY_REPOSITORY_AUDIT.md), 1 August 2026) and workspace state are still committed to the repo, so this is verifiable rather than claimed. |
| **Codex** | ~30% | Implementation across the services and front end. |
| **Claude Code** | ~20% | The final stretch: repositioning the product around the lone worker, the onboarding rebuild, the guided demo scenarios, deployment tooling and documentation. |
| **Gemini** | In the product | Six live routes in production, plus Google AI Studio for model selection and diagnosing free-tier quota behaviour. |

**In the product, the only LLM is Gemini.** Development tooling is a separate question from
what ships, and when Gemini is unavailable at runtime the fallback is deterministic code
rather than another provider.

### Why this matters for this category

This entry is about people who cannot buy the infrastructure a corporate employer provides.
It was built by someone in the same position. There was no engineering budget, so the build
ran on whichever agentic tools were free or nearly free, moving between them as limits were
hit — which is exactly how the small businesses Billi is for actually operate.

One person, no budget, about 30 days: a 13-service backend, 18 front-end surfaces, six live
Gemini routes, a native Android build, a public deployment, and a paying checkout. That is
not a story about one vendor's tool. It is the story of what a sole proprietor can now build
alone, which is the same argument as the product itself.

That is AI-native in both directions — the product reasons with Gemini, and the company only
exists because the build loop was AI-paced end to end.

---

## The business model

**$14.99 per month, per account.** One subscription covers up to five protected people,
unlimited trusted contacts, nine activation paths, duress protection, live location and safe
zones, evidence capture, Gemini-assisted context, and full incident history.

**Priced per account, not per person**, because the customer already owns the sensors. They
are not buying hardware. They are paying for the devices already in their pocket to act as
one coordinated system that knows when to raise an alarm.

**The same subscription covers work and family.** A second device can be invited onto the
account with its own GPS, microphone and camera, inheriting the trusted network and Safety
Contract. A driver protected on the road extends the same account to their child without
buying a second product. Lone-worker tools stop at the worker; family apps stop at the
family. This is the structural difference, and it is built and working.

### Why this price

$14.99 sits at an established consumer price point — Life360's ladder runs
$7.99 / $14.99 / $24.99. Adjacent categories price higher: AngelSense around $39.99/month
plus hardware, medical alert services $28–35+.

But the relevant comparison for a sole proprietor is not price, it is **how the product is
bought.** Commercial lone-worker monitoring — Blackline, Peoplesafe, SoloProtect, StaySafe —
is sold through procurement: a contract, a seat count, an account manager. None of them
publishes a per-user price. **You cannot buy it on a personal card.** That is why the people
who need it most go without it, and it is the gap Billi is priced and packaged to fill.

---

## Market size

The anchor number is the U.S. Census Bureau's count of **nonemployer businesses: more than
28 million** — firms with no paid employees, 86.7% of them sole proprietorships. These are
the drivers, aides, contractors, agents and owner-operators Billi is built for. Roughly
16.6 million Americans are self-employed as their primary work.

At $14.99/month ($179.88/year), against the 28M nonemployer figure:

| Penetration | Accounts | Annual revenue |
|---|---|---|
| 0.01% | 2,800 | ~$500K |
| 0.1% | 28,000 | ~$5.0M |
| 0.5% | 140,000 | ~$25.2M |
| 1.0% | 280,000 | ~$50.4M |

Serviceable near-term market is narrower and more honest: the segments where working alone
is the defining condition of the job — rideshare and delivery drivers, home health aides,
independent contractors and tradespeople, real estate agents, owner-operator truckers.

The expansion path is multi-seat: a brokerage covering 40 agents, a home-care agency covering
its aides, a small fleet covering its drivers. Priced on protected population, responder
seats and service level. That is a sales motion rather than a checkout button, and it is
where the larger business is.

---

## Five-year goal

| Year | Focus | Target |
|---|---|---|
| 1 | Direct sales to sole proprietors; iPhone delivery parity; Play Store release | `<FILL IN>` accounts |
| 2 | Multi-seat pilots with one brokerage and one home-care agency | First B2B contracts |
| 3 | Real wearable integration; 911/CAD dispatch integration | Protection no longer phone-only |
| 4 | Vertical packages by trade; partner/insurer distribution | Distribution beyond direct |
| 5 | Category default for "I work alone" | `<FILL IN>` ARR |

The honest statement of the five-year goal is not a revenue number. It is that **a person
who works alone should be able to buy the protection a corporate employee is given, on a
personal card, in under five minutes.** Revenue follows from being the first product shaped
that way.

---

## How impact is measured

Billi's impact is not engagement, and measuring it that way would be dishonest — a safety
product used constantly is a product whose customer is in danger constantly.

**Primary measures:**

1. **Time from trigger to a human knowing.** The interval between activation and the first
   trusted-contact acknowledgement. This is the number the whole product exists to reduce,
   and it is recorded in every incident timeline.
2. **Coverage.** Protected people with a complete Safety Contract, at least one reachable
   contact, and an armed device — a configured account is protection; an installed app is not.
3. **Resolution outcome.** How incidents end, recorded on every incident: confirmed safe,
   false alarm dismissed, escalated to emergency services.
4. **Escalation integrity.** How often the ladder had to widen because nobody answered. A
   rising number means trusted networks are configured wrong, and it is fixable.
5. **False-alarm rate on sensor triggers.** How often the ten-second confirmation window is
   dismissed as a false alarm — the measure of whether Billi cries wolf.

Every one of these is derived from the append-only incident timeline the product already
writes, not from analytics bolted on afterwards.

---

## Sustaining operations

**Cost structure is deliberately thin.** Cloud Run scales to zero, so idle cost is
effectively nil. There is no database bill — each service uses local JSON persistence.
Gemini is the main variable cost and is bounded by design: responses are cached on the
incident, refetching is keyed to lifecycle changes rather than every render, and routes are
split across two model tiers. SMS on Android sends from the user's own SIM at no cost to the
platform.

The result is that a paying account costs cents to serve, so the business does not require
volume before it works.

**Sustaining it means, in order:** iPhone delivery parity, Play Store release, then real
monitoring and wearable integration — each of which raises what the subscription is worth
and opens the multi-seat motion above.

**Revenue to date and expenses are reported in
[XPRIZE_SUBMISSION.md](XPRIZE_SUBMISSION.md)**, which is the authoritative financial
statement for this submission.

---

## Evidence the project is running

| Evidence | Where |
|---|---|
| Live product, no login gate | <https://billi-platform-467802610371.us-central1.run.app/landing.html> |
| 3-minute walkthrough | <https://youtu.be/CIdecRU1-T4> |
| Real captured production trace — incident + packet IDs, 13/13 services, `aiProvider: gemini-live`, orchestration approving Gemini-recommended actions | [product_evidence/agent_execution_logs.txt](product_evidence/agent_execution_logs.txt) |
| Unedited JSON behind that trace | [product_evidence/api_usage_records_raw.json.txt](product_evidence/api_usage_records_raw.json.txt) |
| Screen capture of the current UI, end to end | [product_evidence/current_ui_incident_walkthrough.gif](product_evidence/current_ui_incident_walkthrough.gif) |
| Source | <https://github.com/SeedClassIntelligence/Billi-emergency-coordination> |
| Android build | `/billi.apk` from the landing page |

Anyone can create an account and run a real incident end to end without contacting us.
