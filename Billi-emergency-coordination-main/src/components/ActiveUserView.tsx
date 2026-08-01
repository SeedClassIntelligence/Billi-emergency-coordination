/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import InfoTooltip from "./InfoTooltip";
import { 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  Battery, 
  Lock, 
  Mic, 
  X, 
  MapPin, 
  KeyRound, 
  CircleAlert, 
  CheckCircle2, 
  UserRoundCheck,
  Compass,
  Bluetooth,
  Radio,
  Cpu,
  Activity,
  ShieldCheck,
  Volume2
} from "lucide-react";
import { Incident, Profile } from "../types";

interface ActiveUserViewProps {
  incident: Incident | null;
  profile: Profile | null;
  onActivate: (method: string) => void;
  onSimulateTick: (params: { triggerDuress?: boolean }) => void;
  onCloseIncident: (closedBy: string, notes: string, reason: string) => void;
}

export default function ActiveUserView({
  incident,
  profile,
  onActivate,
  onSimulateTick,
  onCloseIncident
}: ActiveUserViewProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pinMode, setPinMode] = useState<"none" | "normal" | "duress">("none");
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

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
    modeLabel = "Estimated Trajectory";
  } else if (deg.gpsLost || deg.phoneOff) {
    confidence = "MEDIUM";
    modeLabel = deg.phoneOff ? "Apple Watch Wearable" : "Estimated Wi-Fi/Cellular";
  } else if (deg.batteryCrit) {
    confidence = "MEDIUM";
    modeLabel = "Low Power GPS";
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

  useEffect(() => {
    if (isHolding) {
      holdInterval.current = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(holdInterval.current!);
            setIsHolding(false);
            onActivate("manual_long_press");
            return 0;
          }
          return prev + 5;
        });
      }, 80);
    } else {
      if (holdInterval.current) {
        clearInterval(holdInterval.current);
      }
      setHoldProgress(0);
    }

    return () => {
      if (holdInterval.current) clearInterval(holdInterval.current);
    };
  }, [isHolding, onActivate]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    if (pinValue === "1234") {
      // Normal safe cancel
      onCloseIncident("Maya Johnson", "Maya entered safety pin. Reunited safe.", "User marked safe");
      setPinValue("");
      setPinMode("none");
      setStatusMessage("Emergency successfully resolved. Marked safe.");
      setTimeout(() => setStatusMessage(""), 4000);
    } else if (pinValue === "9999") {
      // Duress cancel (silent continuation)
      onSimulateTick({ triggerDuress: true });
      setPinValue("");
      setPinMode("none");
      // Feign cancellation on child screen
      setStatusMessage("Alert canceled. Guardian notified.");
      setTimeout(() => setStatusMessage(""), 4000);
    } else {
      setPinError("Invalid security PIN. Try again.");
      setPinValue("");
    }
  };

  const currentLoc = incident?.currentLocation;

  return (
    <div id="billi_child_device_view" className="flex flex-col h-full bg-white text-slate-800 font-sans p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Background Ambience */}
      {incident && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06)_0%,transparent_70%)] animate-pulse pointer-events-none" />
      )}

      {/* Header Indicators */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-150 z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${incident ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
            {incident ? "EMERGENCY BROADCASTING" : "BILLI DEVICE ARMED"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-450 text-xs font-mono">
          <div className="flex items-center gap-1">
            <Battery className={`w-4 h-4 ${incident?.deviceBattery && incident.deviceBattery < 15 ? "text-red-500 animate-bounce" : "text-slate-450"}`} />
            <span>{incident ? `${incident.deviceBattery}%` : "82%"}</span>
          </div>
          <div className="flex items-center gap-1">
            {incident?.deviceSignal === "offline" ? (
              <WifiOff className="w-4 h-4 text-red-500" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-500" />
            )}
            <span className="uppercase font-semibold">{incident ? incident.deviceSignal : "good"}</span>
          </div>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col justify-between py-6 z-10">
        
        {/* Status Messaging Banner */}
        <AnimatePresence mode="wait">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-250 text-emerald-850 text-xs px-4 py-3 rounded-lg flex items-center gap-2.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Display State */}
        {!incident ? (
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-2">Billi Safety Charm</h2>
              <p className="text-xs text-slate-450 max-w-xs mx-auto leading-relaxed">
                Secure wearable simulator. In emergency, press and hold the central button for 2 seconds to alert your safety plan.
              </p>
            </motion.div>

            {/* Interactive Button Charm */}
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Decorative Ring */}
              <div className="absolute w-48 h-48 rounded-full border border-slate-100 animate-pulse pointer-events-none" />
              <div className="absolute w-40 h-40 rounded-full border border-slate-150 animate-ping duration-1000 pointer-events-none" />

              {/* Progress SVG Overlay */}
              <svg className="absolute w-36 h-36 transform -rotate-90 pointer-events-none">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="transparent"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#3b82f6"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="402"
                  strokeDashoffset={402 - (402 * holdProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              {/* Central Button */}
              <motion.button
                id="billi_charm_trigger"
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 shadow-md z-10 transition-colors border-2 ${
                  isHolding 
                    ? "bg-blue-600 border-blue-500 scale-95 text-white" 
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 active:bg-slate-200 active:scale-95 cursor-pointer text-slate-800"
                }`}
                whileHover={{ scale: 1.03 }}
              >
                <ShieldAlert className={`w-8 h-8 ${isHolding ? "text-white animate-bounce" : "text-blue-600 animate-pulse"}`} />
                <span className="text-[10px] font-mono font-bold tracking-widest">
                  {isHolding ? "HOLDING..." : "SOS PRESS"}
                </span>
              </motion.button>
            </div>

            <div className="text-center mt-6">
              <span className="inline-block text-[10px] font-mono px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-500 font-bold uppercase tracking-wide">
                HOLD BTN FOR 2 SECONDS
              </span>
            </div>

            {/* BILLI SMART TAG & INTELLIGENCE DECK (Point 7, 13, 14, 5) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Point 7: Tag Integration */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs text-left">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-150">
                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span>Billi Tag Connected</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-1 font-mono text-[9px] text-slate-500">
                  <div>
                    <p className="text-slate-400 font-bold">BATTERY</p>
                    <p className="text-slate-800 font-black">92%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">STATUS</p>
                    <p className="text-emerald-700 font-black">Ready</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">SIGNAL</p>
                    <p className="text-slate-855 font-black">Now</p>
                  </div>
                </div>
                <button
                  onClick={() => onActivate("billi_tag")}
                  className="w-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 font-sans text-[10px] font-bold py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-98"
                >
                  <Cpu className="w-3 h-3 text-blue-500 animate-pulse" />
                  <span>Press Tag to Activate</span>
                </button>
              </div>

              {/* Point 14 & 13: Billi Aware & Device Status */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs text-left">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-150">
                  <span className="text-[10px] font-mono font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>Billi Aware™ Engine</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250 animate-pulse">
                    COGNITIVE LIVE
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Environmental Context */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                      🔊 ENVIRONMENTAL CONTEXT
                    </span>
                    <div className="bg-white border border-slate-150 p-2 rounded-lg flex justify-between items-center text-[10px] shadow-2xs">
                      <div className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-slate-500" />
                        <span className="font-semibold text-slate-700">Ambient Noise</span>
                      </div>
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        incident ? "bg-red-50 text-red-650" : "bg-slate-100 text-slate-600"
                      }`}>
                        {incident ? "Elevated (72dB)" : "Quiet (42dB)"}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-150 p-2 rounded-lg flex justify-between items-center text-[10px] shadow-2xs">
                      <div className="flex items-center gap-1">
                        <Compass className="w-3 h-3 text-slate-500 animate-spin-slow" />
                        <span className="font-semibold text-slate-700">Motion State</span>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        {incident && incident.currentLocation?.speed > 0 
                          ? `Moving (${incident.currentLocation.speed} mph)` 
                          : "Stationary"}
                      </span>
                    </div>
                  </div>

                  {/* Safe Zones Evaluation */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                      📍 SAFE ZONES MONITOR
                    </span>
                    <div className="bg-white border border-slate-150 p-2 rounded-lg flex justify-between items-center text-[10px] shadow-2xs">
                      <span className="font-semibold text-slate-700">Geofence Status</span>
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        incident && incident.activationMethod === "geofence_exit"
                          ? "bg-red-50 text-red-650 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {incident && incident.activationMethod === "geofence_exit" 
                          ? "BREACH DETECTED" 
                          : "INSIDE PERIMETER"}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-150 p-2 rounded-lg text-[9px] text-slate-500 font-mono shadow-2xs space-y-0.5">
                      <p className="flex justify-between">
                        <span>• Pine Middle School:</span>
                        <span className="font-bold text-emerald-600">Active (100m)</span>
                      </p>
                      <p className="flex justify-between">
                        <span>• Home Zone:</span>
                        <span className="font-bold text-slate-500">Standby (150m)</span>
                      </p>
                    </div>
                  </div>

                  {/* Nearby Support Connectivity */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                      🤝 SUPPORT CONNECTIVITY
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-white border border-slate-150 p-1.5 rounded-lg text-center shadow-2xs">
                        <span className="text-[8px] text-slate-400 font-bold block">TRUST CIRCLE</span>
                        <span className="text-[10px] font-mono font-extrabold text-blue-600">4 Synced</span>
                      </div>
                      <div className="bg-white border border-slate-150 p-1.5 rounded-lg text-center shadow-2xs">
                        <span className="text-[8px] text-slate-400 font-bold block">SAFETY UPLINK</span>
                        <span className="text-[10px] font-mono font-extrabold text-emerald-600">Campus OK</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hardware indicator pills */}
                <div className="flex gap-1 justify-between pt-1">
                  <span className="text-[8px] font-mono font-bold bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-600 flex items-center gap-0.5" title="GPS is Locked">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> GPS
                  </span>
                  <span className="text-[8px] font-mono font-bold bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-600 flex items-center gap-0.5" title="Bluetooth is Active">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> BLE
                  </span>
                  <span className="text-[8px] font-mono font-bold bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-600 flex items-center gap-0.5" title="Microphone is Armed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> MIC
                  </span>
                  <span className="text-[8px] font-mono font-bold bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-600 flex items-center gap-0.5" title="Camera is Ready">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> CAM
                  </span>
                </div>
              </div>
            </div>

            {/* Active Voice Activation Triggers */}
            {profile?.voicePhrases && profile.voicePhrases.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-150">
                <p className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase text-center mb-2 flex items-center justify-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  <span>SILENT VOICE TRIGGERS ACTIVE</span>
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center max-h-[85px] overflow-y-auto py-1 px-1">
                  {profile.voicePhrases.map((phrase, idx) => (
                    <span 
                      key={idx} 
                      className="bg-slate-50 border border-slate-150 text-slate-600 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-md italic hover:bg-slate-100 transition-colors"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Active Geofence Safe Zones */}
            {profile?.safeZones && profile.safeZones.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-150">
                <p className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase text-center mb-2 flex items-center justify-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
                  <span>GEOFENCE PROTECTION ACTIVE</span>
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center max-h-[85px] overflow-y-auto py-1 px-1">
                  {profile.safeZones.map((zone, idx) => (
                    <span 
                      key={idx} 
                      className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 text-left ${
                        zone.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                          : "bg-slate-50 text-slate-400 border-slate-150 line-through"
                      }`}
                      title={zone.address || undefined}
                    >
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      <span>{zone.name} ({zone.radius}m)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between mt-2">
            
            {/* Active Monitoring State */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-red-700 text-xs font-mono font-semibold animate-pulse mb-3">
                <Mic className="w-3.5 h-3.5 text-red-500 animate-spin" />
                <span>MICROPHONE RECORDING ACTIVE</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-800">Emergency Active</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Evidence uploads and live location are streaming to your trusted contacts securely in segments.
              </p>
            </div>

            {/* Active Triggering Device Display for Child View */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 my-2 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[8.5px] font-mono text-red-500 uppercase tracking-widest block font-bold flex items-center gap-1">
                    <span>Triggering Device Node</span>
                    <InfoTooltip 
                      title="Triggering Device Node"
                      whatIsIt="The physical wearable or software gesture that initiated this emergency SOS."
                      whyIsItThere="To let both the user and the coordinator know exactly which physical node (Apple Watch, keyfob, phone hold) broadcasted the start of the emergency event."
                      capabilities={["Instant Bluetooth pairing", "Vocal phrase wake", "Double-button squeeze"]}
                      align="left"
                    />
                  </span>
                  <p className="text-xs font-mono font-extrabold text-red-900 uppercase tracking-wide">
                    {incident.activationMethod.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <span className="text-[8px] bg-red-100 text-red-800 border border-red-300 font-mono font-bold px-2 py-0.5 rounded uppercase">
                Active
              </span>
            </div>

            {/* --- Location Confidence Panel --- */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs text-left my-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-150">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location Confidence</span>
                  <InfoTooltip 
                    title="Location Confidence"
                    whatIsIt="A real-time scoring of your position's accuracy based on available tracking hardware."
                    whyIsItThere="To ensure coordinators can identify whether you are actively on a multi-constellation live GPS tracking feed, or if your phone went offline and they are tracking you on fallback BLE or trajectory vectors."
                    capabilities={["GPS Signal integrity checking", "Dynamic triangulation backup", "Trajectory vectoring"]}
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
                  <div className="bg-red-50/50 border border-red-150 p-2 rounded-lg text-red-850 text-left">
                    <p className="font-bold">All Live Location Sources: Unavailable</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Operating on estimated fallback trajectory.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] text-left">
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
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs text-left my-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-150">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                  <span>Current Awareness</span>
                  <InfoTooltip 
                    title="Current Awareness"
                    whatIsIt="A high-level metric showing how healthy your communication links are with your responder network."
                    whyIsItThere="To reassure you that coordinators are actively connected to your feeds, and that emergency data and audio buffers are streaming or securely caching."
                    capabilities={["Encrypted evidence streaming", "Acknowledge handshake check", "Hardware health heartbeat"]}
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

            {/* Active Response Layers Summary (Point 1) */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 mb-4 text-left">
              <span className="text-[9px] font-mono font-bold text-blue-400 tracking-wider uppercase block">
                ⚡ Active Multi-Layer Orchestration
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[8.5px] font-mono text-slate-300">
                <div className="bg-slate-850 p-1.5 rounded border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-slate-500 font-bold">NET CIRCLE</span>
                  <span className="text-emerald-400 font-bold uppercase">ALER_DISP</span>
                </div>
                <div className="bg-slate-850 p-1.5 rounded border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-slate-500 font-bold">LIVE TELEM</span>
                  <span className="text-emerald-400 font-bold uppercase">LIVE_ON</span>
                </div>
                <div className="bg-slate-850 p-1.5 rounded border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-slate-500 font-bold">MIC STREAM</span>
                  <span className="text-emerald-400 font-bold uppercase">BUFFERING</span>
                </div>
                <div className="bg-slate-850 p-1.5 rounded border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-slate-500 font-bold">TIMELINE</span>
                  <span className="text-emerald-400 font-bold uppercase">LOCKED</span>
                </div>
                <div className="bg-slate-850 p-1.5 rounded border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-slate-500 font-bold">EMS PORTAL</span>
                  <span className="text-emerald-400 font-bold uppercase">STANDBY</span>
                </div>
                <div className="bg-slate-850 p-1.5 rounded border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-slate-500 font-bold">GEMINI AI</span>
                  <span className="text-blue-400 font-bold uppercase">COORDINATING</span>
                </div>
              </div>
            </div>

            {/* Cancel Panel Selector */}
            {pinMode === "none" ? (
              <motion.button
                onClick={() => setPinMode("normal")}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                whileTap={{ scale: 0.98 }}
              >
                <Lock className="w-4 h-4 text-red-500" />
                <span>ENTER SECURITY PIN TO CANCEL</span>
              </motion.button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Enter Safety / Duress PIN</span>
                  </span>
                  <button 
                    onClick={() => { setPinMode("none"); setPinError(""); setPinValue(""); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-3">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-white text-slate-850 text-center tracking-widest text-lg font-bold border border-slate-200 focus:border-red-500 focus:outline-none py-2 rounded-lg"
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 font-mono">
                      <CircleAlert className="w-3.5 h-3.5" />
                      <span>{pinError}</span>
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-550 text-white font-semibold text-xs py-2 rounded-lg cursor-pointer shadow-sm"
                    >
                      Verify PIN
                    </button>
                  </div>
                </form>
                <div className="text-[9px] text-slate-450 leading-normal text-center">
                  Demo Security Code: <span className="text-slate-700 font-bold">1234</span> (Safe) or <span className="text-slate-700 font-bold">9999</span> (Duress).
                </div>
              </motion.div>
            )}

          </div>
        )}
      </div>

      {/* Safety Info Overlay */}
      <div className="mt-4 pt-3 border-t border-slate-150 text-[10px] font-mono text-slate-400 flex justify-between">
        <span>DEVICE: BILLI_SLATE_V1</span>
        <span>ID: {incident?.userId || "user_maya_11"}</span>
      </div>
    </div>
  );
}
