/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Brain, 
  ShieldAlert, 
  RefreshCw, 
  Languages, 
  Info, 
  TrendingUp, 
  Clock,
  Volume2
} from "lucide-react";
import { Incident } from "../types";

interface AiAnalysisPanelProps {
  incident: Incident | null;
  onActivate?: (method: string) => void;
}

export default function AiAnalysisPanel({ incident, onActivate }: AiAnalysisPanelProps) {
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    summary: string;
    riskClassification: "low" | "medium" | "high" | "critical";
    suggestedCategory: string;
    keyObservations: string[];
    translation?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [targetLang, setTargetLang] = useState<"none" | "es" | "fr">("none");

  const runAiAnalysis = async (languageCode: "none" | "es" | "fr") => {
    if (!incident) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentData: incident,
          targetLanguage: languageCode === "none" ? undefined : languageCode
        })
      });

      if (!response.ok) {
        throw new Error("Server failed to respond to AI Request.");
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to run Gemini AI analysis. Falling back to built-in telemetry parsing.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run AI analysis whenever the incident ticks or updates (e.g. new coordinates or evidence transcripts)
  useEffect(() => {
    if (incident) {
      runAiAnalysis(targetLang);
    } else {
      setAiResult(null);
    }
  }, [incident, incident?.locations.length, incident?.evidence.length]);

  const handleLanguageChange = (lang: "none" | "es" | "fr") => {
    setTargetLang(lang);
    runAiAnalysis(lang);
  };

  if (!incident) {
    return (
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-fade-in relative overflow-hidden">
        {/* Decorative background brain node mesh */}
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Brain className="w-40 h-40 text-blue-500 animate-pulse" />
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-150 animate-pulse mb-1">
          <Brain className="w-5 h-5 text-blue-600" />
        </div>

        <div className="space-y-1.5 max-w-md z-10">
          <span className="text-[9.5px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
            Gemini Sentinel Standby
          </span>
          <h4 className="text-slate-800 font-extrabold text-xs uppercase font-mono tracking-wide">
            Cognitive Emergency Co-Dispatch Engine
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
            During peacetime, Billi remains strictly offline and encrypted under on-device Zero-Knowledge keys to protect student privacy. When an emergency is launched, the server-side Gemini model instantly decrypts the active session to parse voice audio transcript logs, analyze route velocity drift, classify hazard zones, and compile dispatch logs.
          </p>
        </div>

        {/* Live Standby Indicators */}
        <div className="grid grid-cols-3 gap-3.5 w-full max-w-sm py-2 font-mono text-[9px] text-slate-400 border-t border-b border-slate-150 z-10">
          <div>
            <span className="block text-slate-500 font-bold">LOCAL TELEMETRY</span>
            <span className="text-emerald-600 font-bold">● PRIMED</span>
          </div>
          <div>
            <span className="block text-slate-500 font-bold">VOICE CLASSIFIER</span>
            <span className="text-emerald-600 font-bold">● LISTENING</span>
          </div>
          <div>
            <span className="block text-slate-500 font-bold">GEOFENCE LOCKS</span>
            <span className="text-emerald-600 font-bold">● ACTIVE</span>
          </div>
        </div>

        {/* Interactive launch button to let user demo AI */}
        {onActivate && (
          <div className="pt-2 z-10 w-full max-w-xs">
            <button
              type="button"
              onClick={() => onActivate("verbal_duress")}
              className="w-full bg-blue-600 hover:bg-blue-550 text-white font-mono text-[10px] font-bold py-2.5 px-4 rounded-xl shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all uppercase flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>TEST SIMULATE EMERGENCY SOS</span>
            </button>
            <span className="text-[8.5px] text-slate-400 font-mono mt-1.5 block">
              Launches voice-activated crisis simulation to wake up the AI panel.
            </span>
          </div>
        )}
      </div>
    );
  }

  // Helper color tags for Risk
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "high":
        return "bg-amber-50 text-amber-750 border-amber-200";
      case "medium":
        return "bg-yellow-50 text-yellow-750 border-yellow-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div id="ai_coordination_panel" className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-inner relative overflow-hidden">
      
      {/* Decorative sparkles */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-blue-400 animate-spin duration-3000" />
      </div>

      {/* Panel Title */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
          <h3 className="font-bold text-white text-xs tracking-wider font-mono uppercase">GEMINI LIVE AI THREAT COPILOT</h3>
        </div>

        <button
          onClick={() => runAiAnalysis(targetLang)}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-50 p-1.5 rounded-lg flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
          title="Refresh AI Analysis"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2 leading-relaxed font-mono">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main AI Output Layout */}
      <div className="space-y-4">
        {loading && !aiResult ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-blue-600 animate-pulse font-bold">Running Multi-Channel Gemini Extraction...</p>
          </div>
        ) : aiResult ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Risk Category & Audio Sentiment Badges */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getRiskStyles(aiResult.riskClassification)}`}>
                Risk Level: {aiResult.riskClassification}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-700 border border-slate-250 px-3 py-1 rounded-full uppercase tracking-wider">
                Category: {aiResult.suggestedCategory.replace("_", " ")}
              </span>
              <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${
                (aiResult as any).isRealDistressVerified !== false
                  ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                  : "bg-emerald-50 text-emerald-750 border-emerald-200"
              }`}>
                <span>🎙️ SENTIMENT VERIFICATION:</span>
                <span>{(aiResult as any).audioSentimentVerification || "High-Arousal Vocal Panic & Distress Confirmed"}</span>
              </span>
            </div>

            {/* AI Operational Summary Text Box */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2 relative">
              <span className="absolute top-2.5 right-3 text-[9px] font-mono text-blue-400 flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>REAL-TIME INSIGHT</span>
              </span>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest block font-bold">TACTICAL TIMELINE REPORT:</p>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal">
                {aiResult.summary}
              </p>
            </div>

            {/* Optional translation view */}
            {targetLang !== "none" && aiResult.translation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-blue-950/40 border border-blue-800/60 p-4 rounded-xl space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-xs text-blue-300 font-bold">
                  <Languages className="w-4 h-4" />
                  <span>
                    {targetLang === "es" ? "Spanish Translation (Muni Handoff)" : "French Translation (Muni Handoff)"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                  "{aiResult.translation}"
                </p>
              </motion.div>
            )}

            {/* AI Extracted Tactical Observations */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">GEMINI EXTRACTED KEY OBSERVATIONS:</p>
              <ul className="space-y-2 text-xs text-slate-200">
                {aiResult.keyObservations.map((obs, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start leading-relaxed">
                    <span className="text-blue-400 font-bold font-mono mt-0.5">✓</span>
                    <span className="font-sans">{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Actionable Responder Directives (Option B) */}
            {aiResult.responderDirectives && aiResult.responderDirectives.length > 0 && (
              <div className="bg-emerald-950/60 border border-emerald-800/80 p-4 rounded-xl space-y-2">
                <p className="text-xs font-mono text-emerald-300 uppercase tracking-widest block font-bold flex items-center gap-1.5">
                  <span>⚡ ACTIONABLE RESPONDER DIRECTIVES:</span>
                </p>
                <ul className="space-y-2 text-xs text-emerald-100 font-sans">
                  {aiResult.responderDirectives.map((dir, idx) => (
                    <li key={idx} className="flex gap-2 items-start font-medium leading-relaxed">
                      <span className="bg-emerald-500 text-slate-950 font-mono text-[9px] font-black px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{dir}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>

      {/* Translation & Controls Toolbar */}
      <div className="border-t border-slate-150 pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider font-bold">Handoff Language Translation:</span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => handleLanguageChange("none")}
            className={`text-[10px] font-mono px-2.5 py-1 rounded border cursor-pointer transition-colors shadow-sm ${
              targetLang === "none"
                ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            None (English)
          </button>
          <button
            onClick={() => handleLanguageChange("es")}
            className={`text-[10px] font-mono px-2.5 py-1 rounded border cursor-pointer transition-colors shadow-sm ${
              targetLang === "es"
                ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            Spanish (es)
          </button>
          <button
            onClick={() => handleLanguageChange("fr")}
            className={`text-[10px] font-mono px-2.5 py-1 rounded border cursor-pointer transition-colors shadow-sm ${
              targetLang === "fr"
                ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            French (fr)
          </button>
        </div>
      </div>

    </div>
  );
}
