/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { db } from "./src/lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { 
  Incident, 
  Profile, 
  AuditLog, 
  LocationUpdate, 
  EvidenceSegment,
  Contact
} from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for simulated multimedia assets
app.use(express.json({ limit: "15mb" }));

// --- STATE MANAGEMENT (In-Memory Database) ---
let currentProfile: Profile = {
  userId: "user_maya_11",
  name: "Maya Johnson",
  age: 11,
  photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  phone: "+1 (555) 321-7654",
  medicalInfo: "Asthma. Uses rescue Albuterol inhaler. Allergies: Peanuts.",
  emergencyInstructions: "Keep calm. Locate rescue inhaler in backpack. Call Mother immediately, then School Safety Officer.",
  contacts: [
    {
      id: "contact_mom",
      name: "Evelyn Johnson (Mom)",
      role: "Primary Guardian",
      relationship: "Mother",
      phone: "+1 (555) 987-6543",
      notificationChannel: "push",
      alertStatus: "queued",
      respondStatus: "none"
    },
    {
      id: "contact_dad",
      name: "Marcus Johnson (Dad)",
      role: "Secondary Guardian",
      relationship: "Father",
      phone: "+1 (555) 876-5432",
      notificationChannel: "sms",
      alertStatus: "queued",
      respondStatus: "none"
    },
    {
      id: "contact_officer",
      name: "Officer Davis",
      role: "School Safety Officer",
      relationship: "Campus Officer (Pine Middle School)",
      phone: "+1 (555) 432-1098",
      notificationChannel: "sms",
      alertStatus: "queued",
      respondStatus: "none"
    },
    {
      id: "contact_grandma",
      name: "Grandma Clara",
      role: "Grandparent",
      relationship: "Maternal Grandmother",
      phone: "+1 (555) 234-5678",
      notificationChannel: "call",
      alertStatus: "queued",
      respondStatus: "none"
    }
  ],
  voicePhrases: [
    "Blue Folder",
    "Call Grandma",
    "Billi Now",
    "Code cobalt silent"
  ],
  safeZones: [
    {
      id: "zone_home",
      name: "Home",
      address: "1254 Pine St, San Francisco, CA",
      lat: 37.7749,
      lng: -122.4194,
      radius: 150,
      isActive: true
    },
    {
      id: "zone_school",
      name: "Pine Middle School",
      address: "1155 Pine St, San Francisco, CA",
      lat: 37.7753,
      lng: -122.4201,
      radius: 100,
      isActive: true
    }
  ]
};

let activeIncident: Incident | null = null;
let incidentHistory: Incident[] = [];
let auditLogs: AuditLog[] = [
  {
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: "System",
    action: "BOOT",
    details: "Billi Core Incident Engine initialized successfully."
  },
  {
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actor: "Evelyn Johnson",
    action: "PROFILE_SETUP",
    details: "Safety plan and trusted contacts configured for Maya Johnson."
  }
];

// --- GEMINI API LAZY INITIALIZATION ---
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Features will fall back to simulated mock intelligence.");
      return null;
    }
    try {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      return null;
    }
  }
  return geminiClient;
}

// --- FIRESTORE SYNC HELPERS ---
async function saveActiveIncidentToFirestore() {
  try {
    const docRef = doc(db, "system", "incident");
    if (activeIncident) {
      await setDoc(docRef, activeIncident);
    } else {
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error("Failed to write activeIncident to Firestore:", error);
  }
}

async function initFirestoreState() {
  console.log("Initializing Firestore database connection...");
  try {
    // 1. Check & Sync Profile
    const profileRef = doc(db, "system", "profile");
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      currentProfile = profileSnap.data() as Profile;
      console.log("Loaded Profile from Firestore:", currentProfile.name);
    } else {
      await setDoc(profileRef, currentProfile);
      console.log("Provisioned default Profile in Firestore.");
    }

    // 2. Check & Sync Active Incident
    const incidentRef = doc(db, "system", "incident");
    const incidentSnap = await getDoc(incidentRef);
    if (incidentSnap.exists()) {
      activeIncident = incidentSnap.data() as Incident;
      console.log("Loaded active Incident from Firestore, Status:", activeIncident.status);
    } else {
      activeIncident = null;
      console.log("No active Incident in Firestore.");
    }

    // 3. Check & Sync Audit Logs
    const auditLogsRef = collection(db, "auditLogs");
    const auditQuery = query(auditLogsRef, orderBy("timestamp", "desc"), limit(100));
    const auditSnap = await getDocs(auditQuery);
    if (!auditSnap.empty) {
      auditLogs = auditSnap.docs.map(doc => doc.data() as AuditLog);
      console.log(`Loaded ${auditLogs.length} audit logs from Firestore.`);
    } else {
      // Write default audit logs to Firestore
      for (const log of auditLogs) {
        await addDoc(auditLogsRef, log);
      }
      console.log("Provisioned initial audit logs in Firestore.");
    }

    // 4. Check & Sync Incident History
    const historyRef = collection(db, "incidentHistory");
    const historySnap = await getDocs(historyRef);
    if (!historySnap.empty) {
      incidentHistory = historySnap.docs.map(doc => doc.data() as Incident);
      console.log(`Loaded ${incidentHistory.length} historical incidents from Firestore.`);
    }
  } catch (error) {
    console.error("Failed to initialize state from Firestore, falling back to in-memory mode:", error);
  }
}

// Log action helper
async function addAuditLog(actor: string, action: string, details: string) {
  const log: AuditLog = {
    timestamp: new Date().toISOString(),
    actor,
    action,
    details
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 100) auditLogs.pop();
  try {
    await addDoc(collection(db, "auditLogs"), log);
  } catch (err) {
    console.error("Failed to write audit log to Firestore:", err);
  }
}

// Calculate distance in meters using Haversine formula
function getDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simulated preset path updates for location tracking
const SIMULATED_PATH: { lat: number; lng: number; speed: number; label: string }[] = [
  { lat: 37.7749, lng: -122.4194, speed: 0, label: "East Entrance of Pine Middle School" },
  { lat: 37.7753, lng: -122.4201, speed: 8, label: "Moving west on Pine Street" },
  { lat: 37.7758, lng: -122.4212, speed: 18, label: "Speed increased. West on Pine St & Polk St" },
  { lat: 37.7765, lng: -122.4218, speed: 22, label: "Headed North on Van Ness Ave" },
  { lat: 37.7774, lng: -122.4221, speed: 25, label: "Headed North near Civic Center" },
  { lat: 37.7785, lng: -122.4215, speed: 12, label: "Slowing down near Golden Gate Avenue" },
  { lat: 37.7792, lng: -122.4208, speed: 5, label: "Entering parking facility off Larkin" }
];

const SIMULATED_AUDIO_TRANSCRIPTS = [
  "No transcript yet. Environment sounds quiet.",
  "Maya: [Distant heavy breathing] Wait... why are you following me?",
  "Unidentified Voice: Hey, stop! Get over here!",
  "Maya: No! Let me go! [Screaming] Help me! Help!",
  "[Sound of physical scuffle, heavy rustling, keys clattering]",
  "[Door slamming, high-speed engine acceleration, road tire noise]",
  "[Low murmuring voices, continuous car rumbling in background]"
];

// --- REST API ENDPOINTS ---

// Profile Management
app.get("/api/profile", async (req, res) => {
  try {
    const snap = await getDoc(doc(db, "system", "profile"));
    if (snap.exists()) {
      currentProfile = snap.data() as Profile;
    }
  } catch (err) {
    console.error("Firestore read fallback for profile:", err);
  }
  res.json(currentProfile);
});

app.post("/api/profile", async (req, res) => {
  try {
    currentProfile = { ...currentProfile, ...req.body };
    await addAuditLog("Account Owner", "PROFILE_UPDATE", "Updated safety plan profile parameters.");
    await setDoc(doc(db, "system", "profile"), currentProfile);
    res.json({ success: true, profile: currentProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Logs
app.get("/api/audit-logs", async (req, res) => {
  try {
    const auditLogsRef = collection(db, "auditLogs");
    const q = query(auditLogsRef, orderBy("timestamp", "desc"), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      auditLogs = snap.docs.map(doc => doc.data() as AuditLog);
    }
  } catch (err) {
    console.error("Firestore read fallback for audit logs:", err);
  }
  res.json(auditLogs);
});

app.post("/api/audit-log", async (req, res) => {
  try {
    const { actor, action, details } = req.body;
    await addAuditLog(actor || "System", action || "ACTION", details || "");
    res.json({ success: true, auditLogs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Incident Status Retrieve
app.get("/api/incident", async (req, res) => {
  try {
    const snap = await getDoc(doc(db, "system", "incident"));
    if (snap.exists()) {
      activeIncident = snap.data() as Incident;
    } else {
      activeIncident = null;
    }
  } catch (err) {
    console.error("Firestore read fallback for active incident:", err);
  }
  res.json({ activeIncident });
});

// Incident History
app.get("/api/incident/history", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "incidentHistory"));
    if (!snap.empty) {
      incidentHistory = snap.docs.map(doc => doc.data() as Incident);
    }
  } catch (err) {
    console.error("Firestore read fallback for incident history:", err);
  }
  res.json(incidentHistory);
});

// Activate Emergency Incident
app.post("/api/incident/activate", async (req, res) => {
  try {
    if (activeIncident && activeIncident.status !== "closed" && activeIncident.status !== "safe") {
      return res.status(400).json({ error: "An emergency incident is already active." });
    }

    const { method } = req.body;
    let triggerDevice = "Phone";
    let triggerMethodName = "Manual Emergency Key";

    if (method === "watch_double_tap") {
      triggerDevice = "Apple Watch";
      triggerMethodName = "Double Tap Gesture";
    } else if (method === "watch_fall_impact") {
      triggerDevice = "Apple Watch";
      triggerMethodName = "Fall Impact Sensor";
    } else if (method === "watch_link") {
      triggerDevice = "Apple Watch";
      triggerMethodName = "Heart Rate Spike Sensor";
    } else if (method === "ble_tag_press" || method === "billi_tag") {
      triggerDevice = "Billi Tag";
      triggerMethodName = "Tactile Button Squeeze";
    } else if (method === "glasses_voice_phrase" || method === "voice_phrase") {
      triggerDevice = "Meta Ray-Ban Glasses";
      triggerMethodName = "Vocal Phrase Command";
    } else if (method === "geofence_exit") {
      triggerDevice = "Phone (Geofence Engine)";
      triggerMethodName = "Geofence Exit Breach";
    } else if (method === "fall_detected") {
      triggerDevice = "Phone (Inertial Sensor)";
      triggerMethodName = "Automated Fall Detector";
    } else if (method === "accessibility_shortcut") {
      triggerDevice = "Phone";
      triggerMethodName = "Accessibility Volume Shortcut";
    } else if (method === "manual_long_press") {
      triggerDevice = "Phone";
      triggerMethodName = "Emergency SOS Long Press";
    }

    let initialLocation: LocationUpdate = {
      lat: SIMULATED_PATH[0].lat,
      lng: SIMULATED_PATH[0].lng,
      timestamp: new Date().toISOString(),
      accuracy: 8,
      speed: 0,
      method: "gps"
    };

    if (method === "geofence_exit") {
      // Set to out-of-bounds starting coordinate (SIMULATED_PATH[2])
      initialLocation = {
        lat: SIMULATED_PATH[2].lat,
        lng: SIMULATED_PATH[2].lng,
        timestamp: new Date().toISOString(),
        accuracy: 8,
        speed: 18,
        method: "gps"
      };
    }

    // Deep copy contacts to track alert statuses independently for this incident
    const activeContacts: Contact[] = currentProfile.contacts.map((c, i) => ({
      ...c,
      alertStatus: "queued",
      respondStatus: "none"
    }));

    activeIncident = {
      id: `BIL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentProfile.userId,
      userName: currentProfile.name,
      userAge: currentProfile.age,
      userPhoto: currentProfile.photo,
      medicalInfo: currentProfile.medicalInfo,
      emergencyInstructions: currentProfile.emergencyInstructions,
      status: "activated",
      activationTime: new Date().toISOString(),
      activationMethod: method || "manual_long_press",
      deviceBattery: 82,
      deviceSignal: "good",
      deviceLocked: true,
      locations: [initialLocation],
      currentLocation: initialLocation,
      evidence: [
        {
          id: `seg_initial`,
          type: "metadata",
          timestamp: new Date().toISOString(),
          segmentNum: 0,
          mimeType: "text/plain",
          data: `${triggerDevice} emergency triggered via ${triggerMethodName}. Battery: 82%, GPS active. Silent audio record starting...`,
          processedByAi: true,
          aiTranscription: `[System Message] Emergency protocol initiated from ${triggerDevice} via ${triggerMethodName}. Audio streaming active.`
        }
      ],
      contacts: activeContacts,
      aiSummary: `Incident activated from ${triggerDevice} (${triggerMethodName}). Retrieving GPS telemetry and launching evidence buffers.`,
      aiRiskClassification: "high",
      aiSuggestedCategory: "unknown",
      duressCodeEntered: false,
      triggerDevice,
      triggerMethodName,
      degradation: {
        gpsLost: false,
        phoneOff: false,
        cellLost: false,
        watchDisconnected: false,
        tagDisconnected: false,
        batteryCrit: false
      }
    };

    await addAuditLog(currentProfile.name, "EMERGENCY_ACTIVATED", `Incident triggered from ${triggerDevice} via ${triggerMethodName}`);
    await saveActiveIncidentToFirestore();
    
    // Automatically transition to alerting in 1.2 seconds
    setTimeout(async () => {
      if (activeIncident) {
        activeIncident.status = "alerting";
        
        // Mark primary contacts (Parents or first two contacts) as 'sent' immediately
        activeIncident.contacts = activeIncident.contacts.map((c, idx) => {
          if (c.role === "Primary Guardian" || c.role === "Secondary Guardian" || idx < 2) {
            const alertTime = new Date().toISOString();
            const loc = activeIncident!.currentLocation;
            const messageText = `BILLI ALERT: ${activeIncident!.userName} has triggered an active safety protocol (${activeIncident!.activationMethod.replace(/_/g, " ")}). Last GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}. Speed: ${loc.speed}mph. Video/audio feed streaming live. Check tracking link: https://billi.secure/track/${activeIncident!.id}`;
            
            // Get all preferred communication channels (array) or fallback to singular legacy field
            const channels = (c.notificationChannels && Array.isArray(c.notificationChannels) && c.notificationChannels.length > 0)
              ? c.notificationChannels
              : [c.notificationChannel || "sms"];

            // Log independent dispatch events for each active communication channel
            channels.forEach((channel) => {
              addAuditLog(
                "Orchestrator", 
                `${channel.toUpperCase()}_DISPATCH_${c.id.toUpperCase()}`, 
                `Dispatched GPS alert message to ${c.name} (${c.relationship}) via ${channel.toUpperCase()}: "${messageText}"`
              );
            });
            
            return { 
              ...c, 
              alertStatus: "sent", 
              alertTimestamp: alertTime 
            };
          }
          return c;
        });
        await addAuditLog("Orchestrator", "ALERTS_DISPATCHED", "Primary trusted network channels notified synchronously with live GPS & stream telemetry.");
        await saveActiveIncidentToFirestore();
      }
    }, 1200);

    res.json({ success: true, incident: activeIncident });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate ticks (moves location, generates mock transcription / evidence buffers, triggers auto escalations)
app.post("/api/incident/tick", async (req, res) => {
  try {
    if (!activeIncident) {
      return res.status(400).json({ error: "No active incident to simulate." });
    }

    const { 
      statusUpdate, 
      triggerDuress, 
      triggerBatteryCrit, 
      lossOfSignal,
      gpsLost,
      phoneOff,
      cellLost,
      watchDisconnected,
      tagDisconnected,
      batteryCrit
    } = req.body;

    if (!activeIncident.degradation) {
      activeIncident.degradation = {
        gpsLost: false,
        phoneOff: false,
        cellLost: false,
        watchDisconnected: false,
        tagDisconnected: false,
        batteryCrit: false
      };
    }

    // Process new degradation flags if provided
    if (gpsLost !== undefined) {
      activeIncident.degradation.gpsLost = gpsLost;
      addAuditLog("System Diagnostic", gpsLost ? "GPS_SIGNAL_LOST" : "GPS_SIGNAL_RECOVERED", gpsLost ? "GPS satellite uplink interrupted. Reverting to estimated dead-reckoning trajectory." : "High-precision GPS lock re-established.");
    }
    if (phoneOff !== undefined) {
      activeIncident.degradation.phoneOff = phoneOff;
      if (phoneOff) {
        activeIncident.deviceSignal = "offline";
      } else {
        activeIncident.deviceSignal = "good";
      }
      addAuditLog("System Diagnostic", phoneOff ? "PHONE_POWER_OFF" : "PHONE_POWER_ON", phoneOff ? "Primary smartphone powered off/destroyed. Graceful degradation active: Wearable and Tag telemetry maintaining link." : "Primary smartphone re-established link. Standard full telemetry active.");
    }
    if (cellLost !== undefined) {
      activeIncident.degradation.cellLost = cellLost;
      if (cellLost) {
        activeIncident.deviceSignal = "offline";
      } else {
        activeIncident.deviceSignal = "good";
      }
      addAuditLog("System Diagnostic", cellLost ? "CELL_CONNECTION_LOST" : "CELL_CONNECTION_RECOVERED", cellLost ? "Cellular connection lost. Local telemetry store caching active." : "Cellular connection restored. Synchronizing cached telemetry.");
    }
    if (watchDisconnected !== undefined) {
      activeIncident.degradation.watchDisconnected = watchDisconnected;
      addAuditLog("System Diagnostic", watchDisconnected ? "WATCH_DISCONNECTED" : "WATCH_RECONNECTED", watchDisconnected ? "Apple Watch telemetry stream disconnected. Aux sensor feed lost." : "Apple Watch secondary sensor feed active.");
    }
    if (tagDisconnected !== undefined) {
      activeIncident.degradation.tagDisconnected = tagDisconnected;
      addAuditLog("System Diagnostic", tagDisconnected ? "TAG_DISCONNECTED" : "TAG_RECONNECTED", tagDisconnected ? "Billi Smart Tag out of Bluetooth range. Signal lost." : "Billi Smart Tag Bluetooth connection active.");
    }
    if (batteryCrit !== undefined) {
      activeIncident.degradation.batteryCrit = batteryCrit;
      if (batteryCrit) {
        activeIncident.deviceBattery = 8;
        activeIncident.deviceSignal = "weak";
      } else {
        activeIncident.deviceBattery = 82;
        activeIncident.deviceSignal = "good";
      }
      addAuditLog("System Diagnostic", batteryCrit ? "BATTERY_CRITICAL" : "BATTERY_NORMAL", batteryCrit ? "Battery critically low (8%). Battery conservation protocol active." : "Battery power level stabilized.");
    }

    // For backwards compatibility
    if (triggerBatteryCrit) {
      activeIncident.degradation.batteryCrit = true;
      activeIncident.deviceBattery = 8;
      activeIncident.deviceSignal = "weak";
      addAuditLog("System Diagnostic", "POWER_CRITICAL", "Power conservation protocol: Low power location updates triggered.");
    } else if (triggerBatteryCrit === false) {
      activeIncident.degradation.batteryCrit = false;
      activeIncident.deviceBattery = 82;
      activeIncident.deviceSignal = "good";
    }

    if (lossOfSignal) {
      activeIncident.degradation.cellLost = true;
      activeIncident.deviceSignal = "offline";
      addAuditLog("System Diagnostic", "SIGNAL_LOST", "Cellular uplink disrupted. Reverting to offline buffer mode.");
    } else if (lossOfSignal === false) {
      activeIncident.degradation.cellLost = false;
      activeIncident.deviceSignal = "good";
    }

    if (triggerDuress) {
      activeIncident.duressCodeEntered = true;
      activeIncident.status = "duress_canceled";
      addAuditLog(currentProfile.name, "DURESS_CANCELLATION", "Silent duress cancellation entered. Audio and tracking continued.");
    }

    // Tick locations
    const ticksCount = activeIncident.locations.length;
    // Don't advance coordinates if phone is off AND watch is disconnected OR cell/signal is lost entirely
    const isOffline = activeIncident.degradation.phoneOff && activeIncident.degradation.watchDisconnected;
    
    if (ticksCount < SIMULATED_PATH.length && !isOffline) {
      const pathPoint = SIMULATED_PATH[ticksCount];
      
      let locMethod: 'gps' | 'wifi' | 'cellular' | 'last_known' = "gps";
      let locAccuracy = 6;
      
      if (activeIncident.degradation.gpsLost) {
        locMethod = "wifi";
        locAccuracy = 45;
      } else if (activeIncident.degradation.phoneOff) {
        // Telemetry is falling back to secondary wearable (Apple Watch)
        locMethod = "cellular";
        locAccuracy = 15;
      }

      const newLoc: LocationUpdate = {
        lat: pathPoint.lat,
        lng: pathPoint.lng,
        timestamp: new Date().toISOString(),
        accuracy: activeIncident.degradation.batteryCrit ? 25 : locAccuracy,
        speed: pathPoint.speed,
        method: activeIncident.degradation.batteryCrit ? "wifi" : locMethod
      };
      
      activeIncident.locations.push(newLoc);
      activeIncident.currentLocation = newLoc;
      
      const sourceLabel = activeIncident.degradation.phoneOff 
        ? "Apple Watch Secondary Telemetry" 
        : activeIncident.degradation.gpsLost 
          ? "Estimated Wi-Fi/Cellular Triangulation" 
          : "Primary GPS Lock";
          
      addAuditLog("Location Engine", "LOCATION_UPDATE", `New coordinate plotted via ${sourceLabel}: speed ${pathPoint.speed}mph (${pathPoint.label})`);

      // Compute geofence status dynamically
      if (currentProfile.safeZones && currentProfile.safeZones.length > 0) {
        const activeZones = currentProfile.safeZones.filter(z => z.isActive);
        if (activeZones.length > 0) {
          const isInsideAny = activeZones.some(zone => {
            const dist = getDistanceInMeters(newLoc.lat, newLoc.lng, zone.lat, zone.lng);
            return dist <= zone.radius;
          });

          if (!isInsideAny) {
            addAuditLog("Geofence Engine", "GEOFENCE_BREACH", `ALERT: Current coordinate (${newLoc.lat.toFixed(5)}, ${newLoc.lng.toFixed(5)}) is outside all active safe zones!`);
          } else {
            const currentZone = activeZones.find(zone => {
              const dist = getDistanceInMeters(newLoc.lat, newLoc.lng, zone.lat, zone.lng);
              return dist <= zone.radius;
            });
            addAuditLog("Geofence Engine", "SAFE_ZONE_OK", `Device verified safe inside perimeter: "${currentZone?.name}" (radius: ${currentZone?.radius}m)`);
          }
        }
      }
    } else if (isOffline) {
      addAuditLog("Location Engine", "ESTIMATED_TRAJECTORY", `Primary & secondary live sources offline. Trajectory estimated using last known speed (${activeIncident.currentLocation.speed} mph) and direction.`);
    }

    // Tick evidence transcripts
    const evCount = activeIncident.evidence.filter(e => e.type === "audio").length;
    if (evCount < SIMULATED_AUDIO_TRANSCRIPTS.length) {
      const nextTranscript = SIMULATED_AUDIO_TRANSCRIPTS[evCount];
      const newEv: EvidenceSegment = {
        id: `seg_audio_${evCount + 1}`,
        type: "audio",
        timestamp: new Date().toISOString(),
        segmentNum: evCount + 1,
        mimeType: "audio/ogg",
        data: `[Audio Chunk Base64Data - Segment ${evCount + 1}]`,
        duration: 10,
        processedByAi: false,
        aiTranscription: nextTranscript
      };
      activeIncident.evidence.push(newEv);
      addAuditLog("Evidence Engine", "AUDIO_STREAMED", `Uploaded segment #${newEv.segmentNum} successfully to secure buffer.`);
    }

    // Tick alert escalations
    if (ticksCount === 2) {
      // Escalates school safety officer, school administrator, or any 3rd secondary contact
      let escalatedCount = 0;
      activeIncident.contacts = activeIncident.contacts.map((c, idx) => {
        if (c.id === "contact_officer" || c.role === "School Safety Officer" || c.role === "School Administrator") {
          escalatedCount++;
          const alertTime = new Date().toISOString();
          const loc = activeIncident!.currentLocation;
          addAuditLog("Orchestrator", `ESCALATION_${c.id.toUpperCase()}`, `Escalation SMS sent to school responder ${c.name} (${c.relationship}): "GEOFENCE BREACH: ${activeIncident!.userName} moved outside zone. Speed: ${loc.speed}mph. Current GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}. Please verify immediately."`);
          return { ...c, alertStatus: "delivered", alertTimestamp: alertTime };
        }
        return c;
      });
      if (escalatedCount > 0) {
        addAuditLog("Orchestrator", "ESCALATION", "Active geofence exit. School & campus security responders alerted automatically with live telemetry.");
      } else if (activeIncident.contacts.length > 2) {
        const contact = activeIncident.contacts[2];
        const alertTime = new Date().toISOString();
        const loc = activeIncident!.currentLocation;
        contact.alertStatus = "delivered";
        contact.alertTimestamp = alertTime;
        addAuditLog("Orchestrator", `ESCALATION_${contact.id.toUpperCase()}`, `Escalated alert sent to secondary contact ${contact.name}: "Geofence Exit registered. Current GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}. Tracking link active."`);
        addAuditLog("Orchestrator", "ESCALATION", `Active geofence exit. Escalated alert to secondary responder ${contact.name}.`);
      }
    } else if (ticksCount === 4) {
      // Escalates grandmother, grandparent, caregiver or 4th contact due to lack of response on primary
      let escalatedCount = 0;
      activeIncident.contacts = activeIncident.contacts.map((c, idx) => {
        if (c.id === "contact_grandma" || c.role === "Grandparent" || c.role === "Caregiver") {
          escalatedCount++;
          const alertTime = new Date().toISOString();
          const loc = activeIncident!.currentLocation;
          addAuditLog("Orchestrator", `ESCALATION_${c.id.toUpperCase()}`, `Escalation Call/SMS dispatched to caregiver ${c.name}: "URGENT SAFETY NOTIFICATION: ${activeIncident!.userName} is on the move. Battery: ${activeIncident!.deviceBattery}%. Live audio transcript reveals stress. GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}."`);
          return { ...c, alertStatus: "sent", alertTimestamp: alertTime };
        }
        return c;
      });
      if (escalatedCount > 0) {
        addAuditLog("Orchestrator", "ESCALATION", "Escalation rules triggered: Alternate caregivers notified via automated voice/SMS.");
      } else if (activeIncident.contacts.length > 3) {
        const contact = activeIncident.contacts[3];
        const alertTime = new Date().toISOString();
        contact.alertStatus = "sent";
        contact.alertTimestamp = alertTime;
        addAuditLog("Orchestrator", `ESCALATION_${contact.id.toUpperCase()}`, `Escalation alert dispatched to caregiver ${contact.name} due to no response from primary contacts.`);
        addAuditLog("Orchestrator", "ESCALATION", `Escalation rules triggered: Automated backup notification placed to ${contact.name}.`);
      }
    }

    await saveActiveIncidentToFirestore();
    res.json({ success: true, incident: activeIncident });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact respond/alert action
app.post("/api/incident/update-contact", async (req, res) => {
  try {
    if (!activeIncident) {
      return res.status(400).json({ error: "No active incident to update." });
    }

    const { contactId, alertStatus, respondStatus } = req.body;
    activeIncident.contacts = await Promise.all(activeIncident.contacts.map(async c => {
      if (c.id === contactId) {
        const nextC = { ...c };
        if (alertStatus) nextC.alertStatus = alertStatus;
        if (respondStatus) {
          nextC.respondStatus = respondStatus;
          await addAuditLog(c.name, "RESPOND_STATUS_CHANGED", `Marked state as: ${respondStatus}`);
        }
        return nextC;
      }
      return c;
    }));

    // Check if school officer changed status to responding
    const officer = activeIncident.contacts.find(c => c.id === "contact_officer");
    if (officer && officer.respondStatus === "responding" && activeIncident.status !== "responder_dispatched" && activeIncident.status !== "duress_canceled") {
      activeIncident.status = "responder_dispatched";
    }

    await saveActiveIncidentToFirestore();
    res.json({ success: true, incident: activeIncident });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add visual / photo evidence segment manually from camera/environment controls
app.post("/api/incident/add-evidence", async (req, res) => {
  try {
    if (!activeIncident) {
      return res.status(400).json({ error: "No active incident." });
    }

    const { type, data, visualDesc } = req.body;
    const count = activeIncident.evidence.length;
    const newEv: EvidenceSegment = {
      id: `seg_manual_${count + 1}`,
      type: type || "photo",
      timestamp: new Date().toISOString(),
      segmentNum: count + 1,
      mimeType: type === "photo" ? "image/jpeg" : "text/plain",
      data: data || "",
      processedByAi: true,
      aiVisualDescription: visualDesc || "Camera stream capture. Vehicle license plate detected: 7XYZ89."
    };

    activeIncident.evidence.push(newEv);
    await addAuditLog("Camera Stream", "MEDIA_UPLOAD", `Uploaded simulated ${type} segment #${newEv.segmentNum}`);
    await saveActiveIncidentToFirestore();
    res.json({ success: true, incident: activeIncident });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve & Close incident
app.post("/api/incident/close", async (req, res) => {
  try {
    if (!activeIncident) {
      return res.status(400).json({ error: "No active incident." });
    }

    const { closedBy, notes, reason } = req.body;

    activeIncident.status = "closed";
    activeIncident.closedBy = closedBy || "Evelyn Johnson (Mom)";
    activeIncident.closedAt = new Date().toISOString();
    activeIncident.closureNotes = notes || "Reunited with Maya at local coffee shop. Safe, rescue inhaler administered.";
    activeIncident.closureReason = reason || "User marked safe";

    incidentHistory.unshift({ ...activeIncident });
    await addAuditLog(activeIncident.closedBy, "INCIDENT_CLOSED", `Emergency closed. Status: User Safe. Reason: ${activeIncident.closureReason}`);

    const resolvedIncident = activeIncident;
    
    // Save to incident history collection
    try {
      await addDoc(collection(db, "incidentHistory"), resolvedIncident);
    } catch (historyErr) {
      console.error("Failed to write to incidentHistory collection:", historyErr);
    }

    activeIncident = null; // Clear active
    await saveActiveIncidentToFirestore(); // This will delete the active incident document

    res.json({ success: true, report: resolvedIncident });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- SERVER-SIDE GEMINI API CALL (ANALYSIS ENDPOINT) ---
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { incidentData, targetLanguage } = req.body;

    if (!incidentData) {
      return res.status(400).json({ error: "No incident data provided for AI parsing." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Elegant fallback response when Gemini API key is missing or not configured
      const simulatedSummary = `BILLI Cognitive Co-Dispatch Engine [SIMULATED]: Operational timeline analyzed. Maya Johnson (${incidentData.activationMethod}) was activated near Pine Middle School. Tracker is actively receiving updates and plotting coordinates. Simulated telemetry indicators classify threat level as highly critical due to high-speed movement matching vehicle pattern. Primary and secondary trusted responders notified.`;
      
      return res.json({
        summary: simulatedSummary,
        riskClassification: "critical",
        suggestedCategory: incidentData.activationMethod === "fall_detected" ? "fall" : "abduction_risk",
        audioSentimentVerification: "High-Arousal Vocal Panic & Verbal Distress Confirmed [Simulated]",
        isRealDistressVerified: true,
        keyObservations: [
          "Device telemetry matches vehicular velocity (>15mph)",
          "Rapid, non-standard transit away from school property limits",
          "Encrypted voice-activation buffer captures high-stress scuffle cues"
        ],
        responderDirectives: [
          "Immediately notify Officer Davis (Pine Middle School Campus Safety) with GPS coordinates",
          "Prepare Albuterol rescue inhaler upon arrival — subject has documented asthma",
          "Do NOT alert subject's device — silent tracking mode active",
          "Coordinate with municipal PSAP — transmit E911 CAD Packet via Guardian Dashboard"
        ],
        distressLevel: "9/10 — High-velocity trajectory, voice-activation trigger, and acoustic distress cues all confirm critical emergency.",
        translation: targetLanguage ? `[Simulated Translation] Alerta de Billi: Maya Johnson activado cerca de Pine Middle School. El rastreo de ubicación está activo.` : undefined
      });
    }

    // Construct highly professional instruction for emergency-response summarizing
    const systemPrompt = `You are the BILLI Cognitive Co-Dispatch Engine.
Analyze the provided JSON payload of an active child tracking emergency. Perform acoustic & verbal sentiment analysis on the ambient audio transcript buffers (evaluating vocal panic cadence, distress arousal, screams, versus accidental pocket rustling or peacetime banter) to determine whether this beacon is a genuine distress emergency or an accidental trigger.
Your response must be extremely objective, concise, professional, and omit all speculative labels (e.g. do NOT confirm 'kidnapping' or 'abduction' - label it as 'abduction_risk' or 'physical_threat'). Create a structured operational timeline summary.
If a translation language code (like "es" or "fr") is provided in the prompt, you must translate the summary directly into that language as well in the translation field.`;

    const userPrompt = `
Incident details:
- Name: ${incidentData.userName}, Age: ${incidentData.userAge}
- Activation: ${incidentData.activationTime} via ${incidentData.activationMethod}
- Battery: ${incidentData.deviceBattery}%, Signal: ${incidentData.deviceSignal}
- Path Coordinates Plotted: ${JSON.stringify(incidentData.locations)}
- Transcript Logs: ${JSON.stringify(incidentData.evidence.map((e: any) => e.aiTranscription || e.aiVisualDescription))}
- Target Translation Language: ${targetLanguage || "none"}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING, 
              description: "A professional, scannable, high-level operational summary of the active incident for responders." 
            },
            riskClassification: { 
              type: Type.STRING, 
              enum: ["low", "medium", "high", "critical"],
              description: "Risk assessment severity rating." 
            },
            suggestedCategory: { 
              type: Type.STRING, 
              enum: ["physical_threat", "vehicle_incident", "medical_emergency", "fall", "fire", "lost_person", "abduction_risk", "unknown"],
              description: "Emergency type classification." 
            },
            audioSentimentVerification: {
              type: Type.STRING,
              description: "Vocal and acoustic sentiment analysis evaluation (e.g. 'High-Arousal Panic & Verbal Distress Confirmed' or 'Calm Conversational / Accidental Trigger Suspected')."
            },
            isRealDistressVerified: {
              type: Type.BOOLEAN,
              description: "True if sentiment analysis confirms genuine distress; False if false alarm."
            },
            keyObservations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Specific tactical observations from telemetry, voice, and media." 
            },
            responderDirectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable, step-by-step tactical directives for guardians and first responders."
            },
            distressLevel: {
              type: Type.STRING,
              description: "A 1-10 numerical distress evaluation with qualitative justification."
            },
            translation: { 
              type: Type.STRING, 
              description: "Direct translation of the summary into the requested target language (or empty if none requested)." 
            }
          },
          required: ["summary", "riskClassification", "suggestedCategory", "audioSentimentVerification", "isRealDistressVerified", "keyObservations", "responderDirectives"]
        }
      }
    });

    const aiResponseText = response.text;
    if (!aiResponseText) {
      throw new Error("No response content generated from Gemini.");
    }

    const aiResult = JSON.parse(aiResponseText.trim());
    res.json(aiResult);

  } catch (error: any) {
    console.error("Gemini analyze endpoint failed:", error);
    res.status(500).json({ error: error.message || "Failed to contact Gemini." });
  }
});

// --- VITE MIDDLEWARE & CLIENT MOUNTING ---
async function startServer() {
  await initFirestoreState();

  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring Static Build Middleware for Production...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Billi Full-Stack Server boot complete.`);
    console.log(`Server actively running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
