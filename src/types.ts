/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IncidentStatus = 
  | 'activated'
  | 'alerting'
  | 'active'
  | 'responder_dispatched'
  | 'safe'
  | 'duress_canceled'
  | 'closed';

export type ActivationMethod =
  | 'manual_long_press'
  | 'fall_detected'
  | 'voice_help'
  | 'crash_detected'
  | 'device_removal'
  | 'geofence_exit';

export interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy: number; // in meters
  speed: number; // in mph
  method: 'gps' | 'wifi' | 'cellular' | 'last_known';
}

export interface EvidenceSegment {
  id: string;
  type: 'audio' | 'video' | 'photo' | 'metadata';
  timestamp: string;
  segmentNum: number;
  mimeType: string;
  data: string; // Base64 or text representation of segment
  duration?: number; // duration in seconds if audio/video
  processedByAi: boolean;
  aiTranscription?: string;
  aiVisualDescription?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: 'Primary Guardian' | 'Secondary Guardian' | 'School Administrator' | 'School Safety Officer' | 'Grandparent' | 'Caregiver' | 'Emergency Contact';
  relationship: string;
  phone: string;
  notificationChannel: 'push' | 'sms' | 'call' | 'email';
  notificationChannels?: ('push' | 'sms' | 'call' | 'email')[];
  alertStatus: 'queued' | 'sent' | 'delivered' | 'opened' | 'acknowledged';
  alertTimestamp?: string;
  respondStatus: 'none' | 'viewing' | 'acknowledged' | 'responding' | 'contacting_services';
  lastActive?: string;
}

export interface Incident {
  id: string;
  userId: string;
  userName: string;
  userAge: number;
  userPhoto?: string;
  medicalInfo?: string;
  emergencyInstructions?: string;
  status: IncidentStatus;
  activationTime: string;
  activationMethod: ActivationMethod;
  deviceBattery: number;
  deviceSignal: 'good' | 'weak' | 'offline';
  deviceLocked: boolean;
  locations: LocationUpdate[];
  currentLocation: LocationUpdate;
  evidence: EvidenceSegment[];
  contacts: Contact[];
  aiSummary: string | null;
  aiRiskClassification: 'low' | 'medium' | 'high' | 'critical' | null;
  aiSuggestedCategory: 'physical_threat' | 'vehicle_incident' | 'medical_emergency' | 'fall' | 'fire' | 'lost_person' | 'abduction_risk' | 'unknown' | null;
  duressCodeEntered: boolean;
  proximityPeerMeshEnabled?: boolean;
  proximityHelpersNotified?: number;
  closedBy?: string | null;
  closedAt?: string | null;
  closureNotes?: string | null;
  closureReason?: string | null;
  triggerDevice?: string;
  triggerMethodName?: string;
  degradation?: {
    gpsLost: boolean;
    phoneOff: boolean;
    cellLost: boolean;
    watchDisconnected: boolean;
    tagDisconnected: boolean;
    batteryCrit: boolean;
  };
}

export interface AuditLog {
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export type PersonaType = 'landing' | 'child' | 'guardian' | 'responder' | 'admin' | 'simulator' | 'devices';

export interface SafeZone {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  isActive: boolean;
}

export interface Profile {
  userId: string;
  name: string;
  age: number;
  photo: string;
  phone: string;
  medicalInfo: string;
  emergencyInstructions: string;
  contacts: Contact[];
  voicePhrases?: string[];
  safeZones?: SafeZone[];
}
