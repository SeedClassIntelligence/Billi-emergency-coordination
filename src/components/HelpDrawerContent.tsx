import React, { useState } from "react";
import { 
  Search, 
  Check, 
  HelpCircle, 
  BookOpen, 
  Radio, 
  Activity, 
  ShieldAlert, 
  Compass, 
  Users, 
  Mic, 
  Volume2, 
  Sparkles,
  MapPin,
  Lock
} from "lucide-react";

interface GlossaryTerm {
  term: string;
  category: "Core Engine" | "Sensors & Telemetry" | "Security & Sovereignty";
  definition: string;
  usage: string;
  whyItMatters: string;
  icon: React.ReactNode;
}

export default function HelpDrawerContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [checklist, setChecklist] = useState({
    paired: true,
    safeZone: false,
    testSos: false,
    telemetryVerified: true,
    guardiansNotified: false
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const glossaryTerms: GlossaryTerm[] = [
    {
      term: "Telemetry",
      category: "Sensors & Telemetry",
      definition: "Real-time streaming metrics including high-precision GPS locks, dual-button tactile trigger pulses, BLE beacon advertisement signals, active audio buffers, and battery levels aggregate from physical devices.",
      usage: "Processed continuously by the safety mesh, converting hardware accessories into live safety indicators.",
      whyItMatters: "Allows guardians to view reliable coordinates without relying on single carrier connectivity.",
      icon: <Radio className="w-4 h-4 text-emerald-400" />
    },
    {
      term: "Incident Engine",
      category: "Core Engine",
      definition: "The active-duty safety orchestrator. Controls live event states from original SOS trigger to resolution, broadcasting instant SMS push feeds, and synchronizing coordinates between primary and backup guardians.",
      usage: "Coordinates all physical, local, and system-level emergency states when an SOS is active.",
      whyItMatters: "Consolidates emergency response into a shared incident card with unified actions, preventing fragmented alerts.",
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />
    },
    {
      term: "Capability Registry",
      category: "Sensors & Telemetry",
      definition: "The physical hardware inventory cataloging approved secondary smart accessories paired with the user's safety plan. It registers active hardware sensors (GPS, microphones, accelerometers, haptic chips) to direct sensor-fusion workflows.",
      usage: "Determines fallback telemetry options when the central smartphone hub is lost or disconnected.",
      whyItMatters: "Remains entirely hardware-agnostic, letting you register any combination of wearable devices to serve as reliable backup triggers.",
      icon: <Activity className="w-4 h-4 text-blue-400" />
    },
    {
      term: "Decentralized Safety Mesh",
      category: "Core Engine",
      definition: "An offline-first mesh protocol that leverages consumer devices to relay distress telemetry through BLE and ad-hoc local frequencies when active cellular networks fail.",
      usage: "Broadcasts continuous BLE beacons from physical accessories when the cellular signal is cut.",
      whyItMatters: "Protects campus students inside concrete buildings, basements, or deep parking structures with poor cellular reception.",
      icon: <Compass className="w-4 h-4 text-purple-400" />
    },
    {
      term: "Dossier & Safety Plan",
      category: "Security & Sovereignty",
      definition: "An encrypted digital snapshot of critical medical info, medication list, voice trigger phrases, active geofences, and trusted emergency contacts.",
      usage: "Shared instantly with responding guardians and dispatchers only when an emergency event goes live.",
      whyItMatters: "Ensures responders get rich context (like asthma alerts or trigger conditions) within seconds of activation.",
      icon: <Lock className="w-4 h-4 text-amber-400" />
    },
    {
      term: "Cognitive Safety (Local Voice Trigger)",
      category: "Security & Sovereignty",
      definition: "An on-device audio processing watchdog that evaluates incoming microphone streams locally without uploading audio backends.",
      usage: "Evaluates keywords like 'Billi, active safety' to automatically lock incident triggers.",
      whyItMatters: "Guarantees absolute digital sovereignty and privacy while providing a rapid, hands-free activation shortcut.",
      icon: <Mic className="w-4 h-4 text-pink-400" />
    }
  ];

  const filteredTerms = glossaryTerms.filter(t => 
    t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      
      {/* SECTION 1: ONBOARDING ROADMAP */}
      <div className="bg-slate-950/40 border border-slate-800 p-4.5 rounded-2xl space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-blue-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-blue-300 uppercase">
            Billi Onboarding Checklist
          </h3>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          Welcome to Billi. Complete these operational tasks to verify your custom safety mesh config is primed and certified:
        </p>

        <div className="space-y-2 pt-1">
          {/* Item 1 */}
          <div 
            onClick={() => toggleCheck("paired")}
            className="flex items-start gap-3 p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-xl cursor-pointer transition-all"
          >
            <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
              checklist.paired ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 bg-slate-950"
            }`}>
              {checklist.paired && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div>
              <span className={`text-[11px] font-medium block leading-tight ${checklist.paired ? "text-slate-400 line-through" : "text-slate-200"}`}>
                Register Accessories in Capability Registry
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                Approved: Billi BLE Tag & Apple Watch paired.
              </span>
            </div>
          </div>

          {/* Item 2 */}
          <div 
            onClick={() => toggleCheck("safeZone")}
            className="flex items-start gap-3 p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-xl cursor-pointer transition-all"
          >
            <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
              checklist.safeZone ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 bg-slate-950"
            }`}>
              {checklist.safeZone && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div>
              <span className={`text-[11px] font-medium block leading-tight ${checklist.safeZone ? "text-slate-400 line-through" : "text-slate-200"}`}>
                Establish at Least One Safe Zone Boundary
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                Setup your dormitory or neighborhood geofences.
              </span>
            </div>
          </div>

          {/* Item 3 */}
          <div 
            onClick={() => toggleCheck("testSos")}
            className="flex items-start gap-3 p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-xl cursor-pointer transition-all"
          >
            <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
              checklist.testSos ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 bg-slate-950"
            }`}>
              {checklist.testSos && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div>
              <span className={`text-[11px] font-medium block leading-tight ${checklist.testSos ? "text-slate-400 line-through" : "text-slate-200"}`}>
                Simulate a Duress SOS Trigger
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                Run the incident simulator to test Incident Engine loops.
              </span>
            </div>
          </div>

          {/* Item 4 */}
          <div 
            onClick={() => toggleCheck("telemetryVerified")}
            className="flex items-start gap-3 p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-xl cursor-pointer transition-all"
          >
            <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
              checklist.telemetryVerified ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 bg-slate-950"
            }`}>
              {checklist.telemetryVerified && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div>
              <span className={`text-[11px] font-medium block leading-tight ${checklist.telemetryVerified ? "text-slate-400 line-through" : "text-slate-200"}`}>
                Verify Local Device Telemetry Health
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                System status meter must register above 80% integrity.
              </span>
            </div>
          </div>

          {/* Item 5 */}
          <div 
            onClick={() => toggleCheck("guardiansNotified")}
            className="flex items-start gap-3 p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-xl cursor-pointer transition-all"
          >
            <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
              checklist.guardiansNotified ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 bg-slate-950"
            }`}>
              {checklist.guardiansNotified && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div>
              <span className={`text-[11px] font-medium block leading-tight ${checklist.guardiansNotified ? "text-slate-400 line-through" : "text-slate-200"}`}>
                Pre-Authorize Secondary Responders
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                Confirm parent/campus security phone lines are valid.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE GLOSSARY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-blue-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              Technical Terms Glossary
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-750 px-2 py-0.5 rounded">
            {filteredTerms.length} terms
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter telemetry, engines, keys..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-550 focus:outline-hidden transition-colors"
          />
        </div>

        {/* List of filtered glossary terms */}
        <div className="space-y-4">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((term, index) => (
              <div 
                key={index}
                className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl space-y-2.5 text-left hover:border-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {term.icon}
                    <h4 className="text-xs font-extrabold font-mono text-white tracking-wide uppercase">
                      {term.term}
                    </h4>
                  </div>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                    term.category === "Core Engine" ? "bg-red-950 text-red-400 border-red-900/40" :
                    term.category === "Sensors & Telemetry" ? "bg-blue-950 text-blue-400 border-blue-900/40" :
                    "bg-amber-950 text-amber-400 border-amber-900/40"
                  }`}>
                    {term.category}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed font-sans">
                  <p>{term.definition}</p>
                  
                  <div className="text-[10px] bg-slate-900/50 p-2 rounded-lg border border-slate-850 space-y-1">
                    <p className="font-mono text-slate-450 leading-normal">
                      <strong className="text-slate-400 font-bold">OPERATIONAL ROLE:</strong> {term.usage}
                    </p>
                    <p className="font-mono text-slate-450 leading-normal">
                      <strong className="text-slate-400 font-bold">WHY IT MATTERS:</strong> {term.whyItMatters}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
              <HelpCircle className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-bounce" />
              <p className="text-xs text-slate-500 font-mono">No matching technical terms found.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
