/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Settings, 
  HelpCircle,
  X,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Radio,
  Users,
  Smartphone,
  Zap,
  Shield
} from "lucide-react";

import ActiveUserView from "./components/ActiveUserView";
import GuardianDashboard from "./components/GuardianDashboard";
import ResponderDashboard from "./components/ResponderDashboard";
import EnvironmentControls from "./components/EnvironmentControls";
import AiAnalysisPanel from "./components/AiAnalysisPanel";
import ConnectedDevicesView from "./components/ConnectedDevicesView";
import HelpDrawerContent from "./components/HelpDrawerContent";
import LandingPageView from "./components/LandingPageView";
import PlanConfigModal from "./components/PlanConfigModal";
import AuditSpecsModal from "./components/AuditSpecsModal";
import { Incident, Profile, SafeZone, PersonaType } from "./types";
import { db } from "./lib/firebase";
import { onSnapshot, doc } from "firebase/firestore";

export default function App() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentTab, setCurrentTab] = useState<PersonaType>("landing");
  const [showPlanConfig, setShowPlanConfig] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);

  // Sync state with full-stack Express server
  const fetchState = async () => {
    try {
      // Get active incident
      const incRes = await fetch("/api/incident");
      if (incRes.ok) {
        const { activeIncident } = await incRes.json();
        setIncident(activeIncident);
      }

      // Get safety plan profile
      const profRes = await fetch("/api/profile");
      if (profRes.ok) {
        const prof = await profRes.json();
        setProfile(prof);
        // Profile loaded from server
      }
    } catch (err) {
      console.error("Poller failed to synchronize backend state:", err);
    }
  };

  useEffect(() => {
    // Initial fetch to get the state immediately
    fetchState();

    // 1. Subscribe to profile in real-time
    const unsubProfile = onSnapshot(doc(db, "system", "profile"), (snapshot) => {
      if (snapshot.exists()) {
        const prof = snapshot.data() as Profile;
        setProfile(prof);
        if (!hasInitializedForm) {
          setHasInitializedForm(true);
        }
      }
    }, (error) => {
      console.error("Firestore Profile subscription error:", error);
    });

    // 2. Subscribe to active incident in real-time
    const unsubIncident = onSnapshot(doc(db, "system", "incident"), (snapshot) => {
      if (snapshot.exists()) {
        setIncident(snapshot.data() as Incident);
      } else {
        setIncident(null);
      }
    }, (error) => {
      console.error("Firestore Incident subscription error:", error);
    });

    return () => {
      unsubProfile();
      unsubIncident();
    };
  }, [hasInitializedForm]);

  const handleActivate = async (method: string) => {
    try {
      const response = await fetch("/api/incident/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method })
      });
      if (response.ok) {
        const data = await response.json();
        setIncident(data.incident);
        // Autotoggle to guardian dashboard so they see the monitoring flow instantly
        setCurrentTab("guardian");
      }
    } catch (error) {
      console.error("Failed to activate safety incident:", error);
    }
  };

  const handleSimulateTick = async (params: { 
    triggerDuress?: boolean; 
    triggerBatteryCrit?: boolean; 
    lossOfSignal?: boolean; 
    gpsLost?: boolean;
    phoneOff?: boolean;
    cellLost?: boolean;
    watchDisconnected?: boolean;
    tagDisconnected?: boolean;
    batteryCrit?: boolean;
  }) => {
    try {
      const response = await fetch("/api/incident/tick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (response.ok) {
        const data = await response.json();
        setIncident(data.incident);
      }
    } catch (error) {
      console.error("Simulation tick failed:", error);
    }
  };

  const handleUpdateContact = async (contactId: string, alertStatus?: string, respondStatus?: string) => {
    try {
      const response = await fetch("/api/incident/update-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, alertStatus, respondStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setIncident(data.incident);
      }
    } catch (error) {
      console.error("Failed to update responder status:", error);
    }
  };

  const handleAddEvidence = async (type: "photo" | "metadata", visualDesc: string) => {
    try {
      const response = await fetch("/api/incident/add-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, visualDesc })
      });
      if (response.ok) {
        const data = await response.json();
        setIncident(data.incident);
      }
    } catch (error) {
      console.error("Evidence upload failed:", error);
    }
  };

  const handleCloseIncident = async (closedBy: string, notes: string, reason: string) => {
    try {
      const response = await fetch("/api/incident/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closedBy, notes, reason })
      });
      if (response.ok) {
        setIncident(null);
      }
    } catch (error) {
      console.error("Close incident request failed:", error);
    }
  };

  const handleReset = async () => {
    try {
      // Close any active incident to wipe memory state
      if (incident) {
        await handleCloseIncident("System Administrator", "Simulation reset requested", "Accidental activation");
      }
      setIncident(null);
      await fetchState();
    } catch (error) {
      console.error("Resetting server database failed:", error);
    }
  };



  const deg = incident?.degradation || {
    gpsLost: false,
    phoneOff: false,
    cellLost: false,
    watchDisconnected: false,
    tagDisconnected: false,
    batteryCrit: false
  };

  let globalProtection: "Strong" | "High" | "Reduced" | "Limited" | "Unavailable" = "High";
  let globalColor = "bg-emerald-50 text-emerald-850 border-emerald-200";
  let globalBadgeColor = "bg-emerald-500 text-white";
  let globalPercent = 92;
  let globalPercentColor = "bg-emerald-500";
  let globalDescription = "All primary telemetry channels and active guardians are online and responsive.";

  if (deg.phoneOff && deg.watchDisconnected) {
    globalProtection = "Unavailable";
    globalColor = "bg-red-50 text-red-800 border-red-200 animate-pulse";
    globalBadgeColor = "bg-red-600 text-white";
    globalPercent = 5;
    globalPercentColor = "bg-red-600 animate-pulse";
    globalDescription = "Critical Telemetry Lost. All live location signals are powered off or disconnected.";
  } else if (deg.phoneOff || (deg.cellLost && deg.gpsLost)) {
    globalProtection = "Limited";
    globalColor = "bg-amber-50 text-amber-900 border-amber-300 animate-pulse";
    globalBadgeColor = "bg-amber-600 text-white";
    globalPercent = 32;
    globalPercentColor = "bg-amber-500";
    globalDescription = "Direct phone tracking is offline. Operating on backup Ray-Ban glasses, BLE tag, or estimated fallback trajectory.";
  } else if (deg.gpsLost || deg.cellLost || deg.watchDisconnected) {
    globalProtection = "Reduced";
    globalColor = "bg-amber-50 text-amber-800 border-amber-250";
    globalBadgeColor = "bg-amber-500 text-white";
    globalPercent = 60;
    globalPercentColor = "bg-amber-500";
    globalDescription = "Signal degradation detected. Secondary backup wearables handle active location estimations.";
  } else if (incident && !deg.gpsLost && !deg.phoneOff && !deg.cellLost && incident.contacts.some(c => c.respondStatus === "responding")) {
    globalProtection = "Strong";
    globalColor = "bg-emerald-100 text-emerald-950 border-emerald-300";
    globalBadgeColor = "bg-emerald-600 text-white animate-pulse";
    globalPercent = 100;
    globalPercentColor = "bg-emerald-600";
    globalDescription = "Coordinated Response Activated. Primary guardians are actively tracked with live high-precision GPS.";
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col justify-between selection:bg-blue-500/30">
      
      {/* Dynamic Duress Hazard Border */}
      {incident?.duressCodeEntered && (
        <div className="fixed inset-0 border-4 border-red-600 pointer-events-none z-50 animate-pulse" />
      )}

      {/* --- CONSOLIDATED MASTER HEADER & NAVIGATION BAR --- */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 sticky top-0 z-30 shadow-lg backdrop-blur-md bg-slate-900/95">
        {/* Brand logo & platform title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab("landing")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-display font-extrabold text-lg shadow-md shadow-blue-500/20">
            B
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-white tracking-tight flex items-center gap-2">
              <span>BILLI</span>
              <span className="text-[9px] font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase">
                V1.0
              </span>
            </h1>
            <p className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest hidden sm:block">
              Emergency Protection Platform
            </p>
          </div>
        </div>

        {/* Center Pill Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono font-bold overflow-x-auto max-w-full">
          <button
            onClick={() => setCurrentTab("landing")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === "landing"
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>🌐 Overview</span>
          </button>

          <button
            onClick={() => setCurrentTab("guardian")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === "guardian" || currentTab === "child" || currentTab === "responder"
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Emergency Console</span>
            {incident && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </button>

          <button
            onClick={() => setCurrentTab("devices")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === "devices"
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Devices</span>
          </button>

          <button
            onClick={() => setCurrentTab("simulator")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === "simulator"
                ? "bg-amber-500 text-white shadow-sm font-black"
                : "text-amber-400 hover:bg-amber-500/10 border border-amber-500/20"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulator</span>
          </button>
        </div>

        {/* Right Icon Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Emergency SOS Action Button */}
          {!incident ? (
            <button
              type="button"
              onClick={() => {
                handleActivate("voice_phrase");
                setCurrentTab("guardian");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-black tracking-wide shadow-md shadow-red-600/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5"
              title="Instantly Activate Silent Emergency Protection"
            >
              <AlertTriangle className="w-4 h-4 fill-white text-red-600" />
              <span>TRIGGER SOS</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleCloseIncident("System User", "Manually resolved via quick header action", "Resolved")}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              title="Mark Emergency Resolved"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>MARK SAFE</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPlanConfig(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Configure Account & Trusted Network"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="System Audit Specifications"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpDrawer(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Help Desk & Glossary"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </header>

      {/* --- MAIN OPERATIONAL WORKSPACE --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 z-10">

        {/* --- UNIFIED LIVE EMERGENCY COMMAND HEADER --- */}
        {currentTab !== "landing" && currentTab !== "simulator" && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 rounded-3xl text-white shadow-xl text-left space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-3.5">
              {/* Person Identity & Incident Status */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-display font-extrabold text-lg shadow-md shadow-blue-500/10">
                  MJ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">PROTECTED PERSON</span>
                    {incident && (
                      <span className="text-[9.5px] font-mono bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-extrabold uppercase animate-pulse">
                        CRISIS STATUS: {incident.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Maya Johnson</span>
                    <span className="text-xs text-slate-400 font-normal">(Age 11)</span>
                  </h2>
                </div>
              </div>

              {/* Center Role Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono font-bold">
                <button
                  onClick={() => setCurrentTab("guardian")}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === "guardian"
                      ? "bg-blue-600 text-white shadow-sm font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Guardian</span>
                </button>
                <button
                  onClick={() => setCurrentTab("child")}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === "child"
                      ? "bg-blue-600 text-white shadow-sm font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Child View</span>
                </button>
                <button
                  onClick={() => setCurrentTab("responder")}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === "responder"
                      ? "bg-blue-600 text-white shadow-sm font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Responder Console</span>
                </button>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider border shadow-xs ${
                  globalProtection === "Strong" ? "bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse" :
                  globalProtection === "High" ? "bg-emerald-950/80 text-emerald-300 border-emerald-800" :
                  globalProtection === "Reduced" ? "bg-amber-950 text-amber-300 border-amber-800" :
                  globalProtection === "Limited" ? "bg-amber-950 text-amber-300 border-amber-800 animate-pulse" :
                  "bg-red-950 text-red-300 border-red-800 animate-pulse"
                }`}>
                  {globalProtection} Protection
                </span>

                <button
                  onClick={() => setCurrentTab("simulator")}
                  className="text-xs font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulator</span>
                </button>
              </div>
            </div>

            {/* Sub-row: Telemetry sensors & Trigger info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1 text-xs font-mono">
              <div className="md:col-span-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[10px] font-bold uppercase">SIGNAL INTEGRITY</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${globalPercentColor}`} style={{ width: `${globalPercent}%` }} />
                  </div>
                  <span className="font-bold text-white text-[11px]">{globalPercent}%</span>
                </div>
              </div>

              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${deg.phoneOff ? "bg-slate-950/40 text-slate-500 border-slate-800" : "bg-emerald-950/30 text-emerald-300 border-emerald-800/60"}`}>
                  <span className={`w-2 h-2 rounded-full ${deg.phoneOff ? "bg-slate-600" : "bg-emerald-400 animate-pulse"}`} />
                  <span className="font-bold text-[11px]">Phone Hub</span>
                </div>
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${deg.watchDisconnected || deg.phoneOff ? "bg-slate-950/40 text-slate-500 border-slate-800" : "bg-emerald-950/30 text-emerald-300 border-emerald-800/60"}`}>
                  <span className={`w-2 h-2 rounded-full ${deg.watchDisconnected || deg.phoneOff ? "bg-slate-600" : "bg-emerald-400 animate-pulse"}`} />
                  <span className="font-bold text-[11px]">Apple Watch</span>
                </div>
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${deg.tagDisconnected || deg.phoneOff ? "bg-slate-950/40 text-slate-500 border-slate-800" : "bg-emerald-950/30 text-emerald-300 border-emerald-800/60"}`}>
                  <span className={`w-2 h-2 rounded-full ${deg.tagDisconnected || deg.phoneOff ? "bg-slate-600" : "bg-emerald-400 animate-pulse"}`} />
                  <span className="font-bold text-[11px]">BLE Tag</span>
                </div>
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${deg.phoneOff ? "bg-slate-950/40 text-slate-500 border-slate-800" : "bg-emerald-950/30 text-emerald-300 border-emerald-800/60"}`}>
                  <span className={`w-2 h-2 rounded-full ${deg.phoneOff ? "bg-slate-600" : "bg-emerald-400 animate-pulse"}`} />
                  <span className="font-bold text-[11px]">Ray-Ban Audio</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GEMINI AI MULTIMODAL INTELLIGENCE COPILOT (Elevated above the fold on operational views) */}
        {currentTab !== "landing" && currentTab !== "simulator" && (
          <section className="space-y-3">
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-5 md:p-6 rounded-3xl text-white shadow-lg space-y-4 border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display tracking-tight text-white flex items-center gap-2">
                      <span>Google Gemini Multimodal AI Copilot</span>
                      <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase">Live AI Threat Directives</span>
                    </h3>
                  </div>
                </div>
              </div>

              <AiAnalysisPanel incident={incident} onActivate={handleActivate} />
            </div>
          </section>
        )}

        {/* ACTIVE PERSONA DASHBOARD VIEW */}
        <section className="space-y-6">
          <AnimatePresence mode="wait">
            {currentTab === "landing" && (
              <motion.div
                key="landing_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <LandingPageView
                  incident={incident}
                  onStartDemo={() => {
                    // Trigger demo steps and navigate
                    setIsDemoRunning(true);
                    setDemoStep(1);
                    setCurrentTab("child");
                    handleActivate("voice_phrase");

                    setTimeout(() => {
                      setDemoStep(2);
                      setCurrentTab("guardian");
                      fetch("/api/incident/update-contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contactId: "contact_mom", respondStatus: "responding" })
                      }).catch(console.error);
                    }, 6000);

                    setTimeout(() => {
                      setDemoStep(3);
                      setCurrentTab("devices");
                      handleSimulateTick({ phoneOff: true, lossOfSignal: true });
                    }, 14000);

                    setTimeout(() => {
                      setDemoStep(4);
                      setCurrentTab("responder");
                      fetch("/api/incident/update-contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contactId: "contact_officer", respondStatus: "responding" })
                      }).catch(console.error);
                    }, 22000);

                    setTimeout(() => {
                      setDemoStep(5);
                      setCurrentTab("guardian");
                      setIsDemoRunning(false);
                    }, 30000);
                  }}
                  isDemoRunning={isDemoRunning}
                  demoStep={demoStep}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onActivate={handleActivate}
                />
              </motion.div>
            )}

            {currentTab === "child" && (
              <motion.div
                key="child_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <ActiveUserView
                  incident={incident}
                  profile={profile}
                  onActivate={handleActivate}
                  onSimulateTick={handleSimulateTick}
                  onCloseIncident={handleCloseIncident}
                />
              </motion.div>
            )}

            {currentTab === "guardian" && (
              <motion.div
                key="guardian_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <GuardianDashboard
                  incident={incident}
                  onUpdateContact={handleUpdateContact}
                  onCloseIncident={handleCloseIncident}
                  onAddEvidence={handleAddEvidence}
                />
              </motion.div>
            )}

            {currentTab === "responder" && (
              <motion.div
                key="responder_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <ResponderDashboard
                  incident={incident}
                  onUpdateContact={handleUpdateContact}
                />
              </motion.div>
            )}

            {currentTab === "devices" && (
              <motion.div
                key="devices_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <ConnectedDevicesView
                  incident={incident}
                  onActivate={handleActivate}
                  onCloseIncident={handleCloseIncident}
                />
              </motion.div>
            )}

            {currentTab === "simulator" && (
              <motion.div
                key="simulator_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <EnvironmentControls
                  incident={incident}
                  onActivate={handleActivate}
                  onSimulateTick={handleSimulateTick}
                  onReset={handleReset}
                  onSwitchTab={(tab) => setCurrentTab(tab)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>



      {/* --- PRE-EMERGENCY CONFIGURATION PLAN DIALOG MODAL --- */}
      {profile && (
        <PlanConfigModal
          isOpen={showPlanConfig}
          onClose={() => setShowPlanConfig(false)}
          profile={profile}
          onProfileSaved={(updatedProf) => {
            setProfile(updatedProf);
            setShowPlanConfig(false);
          }}
        />
      )}

      {/* --- CORE PLATFORM AUDIT & BILL SPECS MODAL --- */}
      <AuditSpecsModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
      />

      {/* --- INFO GLOSSARY & ONBOARDING HELP DRAWER --- */}
      <AnimatePresence>
        {showHelpDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpDrawer(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md md:max-w-lg h-full bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">System Help Desk</span>
                  <h2 className="text-md font-extrabold font-mono text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    <span>ONBOARDING & PLATFORM GLOSSARY</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpDrawer(false)}
                  className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <HelpDrawerContent />

              {/* Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>ONBOARDING COMPLETED: V2.14</span>
                <button
                  type="button"
                  onClick={() => setShowHelpDrawer(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold py-1.5 px-4 rounded-xl cursor-pointer shadow-md transition-colors text-xs"
                >
                  Dismiss Help
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MASTER RUNTIME FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-[10px] font-mono text-slate-400">
        <p>© 2026 Billi Emergency Response Inc. Authorized Safety Plan Protocol active.</p>
        <p className="mt-1">All evidence captures are cryptographically sealed locally before cloud uplink.</p>
      </footer>

    </div>
  );
}
