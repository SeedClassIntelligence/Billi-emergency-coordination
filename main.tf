terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "random_password" "alloydb_pass" {
  length  = 24
  special = false
}

# ================================================================================
# 1. API Services Enablement
# ================================================================================
resource "google_project_service" "services" {
  for_each = toset([
    "compute.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "spanner.googleapis.com",
    "pubsub.googleapis.com",
    "storage.googleapis.com",
    "alloydb.googleapis.com",
    "servicenetworking.googleapis.com",
    "aiplatform.googleapis.com",
    "secretmanager.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

# ================================================================================
# 2. Resilient Private VPC Networking (For AlloyDB Isolation - RFC1918)
# ================================================================================
resource "google_compute_network" "vpc" {
  name                    = "billi-vpc-${random_id.suffix.hex}"
  auto_create_subnetworks = true
  depends_on              = [google_project_service.services]
}

resource "google_compute_global_address" "private_ip_alloc" {
  name          = "billi-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]
}

# ================================================================================
# 3. Community Mesh Network Database Layer (AlloyDB Cluster - Private IP Only)
# ================================================================================
resource "google_alloydb_cluster" "billi_mesh" {
  cluster_id = "billi-mesh-network"
  location   = var.region

  network_config {
    network = google_compute_network.vpc.id
  }

  initial_user {
    password = var.alloydb_password != null ? var.alloydb_password : random_password.alloydb_pass.result
  }

  deletion_protection = false

  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
}

resource "google_alloydb_instance" "billi_mesh_primary" {
  cluster       = google_alloydb_cluster.billi_mesh.name
  instance_id   = "billi-mesh-network-primary"
  instance_type = "PRIMARY"

  machine_config {
    cpu_count = 2
  }
}

# ================================================================================
# 4. User Safety Protocol Rules Engine (Firestore Databases)
# ================================================================================
resource "google_firestore_database" "safety_protocol" {
  name            = "billi-safety-protocol"
  location_id     = var.region
  type            = "FIRESTORE_NATIVE"
  deletion_policy = "DELETE"

  depends_on = [google_project_service.services]
}

resource "google_firestore_database" "event_safety_protocol" {
  name            = "billi-event-safety-protocol"
  location_id     = var.region
  type            = "FIRESTORE_NATIVE"
  deletion_policy = "DELETE"

  depends_on = [google_project_service.services]
}

# ================================================================================
# 5. Living Emergency Packet Store (Cloud Spanner Instances)
# ================================================================================
resource "google_spanner_instance" "emergency_packet" {
  name             = "billi-emergency-packet"
  config           = "regional-${var.region}"
  display_name     = "Billi Emergency Packet"
  processing_units = 100
  deletion_policy  = "DELETE"

  depends_on = [google_project_service.services]
}

resource "google_spanner_database" "emergency_packet_db" {
  instance            = google_spanner_instance.emergency_packet.name
  name                = "billi_emergency_packet_db"
  deletion_protection = false
}

resource "google_spanner_instance" "event_emergency_packet" {
  name             = "billi-event-emergency-packet"
  config           = "regional-${var.region}"
  display_name     = "Billi Event Emergency Packet"
  processing_units = 100
  deletion_policy  = "DELETE"

  depends_on = [google_project_service.services]
}

resource "google_spanner_database" "event_emergency_packet_db" {
  instance            = google_spanner_instance.event_emergency_packet.name
  name                = "billi_event_emergency_packet_db"
  deletion_protection = false
}

# ================================================================================
# 6. Communication Orchestrator Bus (Cloud Pub/Sub)
# ================================================================================
resource "google_pubsub_topic" "comm_engine" {
  name = "billi-comm-engine"

  depends_on = [google_project_service.services]
}

# ================================================================================
# 7. Evidence Store (Highly Durable Cloud Storage Bucket)
# ================================================================================
resource "google_storage_bucket" "evidence_store" {
  name                        = "billi-evidence-store-${random_id.suffix.hex}"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true

  depends_on = [google_project_service.services]
}

# ================================================================================
# 8. Microservices Compute Layer (Cloud Run v2 with Dynamic Scaling Policy)
# ================================================================================
resource "google_cloud_run_v2_service" "orchestrator" {
  name                = "billi-orchestrator"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = false

  template {
    # Dynamic Scaling Policy: Scale to 0 when idle; burst to 100 instances during emergency events
    scaling {
      min_instance_count = 0
      max_instance_count = 100
    }

    # Strict Network Isolation: Direct VPC Access to private RFC1918 space (AlloyDB)
    vpc_access {
      network_interfaces {
        network = google_compute_network.vpc.id
      }
      egress = "PRIVATE_RANGES_ONLY"
    }

    max_instance_request_concurrency = 80

    containers {
      image = var.orchestrator_image

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }

      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "SPANNER_INSTANCE"
        value = google_spanner_instance.emergency_packet.name
      }
      env {
        name  = "SPANNER_DATABASE"
        value = google_spanner_database.emergency_packet_db.name
      }
      env {
        name  = "FIRESTORE_DB"
        value = google_firestore_database.safety_protocol.name
      }
      env {
        name  = "PUBSUB_TOPIC"
        value = google_pubsub_topic.comm_engine.id
      }
      env {
        name  = "EVIDENCE_BUCKET"
        value = google_storage_bucket.evidence_store.name
      }
      env {
        name  = "ALLOYDB_CLUSTER"
        value = google_alloydb_cluster.billi_mesh.cluster_id
      }
      env {
        name  = "ALLOYDB_PRIMARY_IP"
        value = google_alloydb_instance.billi_mesh_primary.ip_address
      }
    }
  }

  depends_on = [
    google_project_service.services,
    google_service_networking_connection.private_vpc_connection
  ]
}

resource "google_cloud_run_v2_service" "event_processor" {
  name                = "billi-event-processor"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_ONLY"
  deletion_protection = false

  template {
    # Dynamic Scaling Policy: Scale to 0 when idle; burst to 100 instances
    scaling {
      min_instance_count = 0
      max_instance_count = 100
    }

    # Strict Network Isolation: Direct VPC Access
    vpc_access {
      network_interfaces {
        network = google_compute_network.vpc.id
      }
      egress = "PRIVATE_RANGES_ONLY"
    }

    max_instance_request_concurrency = 80

    containers {
      image = var.event_processor_image

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "SPANNER_INSTANCE"
        value = google_spanner_instance.event_emergency_packet.name
      }
      env {
        name  = "SPANNER_DATABASE"
        value = google_spanner_database.event_emergency_packet_db.name
      }
      env {
        name  = "FIRESTORE_DB"
        value = google_firestore_database.event_safety_protocol.name
      }
      env {
        name  = "PUBSUB_TOPIC"
        value = google_pubsub_topic.comm_engine.id
      }
    }
  }

  depends_on = [
    google_project_service.services,
    google_service_networking_connection.private_vpc_connection
  ]
}

# ================================================================================
# 9. Serverless Global Network Routing (Load Balancer routing to Orchestrator)
# ================================================================================
resource "google_compute_region_network_endpoint_group" "orchestrator_neg" {
  name                  = "billi-orchestrator-neg"
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.orchestrator.name
  }
}

resource "google_compute_backend_service" "orchestrator_backend" {
  name                  = "billi-orchestrator-backend"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.orchestrator_neg.id
  }
}

resource "google_compute_url_map" "orchestrator_map" {
  name            = "billi-orchestrator-map"
  default_service = google_compute_backend_service.orchestrator_backend.id
}

resource "google_compute_target_http_proxy" "orchestrator_proxy" {
  name    = "billi-orchestrator-proxy"
  url_map = google_compute_url_map.orchestrator_map.id
}

resource "google_compute_global_forwarding_rule" "orchestrator_forwarding_rule" {
  name                  = "billi-orchestrator-forwarding-rule"
  target                = google_compute_target_http_proxy.orchestrator_proxy.id
  port_range            = "80"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
