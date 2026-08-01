/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Users, 
  MapPin, 
  Mic, 
  Clock, 
  Siren, 
  Sparkles, 
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Incident } from "../types";

interface MultiLayerResponseProps {
  incident: Incident;
}

export default function MultiLayerResponse({ incident }: MultiLayerResponseProps) {
  const layers = [
    {
      id: "layer_network",
      title: "1. Trusted Network Alerted",
      desc: "Instant multi-channel notifications (pushed alerts, SMS texts, and automated calls) dispatched immediately to contacts.",
      status: "Dispatched",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      icon: Users,
      iconColor: "text-blue-600 bg-blue-50"
    },
    {
      id: "layer_location",
      title: "2. Live Location Streaming",
      desc: "Continuous, high-precision background GPS telemetry broadcast. Active route tracking and geofence exit checks.",
      status: "Broadcasting",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200 animate-pulse",
      icon: MapPin,
      iconColor: "text-red-600 bg-red-50"
    },
    {
      id: "layer_evidence",
      title: "3. Audio & Video Evidence Buffer",
      desc: "Encrypted ambient voice buffers stream directly into the incident evidence ledger for review.",
      status: "Recording Silently",
      statusColor: "text-violet-600 bg-violet-50 border-violet-200",
      icon: Mic,
      iconColor: "text-violet-600 bg-violet-50"
    },
    {
      id: "layer_timeline",
      title: "4. Immutable Incident Timeline",
      desc: "Centralized object database records all system activity, geofence breaches, and responder acknowledgements.",
      status: "Active Tracking",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-50"
    },
    {
      id: "layer_services",
      title: "5. Emergency Services Linkage",
      desc: "Campus security dispatch alerted. Automated handoff ready with secure, encrypted tracker coordination links.",
      status: incident.status === "responder_dispatched" ? "Cruiser En Route" : "Armed / Queueing",
      statusColor: incident.status === "responder_dispatched" ? "text-red-700 bg-red-100 border-red-300 animate-pulse font-bold" : "text-slate-500 bg-slate-50 border-slate-200",
      icon: Siren,
      iconColor: "text-red-600 bg-red-50"
    },
    {
      id: "layer_ai",
      title: "6. Gemini AI Orchestration",
      desc: "Active telemetry parsing, ambient sound analytics, risk factor extraction, and instant language translation.",
      status: "Analyzing Real-Time",
      statusColor: "text-blue-600 bg-blue-50 border-blue-200 animate-pulse",
      icon: Sparkles,
      iconColor: "text-blue-600 bg-blue-50"
    }
  ];

  return (
    <div id="multi_layer_response_grid" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-md">
      
      {/* Header info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Layers className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-xs tracking-wide uppercase font-mono">Multi-Layer Response Engine</h4>
            <p className="text-[10px] text-slate-400 font-medium">1 Trigger starts 6 orchestrated security structures simultaneously</p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold bg-blue-950 border border-blue-800 text-blue-300 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-blue-400 animate-pulse" />
          <span>Active Orchestrator</span>
        </span>
      </div>

      {/* Grid of the 6 layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {layers.map((layer, index) => {
          const IconComp = layer.icon;
          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-850/80 border border-slate-800/80 hover:border-blue-900/60 p-3.5 rounded-xl space-y-2 hover:bg-slate-850 transition-all flex flex-col justify-between shadow-xs group"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${layer.iconColor} group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${layer.statusColor}`}>
                    {layer.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-200 text-xs tracking-tight font-sans">{layer.title}</h5>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    {layer.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
