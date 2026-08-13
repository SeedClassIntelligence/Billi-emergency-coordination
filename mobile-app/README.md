# Billi — Flutter App (superseded design generation)

**This directory does not run, and it is not what ships.** It is kept as a record
of an earlier design generation, the same way `../infrastructure/` keeps the
designed-but-unapplied cloud architecture. Read this before assuming any screen
here reflects the current product.

## What ships today

The mobile product is **`../mobile-native/`** — a native Android shell (WebView +
a real `SmsManager` bridge) that wraps the live web app. It is built with plain
`aapt2` / `d8` / `apksigner`, needs no Gradle or Android Studio, and is served
from the landing page as `/billi.apk`. It exists to do the one thing a browser
categorically cannot do on any platform: send a real SMS through the phone's own
SIM the moment an incident triggers.

The screens a user actually sees are in **`../web-app/`** — 18 plain HTML/CSS/JS
pages driven by `billi-core.js`.

## Why this is superseded

The Flutter screens here were written before the current platform existed and
were never updated to it. Concretely:

- **The personas are stale.** These files use Emma Miller / Sarah Miller / the
  "Red Balloon" safe word. The current platform is Maya Johnson–canonical, with
  six named scenario personas (a rideshare driver, a courier, an owner-operator
  and others) that do not exist here at all.
- **Nothing connects them to the running backend.** The 13-service system,
  shared incident state over SSE, the Safety Contract rule engine and all six
  Gemini routes were built after these screens and are not wired to them.
- **They are not in any build.** `start-all.js`, `start-cloud.js`, the
  `Dockerfile` and `package.json` do not reference this directory.

## Do not cite these files as evidence of a shipped capability

`../CANONICAL_CAPABILITY_RECOVERY_MATRIX.md` cites paths in this directory as
implementation evidence for capabilities marked ✅ IMPLEMENTED. That document
predates the rebuild. Where a capability really is implemented, the running
implementation is in `../web-app/` and `../services/` — not here.

## If Flutter is revisited

The value in this directory is the screen inventory and the interaction model,
not the code. A real native rebuild would target the existing gateway API
(`/api/v1/*`) exactly as the web app does, and would inherit the current
personas, the Safety Contract model and the guided scenarios rather than the
fixtures frozen here.
