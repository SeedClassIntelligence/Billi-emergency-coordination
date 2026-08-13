# Product Evidence

Everything here reflects the platform as deployed at
<https://billi-platform-467802610371.us-central1.run.app> unless a file says
otherwise.

## Current

| File | What it is |
|---|---|
| `agent_execution_logs.txt` | A real captured execution trace against production — incident `inc_63373`, packet `pkt_1786571191893_lp34ny`, 13/13 services, `aiProvider: gemini-live`, and the orchestration engine approving two Gemini-recommended actions. Reproducible; commands included in the file. |
| `api_usage_records_raw.json.txt` | The unedited JSON responses behind that trace. |
| `current_ui_incident_walkthrough.gif` | Real screen capture of the current UI: armed → hold-to-activate SOS → four core actions live → Guardian Command Center → guardian acknowledges → live Gemini analysis. |
| `pnl_proforma_statement.csv` | **Projection, not actuals.** Year 1-5 model. Collected revenue is reported in [../XPRIZE_SUBMISSION.md](../XPRIZE_SUBMISSION.md), which is the authoritative financial statement. |
| `dashboard_banner.jpg` | Brand banner. |

## `archive_v1/`

Twelve screenshots from the product's first iteration. The UI has moved well
beyond them and they no longer match what the live URL serves, so they were
moved here rather than deleted — they are a genuine record of where the product
started.

**Do not use these to represent the product.** A reader comparing them to the
live site would see two different applications.

## Still to add: current UI stills

The `archive_v1` shots have not yet been replaced with equivalents from the
current build. The walkthrough GIF above covers the incident path; the
following six screens are worth capturing as stills:

1. Landing page — hero, nav, prototype notice
2. Pricing — Billi Family $14.99 with the Android requirement notice
3. `protected.html` armed — "Billi is ready", `LIVE · 13/13` chip, SOS button
4. `protected.html` during an incident — the four core actions green
5. `incident.html` — lifecycle pills and the Trusted Network response matrix
6. `incident.html` — the **Audio sentiment analysis** card showing `LIVE GEMINI`

Number 6 is the most valuable single image in this directory: it shows Gemini
classifying risk, verifying distress, and correlating audio evidence against
speed telemetry, in production.

Capture with `Win + Shift + S` against the live URL. Seed a demo account first
from the browser console so the screens have realistic data:

```javascript
Billi.applyFixturePrefill(); Billi.activatePlatform();
const s = JSON.parse(localStorage.getItem('billi_platform_v1'));
s.session.authed = true; s.contract.video = true;
localStorage.setItem('billi_platform_v1', JSON.stringify(s));
location.href = 'protected.html';
```
