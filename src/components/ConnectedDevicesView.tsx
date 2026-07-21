/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import InfoTooltip from "./InfoTooltip";
import { 
  Smartphone, 
  Watch, 
  Glasses, 
  Radio, 
  Cpu, 
  Activity, 
  Users, 
  Siren, 
  ShieldCheck, 
  ShieldAlert,
  Plus, 
  Check, 
  ChevronRight, 
  Info,
  ArrowRight,
  Sparkles,
  Link2,
  Trash2,
  ListFilter,
  MapPin,
  Mic,
  Wifi,
  Bluetooth,
  RefreshCw,
  Lock,
  Unlock,
  Key
} from "lucide-react";
import { Incident } from "../types";

interface ConnectedDevicesViewProps {
  incident: Incident | null;
  onActivate: (method: string) => void;
  onCloseIncident?: (closedBy: string, notes: string, reason: string) => void;
}

interface CustomDevice {
  id: string;
  name: string;
  type: "watch" | "glasses" | "tag" | "other";
  status: "Connected" | "Standby" | "Searching";
  activationSignal: string;
  battery: number;
  capabilities: string[];
}

export default function ConnectedDevicesView({ incident, onActivate, onCloseIncident }: ConnectedDevicesViewProps) {
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceType, setNewDeviceType] = useState<"watch" | "glasses" | "tag" | "other">("watch");
  const [newDeviceSignal, setNewDeviceSignal] = useState("");

  const [phoneEcosystem, setPhoneEcosystem] = useState<"ios" | "android">("ios");
  const [isBleScanning, setIsBleScanning] = useState(false);
  const [pairingDevice, setPairingDevice] = useState<string | null>(null);
  const [pairingSuccess, setPairingSuccess] = useState<string | null>(null);

  // --- ADVANCED PLATFORM DECENTRALIZED RESILIENCY & PRIVACY STATES ---
  const [cellOutageSimulation, setCellOutageSimulation] = useState(false);
  const [privateKeyDossier, setPrivateKeyDossier] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [escalationCountdown, setEscalationCountdown] = useState(45);
  const [escalatedAuditLogged, setEscalatedAuditLogged] = useState(false);

  // Countdown timer for Multi-Tier Progressive Escalation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (incident && incident.status !== "closed" && incident.status !== "safe") {
      setEscalationCountdown(prev => {
        if (prev > 0) {
          return prev - 1;
        } else {
          // Time expired! Escalate automatically to campus dispatch and local responders
          if (!escalatedAuditLogged) {
            setEscalatedAuditLogged(true);
            // Post an audit log to express
            fetch("/api/audit-log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                actor: "Orchestrator Failsafe",
                action: "MULTI_TIER_ESCALATION",
                details: "Failsafe limit of 45s breached without primary guardian acknowledgement. Co-dispatch escalated automatically to campus dispatch & 911 emergency backup."
              })
            });
          }
          return 0;
        }
      });
      interval = setInterval(() => {
        setEscalationCountdown(prev => {
          if (prev > 1) return prev - 1;
          if (prev === 1) {
            if (!escalatedAuditLogged) {
              setEscalatedAuditLogged(true);
              fetch("/api/audit-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  actor: "Orchestrator Failsafe",
                  action: "MULTI_TIER_ESCALATION",
                  details: "Failsafe limit of 45s breached without primary guardian acknowledgement. Co-dispatch escalated automatically to campus dispatch & 911 emergency backup."
                })
              });
            }
            return 0;
          }
          return 0;
        });
      }, 1000);
    } else {
      setEscalationCountdown(45);
      setEscalatedAuditLogged(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [incident, escalatedAuditLogged]);

  const [bleDevices, setBleDevices] = useState([
    { name: "Garmin Fenix 7 Pro", type: "watch" as const, signal: "Double-Button Hotkey Squeeze", address: "00:A0:C9:14:C8:29", battery: 89, capabilities: ["Continuous GPS Sync", "Heartbeat Threshold Spike Broadcast", "Inertial Crash Detection"] },
    { name: "Samsung Galaxy Ring", type: "tag" as const, signal: "Double Pinch Gesture SOS Trigger", address: "84:FC:E6:38:11:A4", battery: 95, capabilities: ["Pinch Gesture Accelerometer", "Continuous Heart Rate Monitor", "Bluetooth Proximity Beacon"] },
    { name: "Pixel Watch 3 (LTE)", type: "watch" as const, signal: "High-G Fall Decelerometer Hold", address: "B4:52:1A:C9:8F:22", battery: 74, capabilities: ["SOS Hold Gesture Trigger", "Decelerometer Impact Tracking", "LTE Satellite Backup Tunnel"] },
    { name: "Sennheiser Accentum (Audio)", type: "other" as const, signal: "Vocal Assist Wakeup Matcher", address: "78:23:4E:99:BB:0C", battery: 82, capabilities: ["Microphone Audio Streaming Buffer", "Noise Suppression Filtering", "Dual-Channel Voice Wakeup"] }
  ]);

  const [customDevices, setCustomDevices] = useState<CustomDevice[]>([
    {
      id: "dev_watch_apple",
      name: "Apple Watch Ultra 2",
      type: "watch",
      status: "Connected",
      activationSignal: "Double Tap Gestures / Hard Fall Detection",
      battery: 92,
      capabilities: ["Continuous GPS Broadcast", "Fall Impact Telemetry", "Double-Tap Gesture Ring"]
    },
    {
      id: "dev_watch_pixel",
      name: "Pixel Watch 3",
      type: "watch",
      status: "Connected",
      activationSignal: "High-G Fall Impact Sensor / SOS Hold",
      battery: 78,
      capabilities: ["Continuous GPS Broadcast", "High-G Sensor Logging", "SOS Wrist Gesture Trigger"]
    },
    {
      id: "dev_watch_galaxy",
      name: "Samsung Galaxy Watch 6",
      type: "watch",
      status: "Connected",
      activationSignal: "SOS Quad-Click Power Key Trigger",
      battery: 84,
      capabilities: ["GPS Coordinates Sync", "Power Key Panic Signal", "Ambient Heart Rate Monitor"]
    },
    {
      id: "dev_tag_billi",
      name: "Billi Smart Tag BLE",
      type: "tag",
      status: "Connected",
      activationSignal: "Tactile Double Button Squeeze Failsafe",
      battery: 100,
      capabilities: ["Low-Latency Keyfob Trigger", "BLE Beacon Proximity", "Haptic Status Feedback"]
    },
    {
      id: "dev_glasses_meta",
      name: "Meta Ray-Ban Glasses",
      type: "glasses",
      status: "Connected",
      activationSignal: "Vocal Phrase: 'Billi, activate safety ring'",
      battery: 65,
      capabilities: ["Hands-Free Vocal Wakeup", "Active Audio Stream Pipeline", "Visual Frame Analysis Context"]
    }
  ]);

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const added: CustomDevice = {
      id: "custom_" + Date.now(),
      name: newDeviceName,
      type: newDeviceType,
      status: "Connected",
      activationSignal: newDeviceSignal.trim() || "Programmable Action Shortcut Trigger",
      battery: 100,
      capabilities: ["Bluetooth SOS Signal Relay", "Proximity Heartbeat Beacon"]
    };

    setCustomDevices(prev => [...prev, added]);
    setNewDeviceName("");
    setNewDeviceSignal("");
    setShowAddDeviceModal(false);
  };

  const handleDeleteDevice = (id: string) => {
    setCustomDevices(prev => prev.filter(d => d.id !== id));
  };

  // Triggers for secondary devices
  const triggerSources = [
    {
      label: "Apple Watch Double Tap",
      method: "watch_double_tap",
      color: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
      deviceIcon: Watch,
      desc: "Sends instant watch wrist double-tap accelerometer impulse."
    },
    {
      label: "Meta Glasses Voice Phrase",
      method: "glasses_voice_phrase",
      color: "from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
      deviceIcon: Glasses,
      desc: "Triggers via smart glass onboard vocal phrase matching."
    },
    {
      label: "Billi Tag Button Press",
      method: "ble_tag_press",
      color: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
      deviceIcon: Radio,
      desc: "Squeezes Bluetooth BLE keyfob micro-switch."
    },
    {
      label: "Galaxy Watch Fall Detection",
      method: "watch_fall_impact",
      color: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
      deviceIcon: Watch,
      desc: "Simulates high-G deceleration impact signature on watch."
    }
  ];

  return (
    <div id="billi_device_network_dashboard" className="space-y-12">
      
      {/* 1. ARCHITECTURAL STATEMENT BANNER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm text-slate-100 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Cpu className="w-48 h-48 text-white" />
        </div>
        
        <div className="relative z-10 space-y-2.5 max-w-3xl font-sans">
          <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 border border-blue-900/60 px-2 py-0.5 rounded uppercase tracking-wider">
            Ecosystem Philosophy
          </span>
          <h2 className="text-lg md:text-xl font-display font-extrabold text-white tracking-tight">
            The Billi Device Network (BDN)
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Billi integrates with compatible wearable and connected devices capable of securely triggering or contributing to an emergency incident. 
            By decoupling physical hardware from the signaling pipeline, Billi turns any accessory into a life-saving portal.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[10px] font-mono text-slate-450">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Device-Agnostic
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Decentralized Signals
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Hub-Centric Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* 2. THE ABSTRACTED PLATFORM WORKFLOW DIAGRAM */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left space-y-5">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
            DEVICE-AGNOSTIC DATA FLOW PIPELINE
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
            Visual pathway of how a hardware signal translates into a coordinated safe resolution.
          </p>
        </div>

        {/* Scrollable workflow nodes */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center text-center">
          {/* Node 1: Activation Trigger */}
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
              <Watch className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 font-mono">Any Device</span>
            <span className="text-[8px] text-slate-400">Watch, Glasses, BLE Tag</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-350">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Node 2: Signal */}
          <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Link2 className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-blue-800 font-mono">Activation Signal</span>
            <span className="text-[8px] text-blue-500">Double-Tap / Voice Wake</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-350">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Node 3: Core Hub */}
          <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 font-mono">Billi Mobile Hub</span>
            <span className="text-[8px] text-emerald-500">Location, AI, Safe Zones</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-350">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Node 4: Incident Engine */}
          <div className="bg-red-50 border border-red-150 p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
              <Activity className="w-4 h-4 text-red-650" />
            </div>
            <span className="text-[10px] font-bold text-red-800 font-mono">Incident Engine</span>
            <span className="text-[8px] text-red-500">Shared Live Object</span>
          </div>
        </div>

        {/* Workflow Part 2 */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center text-center pt-3 border-t border-slate-100">
          {/* Node 5: Trusted Network */}
          <div className="bg-violet-50 border border-violet-150 p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-violet-800 font-mono">Trusted Network</span>
            <span className="text-[8px] text-violet-500">Synced Guardian Stream</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-350">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Node 6: Emergency Dispatch */}
          <div className="bg-indigo-50 border border-indigo-150 p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Siren className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-indigo-800 font-mono">Emergency Services</span>
            <span className="text-[8px] text-indigo-500">911 & Campus Dispatch</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-350">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Node 7: Coordinated Resolution */}
          <div className="bg-slate-900 text-white border border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center space-y-1 md:col-span-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 animate-bounce" />
            </div>
            <span className="text-[10px] font-bold text-slate-100 font-mono">Coordinated Resolution</span>
            <span className="text-[8px] text-slate-400">Marked Safe via Decentralized Failsafe Security Codes</span>
          </div>
        </div>
      </div>

      {/* 2.5 LIVE BLE DIAGNOSTIC SPECTRUM & SIGNAL WAVE (NEW SPARKLED FEATURE) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm text-slate-100 text-left space-y-6">
        <div className="flex justify-between items-start flex-col sm:flex-row gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>LIVE BLE SPECTRUM DIAGNOSTIC MONITOR</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
              Continuous RF signal analysis for all secure wearable nodes in Maya's physical proximity.
            </p>
          </div>
          <button
            onClick={() => {
              const original = [...customDevices];
              setCustomDevices(original.map(d => ({ ...d, battery: Math.max(50, Math.min(100, d.battery + (Math.random() > 0.5 ? 1 : -1))) })));
            }}
            className="text-[9px] font-mono font-bold bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/80 hover:border-blue-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            ⚡ PING ACTIVE FREQUENCIES
          </button>
        </div>

        {/* Spectrum Wave Animation */}
        <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-xl relative overflow-hidden flex flex-col justify-center min-h-[90px]">
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-around opacity-20 pointer-events-none px-4">
            {[...Array(24)].map((_, idx) => (
              <div 
                key={idx} 
                className="w-1 bg-blue-500 rounded-t-sm" 
                style={{ 
                  height: `${20 + Math.sin(idx * 0.8) * 60}%`, 
                  animation: 'pulse 1.5s infinite ease-in-out',
                  animationDelay: `${idx * 80}ms`
                }} 
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-950/60 flex items-center justify-center border border-blue-800 text-blue-400 font-mono text-[10px] font-extrabold animate-pulse">
                -72d
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Average Signal RSSI Strength</span>
                <p className="text-xs font-bold text-slate-200">Excellent. Proximity radius is under 2.5 meters.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full sm:w-auto">
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase block">FREQ CHANNEL</span>
                <span className="text-[10px] font-mono font-bold text-slate-300">2.480 GHz (CH39)</span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase block">TX POWER LEVEL</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">+4 dBm (Normal)</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">DECRYPTION ENVELOPE</span>
                <span className="text-[10px] font-mono font-bold text-blue-400">AES-256 GCM SECURE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Console Stream */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Real-Time Cryptographic Beacon Stream</span>
          <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl font-mono text-[9px] text-slate-350 space-y-1.5 max-h-[140px] overflow-y-auto leading-relaxed scrollbar-thin">
            <p className="text-blue-400 animate-pulse">⚡ [COORD-DOCK] Active peripheral diagnostic session initialized. Polling RF channels...</p>
            <p className="text-slate-400">[21:42:01.402] ID: dev_watch_apple | RSSI: -65dBm | BATT: 92% | Beacon Token Hash: fb9a721d...04c (VALID)</p>
            <p className="text-slate-400">[21:42:01.905] ID: dev_tag_billi | RSSI: -44dBm | BATT: 100% | Proximity state: INTRA-ZONE (1.2m)</p>
            <p className="text-emerald-400">[21:42:02.110] SUCCESS: Meta Ray-Ban Audio stream handshaked on BLE channel 37. Encrypted frame synced.</p>
            <p className="text-slate-400">[21:42:02.802] ID: dev_watch_pixel | RSSI: -78dBm | BATT: 78% | Handshake timing delay: 12ms (EXCELLENT)</p>
            <p className="text-slate-400">[21:42:03.205] ID: dev_watch_galaxy | RSSI: -84dBm | BATT: 84% | Secondary fallback mesh listener armed.</p>
          </div>
        </div>
      </div>

      {/* --- ADVANCED PLATFORM SUITE: RESILIENCY, PRIVACY & ONBOARDING (NEW) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT CARD: AD-HOC P2P SAFETY MESH (Lg: 7/12) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm text-slate-100 text-left space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>AD-HOC PEER-TO-PEER SAFETY MESH</span>
              </h3>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                cellOutageSimulation 
                  ? "bg-red-950/60 border-red-800 text-red-400 animate-pulse" 
                  : "bg-blue-950/60 border-blue-900 text-blue-400"
              }`}>
                {cellOutageSimulation ? "Mesh Enabled (Cell Jammed)" : "LTE/Satellite Active"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If cellular tower networks are jammed or down, Billi activates a decentralized safety mesh. Distress beacons hop anonymously over local BLE & Wi-Fi Direct until an active uplink is discovered.
            </p>
          </div>

          {/* Interactive Outage Toggle */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Cell Outage Simulator</span>
                <p className="text-xs font-bold text-slate-200">Sever Primary LTE/Satellite Signal</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCellOutageSimulation(!cellOutageSimulation);
                  fetch("/api/audit-log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      actor: "System Simulator",
                      action: cellOutageSimulation ? "CELLULAR_RESTORED" : "CELLULAR_OUTAGE",
                      details: cellOutageSimulation 
                        ? "Primary cellular & GPS satellites re-connected. Back to standard direct cloud routing." 
                        : "Simulating severe radio jamming. Cell service down. Activating local Ad-Hoc Decentralized BLE Mesh network relays!"
                    })
                  });
                }}
                className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  cellOutageSimulation
                    ? "bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-md animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-750 text-slate-200"
                }`}
              >
                {cellOutageSimulation ? "🔌 RESTORE SIGNAL" : "📡 CUT CELL SERVICE"}
              </button>
            </div>

            {/* Visual Mesh Diagram */}
            <div className="border-t border-slate-850 pt-3.5 space-y-3">
              <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Active Routing Path</span>
              
              {!cellOutageSimulation ? (
                <div className="flex items-center justify-between bg-blue-950/20 border border-blue-900/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-300 font-mono text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>DIRECT LINK: Maya's iPhone ➜ Secure AWS Cloud Gateway</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">RSSI: -58dBm</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual Node-Hop Flow Chart */}
                  <div className="grid grid-cols-4 gap-1 text-center relative">
                    {/* Connecting line backgrounds */}
                    <div className="absolute top-4 left-[12%] right-[12%] h-[2px] bg-red-900/40 z-0 border-dashed border-red-500" />
                    
                    {/* Node 1 */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-750 text-red-400 flex items-center justify-center font-bold text-xs animate-pulse">
                        Maya
                      </div>
                      <span className="text-[8.5px] font-mono text-slate-300 mt-1.5 block">Watch Wearable</span>
                      <span className="text-[7.5px] text-red-400 font-mono">BLE beacon</span>
                    </div>

                    {/* Node 2 */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-700 text-slate-300 flex items-center justify-center font-mono text-[9px] animate-pulse">
                        Hop 1
                      </div>
                      <span className="text-[8.5px] font-mono text-slate-300 mt-1.5 block">Classmate S24</span>
                      <span className="text-[7.5px] text-slate-400 font-mono">Anonymous Peer</span>
                    </div>

                    {/* Node 3 */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-700 text-slate-300 flex items-center justify-center font-mono text-[9px] animate-pulse">
                        Hop 2
                      </div>
                      <span className="text-[8.5px] font-mono text-slate-300 mt-1.5 block">Admin iPad</span>
                      <span className="text-[7.5px] text-slate-400 font-mono">Campus Mesh</span>
                    </div>

                    {/* Node 4 */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-mono text-[9px] animate-bounce">
                        Uplink
                      </div>
                      <span className="text-[8.5px] font-mono text-emerald-400 mt-1.5 block">School Gateway</span>
                      <span className="text-[7.5px] text-emerald-500 font-mono">Fiber Web</span>
                    </div>
                  </div>

                  <div className="bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg text-[9.5px] text-red-300 font-mono leading-normal">
                    <strong>P2P Active:</strong> Beacon packet <code>#045-A</code> hopped to classmate S24 (3.2m), forwarded to hallway iPad (22m), synced to Campus fiber gateway. Telemetry successfully delivered to mom!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progressive Multi-Tier Co-Dispatch countdown visualizer */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-[11px] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Failsafe Escalation</span>
              {incident ? (
                <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Escalation Timer Active
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 font-mono">Emergency standby</span>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1 text-left">
                <p className="font-bold text-slate-200">Progressive Co-Dispatch Fallback</p>
                <p className="text-[10px] text-slate-400 leading-normal">
                  If the primary guardian (Evelyn) does not acknowledge this emergency dispatch within 45 seconds, Billi automatically escalates alerts to municipal 911 dispatch, campus police cruisers, and nearby pre-authorized civilian responders.
                </p>
              </div>

              {incident ? (
                <div className="text-center bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex flex-col justify-center min-w-[75px]">
                  <span className={`text-xl font-mono font-black ${escalationCountdown <= 15 ? "text-red-500 animate-pulse" : "text-amber-400"}`}>
                    {escalationCountdown}s
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">UNTIL POLICE</span>
                </div>
              ) : (
                <div className="text-center bg-slate-900/60 border border-slate-850 px-4 py-2 rounded-xl text-slate-600 font-mono text-xs font-bold">
                  45s
                </div>
              )}
            </div>

            {incident && escalationCountdown === 0 && (
              <div className="bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg text-red-300 font-mono text-[9px] leading-relaxed">
                🚨 <strong>SYSTEM ESCALATED:</strong> No acknowledgement received in 45s. Co-dispatch triggered alerts to Campus Safety Cruiser #4 and SFPD Dispatch Unit 12. Student medical/identity dossier securely dispatched.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD: ZERO-KNOWLEDGE DOSSIER CRYPTOGRAPHY (Lg: 5/12) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-slate-850 text-left space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>PRIVACY SOVEREIGNTY LOCKER</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Billi guarantees absolute user privacy during peacetime. The child's medical records, tracking history, and live microphone buffers are encrypted on-device with a private key.
            </p>
          </div>

          {/* Cryptography status window */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Peacetime Privacy State</span>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
                {privateKeyDossier ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    Zero-Knowledge Locked
                  </span>
                ) : (
                  <span className="text-slate-400">Standard Unlocked</span>
                )}
              </div>
            </div>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400">ON-DEVICE PRIVATE KEY</span>
                  <span className="text-slate-600 font-bold">SAVED ONLY ON PHONE</span>
                </div>
                <p className="bg-white border border-slate-200 p-1.5 rounded text-[10px] font-mono text-slate-500 break-all select-all">
                  {privateKeyDossier ? "0xBD927A88EF412B9802AA4C371B9EE40" : "Not configured / inactive"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-slate-400">GUARDIAN PUBLIC KEY</span>
                  <span className="text-slate-600 font-bold">REGISTERED RECIPIENT</span>
                </div>
                <p className="bg-white border border-slate-200 p-1.5 rounded text-[10px] font-mono text-slate-500 break-all">
                  0x78D32E77BA290DCCB1826F32AEE835C1
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-150">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Decryption Policy Matrix</span>
                
                {incident ? (
                  <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-start gap-2 text-[10px] leading-relaxed text-red-800">
                    <Unlock className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>EMERGENCY ACTIVE:</strong> Decryption token <code>0xAES_554b7</code> signed by Maya's watch, distributed to Evelyn & Officer Davis. Dossier is successfully decrypted.
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-start gap-2 text-[10px] leading-relaxed text-emerald-800">
                    <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>PEACETIME ENCRYPTED:</strong> Coordinates and medical dossier are unreadable. No parent or third-party can query tracking telemetry until an active SOS trigger is validated.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
              <span className="text-[10px] font-mono text-slate-400">Toggle ZK-Dossier Cryptography:</span>
              <button
                type="button"
                onClick={() => setPrivateKeyDossier(!privateKeyDossier)}
                className={`text-[9px] font-mono font-bold px-2 py-1 rounded border cursor-pointer transition-all ${
                  privateKeyDossier 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-black" 
                    : "bg-slate-100 border-slate-300 text-slate-600"
                }`}
              >
                {privateKeyDossier ? "ENABLED (SECURE)" : "DISABLED"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* --- CONVERSATIONAL ASSISTANT SETUP ONBOARDING WALKTHROUGH --- */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-slate-800 text-left space-y-4">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-150">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase font-display">Billi Assistant Onboarding Guide</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                An interactive step-by-step wizard to setup your family security plan, configure geofences, and pair hardware.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-bold">
            Step {onboardingStep} of 4
          </span>
        </div>

        {/* Wizard Steps Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2 border-b border-slate-150 text-center font-mono text-[10px]">
          <div className={`p-2 rounded-lg border transition-all ${onboardingStep === 1 ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-slate-50 border-transparent text-slate-400"}`}>
            1. CHILD DOSSIER
          </div>
          <div className={`p-2 rounded-lg border transition-all ${onboardingStep === 2 ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-slate-50 border-transparent text-slate-400"}`}>
            2. ACCESSORY PAIRING
          </div>
          <div className={`p-2 rounded-lg border transition-all ${onboardingStep === 3 ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-slate-50 border-transparent text-slate-400"}`}>
            3. VOICE CALIBRATION
          </div>
          <div className={`p-2 rounded-lg border transition-all ${onboardingStep === 4 ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-slate-50 border-transparent text-slate-400"}`}>
            4. GEOFENCE MAPS
          </div>
        </div>

        {/* Step Contents */}
        <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl min-h-[140px] flex flex-col justify-between">
          
          {onboardingStep === 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Configure Student Emergency Dossier</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Input the protected child's identity, key medical attributes (like asthma, allergies), and crucial caregiver contact phone numbers. This profile is sealed on-device under AES-256 keys, shared temporarily with authorities only when an SOS is triggered.
              </p>
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop" alt="Maya" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800">Maya Johnson (Age 11)</p>
                    <p className="text-[10px] text-slate-400">Asthma rescue inhaler inside schoolpack</p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold">Dossier Completed</span>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
                <Bluetooth className="w-4 h-4 text-blue-600" />
                <span>Pair Secure Bluetooth Accessories</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connect hardware triggers such as smartwatches, keyfobs, or audio accessories. In this walkthrough, let's simulate pairing a <strong>Billi Smart Tag BLE Button</strong> to Maya's cognitive keychain node.
              </p>
              
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Bluetooth className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Billi Smart Keyfob BLE Tag</p>
                    <p className="text-[9px] text-slate-400">Broadcasting proximity beacon: ID <code>tag_billi_09</code></p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const originalLogs = [...customDevices];
                    if (!originalLogs.find(d => d.id === "dev_tag_billi")) {
                      setCustomDevices(prev => [...prev, {
                        id: "dev_tag_billi",
                        name: "Billi Smart Tag BLE",
                        type: "tag",
                        status: "Connected",
                        activationSignal: "Tactile Double Button Squeeze Failsafe",
                        battery: 100,
                        capabilities: ["Low-Latency Keyfob Trigger", "BLE Beacon Proximity", "Haptic Status Feedback"]
                      }]);
                    }
                    alert("Billi Smart Tag paired successfully! Haptic buzz simulated on device accessory.");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm cursor-pointer transition-all uppercase"
                >
                  ⚡ Pair & Test Tag
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
                <Mic className="w-4 h-4 text-blue-600" />
                <span>Calibrate Local On-Device Voice Trigger Safeword</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Instruct the vocal audio classifier engine on your smartwatch or smart glasses to recognize your confidential duress phrase. In this walkthrough, Maya's Ray-Ban Glasses are calibrated to detect: <strong>"Blue Folder"</strong>.
              </p>
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs leading-normal">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-mono text-xs font-bold animate-pulse">
                    98%
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800">Vocal Match Safeword: "Blue Folder"</p>
                    <p className="text-[10px] text-slate-400">Classified locally inside glasses digital signal processor</p>
                  </div>
                </div>
                <span className="text-[9px] bg-violet-100 text-violet-700 font-mono px-2 py-0.5 rounded font-bold uppercase animate-pulse">CALIBRATED</span>
              </div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Establish Dynamic Failsafe Geofence Boundaries</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Establish dynamic safe zones around crucial centers like home and school. If the child's coordinate drifts outside these boundaries during hours they are scheduled to be inside, the system alerts parents and schedules escalation warnings automatically.
              </p>
              <div className="bg-emerald-50/60 border border-emerald-150 p-3 rounded-xl text-xs text-emerald-850 flex items-center justify-between">
                <div>
                  <p className="font-extrabold">Active school schedule boundary map active</p>
                  <p className="text-[10px] text-emerald-700 font-mono">Pine Middle School Zone: 100 meter radius circle mapped.</p>
                </div>
                <span className="text-[9.5px] font-mono text-emerald-700 font-bold uppercase">✓ Boundary Secured</span>
              </div>
            </div>
          )}

          {/* Stepper controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={onboardingStep === 1}
              onClick={() => setOnboardingStep(prev => prev - 1)}
              className="bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-600 border border-slate-250 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all"
            >
              ◀ BACK
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className="text-slate-400 hover:text-slate-600 text-[9px] font-mono font-bold uppercase tracking-wide cursor-pointer"
              >
                Reset Setup Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onboardingStep < 4) {
                    setOnboardingStep(prev => prev + 1);
                  } else {
                    setOnboardingStep(1);
                    alert("Walkthrough onboarding successfully completed! You are now fully configured in the cognitive safety ecosystem.");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-550 text-white font-mono text-[10px] font-bold py-1.5 px-4.5 rounded-lg shadow-sm cursor-pointer transition-all uppercase"
              >
                {onboardingStep === 4 ? "Complete Setup Guide" : "Next Step ▶"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. HARDWARE SIMULATION CONTROL DECK */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm text-left space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>INTERACTIVE WEARABLE TRIGGER SIMULATOR</span>
            </h3>
            <p className="text-[11px] text-slate-450 mt-0.5 leading-normal">
              Press any button below to simulate an active emergency protocol launch from that specific wearable hardware node.
            </p>
          </div>
          {incident && (
            <span className="text-[9px] bg-red-100 text-red-700 border border-red-300 font-mono px-2 py-0.5 rounded font-bold animate-pulse">
              INCIDENT LIVE
            </span>
          )}
        </div>

        {incident ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-extrabold text-red-800 flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-red-650 animate-bounce" />
                <span>ACTIVE INCIDENT DETECTED IN THE COGNITIVE HUB ({incident.id})</span>
              </p>
              <p className="text-slate-650 text-[11px]">
                The platform hub (Phone) has locked-in. Triggered via: <strong className="uppercase font-mono text-red-750">{incident.activationMethod.replace(/_/g, " ")}</strong>.
              </p>
            </div>
            {onCloseIncident && (
              <button
                onClick={() => onCloseIncident("System Administrator", "Wearable demo reset", "Accidental activation")}
                className="bg-white hover:bg-slate-100 text-red-750 border border-red-200 px-4 py-2 rounded-xl font-bold font-mono text-xs shadow-xs transition-colors cursor-pointer"
              >
                DISMISS SYSTEM INCIDENT
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {triggerSources.map((src, index) => {
              const DeviceIcon = src.deviceIcon;
              return (
                <button
                  key={index}
                  onClick={() => onActivate(src.method)}
                  className={`relative p-3.5 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 shadow-sm hover:border-blue-400 group transition-all duration-300 cursor-pointer flex gap-3`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform`}>
                    <DeviceIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {src.label}
                    </p>
                    <p className="text-[10px] text-slate-450 leading-normal">
                      {src.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RE-ARCHITECTED TRUSTED DEVICES INVENTORY */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left space-y-4">
        
        {/* Registry header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-150">
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-600 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>BILLI COMPATIBLE HARDWARE REGISTRY</span>
              <InfoTooltip 
                title="Hardware Registry"
                whatIsIt="The roster of secondary wearable accessories approved by the user to relay SOS triggers and telemetry."
                whyIsItThere="To manage physical device hookups. Billi remains hardware-agnostic, letting you register any Bluetooth keyfob, Apple Watch, or smart glasses to serve as emergency triggers."
                capabilities={["Dynamic BLE pairing", "Device signal heartbeats", "Independent battery monitoring"]}
                align="left"
              />
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Approved accessories registered to Maya's cognitive safety profile.
            </p>
          </div>
          
          <button
            onClick={() => setShowAddDeviceModal(true)}
            className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD DEVICE</span>
          </button>
        </div>

        {/* Dynamic Parent/Child Hub OS Platform Selection */}
        <div id="billi_mobile_os_selector" className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Primary Hub Hardware Ecosystem</span>
            <p className="text-[11px] font-sans text-slate-600 mt-0.5">Determine whether Maya's primary coordinator is an iOS or Android device.</p>
          </div>
          <div className="flex gap-1.5 w-full md:w-auto">
            <button
              onClick={() => {
                setPhoneEcosystem("ios");
                fetch("/api/audit-log", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    actor: "Account Owner",
                    action: "ECOSYSTEM_SWITCHED",
                    details: "Switched core mobile hub profile configuration to Apple iOS (iPhone Hub)."
                  })
                });
              }}
              className={`flex-1 md:flex-initial text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                phoneEcosystem === "ios"
                  ? "bg-slate-900 border-slate-800 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
               Apple iOS Hub
            </button>
            <button
              onClick={() => {
                setPhoneEcosystem("android");
                fetch("/api/audit-log", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    actor: "Account Owner",
                    action: "ECOSYSTEM_SWITCHED",
                    details: "Switched core mobile hub profile configuration to Google Android (Pixel/Galaxy Hub)."
                  })
                });
              }}
              className={`flex-1 md:flex-initial text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                phoneEcosystem === "android"
                  ? "bg-emerald-600 border-emerald-550 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              🤖 Google Android Hub
            </button>
          </div>
        </div>

        {/* Primary Phone Hub Block */}
        <div id="billi_primary_phone_hub_card" className="bg-gradient-to-r from-blue-50/40 to-slate-50 border border-blue-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/10 ${
              phoneEcosystem === "ios" ? "bg-blue-650" : "bg-emerald-600"
            }`}>
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="relative group cursor-help">
                  <h4 className="text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-1">
                    <span>
                      {phoneEcosystem === "ios" 
                        ? "Primary Mobile Hub (Maya's iPhone 15 Pro)" 
                        : "Primary Mobile Hub (Maya's Samsung S24 Ultra)"
                      }
                    </span>
                    <span className="text-[8.5px] text-blue-500 font-mono font-bold animate-pulse">(Hover for Matrix)</span>
                  </h4>
                  
                  {/* --- PRIMARY PHONE HUB CAPABILITY MATRIX TOOLTIP --- */}
                  <div className="absolute left-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left scale-95 origin-top-left group-hover:scale-100">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-widest block">Core Telemetry Matrix</span>
                        <h5 className="font-sans font-bold text-xs text-white">
                          {phoneEcosystem === "ios" ? "Maya's iPhone Hub" : "Maya's Android Hub"}
                        </h5>
                      </div>
                      <span className="text-[8px] font-mono bg-blue-900/40 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded uppercase">
                        {phoneEcosystem === "ios" ? "iOS 17.4" : "Android 14 (OneUI 6.1)"}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] font-sans">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Core Telemetry Channels</p>
                      
                      <div className="space-y-1.5">
                        {/* GPS */}
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-200">
                              {phoneEcosystem === "ios" ? "Apple CoreLocation Precise GPS" : "Google Play Services Location Fused GPS"}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                            REGISTERED
                          </span>
                        </div>

                        {/* Audio */}
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                          <div className="flex items-center gap-2">
                            <Mic className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-200">
                              {phoneEcosystem === "ios" ? "iOS AudioKit Local Ring-Buffer" : "Android AudioRecord Ambient Classifier"}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                            REGISTERED
                          </span>
                        </div>

                        {/* Motion */}
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                          <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-200">
                              {phoneEcosystem === "ios" ? "Apple CoreMotion High-G Deceleration" : "Android Hardware SensorManager Crash Detection"}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                            REGISTERED
                          </span>
                        </div>

                        {/* BLE */}
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                          <div className="flex items-center gap-2">
                            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-200">
                              {phoneEcosystem === "ios" ? "Apple CoreBluetooth BLE Peripheral Gateway" : "Android BluetoothLeScanner Mesh Gateway"}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                            REGISTERED
                          </span>
                        </div>

                        {/* Custom OS Channel */}
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-200">
                              {phoneEcosystem === "ios" ? "iOS Satellite SOS Emergency Handshake" : "Android Wi-Fi Direct Safe-Zone Mesh Network"}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                            REGISTERED
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">REGISTERED PROFILE CAPABILITIES</span>
                        <div className="flex flex-wrap gap-1">
                          {phoneEcosystem === "ios" ? (
                            ["Dual-Band GPS (L1+L5)", "Local Microphone Ring-Buffer", "Encrypted Cache Storage", "AES-GCM Transmit Pipeline", "Satellite Uplink Handshake"].map((cap, cidx) => (
                              <span key={cidx} className="bg-blue-950/70 border border-blue-900/40 text-blue-300 text-[8px] font-mono px-1.5 py-0.2 rounded">
                                {cap}
                              </span>
                            ))
                          ) : (
                            ["Google FusedLocationProvider", "On-Device Tensor Voice Processing", "Android Keystore Backed Signatures", "Wi-Fi Aware Peer Mesh Tracking", "Hardware Crash Decelerometer"].map((cap, cidx) => (
                              <span key={cidx} className="bg-emerald-950/70 border border-emerald-900/40 text-emerald-300 text-[8px] font-mono px-1.5 py-0.2 rounded">
                                {cap}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                  phoneEcosystem === "ios" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                }`}>
                  Central Hub
                </span>
                <InfoTooltip 
                  title="Primary Mobile Hub"
                  whatIsIt="The user's cellular smartphone, acting as the centralized coordinator and internet uplink for all peripherals."
                  whyIsItThere="To run high-powered geofencing engines, manage local audio record ring-buffers, calculate AI safety scores, and serve as the cellular or satellite gateway to guardians."
                  capabilities={
                    phoneEcosystem === "ios" 
                      ? ["Apple CoreLocation locks", "Secure Enclave encryption", "Satellite SOS emergency routing"]
                      : ["Android Fused Location locks", "Android Keystore encryption", "Wi-Fi Aware Peer Mesh tracking"]
                  }
                  align="center"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono mt-0.5">
                {phoneEcosystem === "ios" 
                  ? "Role: Apple iOS Core (MIC/CAM), Location Engine, Safe Geofence, AI Risk Classification"
                  : "Role: Google Android Core (TENSOR-VOICE), Wi-Fi Aware mesh grid, Location Engine, Safe Geofence"
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ACTIVE & LENT
            </span>
            <span className="text-[8px] font-mono text-slate-400">BATTERY: 82% • SIGNAL: EXCELLENT</span>
          </div>
        </div>

        {/* --- LIVE BLUETOOTH (BLE) ACCESSORY PAIRING STAGE --- */}
        <div id="billi_bluetooth_pairing_stage" className="bg-slate-950 border border-slate-850 p-4.5 rounded-xl text-slate-100 space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Bluetooth className="w-16 h-16 text-blue-500 animate-pulse" />
          </div>

          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wider text-blue-400 flex items-center gap-1.5 uppercase">
                <Bluetooth className="w-4 h-4 text-blue-400" />
                <span>SECURE BLUETOOTH (BLE) ACCESSORY PAIRING SUITE</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Scan and pair secondary wearable accessories to establish direct telemetry and multi-channel safety signals.
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsBleScanning(true);
                setPairingDevice(null);
                setPairingSuccess(null);
                // Auto scan turns off after 4 seconds
                setTimeout(() => {
                  setIsBleScanning(false);
                }, 4000);
              }}
              disabled={isBleScanning}
              className="w-full md:w-auto text-[10px] font-mono font-bold bg-blue-600 hover:bg-blue-550 disabled:bg-slate-800 disabled:text-slate-500 text-white border border-blue-500/30 px-3.5 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isBleScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SCANNING FREQUENCIES...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🔍 SCAN FOR BLUETOOTH SIGNALS</span>
                </>
              )}
            </button>
          </div>

          {/* Scanner Output Grid */}
          <AnimatePresence>
            {isBleScanning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 border-t border-slate-850/60 pt-3"
              >
                <div className="flex items-center gap-2 text-[9px] font-mono text-blue-300 bg-blue-950/40 border border-blue-900/40 p-2 rounded-lg">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping shrink-0" />
                  <span>Direct BLE scanning active. Capturing local beacon handshakes on 2.4GHz secure channels...</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {bleDevices.map((dev) => {
                    const isPaired = customDevices.some(cd => cd.name === dev.name);
                    return (
                      <div key={dev.name} className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[11px] text-white">{dev.name}</span>
                            <span className="text-[8px] font-mono text-slate-500">({dev.address})</span>
                          </div>
                          <p className="text-[9px] font-mono text-slate-400 leading-none">Signal: {dev.signal}</p>
                        </div>

                        {isPaired ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-900/40 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> PAIRED
                          </span>
                        ) : (
                          <button
                            onClick={async () => {
                              setPairingDevice(dev.name);
                              setIsBleScanning(false);
                              
                              // Simulated connection delay
                              await new Promise(resolve => setTimeout(resolve, 1500));
                              
                              const newCustom: CustomDevice = {
                                id: "custom_paired_" + Date.now(),
                                name: dev.name,
                                type: dev.type,
                                status: "Connected",
                                activationSignal: dev.signal,
                                battery: dev.battery,
                                capabilities: dev.capabilities
                              };

                              setCustomDevices(prev => [...prev, newCustom]);
                              setPairingDevice(null);
                              setPairingSuccess(dev.name);
                              
                              // Log pairing to the database
                              await fetch("/api/audit-log", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  actor: "Maya Johnson",
                                  action: "BLE_PAIR_SUCCESS",
                                  details: `Successfully paired new Bluetooth peripheral: ${dev.name} (${dev.address}). Syncing core telemetry channels.`
                                })
                              });

                              // Clear success tag in 3 seconds
                              setTimeout(() => {
                                setPairingSuccess(null);
                              }, 3000);
                            }}
                            className="bg-blue-600 hover:bg-blue-550 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
                          >
                            PAIR ACCESSORY
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {pairingDevice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-blue-950/40 border border-blue-900/50 p-4 rounded-xl text-center space-y-2.5"
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="font-mono text-xs text-blue-200">NEGOTIATING AES-GCM SECURITY ENVELOPE KEYS WITH <strong className="text-white font-bold">{pairingDevice.toUpperCase()}</strong>...</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </motion.div>
            )}

            {pairingSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-950/40 border border-emerald-900/40 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-400 font-extrabold text-sm">✓</div>
                  <div>
                    <span className="font-mono text-emerald-300 font-bold block uppercase tracking-wide">SECURE LINK CONFIRMED</span>
                    <span>Accessories updated. {pairingSuccess} is now streaming local telemetry to core.</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-900/60 border border-emerald-850 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                  SYNC COMPLETE
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Secondary Devices List */}
        <div className="space-y-3 pt-1">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
            SECONDARY ACTIVE PERIPHERAL NODES
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customDevices.map((device, idx) => {
              const DevIcon = device.type === "watch" ? Watch : device.type === "glasses" ? Glasses : Radio;
              
              // Capability check booleans
              const hasGps = device.type === "watch" || device.capabilities.some(c => c.toLowerCase().includes("gps") || c.toLowerCase().includes("location") || c.toLowerCase().includes("coordinates"));
              const hasMic = device.type === "glasses" || device.capabilities.some(c => c.toLowerCase().includes("mic") || c.toLowerCase().includes("audio") || c.toLowerCase().includes("voice") || c.toLowerCase().includes("vocal"));
              const hasMotion = device.type === "watch" || device.capabilities.some(c => c.toLowerCase().includes("sensor") || c.toLowerCase().includes("accelerometer") || c.toLowerCase().includes("fall") || c.toLowerCase().includes("impact") || c.toLowerCase().includes("motion"));
              const hasBle = device.type === "tag" || device.capabilities.some(c => c.toLowerCase().includes("ble") || c.toLowerCase().includes("proximity") || c.toLowerCase().includes("beacon") || c.toLowerCase().includes("bluetooth") || c.toLowerCase().includes("low-latency") || c.toLowerCase().includes("keyfob"));
              const hasHaptic = device.type === "tag" || device.type === "watch" || device.capabilities.some(c => c.toLowerCase().includes("haptic") || c.toLowerCase().includes("vibrate") || c.toLowerCase().includes("tap") || c.toLowerCase().includes("vibration") || c.toLowerCase().includes("feedback"));

              return (
                <div 
                  key={device.id} 
                  className="bg-slate-50/70 border border-slate-150 rounded-xl p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                      <DevIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="relative group cursor-help inline-block">
                        <h4 className="text-xs font-bold text-slate-850 font-sans hover:text-blue-600 transition-colors flex items-center gap-1">
                          <span>{device.name}</span>
                          <span className="text-[8.5px] text-blue-500 font-mono font-bold animate-pulse">(Info)</span>
                        </h4>

                        {/* --- PERIPHERAL CAPABILITY MATRIX TOOLTIP --- */}
                        <div className="absolute left-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left scale-95 origin-top-left group-hover:scale-100">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                            <div>
                              <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-widest block">Core Telemetry Matrix</span>
                              <h5 className="font-sans font-bold text-xs text-white">{device.name}</h5>
                            </div>
                            <span className="text-[8px] font-mono bg-blue-900/40 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded uppercase">
                              {device.type}
                            </span>
                          </div>

                          <div className="space-y-2 text-[11px] font-sans">
                            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Registered Core Hardware Channels</p>
                            
                            <div className="space-y-1.5">
                              {/* GPS */}
                              <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                                <div className="flex items-center gap-2">
                                  <MapPin className={`w-3.5 h-3.5 ${hasGps ? "text-emerald-400" : "text-slate-600"}`} />
                                  <span className={hasGps ? "text-slate-200" : "text-slate-500 line-through"}>GPS Precision Tracking</span>
                                </div>
                                <span className={`text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold ${
                                  hasGps ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-slate-950 text-slate-600"
                                }`}>
                                  {hasGps ? "REGISTERED" : "N/A"}
                                </span>
                              </div>

                              {/* Microphone */}
                              <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                                <div className="flex items-center gap-2">
                                  <Mic className={`w-3.5 h-3.5 ${hasMic ? "text-emerald-400" : "text-slate-600"}`} />
                                  <span className={hasMic ? "text-slate-200" : "text-slate-500 line-through"}>Microphone / Audio</span>
                                </div>
                                <span className={`text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold ${
                                  hasMic ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-slate-950 text-slate-600"
                                }`}>
                                  {hasMic ? "REGISTERED" : "N/A"}
                                </span>
                              </div>

                              {/* Motion */}
                              <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                                <div className="flex items-center gap-2">
                                  <Activity className={`w-3.5 h-3.5 ${hasMotion ? "text-emerald-400" : "text-slate-600"}`} />
                                  <span className={hasMotion ? "text-slate-200" : "text-slate-500 line-through"}>Motion & Fall Sensor</span>
                                </div>
                                <span className={`text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold ${
                                  hasMotion ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-slate-950 text-slate-600"
                                }`}>
                                  {hasMotion ? "REGISTERED" : "N/A"}
                                </span>
                              </div>

                              {/* BLE */}
                              <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                                <div className="flex items-center gap-2">
                                  <Wifi className={`w-3.5 h-3.5 ${hasBle ? "text-emerald-400" : "text-slate-600"}`} />
                                  <span className={hasBle ? "text-slate-200" : "text-slate-500 line-through"}>BLE Beacon / Proximity</span>
                                </div>
                                <span className={`text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold ${
                                  hasBle ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-slate-950 text-slate-600"
                                }`}>
                                  {hasBle ? "REGISTERED" : "N/A"}
                                </span>
                              </div>

                              {/* Haptic */}
                              <div className="flex items-center justify-between py-0.5 border-b border-slate-850/50">
                                <div className="flex items-center gap-2">
                                  <Sparkles className={`w-3.5 h-3.5 ${hasHaptic ? "text-emerald-400" : "text-slate-600"}`} />
                                  <span className={hasHaptic ? "text-slate-200" : "text-slate-500 line-through"}>Haptic Status Alerts</span>
                                </div>
                                <span className={`text-[8px] font-mono px-1 py-0.2 rounded uppercase font-bold ${
                                  hasHaptic ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-slate-950 text-slate-600"
                                }`}>
                                  {hasHaptic ? "REGISTERED" : "N/A"}
                                </span>
                              </div>
                            </div>

                            {/* Detail tags list */}
                            <div className="pt-2 border-t border-slate-800">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">REGISTERED PROFILE CAPABILITIES</span>
                              <div className="flex flex-wrap gap-1">
                                {device.capabilities && device.capabilities.map((cap, cidx) => (
                                  <span key={cidx} className="bg-blue-950/70 border border-blue-900/40 text-blue-300 text-[8px] font-mono px-1.5 py-0.2 rounded">
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-[8px] font-mono text-slate-450 mt-0.5">
                        Trigger: {device.activationSignal}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {device.capabilities && device.capabilities.map((cap, cidx) => (
                          <span key={cidx} className="bg-blue-50/70 text-blue-800 border border-blue-150/50 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-md">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        ✓ CONNECTED
                      </span>
                      <p className="text-[8px] font-mono text-slate-400 mt-0.5">
                        BATT: {device.battery}%
                      </p>
                    </div>

                    {/* Delete button if custom added */}
                    {device.id.startsWith("custom_") && (
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer"
                        title="Delete Device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. ADD DEVICE MODAL OVERLAY */}
      <AnimatePresence>
        {showAddDeviceModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative"
            >
              <div className="space-y-1 pb-4 border-b border-slate-150">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Register Compatible Accessory</span>
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Link wearable accessory or external hardware sensors to Billi's local phone signaling hub.
                </p>
              </div>

              <form onSubmit={handleAddDevice} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
                    Device Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="e.g., Apple Watch Ultra 2, Garmin Fenix, BLE Ring"
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-xl bg-slate-50/70 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
                      Device Type
                    </label>
                    <select
                      value={newDeviceType}
                      onChange={(e) => setNewDeviceType(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 p-2.5 rounded-xl bg-slate-50/70 focus:outline-none focus:border-blue-500"
                    >
                      <option value="watch">Smart Watch</option>
                      <option value="glasses">Smart Glasses</option>
                      <option value="tag">BLE Hardware Tag</option>
                      <option value="other">Other Peripheral</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
                      Initial Status
                    </label>
                    <div className="w-full text-xs border border-slate-100 p-2.5 rounded-xl bg-slate-100 text-slate-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span>Ready & Synced</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
                    Activation Signal / Hotkey Gesture
                  </label>
                  <input
                    type="text"
                    value={newDeviceSignal}
                    onChange={(e) => setNewDeviceSignal(e.target.value)}
                    placeholder="e.g., Double click power button, Squeeze band"
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-xl bg-slate-50/70 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-500 leading-normal font-sans">
                    <strong>Billi Failsafe:</strong> Secondary accessories pair via low-energy secure Bluetooth (BLE) or Wi-Fi Direct. Signals are encrypted with AES-GCM and verified through standard biometric checks.
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDeviceModal(false)}
                    className="px-4 py-2 text-xs font-semibold hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Register Accessory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
