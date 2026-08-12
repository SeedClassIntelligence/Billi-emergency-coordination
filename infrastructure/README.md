# Billi — Cloud Architecture

This directory holds Billi's infrastructure-as-code and the Vertex AI function
layer. **Read the status of each piece below before assuming what is live** — the
platform currently serves production from a simpler deployment than what is
modelled here, and both facts matter.

## What is running in production today

The live service at `https://billi-platform-467802610371.us-central1.run.app` is a
single Cloud Run container that runs all 13 services internally
(`start-cloud.js`), with local JSON file persistence. It is deployed, healthy,
and serving real traffic. Gemini reasoning runs through `@google/genai` with an
API key, in `services/context-engine`.

That is the deployed architecture. Everything else in this directory is the
designed scale-out path.

## `main.tf` / `infrastructure/main.tf` — designed, not applied

A ~360-line Terraform stack modelling Billi at scale:

- 2 × Cloud Spanner instances + databases — globally-consistent incident state
- 2 × Firestore databases
- Pub/Sub topic for event fan-out between services
- Cloud Storage bucket for evidence retention
- VPC service networking (private service access)
- Global HTTP load balancer with URL map, target proxy, and a Cloud Run
  network endpoint group

**Status: never applied.** There is no `tfstate` in this repository. It has not
provisioned anything, and running `terraform apply` against it would incur real
cost and has not been validated end to end. It is included because it is a real
design artifact showing how the incident model maps onto managed GCP services
when single-container persistence stops being sufficient — not because it is
live.

`main.tf` at the repository root and `infrastructure/main.tf` are near-duplicates
of each other, from two iterations of the same design.

## `cloud-functions/` — a second, enterprise Gemini path

Three Firebase Functions (~307 lines) built on `@google-cloud/vertexai` rather
than the API-key SDK:

- `context_engine.js` — incident context synthesis
- `dispatcher.js` — responder dispatch reasoning
- `index.js` — Pub/Sub-triggered entry points

This is Google's enterprise Vertex AI path: IAM-authenticated, project-scoped,
no API key to leak, and the route you would take for production quota and data
governance. The prompt and schema intent from these functions was ported forward
into the running `services/context-engine`, which is why the live platform's
911/CAD analysis resembles them.

**Status: not deployed and not wired.** There is no root `firebase.json`, and
these functions target a Firestore `incidents/{id}` document shape that no
currently-running service writes. They are retained as the reference
implementation of the Vertex AI migration path.

## Why both exist

Billi was built against a hard deadline. The pragmatic choice was to ship one
container that genuinely works over a distributed architecture that is
half-provisioned. This directory documents the intended destination honestly,
rather than deleting the design work or implying it is running.

If you are evaluating what Billi actually does today, read
[../README.md](../README.md) and open the live URL. If you are evaluating
whether the team understands how this scales, read the Terraform.
