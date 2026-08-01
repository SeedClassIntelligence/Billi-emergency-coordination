variable "project_id" {
  type        = string
  description = "The Google Cloud Project ID"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "The default GCP Region for regional resources"
}

variable "alloydb_password" {
  type        = string
  description = "The password for the AlloyDB initial admin user"
  sensitive   = true
  default     = null
}

variable "orchestrator_image" {
  type        = string
  description = "Container image for the billi-orchestrator service"
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "event_processor_image" {
  type        = string
  description = "Container image for the billi-event-processor service"
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}
