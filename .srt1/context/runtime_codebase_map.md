## 🧠 Project Synopsis

**Architectural Intent:**
A resilient, multi-database emergency coordination system built on Google Cloud Platform (GCP).

**Extracted Core Concepts:**
- **Architecture**: - **Load Balancer**: External Global HTTP Load Balancer with Serverless Network Endpoint Group (NEG).
- **Compute**: Cloud Run v2 Services (`billi-...
- **Project Structure**: ```
.
├── main.tf                            # Core Terraform infrastructure configuration
├── variables.tf                       # Terraform input...
- **Infrastructure Setup**: 1. Copy variable template:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Set your `project_id`, `region`, and database passw...

**Codebase Statistics:**
**Billi-emergency-coordination-main** contains 81 source files with 0 classes and 67 functions. I mapped 18 cross-file call chains.

**Languages:** 32 .json, 16 React TSX, 15 TypeScript, 9 Markdown, 4 JavaScript

**Risk Profile:**
- 2 function(s) write to a database

**⚠️ Code Duplication:** Found 1 function(s) duplicated across files:
- `handleStartAddContact()` exists in: Billi-emergency-coordination-main\src\components\PlanConfigModal.tsx, Billi-emergency-coordination-main\src\components\SetupNetworkView.tsx

**Architecture:** Primarily general purpose (630), API handling (18), CONFIGURATION (13), business logic services (12)



*SRT-1 Runtime Codebase Map generated at: 2026-08-01T11:23:24.704571*