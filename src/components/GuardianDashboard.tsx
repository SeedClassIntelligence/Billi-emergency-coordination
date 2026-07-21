/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import MultiLayerResponse from "./MultiLayerResponse";
import CurrentResponseWidget from "./CurrentResponseWidget";
import InfoTooltip from "./InfoTooltip";
import { 
  ShieldAlert, 
  MapPin, 
  TrendingUp, 
  Battery, 
  Volume2, 
  Activity, 
  Users, 
  Flame, 
  Heart, 
  AlertTriangle, 
  Share2, 
  CheckCircle, 
  ShieldCheck, 
  Plus, 
  Image as ImageIcon,
  Check, 
  Navigation,
  Globe,
  Phone,
  Car,
  Search,
  Clock,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { Incident, Contact } from "../types";

interface GuardianDashboardProps {
  incident: Incident | null;
  onUpdateContact: (contactId: string, alertStatus?: string, respondStatus?: string) => void;
  onCloseIncident: (closedBy: string, notes: string, reason: string) => void;
  onAddEvidence: (type: 'photo' | 'metadata', visualDesc: string) => void;
}

export default function GuardianDashboard({
  incident,
  onUpdateContact,
  onCloseIncident,
  onAddEvidence
}: GuardianDashboardProps) {
  const [closureNotes, setClosureNotes] = useState("");
  const [closureReason, setClosureReason] = useState("User marked safe");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCadPacketModal, setShowCadPacketModal] = useState(false);
  const [manualCapture, setManualCapture] = useState("");
  const [copied, setCopied] = useState(false);

  const deg = incident?.degradation || {
    gpsLost: false,
    phoneOff: false,
    cellLost: false,
    watchDisconnected: false,
    tagDisconnected: false,
    batteryCrit: false
  };

  let confidence: "HIGH" | "MEDIUM" | "LIMITED / ESTIMATED" = "HIGH";
  let modeLabel = "Primary GPS Lock";

  if (deg.phoneOff && deg.watchDisconnected) {
    confidence = "LIMITED / ESTIMATED";
    modeLabel = "Estimated Trajectory / Last Known GPS";
  } else if (deg.gpsLost || deg.phoneOff) {
    confidence = "MEDIUM";
    modeLabel = deg.phoneOff ? "Apple Watch Secondary Telemetry" : "Estimated Wi-Fi/Cellular Triangulation";
  } else if (deg.batteryCrit) {
    confidence = "MEDIUM";
    modeLabel = "Low Power GPS Updates";
  }

  let awareness: "STRONG" | "HIGH" | "REDUCED" | "LIMITED" | "UNAVAILABLE" = "HIGH";
  let awarenessColor = "text-emerald-700 bg-emerald-50 border-emerald-250";

  if (deg.phoneOff && deg.watchDisconnected) {
    awareness = "LIMITED";
    awarenessColor = "text-red-700 bg-red-50 border-red-200";
  } else if (deg.phoneOff || deg.gpsLost || deg.cellLost) {
    awareness = "REDUCED";
    awarenessColor = "text-amber-700 bg-amber-50 border-amber-250";
  } else if (incident && !deg.gpsLost && !deg.phoneOff && !deg.cellLost && incident.contacts.some(c => c.respondStatus === "responding")) {
    awareness = "STRONG";
    awarenessColor = "text-emerald-700 bg-emerald-50 border-emerald-250";
  }

  if (!incident) {
    return (
      <div id="guardian_idle_view" className="flex flex-col items-center justify-center h-full p-8 bg-white border border-slate-200 text-center rounded-2xl min-h-[450px] shadow-sm animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-150 shadow-inner mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight font-display">Safety Secured</h3>
        <p className="text-slate-500 text-xs max-w-sm mt-1.5 leading-relaxed">
          The safety engine is armed. There are no active emergency incidents registered for your profiles.
        </p>
        <div className="mt-6 border-t border-slate-150 pt-5 w-full max-w-xs text-[10px] font-mono text-slate-400 space-y-1">
          <p>PROTECTED MEMBER: MAYA JOHNSON</p>
          <p>LAST SYSTEM STATUS CHECK: OK (2m ago)</p>
        </div>
      </div>
    );
  }

  // Find parent/guardian actions
  const momContact = incident.contacts.find(c => c.id === "contact_mom");

  // Map contacts to rich real-time response actions based on incident state & ticks count
  const getContactResponseDetail = (contact: Contact) => {
    const ticks = incident.locations.length;
    
    if (contact.id === "contact_mom") {
      if (contact.respondStatus === "responding") {
        return {
          action: "Driving",
          detail: "En route to school (ETA 3 mins)",
          color: "text-red-700 bg-red-50 border-red-200",
          iconColor: "text-red-500",
          progress: 80,
          statusText: "Active Dispatch",
          icon: Car
        };
      }
      if (contact.respondStatus === "viewing") {
        return {
          action: "Calling",
          detail: "Monitoring child's live ambient mic",
          color: "text-violet-700 bg-violet-50 border-violet-150 animate-pulse",
          iconColor: "text-violet-500",
          progress: 40,
          statusText: "Investigating",
          icon: Phone
        };
      }
      return {
        action: "Alerted",
        detail: "Evelyn's device ringing on full volume",
        color: "text-amber-700 bg-amber-50 border-amber-150",
        iconColor: "text-amber-500",
        progress: 15,
        statusText: "Awaiting Action",
        icon: AlertCircle
      };
    }

    if (contact.id === "contact_dad") {
      if (ticks >= 3) {
        return {
          action: "Driving",
          detail: "Heading towards school West Gate",
          color: "text-red-700 bg-red-50 border-red-200",
          iconColor: "text-red-500",
          progress: 75,
          statusText: "En Route",
          icon: Car
        };
      }
      if (ticks >= 1) {
        return {
          action: "Calling",
          detail: "Attempting call to campus admin office",
          color: "text-blue-700 bg-blue-50 border-blue-150 animate-pulse",
          iconColor: "text-blue-500",
          progress: 50,
          statusText: "Reaching Out",
          icon: Phone
        };
      }
      return {
        action: "Alerted",
        detail: "Delivered backup SMS alert to device",
        color: "text-slate-600 bg-slate-50 border-slate-200",
        iconColor: "text-slate-400",
        progress: 10,
        statusText: "Standby",
        icon: Clock
      };
    }

    if (contact.id === "contact_officer") {
      if (contact.respondStatus === "responding" || incident.status === "responder_dispatched") {
        return {
          action: "Searching",
          detail: "Ground unit patrolling East Entrance",
          color: "text-emerald-700 bg-emerald-50 border-emerald-250 animate-pulse",
          iconColor: "text-emerald-600",
          progress: 95,
          statusText: "On-Site Search",
          icon: Search
        };
      }
      if (ticks >= 2) {
        return {
          action: "En Route",
          detail: "Cruiser #14 dispatched from zone (ETA 1m)",
          color: "text-blue-700 bg-blue-50 border-blue-200 animate-pulse",
          iconColor: "text-blue-500",
          progress: 60,
          statusText: "Deploying",
          icon: Car
        };
      }
      return {
        action: "Queued",
        detail: "Campus alert in active safety queue",
        color: "text-slate-400 bg-slate-50/50 border-slate-150",
        iconColor: "text-slate-400",
        progress: 5,
        statusText: "Queued",
        icon: Clock
      };
    }

    if (contact.id === "contact_grandma") {
      if (ticks >= 4) {
        return {
          action: "Calling",
          detail: "Emergency vocal robot call connected",
          color: "text-violet-700 bg-violet-50 border-violet-150 animate-pulse",
          iconColor: "text-violet-500",
          progress: 90,
          statusText: "Triggered Backup",
          icon: Phone
        };
      }
      return {
        action: "Standby",
        detail: "Escalates automatically in 2 minutes",
        color: "text-slate-400 bg-slate-50/50 border-slate-150",
        iconColor: "text-slate-350",
        progress: 0,
        statusText: "Standby",
        icon: Clock
      };
    }

    return {
      action: "Standby",
      detail: "Alert delivered on backup channel",
      color: "text-slate-400 bg-slate-50/50 border-slate-150",
      iconColor: "text-slate-350",
      progress: 0,
      statusText: "Standby",
      icon: Clock
    };
  };

  const handleStatusChange = (respondStatus: string) => {
    onUpdateContact("contact_mom", undefined, respondStatus);
  };

  const handleAddManualPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCapture.trim()) return;
    onAddEvidence("photo", manualCapture);
    setManualCapture("");
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseIncident("Evelyn Johnson (Mom)", closureNotes, closureReason);
    setShowCloseModal(false);
    setClosureNotes("");
  };

  const handleShare = () => {
    const summaryText = `Billi Safety Alert: ${incident.userName} triggered an active safety protocol at ${new Date(incident.activationTime).toLocaleTimeString()}. Last location speed: ${incident.currentLocation.speed}mph. Tracker coordinates active. Active contacts have been alerted.`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Determine current response stage (Active, Responding, Resolved)
  let currentStage: "Active" | "Responding" | "Resolved" = "Active";
  if (incident.status === "closed" || incident.status === "safe" || incident.status === "duress_canceled") {
    currentStage = "Resolved";
  } else if (incident.status === "responder_dispatched" || incident.contacts.some(c => c.respondStatus === "responding")) {
    currentStage = "Responding";
  } else {
    currentStage = "Active";
  }

  return (
    <div id="guardian_active_dashboard" className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-slate-850">
      
      {/* Background Alerts Flash */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-500 to-blue-600 animate-pulse z-20" />

      {/* ═════════════════════════════════════════════════════════════════
          STAGE 1: INCIDENT OVERVIEW & TRIGGER SOURCE (SECTION A)
          ═════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col xl:flex-row gap-6 shadow-md text-slate-100">
        
        {/* Left Side: Incident Identity & Stages */}
        <div className="flex-1 space-y-4 border-r border-slate-800/80 pr-0 xl:pr-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold animate-pulse shadow-lg shadow-red-900/35">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-bold uppercase">
                    STAGE 1: TRIGGER DETECTED
                  </span>
                  <h3 className="font-extrabold text-slate-50 text-base tracking-wide font-mono uppercase">Incident Overview</h3>
                  <span className="text-[10px] font-mono bg-red-950 border border-red-900 text-red-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    ID: {incident.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal mt-0.5">
                  Unified incident lifecycle. Secure encryption and immediate coordinator synchronization.
                </p>
              </div>
            </div>

            {/* E911 CAD Digital Handoff Packet Button */}
            <button
              type="button"
              onClick={() => setShowCadPacketModal(true)}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs px-3.5 py-1.5 rounded-xl font-mono font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>🚨 View E911 CAD Handoff Packet</span>
            </button>
          </div>

          {/* Prominent Active Triggering Device / Activation Source Display */}
          <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-650 flex items-center justify-center text-white font-extrabold animate-pulse">
                <ShieldAlert className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-[8.5px] font-mono text-red-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <span>PRIMARY ACTIVATION SOURCE</span>
                  <InfoTooltip 
                    title="Primary Activation Source"
                    whatIsIt="The physical or digital trigger that initialized this emergency alert."
                    whyIsItThere="To ensure coordinators instantly identify which device initiated the SOS beacon (e.g. keyfob double-squeeze, Apple Watch fall, or manual phone toggle)."
                    capabilities={["BLE Secure Handshake", "Panic Hold Failsafe", "Hardware-decoupled Signaling"]}
                    align="left"
                  />
                </span>
                <p className="text-xs font-mono font-extrabold text-white uppercase mt-0.5 tracking-wide">
                  {incident.activationMethod.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <span className="text-[9px] bg-red-900 text-red-200 border border-red-700 font-mono font-bold px-2 py-0.5 rounded uppercase">
              SECURE TRIGGER
            </span>
          </div>

          {/* Core Response Stage Visual Stepper */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
              CURRENT RESPONSE STAGE
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Stage 1: Active */}
              <div className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                currentStage === "Active"
                  ? "bg-red-950/40 border-red-700/80 text-red-100 shadow-sm"
                  : "bg-slate-850/30 border-slate-800 text-slate-400"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-500">STAGE 01</span>
                  {currentStage !== "Active" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="font-bold text-xs mt-1 font-sans">Active Trigger</p>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">Emergency protocol initiated</span>
              </div>

              {/* Stage 2: Responding */}
              <div className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                currentStage === "Responding"
                  ? "bg-blue-950/40 border-blue-700/80 text-blue-100 shadow-sm"
                  : "bg-slate-850/30 border-slate-800 text-slate-400"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-500">STAGE 02</span>
                  {currentStage === "Resolved" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="font-bold text-xs mt-1 font-sans">Responding</p>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">Coordinators en route</span>
              </div>

              {/* Stage 3: Resolved */}
              <div className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                currentStage === "Resolved"
                  ? "bg-emerald-950/40 border-emerald-700/80 text-emerald-100 shadow-sm"
                  : "bg-slate-850/30 border-slate-800 text-slate-400"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-500">STAGE 03</span>
                </div>
                <p className="font-bold text-xs mt-1 font-sans">Resolved</p>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">Marked safe by guardian</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Summary Timeline of Acknowledgment Events */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>ACKNOWLEDGEMENT TIMELINE SUMMARY</span>
            </span>
            <span className="text-[8.5px] font-mono bg-blue-950 border border-blue-800 text-blue-400 px-2 py-0.5 rounded uppercase">
              Live Audited
            </span>
          </div>

          <div className="relative border-l border-slate-800 pl-4 ml-2.5 space-y-4 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Timeline node calculator */}
            {(() => {
              const timelineEvents = [];
              
              // 1. Initial activation
              timelineEvents.push({
                time: "0m",
                title: "Emergency Protocol Triggered",
                desc: `Activated via ${incident.activationMethod.replace(/_/g, " ")}. Telemetry stream opened.`,
                icon: ShieldAlert,
                color: "bg-red-600 ring-red-900/40"
              });

              // 2. Mom Alert States
              const mom = incident.contacts.find(c => c.id === "contact_mom");
              if (mom) {
                if (mom.alertStatus === "acknowledged" || mom.respondStatus !== "none") {
                  timelineEvents.push({
                    time: "15s",
                    title: "Mom Acknowledged",
                    desc: mom.respondStatus === "responding" ? "Evelyn started Driving (ETA 3m)." : "Evelyn opened live audio feed.",
                    icon: Users,
                    color: "bg-blue-600 ring-blue-900/40"
                  });
                } else if (mom.alertStatus === "delivered" || mom.alertStatus === "opened") {
                  timelineEvents.push({
                    time: "10s",
                    title: "Alert Delivered to Mom",
                    desc: "High-priority push alert successfully arrived on Mom's device.",
                    icon: Clock,
                    color: "bg-slate-600 ring-slate-800/40"
                  });
                }
              }

              // 3. Dad Alert States
              const dad = incident.contacts.find(c => c.id === "contact_dad");
              if (dad) {
                if (dad.alertStatus === "acknowledged" || dad.respondStatus !== "none") {
                  timelineEvents.push({
                    time: "45s",
                    title: "Dad Acknowledged",
                    desc: dad.respondStatus === "responding" ? "Marcus responding." : "Marcus reviewed GPS locator tracking.",
                    icon: Users,
                    color: "bg-blue-600 ring-blue-900/40"
                  });
                } else if (dad.alertStatus === "delivered" || dad.alertStatus === "opened" || dad.alertStatus === "sent") {
                  timelineEvents.push({
                    time: "20s",
                    title: "SMS Delivered to Dad",
                    desc: "Emergency backup SMS alert sent and confirmed by carrier.",
                    icon: Clock,
                    color: "bg-slate-600 ring-slate-800/40"
                  });
                }
              }

              // 4. Officer Ramirez Response
              const officer = incident.contacts.find(c => c.id === "contact_officer");
              if (officer && (officer.alertStatus === "acknowledged" || incident.status === "responder_dispatched")) {
                timelineEvents.push({
                  time: "1m 30s",
                  title: "School Safety Dispatched",
                  desc: "Officer Ramirez dispatched cruiser patrol unit #14 to school perimeter.",
                  icon: Car,
                  color: "bg-emerald-600 ring-emerald-900/40"
                });
              }

              // 5. If closed
              if (incident.status === "closed") {
                timelineEvents.push({
                  time: "End",
                  title: "Incident Resolved",
                  desc: `Marked safe by ${incident.closedBy || "Guardian"}. Reason: ${incident.closureReason || "Safe"}.`,
                  icon: Check,
                  color: "bg-emerald-600 ring-emerald-900/40"
                });
              }

              return timelineEvents.map((ev, i) => {
                const IconComp = ev.icon;
                return (
                  <div key={i} className="relative flex gap-3 text-left">
                    {/* Circle Node */}
                    <span className={`absolute -left-[21.5px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ${ev.color}`}>
                      <IconComp className="w-2 h-2 text-white" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-200 text-xs">{ev.title}</h4>
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-850 px-1.5 py-0.2 rounded font-bold">{ev.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{ev.desc}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>

      {/* --- COLUMN 1: TRACKING MAP & TELEMETRY (Lg: 4/12) --- */}
      <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
        
        {/* Child Profile Widget */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img 
              src={incident.userPhoto} 
              alt={incident.userName} 
              className="w-12 h-12 rounded-full border-2 border-red-500 object-cover" 
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{incident.userName}</h3>
              <p className="text-[10px] font-mono text-red-600 font-semibold uppercase tracking-wider animate-pulse">
                {incident.duressCodeEntered ? "🚨 SILENT DURESS ACTIVE" : "🔴 EMERGENCY ACTIVE"}
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-500">
            <div className="flex items-center gap-1.5 justify-end">
              <Battery className={`w-4 h-4 ${incident.deviceBattery < 15 ? "text-red-500 animate-bounce" : "text-emerald-500"}`} />
              <span>{incident.deviceBattery}%</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mt-0.5">{incident.deviceSignal} SIGNAL</span>
          </div>
        </div>

        {/* --- Location Confidence Panel --- */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs text-left">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-150">
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Location Confidence</span>
              <InfoTooltip 
                title="Location Confidence"
                whatIsIt="A real-time accuracy scoring of the active tracking data based on available sensors."
                whyIsItThere="To prevent false certainty during emergency coordination. If a cellular network or GPS signal degrades, coordinators know immediately that position markers are estimated, and can switch to secondary sensor logic."
                capabilities={[
                  "High: Multi-constellation GPS Active",
                  "Medium: Backup Wearable/Wi-Fi Triangulation",
                  "Limited: Fallback Trajectory Estimation Vectors"
                ]}
                align="center"
              />
            </span>
            {confidence === "HIGH" ? (
              <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                HIGH
              </span>
            ) : confidence === "MEDIUM" ? (
              <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-50 border border-amber-250 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                MEDIUM
              </span>
            ) : (
              <span className="text-[10px] font-mono font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                LIMITED / ESTIMATED
              </span>
            )}
          </div>

          {confidence !== "LIMITED / ESTIMATED" ? (
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
              <div className="flex items-center justify-between p-1.5 bg-white border border-slate-150 rounded-lg">
                <span className="font-semibold text-slate-500">Phone GPS</span>
                <span className={deg.phoneOff || deg.gpsLost ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                  {deg.phoneOff || deg.gpsLost ? "Unavailable" : "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white border border-slate-150 rounded-lg">
                <span className="font-semibold text-slate-500">Apple Watch</span>
                <span className={deg.watchDisconnected ? "text-slate-400 font-bold" : "text-emerald-600 font-bold"}>
                  {deg.watchDisconnected ? "Offline" : "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white border border-slate-150 rounded-lg">
                <span className="font-semibold text-slate-500">Billi Tag</span>
                <span className={deg.tagDisconnected ? "text-slate-400 font-bold" : "text-emerald-600 font-bold"}>
                  {deg.tagDisconnected ? "Offline" : "Connected"}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white border border-slate-150 rounded-lg">
                <span className="font-semibold text-slate-500">Motion Telemetry</span>
                <span className={deg.phoneOff ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                  {deg.phoneOff ? "Unavailable" : "Active"}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-[10px] font-mono text-slate-600">
              <div className="bg-red-50/50 border border-red-150 p-2 rounded-lg text-red-850">
                <p className="font-bold">All Live Location Sources: Unavailable</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Operating on estimated fallback trajectory.</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div>
                  <span className="text-slate-400 block font-bold">LAST GPS</span>
                  <span className="text-slate-800 font-bold">12s ago</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">TAG STATUS</span>
                  <span className="text-slate-800 font-bold">Connected</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">LAST DIRECTION</span>
                  <span className="text-slate-800 font-bold">Northbound</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">EST SPEED</span>
                  <span className="text-slate-800 font-bold">18 mph</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-150">
            <span>SOURCE: {modeLabel}</span>
            <span>ACCURACY: {incident.currentLocation?.accuracy || 6}m</span>
          </div>
        </div>

        {/* --- Current Awareness Panel --- */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs text-left">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-150">
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
              <span>Current Awareness</span>
              <InfoTooltip 
                title="Current Awareness"
                whatIsIt="A metric summarizing real-time situational integrity, responder coordination, and evidence streams."
                whyIsItThere="To show coordinators how strong the communication link is with the target person and active guardians at any second."
                capabilities={[
                  "Strong: Multi-responder Active Sync",
                  "Reduced: Local Data Buffering Mode",
                  "Limited: Telemetry Fallback Vectoring"
                ]}
                align="center"
              />
            </span>
            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider ${awarenessColor}`}>
              {awareness}
            </span>
          </div>

          <div className="space-y-2 text-[10px] font-mono text-slate-600">
            <div className="flex justify-between items-center bg-white p-1.5 border border-slate-150 rounded-lg">
              <span className="font-semibold text-slate-500">Location Feed</span>
              <span className={deg.phoneOff && deg.watchDisconnected ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                {deg.phoneOff && deg.watchDisconnected ? "Last Known Fallback" : "Live Trajectory"}
              </span>
            </div>
            <div className="flex justify-between items-center bg-white p-1.5 border border-slate-150 rounded-lg">
              <span className="font-semibold text-slate-500">Trusted Devices</span>
              <span className="text-slate-800 font-bold">
                {(!deg.phoneOff ? 1 : 0) + (!deg.watchDisconnected ? 1 : 0) + (!deg.tagDisconnected ? 1 : 0)} / 3 Active
              </span>
            </div>
            <div className="flex justify-between items-center bg-white p-1.5 border border-slate-150 rounded-lg">
              <span className="font-semibold text-slate-500">Evidence Link</span>
              <span className={deg.phoneOff ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                {deg.phoneOff ? "Local Buffering" : "Live Streaming"}
              </span>
            </div>
            <div className="flex justify-between items-center bg-white p-1.5 border border-slate-150 rounded-lg">
              <span className="font-semibold text-slate-500">Acknowledge Status</span>
              <span className="text-emerald-600 font-bold">
                {incident.contacts.filter(c => c.respondStatus !== "none").length} Responders Active
              </span>
            </div>
          </div>
        </div>

        {/* Live Breadcrumb Timeline Tracking */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex-1 flex flex-col justify-between shadow-sm mt-4 lg:mt-0">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-150">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-600 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>LIVE TELEMETRY PATH</span>
            </h4>
            <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-red-600 font-mono font-bold animate-pulse">
              TRACKER ON
            </span>
          </div>

          {/* Simulated Map Visual Breadcrumb List */}
          <div className="my-4 space-y-3.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {incident.locations.slice().reverse().map((loc, index) => {
              const isLatest = index === 0;
              return (
                <div key={index} className="flex gap-3 relative">
                  {/* Connecting Line */}
                  {index < incident.locations.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-[-20px] w-0.5 bg-slate-150" />
                  )}
                  {/* Marker Dot */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    isLatest ? "bg-red-500 ring-4 ring-red-100 animate-bounce" : "bg-slate-100 border border-slate-200"
                  }`}>
                    {isLatest ? (
                      <MapPin className="w-3 h-3 text-white" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    )}
                  </div>

                  {/* Labeled coordinate summary */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-xs ${isLatest ? "font-bold text-slate-800" : "text-slate-600"}`}>
                        {isLatest ? "Current Active Location" : `Breadcrumb #${incident.locations.length - index}`}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal font-mono">
                      {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3 text-slate-300" />
                        Speed: {loc.speed}mph
                      </span>
                      <span>Accuracy: {loc.accuracy}m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 p-2.5 border border-amber-200 rounded-lg text-[10px] font-mono text-amber-850 leading-normal flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="text-amber-700 font-bold">Asthma Notice:</span> Keep rescue inhaler ready. Maya has rescue instructions.
            </div>
          </div>
        </div>

      </div>

      {/* --- COLUMN 2: EVIDENCE STREAM BUFFERS (Lg: 4/12) --- */}
      <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-sm">
        
        <div>
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-150">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-600 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-red-500 animate-pulse" />
              <span>EVIDENCE BUFFER</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              SEGMENTS SAVED: {incident.evidence.length}
            </span>
          </div>

          {/* List of Streaming Segments */}
          <div className="my-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {incident.evidence.slice().reverse().map((ev, index) => {
              const isAudio = ev.type === "audio";
              const isPhoto = ev.type === "photo";
              return (
                <div key={index} className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isAudio ? "bg-red-50 text-red-650 border border-red-200" : "bg-slate-150 text-slate-600 border border-slate-200"
                    }`}>
                      {ev.type} Segment #{ev.segmentNum}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Render content depending on type */}
                  {isAudio ? (
                    <div className="flex items-start gap-2.5 bg-white p-2 rounded border border-slate-150">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mt-1 flex-shrink-0" />
                      <p className="text-xs text-slate-700 italic font-mono leading-relaxed">
                        "{ev.aiTranscription}"
                      </p>
                    </div>
                  ) : isPhoto ? (
                    <div className="space-y-1.5">
                      <div className="h-28 w-full bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-slate-400 relative overflow-hidden">
                        <ImageIcon className="absolute w-8 h-8 text-slate-300 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent p-2 flex items-end justify-between">
                          <span className="text-[9px] font-mono text-white">Captured camera feed</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-mono bg-white p-2 rounded border border-slate-150">
                        <span className="text-blue-600 font-bold">AI Visual Parsing:</span> {ev.aiVisualDescription}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 font-mono">
                      {ev.data}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload simulated manual photos / vehicle tags */}
        <form onSubmit={handleAddManualPhoto} className="border-t border-slate-150 pt-3 space-y-2">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            Manually Inject Video Frame / Description
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Black SUV license plate 7XYZ89, heading west"
              value={manualCapture}
              onChange={(e) => setManualCapture(e.target.value)}
              className="flex-1 bg-white text-xs text-slate-800 border border-slate-250 focus:border-blue-500 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
            />
            <button
              type="submit"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
              title="Add frame to incident"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>

      {/* --- COLUMN 3: SAFETY PLAN & COORD (Lg: 4/12) --- */}
      <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-sm">
        
        <div>
          <CurrentResponseWidget incident={incident} />

          {/* POINT 4: ROLE-BASED PRIVACY PERMISSIONS MATRIX */}
          <div className="mt-4 pt-3.5 border-t border-slate-150 text-left">
            <p className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5 mb-2">
              <span>🔒 Role-Based Privacy Controls</span>
              <span className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold border border-blue-250">ACTIVE</span>
            </p>
            <p className="text-[10.5px] text-slate-500 leading-normal mb-2.5">
              Billi partitions data stream variables based on relationship role clearance levels:
            </p>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700">Primary Guardian</span>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold text-[9px] border border-emerald-200">FULL ACCESS</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700">Campus Safety</span>
                <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold text-[9px] border border-blue-200">GEOFENCE & DOSSIER</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700">Grandparents / Backup</span>
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold text-[9px] border border-amber-200">STATUS LOGS ONLY</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700">Proximity Good Samaritan Mesh</span>
                <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold text-[9px] border border-purple-200">ANONYMOUS PROXIMITY PING (&lt;300m)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Recommended Actions */}
          <div className="mt-4 pt-3.5 border-t border-slate-150 text-left">
            <p className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase mb-2">
              ⚡ Recommended Actions (Dynamic)
            </p>
            <div className="space-y-2">
              {deg.phoneOff ? (
                <>
                  <button 
                    type="button"
                    className="w-full bg-red-600 hover:bg-red-550 text-white font-sans text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Review Last Confirmed Route</span>
                    <span className="text-[9px] font-mono bg-red-750 text-red-100 px-1.5 py-0.2 rounded font-black">URGENT</span>
                  </button>
                  <button 
                    type="button"
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-sans text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Contact Nearby Trusted Responder</span>
                    <span className="text-[9px] font-mono text-slate-400">Escalate</span>
                  </button>
                  <button 
                    type="button"
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-sans text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Check Secondary Wearable Status</span>
                    <span className="text-[9px] font-mono text-slate-400">Auxiliary</span>
                  </button>
                  <button 
                    type="button"
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-sans text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Provide Incident Link to Dispatch</span>
                    <span className="text-[9px] font-mono text-blue-600 font-bold">911 Portal</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-550 text-white font-sans text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Call Marcus (Primary Line)</span>
                    <span className="text-[9px] font-mono bg-blue-750 text-blue-100 px-1.5 py-0.2 rounded font-black">DIAL</span>
                  </button>
                  <button 
                    type="button"
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-sans text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Contact School Safety Officer</span>
                    <span className="text-[9px] font-mono text-slate-400">On-Site</span>
                  </button>
                  <button 
                    type="button"
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-sans text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Share Incident with 911 Dispatch</span>
                    <span className="text-[9px] font-mono text-red-500 font-bold">EMERGENCY</span>
                  </button>
                  <button 
                    type="button"
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-sans text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between shadow-xs transition-colors cursor-pointer text-left"
                  >
                    <span>Navigate to Last Confirmed GPS</span>
                    <span className="text-[9px] font-mono text-blue-600">MAPS</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Interactive Response Controls (Mom) */}
        <div className="border-t border-slate-150 pt-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Declare Your Response Action:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange("viewing")}
                className={`text-xs py-2 px-3 rounded-lg border font-semibold cursor-pointer shadow-sm transition-colors ${
                  momContact?.respondStatus === "viewing"
                    ? "bg-red-50 text-red-650 border-red-200 font-bold"
                    : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Viewing Alert
              </button>
              <button
                onClick={() => handleStatusChange("responding")}
                className={`text-xs py-2 px-3 rounded-lg border font-semibold cursor-pointer shadow-sm transition-colors ${
                  momContact?.respondStatus === "responding"
                    ? "bg-red-50 text-red-650 border-red-300 animate-pulse font-bold"
                    : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Responding Live
              </button>
              <button
                onClick={() => handleStatusChange("contacting_services")}
                className={`text-xs py-2 px-3 rounded-lg border font-semibold cursor-pointer shadow-sm transition-colors ${
                  momContact?.respondStatus === "contacting_services"
                    ? "bg-amber-50 text-amber-700 border-amber-300 font-bold"
                    : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Dialing 911
              </button>
              <button
                onClick={() => handleStatusChange("acknowledged")}
                className={`text-xs py-2 px-3 rounded-lg border font-semibold cursor-pointer shadow-sm transition-colors ${
                  momContact?.respondStatus === "acknowledged"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-300 font-bold"
                    : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Acknowledged
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-xs py-2.5 rounded-lg font-semibold text-slate-600 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>{copied ? "Copied Securely!" : "Share Incident"}</span>
            </button>

            <button
              onClick={() => setShowCloseModal(true)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Close / Mark Safe</span>
            </button>
          </div>
        </div>

      </div>

      {/* --- CLOSE INCIDENT / MARK SAFE DIALOG MODAL --- */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 max-w-md w-full p-6 rounded-2xl space-y-4 shadow-xl text-slate-800"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-150">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-display">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Resolve Safety Protocol</span>
              </h3>
              <button 
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-mono uppercase tracking-wider">
                  Verification Closure Reason:
                </label>
                <select
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="User marked safe">User Marked Safe (Reunited)</option>
                  <option value="Accidental activation">Accidental Activation (False Alarm)</option>
                  <option value="Resolved by school staff">Resolved by School Safety Staff</option>
                  <option value="Emergency services resolved">Emergency Services Resolved</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-500 font-mono uppercase tracking-wider">
                  Post-Incident Narrative Notes:
                </label>
                <textarea
                  required
                  placeholder="e.g. Reunited with Maya in front of municipal park. Maya has asthma rescue inhaler. Everything is secure."
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs p-3 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-550 text-xs font-semibold py-2 rounded-lg cursor-pointer shadow-sm"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-bold py-2 rounded-lg cursor-pointer shadow-sm"
                >
                  Mark Safe & Close
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- E911 DIGITAL CAD HANDOFF PACKET MODAL --- */}
      {showCadPacketModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 max-w-2xl w-full p-6 rounded-3xl space-y-5 text-slate-100 shadow-2xl font-sans"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 font-bold">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono font-bold text-red-400 uppercase tracking-widest block">STRUCTURED EMERGENCY DISPATCH WORKFLOW</span>
                  <h3 className="text-base font-bold font-mono text-white">PREPARED EMERGENCY DISPATCH PACKET</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCadPacketModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Packet Content Sections */}
            <div className="space-y-4 text-xs font-mono">
              {/* Section 1: Subject Identity & Medical Context */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] block">1. SUBJECT IDENTITY & CRITICAL MEDICAL DOSSIER</span>
                <div className="grid grid-cols-2 gap-3 text-slate-300 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px]">NAME & AGE:</span>
                    <strong className="text-white">{incident.userName} (Age {incident.userAge})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">MEDICAL CONTEXT:</span>
                    <strong className="text-amber-400">{incident.medicalInfo || "Asthma (Rescue Albuterol Inhaler in backpack)"}</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: AI Intelligence Layer Assessment */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] block">2. AI-ASSISTED DISTRESS ASSESSMENT (AI INTELLIGENCE LAYER)</span>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">SEVERITY:</span>
                      <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold uppercase">
                        {incident.aiRiskClassification || "CRITICAL"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-0.5 rounded text-red-300 font-bold text-[10px]">
                      <span>🎙️ AI ACOUSTIC CUES:</span>
                      <span>HIGH-AROUSAL VOCAL PANIC DETECTED</span>
                    </div>
                  </div>
                  <div className="text-slate-300 italic bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    "{incident.aiSummary || "Ambient audio analysis indicates potential verbal distress; trajectory velocity matches vehicle transit."}"
                  </div>
                </div>
              </div>

              {/* Section 3: Telemetry & Haversine Coordinates */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] block">3. REAL-TIME VECTOR & GPS COORDINATES</span>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[9px]">LAT / LNG FIX:</span>
                    <strong className="text-white">{incident.currentLocation.lat.toFixed(4)}, {incident.currentLocation.lng.toFixed(4)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">SPEED & METHOD:</span>
                    <strong className="text-emerald-400">{incident.currentLocation.speed} MPH ({incident.currentLocation.method.toUpperCase()})</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Handoff Actions */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center gap-3">
              <span className="text-[9px] font-mono text-slate-500">PACKET SEALED: AES-GCM 256</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCadPacketModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Close Packet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Structured Dispatch Packet formatted and queued for compatible emergency dispatch integration!");
                    setShowCadPacketModal(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold py-2 px-4 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>PREPARE DISPATCH HANDOFF PACKET</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* POINT 1: MULTI-LAYER RESPONSE STRIP */}
      <div className="lg:col-span-12 mt-4">
        <MultiLayerResponse incident={incident} />
      </div>

    </div>
  );
}

// Simple helper components used in dialogue
function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
