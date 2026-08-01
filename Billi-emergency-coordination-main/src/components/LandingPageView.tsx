/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Sparkles, 
  Users, 
  Smartphone, 
  Radio, 
  ArrowRight, 
  Play, 
  Building2,
  Shield,
  Zap,
  Eye
} from "lucide-react";
import { Incident } from "../types";

interface LandingPageViewProps {
  incident: Incident | null;
  onStartDemo: () => void;
  isDemoRunning: boolean;
  demoStep: number;
  onNavigateTab: (tab: 'child' | 'guardian' | 'responder' | 'devices' | 'simulator') => void;
  onActivate: (method: string) => void;
}

const DEMO_STEPS = [
  { label: "Silent Trigger", detail: "Maya speaks safeword", time: "T+0s" },
  { label: "Guardian Alert", detail: "Mom responds on dashboard", time: "T+6s" },
  { label: "BLE Failover", detail: "Phone off; mesh takes over", time: "T+14s" },
  { label: "Security Dispatched", detail: "Officer Davis en route", time: "T+22s" },
  { label: "Safe Resolution", detail: "Incident closed & logged", time: "T+30s" },
];

const WORKSPACES = [
  { 
    key: "child" as const, 
    title: "Child Wearable Node", 
    desc: "Silent voice activation, panic button, BLE triggers, and live audio buffer.",
    icon: Smartphone,
    color: "blue",
    bgHover: "hover:border-blue-400",
    iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    textColor: "text-blue-400"
  },
  { 
    key: "guardian" as const, 
    title: "Guardian Dashboard", 
    desc: "Live telemetry, AI distress assessment, evidence timeline, dispatch packets.",
    icon: Users,
    color: "indigo",
    bgHover: "hover:border-indigo-400",
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    textColor: "text-indigo-400"
  },
  { 
    key: "responder" as const, 
    title: "Responder Dispatch", 
    desc: "Campus safety console, tactical directives, and location updates.",
    icon: Building2,
    color: "emerald",
    bgHover: "hover:border-emerald-400",
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    textColor: "text-emerald-400"
  },
  { 
    key: "devices" as const, 
    title: "Device Network", 
    desc: "Multi-wearable sensor hub, signal failover, and BLE mesh monitors.",
    icon: Radio,
    color: "amber",
    bgHover: "hover:border-amber-400",
    iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    textColor: "text-amber-400"
  },
];

export default function LandingPageView({
  incident,
  onStartDemo,
  isDemoRunning,
  demoStep,
  onNavigateTab,
  onActivate
}: LandingPageViewProps) {
  return (
    <div className="space-y-0 text-slate-800 font-sans pb-12">
      
      {/* ═══════════════════════════════════════════════════
          SECTION 1: HERO — Full-width cinematic entry
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800/60 shadow-2xl">
        {/* Background glows */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>BUILD WITH GEMINI XPRIZE SUBMISSION</span>
          </motion.div>

          {/* Title */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-[1.1]">
              BILLI
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Emergency Protection Platform
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300/90 font-sans font-normal leading-relaxed max-w-2xl mx-auto">
              Person-centric emergency coordination that transforms fragmented panic into unified, adaptive response — through trusted people, trusted devices, and trusted intelligence.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm font-sans text-slate-400 italic"
          >
            "Billi was developed to protect you better."
          </motion.p>

          {/* Primary CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="button"
              onClick={onStartDemo}
              disabled={isDemoRunning}
              className={`px-8 py-4 rounded-2xl font-mono text-sm font-extrabold uppercase tracking-wider cursor-pointer transition-all shadow-xl flex items-center gap-3 mx-auto ${
                isDemoRunning
                  ? "bg-amber-500 text-white animate-pulse shadow-amber-500/20"
                  : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:scale-[1.03] text-white shadow-emerald-500/25 hover:shadow-emerald-500/40"
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isDemoRunning ? "▶ DEMO RUNNING LIVE..." : "▶ LAUNCH 30-SECOND INTERACTIVE DEMO"}</span>
            </button>
          </motion.div>

          {/* 3 value props */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-6 pt-4 max-w-xl mx-auto"
          >
            <div className="space-y-1.5 text-center">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                <Shield className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-300">Person-First</p>
              <p className="text-[10px] text-slate-500">The individual is the root entity</p>
            </div>
            <div className="space-y-1.5 text-center">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto">
                <Zap className="w-4.5 h-4.5 text-teal-400" />
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-300">30s Response</p>
              <p className="text-[10px] text-slate-500">Trigger to dispatch in seconds</p>
            </div>
            <div className="space-y-1.5 text-center">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                <Eye className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-300">AI-Assisted</p>
              <p className="text-[10px] text-slate-500">Gemini multimodal intelligence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: DEMO CENTER — The star of the show
          ═══════════════════════════════════════════════════ */}
      <section className="mt-8 space-y-4">
        {/* Live demo progress — only shows when running */}
        {isDemoRunning && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-blue-500/30 p-5 rounded-2xl space-y-4 font-mono"
          >
            <div className="flex justify-between items-center text-xs text-amber-300 font-bold">
              <span>LIVE DEMO — STEP {demoStep} OF 5</span>
              <span>{DEMO_STEPS[demoStep - 1]?.time}: {DEMO_STEPS[demoStep - 1]?.label}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(demoStep / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Step indicators */}
            <div className="grid grid-cols-5 gap-2">
              {DEMO_STEPS.map((step, i) => (
                <div 
                  key={i}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    demoStep === i + 1 
                      ? "bg-amber-950/60 border-amber-500/60 ring-1 ring-amber-500/30" 
                      : demoStep > i + 1
                        ? "bg-emerald-950/30 border-emerald-500/20"
                        : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <span className={`text-[9px] block font-bold mb-0.5 ${
                    demoStep === i + 1 ? "text-amber-400" : demoStep > i + 1 ? "text-emerald-500" : "text-slate-600"
                  }`}>{step.time}</span>
                  <p className={`font-bold text-[10px] ${
                    demoStep === i + 1 ? "text-white" : demoStep > i + 1 ? "text-emerald-300" : "text-slate-500"
                  }`}>{step.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3: EXPLORE — 4 workspace navigation tiles
          ═══════════════════════════════════════════════════ */}
      <section className="mt-10 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            Explore the Platform
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Each workspace represents a different perspective in the BILLI ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKSPACES.map((ws) => {
            const Icon = ws.icon;
            return (
              <motion.div 
                key={ws.key}
                whileHover={{ y: -4 }}
                onClick={() => onNavigateTab(ws.key)}
                className={`bg-slate-900 border border-slate-800 ${ws.bgHover} p-5 rounded-2xl space-y-3 transition-all cursor-pointer group text-left hover:shadow-lg hover:shadow-slate-900/50`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${ws.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm tracking-tight">{ws.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
                <div className={`flex items-center text-xs font-mono font-bold ${ws.textColor} gap-1`}>
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
