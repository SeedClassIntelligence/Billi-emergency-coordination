/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Phone, 
  Car, 
  Search, 
  Clock, 
  AlertCircle,
  Volume2
} from "lucide-react";
import { Incident, Contact } from "../types";

interface CurrentResponseWidgetProps {
  incident: Incident;
}

export default function CurrentResponseWidget({ incident }: CurrentResponseWidgetProps) {
  const ticks = incident.locations?.length || 0;

  const getContactResponseDetail = (contact: Contact) => {
    // Determine contact actions based on contact ID and current incident state (e.g., ticks)
    if (contact.id === "contact_mom") {
      if (contact.respondStatus === "responding") {
        return {
          action: "Driving",
          detail: "Evelyn is driving to school East Entrance. Navigation shared via Apple Maps.",
          color: "text-red-700 bg-red-50 border-red-200",
          iconColor: "text-red-500",
          progress: 80,
          statusText: "Active Dispatch (ETA 3m)",
          icon: Car
        };
      }
      if (contact.respondStatus === "viewing") {
        return {
          action: "Investigating",
          detail: "Listening to live ambient sound buffer & real-time GPS telemetry.",
          color: "text-violet-700 bg-violet-50 border-violet-150 animate-pulse",
          iconColor: "text-violet-500",
          progress: 40,
          statusText: "Vocal Link Active",
          icon: Phone
        };
      }
      return {
        action: "Alerted",
        detail: "Device ringing on full volume with continuous emergency sound override.",
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
          action: "En Route",
          detail: "Marcus heading towards school West Gate via Interstate-80 route.",
          color: "text-red-700 bg-red-50 border-red-200",
          iconColor: "text-red-500",
          progress: 75,
          statusText: "Driving (ETA 5m)",
          icon: Car
        };
      }
      if (ticks >= 1) {
        return {
          action: "Calling",
          detail: "Establishing connection with main office & school security administrators.",
          color: "text-blue-700 bg-blue-50 border-blue-150 animate-pulse",
          iconColor: "text-blue-500",
          progress: 50,
          statusText: "Outbound Call Active",
          icon: Phone
        };
      }
      return {
        action: "Alerted",
        detail: "Backup SMS alert delivered successfully. Auto-failsafe enabled.",
        color: "text-slate-600 bg-slate-50 border-slate-200",
        iconColor: "text-slate-400",
        progress: 10,
        statusText: "Standby Monitor",
        icon: Clock
      };
    }

    if (contact.id === "contact_officer") {
      if (contact.respondStatus === "responding" || incident.status === "responder_dispatched") {
        return {
          action: "Searching",
          detail: "Officer Ramirez patrolling East Playground and adjacent geofenced zone.",
          color: "text-emerald-700 bg-emerald-50 border-emerald-250 animate-pulse",
          iconColor: "text-emerald-600",
          progress: 95,
          statusText: "On-Site Active Search",
          icon: Search
        };
      }
      if (ticks >= 2) {
        return {
          action: "En Route",
          detail: "Patrol unit #14 dispatched from zone headquarters.",
          color: "text-blue-700 bg-blue-50 border-blue-200 animate-pulse",
          iconColor: "text-blue-500",
          progress: 60,
          statusText: "Cruiser En Route",
          icon: Car
        };
      }
      return {
        action: "Queued",
        detail: "Dispatched to campus safety queue. Higher authority notified.",
        color: "text-slate-400 bg-slate-50/50 border-slate-150",
        iconColor: "text-slate-400",
        progress: 5,
        statusText: "Armed & Queueing",
        icon: Clock
      };
    }

    if (contact.id === "contact_grandma") {
      if (ticks >= 4) {
        return {
          action: "Calling",
          detail: "Automated robocall dispatcher read out emergency report to grandparents.",
          color: "text-violet-700 bg-violet-50 border-violet-150 animate-pulse",
          iconColor: "text-violet-500",
          progress: 90,
          statusText: "Automated Escalation",
          icon: Phone
        };
      }
      return {
        action: "Standby",
        detail: "Grandmother queued for second-stage safety chain escalation.",
        color: "text-slate-400 bg-slate-50/50 border-slate-150",
        iconColor: "text-slate-350",
        progress: 0,
        statusText: "Pending Cascade",
        icon: Clock
      };
    }

    // Default response status mapping
    return {
      action: "Standby",
      detail: "Ready to transition. Monitored in active trust ring.",
      color: "text-slate-400 bg-slate-50/50 border-slate-150",
      iconColor: "text-slate-350",
      progress: 0,
      statusText: "Standby",
      icon: Clock
    };
  };

  return (
    <div id="current_response_widget" className="space-y-4">
      <div className="flex justify-between items-center pb-2.5 border-b border-slate-150">
        <h4 className="text-xs font-bold font-mono tracking-wider text-slate-600 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <span>CURRENT RESPONSE</span>
        </h4>
        <span className="text-[9px] bg-red-50 text-red-650 border border-red-200 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
          LIVE TRACKING
        </span>
      </div>

      <div className="space-y-3.5">
        {incident.contacts.map((contact, index) => {
          const rd = getContactResponseDetail(contact);
          const IconComponent = rd.icon;
          return (
            <motion.div 
              key={contact.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-50/70 border border-slate-150 rounded-xl p-3 space-y-2.5 hover:bg-slate-50 transition-colors shadow-xs"
            >
              {/* Header with Name, Role, and Response Action */}
              <div className="flex justify-between items-start gap-1">
                <div>
                  <p className="font-bold text-slate-800 text-xs">
                    {contact.name}
                  </p>
                  <span className="text-[8.5px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded mt-0.5 inline-block">
                    {contact.role}
                  </span>
                </div>
                
                {/* Real-time Response Action Badge */}
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${rd.color}`}>
                    <IconComponent className="w-3 h-3 text-current" />
                    <span>{rd.action}</span>
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">
                    {contact.notificationChannel.toUpperCase()} LINKED
                  </span>
                </div>
              </div>

              {/* Detail explanation */}
              <p className="text-[10px] text-slate-600 leading-normal bg-white p-1.5 rounded border border-slate-100/80 font-sans">
                {rd.detail}
              </p>

              {/* Response Progress Tracker */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                  <span>RESPONSE MILESTONE</span>
                  <span className="font-bold text-slate-600">{rd.statusText} • {rd.progress}%</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${rd.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      rd.action === "Driving" || rd.action === "Searching" || rd.action === "En Route"
                        ? "bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"
                        : rd.action === "Calling" || rd.action === "Investigating"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-slate-400"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
