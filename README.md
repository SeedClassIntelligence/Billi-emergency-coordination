# Billi Emergency Coordination Platform

A resilient, multi-database emergency coordination system built on Google Cloud Platform (GCP).

## Architecture

- **Load Balancer**: External Global HTTP Load Balancer with Serverless Network Endpoint Group (NEG).
- **Compute**: Cloud Run v2 Services (`billi-orchestrator` and `billi-event-processor`).
- **Database Tier**:
  - **AlloyDB**: PostgreSQL-compatible, HA database cluster for Community Mesh Network state.
  - **Cloud Spanner**: Globally scalable relational database for Living Emergency Packets and event streams.
  - **Firestore**: Native NoSQL databases for User Safety Protocol and Event Safety Protocol rules engines.
- **Messaging**: Cloud Pub/Sub (`billi-comm-engine`) communication bus.
- **Evidence Storage**: Highly durable Cloud Storage Bucket with uniform access and encryption.
- **Networking**: Isolated VPC network with Service Networking Peering for AlloyDB.

## Project Structure

```
.
├── main.tf                            # Core Terraform infrastructure configuration
├── variables.tf                       # Terraform input variable definitions
├── outputs.tf                         # Infrastructure outputs (IPs, URIs, resource names)
├── terraform.tfvars.example           # Configuration template
├── schemas/
│   ├── spanner_emergency_packet.sql   # Cloud Spanner DDL schema
│   └── alloydb_mesh_network.sql       # AlloyDB PostgreSQL DDL schema
└── services/
    ├── orchestrator/                  # Ingress REST API microservice
    └── event-processor/               # Event stream worker microservice
```

## Deployment Instructions

### Infrastructure Setup

1. Copy variable template:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Set your `project_id`, `region`, and database passwords in `terraform.tfvars`.
3. Initialize and apply Terraform:
   ```bash
   terraform init
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

### Microservices Development

To run services locally:

```bash
# Orchestrator Service
cd services/orchestrator
npm install
npm run dev

# Event Processor Service
cd services/event-processor
npm install
npm run dev
```
