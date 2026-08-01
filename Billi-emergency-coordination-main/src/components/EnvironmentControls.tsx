/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Play, 
  RotateCcw, 
  BatteryLow, 
  WifiOff, 
  ShieldAlert, 
  Terminal, 
  Clock, 
  MapPin, 
  ChevronRight,
  Database,
  History,
  Activity,
  Compass,
  Watch,
  Volume2
} from "lucide-react";
import { Incident, AuditLog } from "../types";

interface EnvironmentControlsProps {
  incident: Incident | null;
  onActivate: (method: string) => void;
  onSimulateTick: (params: { 
    triggerDuress?: boolean; 
    triggerBatteryCrit?: boolean; 
    lossOfSignal?: boolean; 
    gpsLost?: boolean;
    phoneOff?: boolean;
    cellLost?: boolean;
    watchDisconnected?: boolean;
    tagDisconnected?: boolean;
    batteryCrit?: boolean;
  }) => void;
  onReset: () => void;
  onSwitchTab?: (tab: 'child' | 'guardian' | 'responder' | 'devices') => void;
}

export default function EnvironmentControls({
  incident,
  onActivate,
  onSimulateTick,
  onReset,
  onSwitchTab
}: EnvironmentControlsProps) {
  const [batteryCrit, setBatteryCrit] = useState(false);
  const [signalDisrupted, setSignalDisrupted] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const handleStartXPrizeDemo = () => {
    setIsDemoRunning(true);
    setDemoStep(1);
    // T+0s: Activate voice phrase & switch to Child View
    if (onSwitchTab) onSwitchTab('child');
    onActivate("voice_phrase");

    // T+6s: Mom responds & switch to Guardian Dashboard View
    setTimeout(() => {
      setDemoStep(2);
      if (onSwitchTab) onSwitchTab('guardian');
      fetch("/api/incident/update-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: "contact_mom", respondStatus: "responding" })
      }).catch(console.error);
    }, 6000);

    // T+14s: Phone drops offline & switch to Billi Device Network View
    setTimeout(() => {
      setDemoStep(3);
      if (onSwitchTab) onSwitchTab('devices');
      onSimulateTick({ phoneOff: true, lossOfSignal: true });
    }, 14000);

    // T+22s: Campus Security dispatches & switch to Responder View
    setTimeout(() => {
      setDemoStep(4);
      if (onSwitchTab) onSwitchTab('responder');
      fetch("/api/incident/update-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: "contact_officer", respondStatus: "responding" })
      }).catch(console.error);
    }, 22000);

    // T+30s: Return to Guardian View & verify resolution
    setTimeout(() => {
      setDemoStep(5);
      if (onSwitchTab) onSwitchTab('guardian');
      setIsDemoRunning(false);
    }, 30000);
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/audit-logs");
      if (response.ok) {
        const logs = await response.json();
        setAuditLogs(logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    // Poll audit logs to keep them updated
    const interval = setInterval(fetchAuditLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateTick = () => {
    onSimulateTick({
      triggerBatteryCrit: batteryCrit,
      lossOfSignal: signalDisrupted
    });
  };

  return (
    <div id="sim_environment_controls" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 text-slate-800 shadow-sm relative">
      
      {/* Title */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-150">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase font-display">Simulator Cockpit</h3>
        </div>
        <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold uppercase">
          CONTROLLER
        </span>
      </div>

      {/* 🏆 XPRIZE JUDGE DEMO AUTOMATED CONTROLLER CARD */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xl space-y-3 border border-blue-700/50 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <div>
              <h4 className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">XPRIZE JUDGE DEMO MODE</h4>
              <p className="text-[9.5px] text-slate-300 font-sans">Automated 30-Second Crisis & Multi-Persona Coordination Simulation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartXPrizeDemo}
            disabled={isDemoRunning}
            className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition-all uppercase shadow-xs ${
              isDemoRunning
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/30 hover:scale-[1.02]"
            }`}
          >
            {isDemoRunning ? "▶ DEMO RUNNING..." : "🏆 RUN 30S DEMO"}
          </button>
        </div>

        {isDemoRunning && (
          <div className="space-y-2 pt-2 border-t border-blue-800/80 font-mono text-[10px]">
            <div className="flex justify-between items-center text-amber-300 font-bold">
              <span>DEMO STEP {demoStep} / 5</span>
              <span>
                {demoStep === 1 ? "T+0s: Silent Voice Code Spoken" :
                 demoStep === 2 ? "T+6s: Guardian Evelyn Responds" :
                 demoStep === 3 ? "T+14s: Phone Lost (BLE Mesh Fallback)" :
                 demoStep === 4 ? "T+22s: Security Officer Dispatched" :
                 "T+30s: Incident Resolution Verified"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-blue-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500" 
                style={{ width: `${(demoStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Activation Selectors (If idle) */}
      {!incident ? (
        <div className="space-y-3.5">
          <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">Choose Demo Trigger Type (7 Activation Methods):</p>
          <div className="grid grid-cols-1 gap-2">
            
            {/* 1. Emergency Button */}
            <button
              onClick={() => onActivate("manual_long_press")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-500 text-left p-2.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">1. Emergency SOS Button</p>
                  <p className="text-[9px] text-slate-400">Physical long-press trigger on wearable</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* 2. Speak Silent Code Word */}
            <button
              onClick={() => onActivate("voice_phrase")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-500 text-left p-2.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-violet-500 animate-bounce" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">2. Silent Code Word Voice Trigger</p>
                  <p className="text-[9px] text-slate-400">Spoke confidential safeword: "Blue Folder"</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* 3. Press Billi Smart Tag */}
            <button
              onClick={() => onActivate("billi_tag")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 text-left p-2.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-blue-600 animate-pulse" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">3. Press Billi Smart Tag</p>
                  <p className="text-[9px] text-slate-400">Hardware button press on tag accessory</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* 4. Smart Watch Link */}
            <button
              onClick={() => onActivate("watch_link")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500 text-left p-2.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Watch className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">4. Smart Watch Link Linkage</p>
                  <p className="text-[9px] text-slate-400">Heart rate spike or watch shortcut</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* 5. Triple Click Shortcut */}
            <button
              onClick={() => onActivate("accessibility_shortcut")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-700 text-left p-2.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">5. Accessibility Shortcut Trigger</p>
                  <p className="text-[9px] text-slate-400">Triple-click volume key combination</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-850 group-hover:translate-x-1 transition-all" />
            </button>

            {/* 6. Geofence Exit Breach */}
            <button
              onClick={() => onActivate("geofence_exit")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500 text-left p-2.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">6. Geofence Exit Breach</p>
                  <p className="text-[9px] text-slate-400">Safe zones perimeter violation event</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* 7. Automated Fall Trigger */}
            <button
              onClick={() => onActivate("fall_detected")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-500 text-left p-2.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">7. Automated Fall Detector</p>
                  <p className="text-[9px] text-slate-400">Inertial sensor collision impact</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </button>

          </div>
        </div>
      ) : (
        /* Dynamic controls during active incident */
        <div className="space-y-5">
          <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">Simulate Environmental Events:</p>

          <div className="space-y-4">
            
            {/* Step coordinate updates */}
            <button
              onClick={handleSimulateTick}
              className="w-full bg-amber-600 hover:bg-amber-550 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Step Simulation (Move Path Coordinates)</span>
            </button>

            {/* Simulated environmental sliders */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. GPS Signal Lost */}
              <button
                onClick={() => onSimulateTick({ gpsLost: !incident?.degradation?.gpsLost })}
                className={`flex flex-col items-center justify-center border p-3 rounded-xl gap-1.5 transition-all text-center cursor-pointer shadow-sm ${
                  incident?.degradation?.gpsLost 
                    ? "bg-red-50 border-red-300 text-red-650 font-bold" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-[11px] font-bold">GPS Signal Lost</span>
              </button>

              {/* 2. Phone Powered Off */}
              <button
                onClick={() => onSimulateTick({ phoneOff: !incident?.degradation?.phoneOff })}
                className={`flex flex-col items-center justify-center border p-3 rounded-xl gap-1.5 transition-all text-center cursor-pointer shadow-sm ${
                  incident?.degradation?.phoneOff 
                    ? "bg-red-50 border-red-300 text-red-650 font-bold" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-[11px] font-bold">Phone Powered Off</span>
              </button>

              {/* 3. Cellular Connection Lost */}
              <button
                onClick={() => onSimulateTick({ cellLost: !incident?.degradation?.cellLost })}
                className={`flex flex-col items-center justify-center border p-3 rounded-xl gap-1.5 transition-all text-center cursor-pointer shadow-sm ${
                  incident?.degradation?.cellLost 
                    ? "bg-amber-50 border-amber-300 text-amber-700 font-bold" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <WifiOff className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-bold">Cell Signal Lost</span>
              </button>

              {/* 4. Watch Disconnected */}
              <button
                onClick={() => onSimulateTick({ watchDisconnected: !incident?.degradation?.watchDisconnected })}
                className={`flex flex-col items-center justify-center border p-3 rounded-xl gap-1.5 transition-all text-center cursor-pointer shadow-sm ${
                  incident?.degradation?.watchDisconnected 
                    ? "bg-orange-50 border-orange-300 text-orange-700 font-bold" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Watch className="w-4 h-4 text-orange-500" />
                <span className="text-[11px] font-bold">Watch Offline</span>
              </button>

              {/* 5. BLE Tag Disconnected */}
              <button
                onClick={() => onSimulateTick({ tagDisconnected: !incident?.degradation?.tagDisconnected })}
                className={`flex flex-col items-center justify-center border p-3 rounded-xl gap-1.5 transition-all text-center cursor-pointer shadow-sm ${
                  incident?.degradation?.tagDisconnected 
                    ? "bg-purple-50 border-purple-300 text-purple-700 font-bold" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Database className="w-4 h-4 text-purple-600" />
                <span className="text-[11px] font-bold">BLE Tag Offline</span>
              </button>

              {/* 6. Battery Critically Low */}
              <button
                onClick={() => onSimulateTick({ batteryCrit: !incident?.degradation?.batteryCrit })}
                className={`flex flex-col items-center justify-center border p-3 rounded-xl gap-1.5 transition-all text-center cursor-pointer shadow-sm ${
                  incident?.degradation?.batteryCrit 
                    ? "bg-red-50 border-red-300 text-red-650 animate-pulse font-bold" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <BatteryLow className="w-4 h-4 text-red-500" />
                <span className="text-[11px] font-bold">Battery Low (8%)</span>
              </button>
            </div>

            {/* Reset Protocol button */}
            <button
              onClick={onReset}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Abort & Reset Simulation</span>
            </button>

          </div>
        </div>
      )}

      {/* Audit logs history */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase pb-1 border-b border-slate-150">
          <History className="w-4 h-4 text-slate-400" />
          <span>Core Engine Audit Logs</span>
        </h4>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl h-44 overflow-y-auto space-y-2 font-mono text-[10px] text-slate-600">
          {auditLogs.map((log, index) => (
            <div key={index} className="border-b border-slate-150 pb-2 last:border-0 last:pb-0 space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-300" />
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-slate-500 font-bold uppercase">{log.actor}</span>
              </div>
              <p className="text-slate-700">
                <span className="text-blue-600 font-bold uppercase mr-1">[{log.action}]</span> 
                {log.details}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
