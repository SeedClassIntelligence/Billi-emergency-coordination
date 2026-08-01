/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  MapPin, 
  Activity, 
  ChevronRight, 
  FileText, 
  Siren, 
  Radio, 
  PhoneCall, 
  Sparkles,
  ClipboardList,
  Users,
  Phone,
  MessageSquare
} from "lucide-react";
import { Incident } from "../types";

interface ResponderDashboardProps {
  incident: Incident | null;
  onUpdateContact: (contactId: string, alertStatus?: string, respondStatus?: string) => void;
}

export default function ResponderDashboard({
  incident,
  onUpdateContact
}: ResponderDashboardProps) {
  const [radioDispatchLog, setRadioDispatchLog] = useState<string[]>([
    "System: Safety Responder Console synchronized with campus incident grid."
  ]);

  if (!incident) {
    return (
      <div id="responder_idle_view" className="flex flex-col items-center justify-center h-full p-8 bg-white border border-slate-200 text-center rounded-2xl min-h-[450px] shadow-sm animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-150 shadow-inner mb-4">
          <Siren className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight font-display">Dispatcher Off-Duty</h3>
        <p className="text-slate-500 text-xs max-w-sm mt-1.5 leading-relaxed">
          The campus security dispatch system is running idle. No student panic alarms or geofence breaches detected.
        </p>
      </div>
    );
  }

  const officerContact = incident.contacts.find(c => c.id === "contact_officer");

  const handleOfficerRespond = (status: "viewing" | "responding" | "contacting_services") => {
    onUpdateContact("contact_officer", "acknowledged", status);
    
    let dispatchMessage = "";
    if (status === "viewing") {
      dispatchMessage = "Officer Davis: Initialized active monitoring of Student telemetry.";
    } else if (status === "responding") {
      dispatchMessage = "Officer Davis: Cruiser dispatched to student location. Siren active. Estimated intercept: 2 min.";
    } else if (status === "contacting_services") {
      dispatchMessage = "Officer Davis: Requested 911 county dispatch support. GPS tracking linked.";
    }

    setRadioDispatchLog(prev => [dispatchMessage, ...prev]);
  };

  return (
    <div id="responder_command_panel" className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-850">
      
      {/* --- POINT 2: SHARED INCIDENT ENGINE OVERVIEW --- */}
      <div className="md:col-span-12 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-slate-100 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold animate-pulse">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm tracking-wide font-mono uppercase">Incident Engine State</h3>
              <span className="text-[10px] font-mono bg-red-950 border border-red-800 text-red-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                ID: {incident.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Unified emergency instance. Real-time coordination and log audit tracking across school security and family circles.
            </p>
          </div>
        </div>
        
        {/* Incident Status Table Header */}
        <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-slate-400 text-center uppercase w-full md:w-auto">
          <div className="bg-slate-800 px-2.5 py-1.5 rounded border border-slate-700/50">
            <span className="block text-slate-500 font-bold">STATUS</span>
            <span className="text-red-400 font-bold">{incident.status.replace("_", " ")}</span>
          </div>
          <div className="bg-slate-800 px-2.5 py-1.5 rounded border border-slate-700/50">
            <span className="block text-slate-500 font-bold">TRACKER</span>
            <span className="text-emerald-400 font-bold">GPS ACTIVE</span>
          </div>
          <div className="bg-slate-800 px-2.5 py-1.5 rounded border border-slate-700/50">
            <span className="block text-slate-500 font-bold">ROLE SCOPE</span>
            <span className="text-blue-400 font-bold">DISPATCH LEVEL</span>
          </div>
        </div>
      </div>

      {/* --- COLUMN 1: STUDENT CASE DOSSIER (Md: 5/12) --- */}
      <div className="md:col-span-5 space-y-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 shadow-sm">
          <h4 className="text-xs font-bold font-mono tracking-wider text-slate-600 border-b border-slate-150 pb-2 uppercase flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>STUDENT SAFETY DOSSIER</span>
          </h4>

          <div className="flex items-center gap-4">
            <img 
              src={incident.userPhoto} 
              alt={incident.userName} 
              className="w-14 h-14 rounded-full border-2 border-red-500 object-cover" 
              referrerPolicy="no-referrer"
            />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800 text-base font-display">{incident.userName}</p>
              <p className="text-xs text-slate-500">Age: {incident.userAge} • Active Profile ID: {incident.userId}</p>
              <p className="text-[10px] font-mono text-blue-600 font-bold uppercase">Classroom: Grade 6, Room 102</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <p className="text-[10px] font-mono font-bold text-red-650 uppercase tracking-wider">CRITICAL MEDICAL ALERTS:</p>
              <p className="text-xs text-slate-700 leading-normal font-sans">
                {incident.medicalInfo || "No chronic medical flags loaded."}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">EMERGENCY FIRST RESPONSE CODE:</p>
              <p className="text-xs text-slate-650 leading-normal font-sans italic">
                "{incident.emergencyInstructions || "Call secondary contacts immediately."}"
              </p>
            </div>
          </div>
        </div>

        {/* --- TRUSTED CONTACTS & QUICK OUTREACH --- */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
          <h4 className="text-xs font-bold font-mono tracking-wider text-slate-600 border-b border-slate-150 pb-2 uppercase flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>TRUSTED CONTACT NETWORK</span>
          </h4>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {incident.contacts.map((contact) => {
              const getRoleBadgeColor = (role: string) => {
                switch (role) {
                  case "Parent": return "bg-blue-50 text-blue-700 border-blue-200";
                  case "School Safety Officer": return "bg-red-50 text-red-700 border-red-200";
                  case "Teacher": return "bg-purple-50 text-purple-700 border-purple-200";
                  default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
                }
              };

              return (
                <div key={contact.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-2.5 hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 text-xs">{contact.name}</p>
                      <p className="text-[10px] text-slate-450">{contact.relationship}</p>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${getRoleBadgeColor(contact.role)}`}>
                      {contact.role}
                    </span>
                  </div>

                  <div className="border-t border-slate-150/60 pt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      {contact.phone}
                    </span>
                    <div className="flex gap-1.5">
                      <a
                        href={`tel:${contact.phone}`}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg flex items-center gap-1 text-[10px] transition-colors shadow-sm cursor-pointer"
                        title={`Call ${contact.name}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`sms:${contact.phone}`}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg flex items-center gap-1 text-[10px] transition-colors shadow-sm cursor-pointer"
                        title={`Message ${contact.name}`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Message</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* POINT 4: ROLE-BASED PRIVACY PERMISSIONS MATRIX */}
          <div className="mt-4 pt-3.5 border-t border-slate-150 text-left">
            <p className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5 mb-2">
              <span>🔒 Dispatch Clearance: Level 2</span>
              <span className="text-[8px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold border border-red-200 animate-pulse">ENFORCED</span>
            </p>
            <p className="text-[10.5px] text-slate-500 leading-normal mb-2">
              Privacy filters active for Student {incident.userName}:
            </p>
            <div className="space-y-1.5 text-[9.5px] font-mono text-slate-600">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-1.5 rounded">
                <span>📍 High-Precision GPS</span>
                <span className="text-emerald-700 font-bold">GRANTED</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-1.5 rounded">
                <span>📋 Medical Dossier / Class list</span>
                <span className="text-emerald-700 font-bold">GRANTED</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-1.5 rounded">
                <span>🎙️ Live Audio Transcription</span>
                <span className="text-red-650 bg-red-50 font-bold px-1 rounded">REDACTED BY ROLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- COLUMN 2: DISPATCH CONTROLS & RESPONSE (Md: 7/12) --- */}
      <div className="md:col-span-7 bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-sm">
        
        <div>
          <h4 className="text-xs font-bold font-mono tracking-wider text-slate-600 border-b border-slate-150 pb-2 uppercase flex items-center gap-1.5 mb-4">
            <Radio className="w-4 h-4 text-blue-600" />
            <span>DISPATCH TRANSMISSION PROTOCOLS</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleOfficerRespond("viewing")}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all shadow-sm ${
                officerContact?.respondStatus === "viewing"
                  ? "bg-red-50 text-red-650 border-red-300 font-bold"
                  : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <Radio className="w-5 h-5 text-red-500" />
              <span className="text-xs font-bold">Lock GPS Feed</span>
              <span className="text-[9px] text-slate-400">Monitor tracking</span>
            </button>

            <button
              onClick={() => handleOfficerRespond("responding")}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all shadow-sm ${
                officerContact?.respondStatus === "responding"
                  ? "bg-red-50 text-red-650 border-red-300 animate-pulse font-bold"
                  : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <Siren className="w-5 h-5 text-red-500" />
              <span className="text-xs font-bold">Deploy Cruiser</span>
              <span className="text-[9px] text-slate-400">Respond in-person</span>
            </button>

            <button
              onClick={() => handleOfficerRespond("contacting_services")}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all shadow-sm ${
                officerContact?.respondStatus === "contacting_services"
                  ? "bg-amber-50 text-amber-700 border-amber-300 font-bold"
                  : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <PhoneCall className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold">Handoff 911</span>
              <span className="text-[9px] text-slate-400">Alert local police</span>
            </button>
          </div>
        </div>

        {/* Radio Feed Logs */}
        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-mono text-slate-550 uppercase tracking-wider flex items-center gap-1 font-bold">
            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
            <span>TACTICAL TRANS-COMM LOGS (RADIO CH. 3)</span>
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 h-28 overflow-y-auto font-mono text-xs text-slate-600 space-y-1.5 shadow-inner">
            {radioDispatchLog.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-slate-400 font-bold flex-shrink-0">&gt;</span>
                <p className="leading-relaxed">{log}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
