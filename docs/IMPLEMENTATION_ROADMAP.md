# BILLI PLATFORM: IMPLEMENTATION & DEPLOYMENT ROADMAP

Follow this step-by-step developer roadmap to provision infrastructure, deploy Gemini AI logic, and run the mobile application prototype.

---

## Phase 1: Infrastructure Provisioning (GCP & Terraform)

1. **Configure GCP Project:**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   gcloud services enable run.googleapis.com \
                          spanner.googleapis.com \
                          firestore.googleapis.com \
                          alloydb.googleapis.com \
                          pubsub.googleapis.com \
                          aiplatform.googleapis.com \
                          storage.googleapis.com
   ```

2. **Deploy Terraform Infrastructure:**
   ```bash
   cd infrastructure
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with project_id and passwords
   terraform init
   terraform apply -auto-approve
   ```

---

## Phase 2: Living Data Structure Setup

1. **Firestore Database Initialization:**
   - Mode: Native Mode (`(default)` database).
   - Rules: Deploy `schemas/firestore.rules`.
   - Collections: `/incidents` and `/safety_protocols`.

2. **Spanner DDL Application:**
   ```bash
   gcloud spanner databases ddl update billi-emergency-db \
     --instance=billi-spanner-instance \
     --ddl-file=schemas/spanner_emergency_packet.sql
   ```

3. **AlloyDB DDL Application:**
   - Execute `schemas/alloydb_mesh_network.sql` against the AlloyDB primary instance via VPC bastion host or psql client.

---

## Phase 3: Gemini Autonomous Decision Engine Deployment

1. **Deploy Cloud Functions:**
   ```bash
   cd cloud-functions
   npm install

   # Deploy Context Enricher & Autonomous Dispatcher
   gcloud functions deploy enrichIncidentContext \
     --runtime nodejs20 \
     --trigger-event providers/cloud.firestore/eventTypes/document.update \
     --trigger-resource "projects/YOUR_PROJECT_ID/databases/(default)/documents/incidents/{incidentId}" \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Verify Vertex AI Connection:**
   - Test `dispatcher.js` with simulated sensor payloads to confirm structured JSON action outputs (`SWITCH_TO_MESH`, `ALERT_GUARDIAN`).

---

## Phase 4: Mobile Application Prototype (Flutter)

1. **Install Dependencies & Launch App:**
   ```bash
   cd mobile-app
   flutter pub get
   flutter run -d chrome # or run on Android / iOS Simulator
   ```

2. **Verify Screens:**
   - **Active Incident Dashboard:** `/incidents/{incidentId}` live Firestore synchronization.
   - **Safety Protocol Builder:** Onboarding role & permission management.
   - **Discreet Silent Mode:** Calculator disguise trigger for domestic safety scenarios.

---

## Phase 5: Hardware Simulation & Hackathon Demonstration

1. **Run Telemetry Simulator:**
   ```bash
   cd simulator
   npm install
   node test_emergency.js
   ```

2. **Demo Workflow:**
   - Left side of screen: Flutter Mobile Dashboard.
   - Right side of screen: Terminal running `test_emergency.js`.
   - Observe live transition: Signal Loss → Gemini autonomous decision → UI update to *"Connected via Mesh Relay (4 Peers Found)"*.
