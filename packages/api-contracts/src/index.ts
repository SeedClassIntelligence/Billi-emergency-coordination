/**
 * Billi Platform API Contracts Package
 * Unified contract interfaces shared across UI, Gateway, and 13 DDD Microservices
 */

export interface ProtectedPersonContract {
  userId: string;
  name: string;
  age: number;
  photoUrl?: string;
  medicalNotes: string;
  emergencyInstructions: string;
}

export interface TrustedContactContract {
  contactId: string;
  name: string;
  relationship: string;
  role: "Primary Guardian" | "Secondary Guardian" | "Campus Responder" | "Grandparent" | "Other";
  phone: string;
  notificationChannels: Array<"sms" | "push" | "voice_call" | "multi_broadcast">;
  priorityOrder: number;
  alertStatus: "queued" | "sent" | "failed" | "acknowledged";
  respondStatus: "none" | "viewing" | "responding";
}

export interface SafetyContractRules {
  protocolId: string;
  userId: string;
  spokenSafeWords: string[];
  duressPin: string;
  normalPin: string;
  safeZones: Array<{
    zoneId: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    isActive: boolean;
  }>;
  meshRelayPermitted: boolean;
  medicalAccessPermitted: boolean;
  silentActivationAllowed: boolean;
}

export interface EmergencyActivationRequest {
  userId: string;
  triggerSource: 
    | "manual_long_press"
    | "watch_double_tap"
    | "watch_fall_impact"
    | "watch_heart_spike"
    | "ble_tag_press"
    | "glasses_voice_phrase"
    | "geofence_exit"
    | "accessibility_shortcut";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  latitude: number;
  longitude: number;
  sensorSnapshot?: Record<string, any>;
  idempotencyKey?: string;
}

export interface TelemetryReadingContract {
  telemetryId: string;
  incidentId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  speedMph: number;
  headingDegrees?: number;
  ambientNoiseDb: number;
  motionState: "STATIONARY" | "WALKING" | "DRIVING" | "RAPID_ACCELERATION";
  degradation: {
    gpsLost: boolean;
    phoneOff: boolean;
    cellLost: boolean;
    watchDisconnected: boolean;
    tagDisconnected: boolean;
    batteryCrit: boolean;
  };
}

export interface DeviceCapabilityContract {
  deviceId: string;
  deviceName: string;
  deviceType: "PHONE" | "WATCH" | "RING" | "GLASSES" | "TAG" | "AUDIO";
  batteryLevelPercent: number;
  connectionStatus: "CONNECTED" | "STANDBY" | "OFFLINE" | "FAILOVER_MESH";
  capabilities: string[];
}

export interface EmergencyPacketContract {
  packetId: string;
  incidentNumber: number;
  userId: string;
  status: "ACTIVE" | "RESOLVED" | "INTERRUPTED";
  humanStatus: 
    | "EMERGENCY_TRIGGERED"
    | "TRUSTED_NETWORK_NOTIFIED"
    | "GUARDIAN_ACKNOWLEDGED"
    | "HELP_RESPONDING"
    | "INCIDENT_STABILIZED"
    | "RESOLVED";
  startTime: string;
  activationSource: string;
  duressCodeEntered: boolean;
  evidenceList: Array<{
    id: string;
    type: "photo" | "audio" | "metadata";
    timestamp: string;
    data: string;
    aiTranscription?: string;
  }>;
  correlationId?: string;
  updatedAt: string;
}

export interface TimelineEventContract {
  eventId: string;
  incidentId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface ResponderStateContract {
  responderId: string;
  name: string;
  role: string;
  badgeNumber?: string;
  status: "STANDBY" | "DISPATCHED" | "ON_SCENE" | "RESOLVED";
  assignedIncidentId?: string;
  currentLat?: number;
  currentLng?: number;
}
