output "load_balancer_ip" {
  description = "The public IP address of the Global HTTP Load Balancer"
  value       = google_compute_global_forwarding_rule.orchestrator_forwarding_rule.ip_address
}

output "orchestrator_service_url" {
  description = "URL of the billi-orchestrator Cloud Run service"
  value       = google_cloud_run_v2_service.orchestrator.uri
}

output "event_processor_service_url" {
  description = "URL of the billi-event-processor Cloud Run service"
  value       = google_cloud_run_v2_service.event_processor.uri
}

output "alloydb_cluster_id" {
  description = "AlloyDB Cluster Identifier"
  value       = google_alloydb_cluster.billi_mesh.cluster_id
}

output "spanner_emergency_packet_instance" {
  description = "Cloud Spanner Emergency Packet Instance ID"
  value       = google_spanner_instance.emergency_packet.name
}

output "spanner_event_emergency_packet_instance" {
  description = "Cloud Spanner Event Emergency Packet Instance ID"
  value       = google_spanner_instance.event_emergency_packet.name
}

output "pubsub_comm_engine_topic" {
  description = "Pub/Sub Communication Engine Topic ID"
  value       = google_pubsub_topic.comm_engine.id
}

output "evidence_store_bucket" {
  description = "Cloud Storage Evidence Store Bucket Name"
  value       = google_storage_bucket.evidence_store.name
}
