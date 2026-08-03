/**
 * Billi Platform Canonical Demo Fixtures Package
 * Single canonical family dataset for Maya Johnson used across all tests, UI models, and microservices
 */

import { ProtectedPersonContract, TrustedContactContract, SafetyContractRules, DeviceCapabilityContract } from "../../api-contracts/src";

export const CANONICAL_PROTECTED_PERSON: ProtectedPersonContract = {
  userId: "user_maya_001",
  name: "Maya Johnson",
  age: 11,
  photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256",
  medicalNotes: "Mild Asthma. Carries rescue Albuterol inhaler in backpack. Severe peanut allergy.",
  emergencyInstructions: "If unresponsive, check backpack for Albuterol inhaler. Notify Evelyn Johnson immediately."
};

export const CANONICAL_CONTACTS: TrustedContactContract[] = [
  {
    contactId: "contact_mom",
    name: "Evelyn Johnson",
    relationship: "Mother",
    role: "Primary Guardian",
    phone: "+15550192834",
    notificationChannels: ["push", "sms", "voice_call"],
    priorityOrder: 1,
    alertStatus: "sent",
    respondStatus: "responding"
  },
  {
    contactId: "contact_dad",
    name: "Marcus Johnson",
    relationship: "Father",
    role: "Secondary Guardian",
    phone: "+15550199988",
    notificationChannels: ["sms", "push"],
    priorityOrder: 2,
    alertStatus: "sent",
    respondStatus: "viewing"
  },
  {
    contactId: "contact_officer",
    name: "Officer Davis",
    relationship: "Campus Safety Officer",
    role: "Campus Responder",
    phone: "+15550114022",
    notificationChannels: ["push", "sms"],
    priorityOrder: 3,
    alertStatus: "queued",
    respondStatus: "none"
  },
  {
    contactId: "contact_grandma",
    name: "Grandma Clara",
    relationship: "Grandmother",
    role: "Grandparent",
    phone: "+15550183321",
    notificationChannels: ["voice_call"],
    priorityOrder: 4,
    alertStatus: "queued",
    respondStatus: "none"
  }
];

export const CANONICAL_SAFETY_CONTRACT: SafetyContractRules = {
  protocolId: "proto_user_maya_001",
  userId: "user_maya_001",
  spokenSafeWords: ["Blue Folder", "Call Grandma", "Billi Now", "Code cobalt silent"],
  duressPin: "9999",
  normalPin: "1234",
  safeZones: [
    {
      zoneId: "zone_school",
      name: "Pine Middle School",
      address: "1155 Pine St, San Francisco, CA",
      latitude: 37.7753,
      longitude: -122.4201,
      radiusMeters: 100,
      isActive: true
    },
    {
      zoneId: "zone_home",
      name: "Home Zone",
      address: "1254 Pine St, San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
      radiusMeters: 150,
      isActive: true
    },
    {
      zoneId: "zone_grandma",
      name: "Grandma Clara's House",
      address: "842 Larkin St, San Francisco, CA",
      latitude: 37.7812,
      longitude: -122.4175,
      radiusMeters: 200,
      isActive: true
    }
  ],
  meshRelayPermitted: true,
  medicalAccessPermitted: true,
  silentActivationAllowed: true
};

export const CANONICAL_DEVICES: DeviceCapabilityContract[] = [
  {
    deviceId: "device_phone_maya_01",
    deviceName: "iPhone 15 Pro Hub",
    deviceType: "PHONE",
    batteryLevelPercent: 82,
    connectionStatus: "CONNECTED",
    capabilities: ["GPS", "BLE", "MICROPHONE", "CAMERA", "CELLULAR", "WIFI", "ACCELEROMETER", "GYROSCOPE"]
  },
  {
    deviceId: "device_watch_maya_01",
    deviceName: "Apple Watch Ultra 2",
    deviceType: "WATCH",
    batteryLevelPercent: 92,
    connectionStatus: "CONNECTED",
    capabilities: ["HEART_RATE", "FALL_DETECTION", "DOUBLE_TAP_GESTURE", "SECONDARY_GPS", "BLE"]
  },
  {
    deviceId: "device_tag_maya_01",
    deviceName: "Billi Smart Tag",
    deviceType: "TAG",
    batteryLevelPercent: 95,
    connectionStatus: "CONNECTED",
    capabilities: ["TACTILE_PANIC_BUTTON", "BLE_PEER_BEACON", "CRASH_ACCELEROMETER"]
  },
  {
    deviceId: "device_glasses_maya_01",
    deviceName: "Ray-Ban Meta Glasses",
    deviceType: "GLASSES",
    batteryLevelPercent: 78,
    connectionStatus: "CONNECTED",
    capabilities: ["VOICE_PHRASE_LISTENER", "AMBIENT_AUDIO_STREAM", "PHOTO_CAPTURE"]
  },
  {
    deviceId: "device_ring_maya_01",
    deviceName: "Samsung Galaxy Ring",
    deviceType: "RING",
    batteryLevelPercent: 89,
    connectionStatus: "CONNECTED",
    capabilities: ["DOUBLE_PINCH_GESTURE", "HEART_RATE_MONITOR", "BLE_PROXIMITY"]
  }
];
