import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings, 
  FileCheck, 
  Users, 
  UserPlus, 
  Mic, 
  Volume2, 
  Compass, 
  Phone, 
  Mail, 
  MessageSquare, 
  Bell, 
  Plus, 
  X, 
  Trash2, 
  Edit, 
  MapPin, 
  Map, 
  ShieldCheck 
} from "lucide-react";
import { Profile, SafeZone } from "../types";

interface PlanConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileSaved: (profile: Profile) => void;
}

export default function PlanConfigModal({ isOpen, onClose, profile, onProfileSaved }: PlanConfigModalProps) {
  // Local safety plan edits
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState(11);
  const [editMedical, setEditMedical] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editContacts, setEditContacts] = useState<any[]>([]);
  const [editVoicePhrases, setEditVoicePhrases] = useState<string[]>([]);
  const [editSafeZones, setEditSafeZones] = useState<SafeZone[]>([]);
  const [newPhraseInput, setNewPhraseInput] = useState("");
  const [configModalTab, setConfigModalTab] = useState<"dossier" | "contacts" | "voice_phrases" | "safe_zones">("dossier");

  // Contact form sub-states
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactToEditId, setContactToEditId] = useState<string | null>(null);
  const [contactFormName, setContactFormName] = useState("");
  const [contactFormRole, setContactFormRole] = useState<string>("Parent");
  const [contactFormRel, setContactFormRel] = useState("");
  const [contactFormPhone, setContactFormPhone] = useState("");
  const [contactFormChannel, setContactFormChannel] = useState<string>("sms");
  const [contactFormChannels, setContactFormChannels] = useState<string[]>(["sms"]);

  // Safe zone form sub-states
  const [isEditingSafeZone, setIsEditingSafeZone] = useState(false);
  const [safeZoneToEditId, setSafeZoneToEditId] = useState<string | null>(null);
  const [safeZoneFormName, setSafeZoneFormName] = useState("");
  const [safeZoneFormAddress, setSafeZoneFormAddress] = useState("");
  const [safeZoneFormLat, setSafeZoneFormLat] = useState(37.7749);
  const [safeZoneFormLng, setSafeZoneFormLng] = useState(-122.4194);
  const [safeZoneFormRadius, setSafeZoneFormRadius] = useState(150);
  const [safeZoneFormActive, setSafeZoneFormActive] = useState(true);

  useEffect(() => {
    if (isOpen && profile) {
      setEditName(profile.name || "");
      setEditAge(profile.age || 11);
      setEditMedical(profile.medicalInfo || "");
      setEditInstructions(profile.emergencyInstructions || "");
      setEditContacts(profile.contacts || []);
      setEditVoicePhrases(profile.voicePhrases || []);
      setEditSafeZones(profile.safeZones || []);
      
      setNewPhraseInput("");
      setConfigModalTab("dossier");
      setIsEditingContact(false);
      setContactToEditId(null);
      setIsEditingSafeZone(false);
      setSafeZoneToEditId(null);
    }
  }, [isOpen, profile]);

  const handleStartAddContact = () => {
    setContactToEditId(null);
    setContactFormName("");
    setContactFormRole("Parent");
    setContactFormRel("");
    setContactFormPhone("");
    setContactFormChannel("sms");
    setContactFormChannels(["sms"]);
    setIsEditingContact(true);
  };

  const handleStartEditContact = (contact: any) => {
    setContactToEditId(contact.id);
    setContactFormName(contact.name);
    setContactFormRole(contact.role);
    setContactFormRel(contact.relationship);
    setContactFormPhone(contact.phone);
    setContactFormChannel(contact.notificationChannel);
    setContactFormChannels(contact.notificationChannels || [contact.notificationChannel]);
    setIsEditingContact(true);
  };

  const handleSaveContactForm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!contactFormName.trim() || !contactFormPhone.trim()) {
      return;
    }
    
    if (contactToEditId) {
      setEditContacts(prev => prev.map(c => c.id === contactToEditId ? {
        ...c,
        name: contactFormName,
        role: contactFormRole,
        relationship: contactFormRel,
        phone: contactFormPhone,
        notificationChannel: contactFormChannels[0] || "sms",
        notificationChannels: contactFormChannels
      } : c));
    } else {
      const newContact = {
        id: "contact_" + Date.now(),
        name: contactFormName,
        role: contactFormRole,
        relationship: contactFormRel,
        phone: contactFormPhone,
        notificationChannel: contactFormChannels[0] || "sms",
        notificationChannels: contactFormChannels,
        alertStatus: "queued",
        respondStatus: "none"
      };
      setEditContacts(prev => [...prev, newContact]);
    }
    setIsEditingContact(false);
    setContactToEditId(null);
  };

  const handleDeleteContact = (contactId: string) => {
    setEditContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const handleStartAddSafeZone = () => {
    setSafeZoneToEditId(null);
    setSafeZoneFormName("");
    setSafeZoneFormAddress("");
    setSafeZoneFormLat(37.7749);
    setSafeZoneFormLng(-122.4194);
    setSafeZoneFormRadius(150);
    setSafeZoneFormActive(true);
    setIsEditingSafeZone(true);
  };

  const handleStartEditSafeZone = (zone: SafeZone) => {
    setSafeZoneToEditId(zone.id);
    setSafeZoneFormName(zone.name);
    setSafeZoneFormAddress(zone.address || "");
    setSafeZoneFormLat(zone.lat);
    setSafeZoneFormLng(zone.lng);
    setSafeZoneFormRadius(zone.radius);
    setSafeZoneFormActive(zone.isActive);
    setIsEditingSafeZone(true);
  };

  const handleSaveSafeZoneForm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!safeZoneFormName.trim()) {
      return;
    }
    
    if (safeZoneToEditId) {
      setEditSafeZones(prev => prev.map(z => z.id === safeZoneToEditId ? {
        ...z,
        name: safeZoneFormName,
        address: safeZoneFormAddress,
        lat: Number(safeZoneFormLat),
        lng: Number(safeZoneFormLng),
        radius: Number(safeZoneFormRadius),
        isActive: safeZoneFormActive
      } : z));
    } else {
      const newZone: SafeZone = {
        id: "zone_" + Date.now(),
        name: safeZoneFormName,
        address: safeZoneFormAddress,
        lat: Number(safeZoneFormLat),
        lng: Number(safeZoneFormLng),
        radius: Number(safeZoneFormRadius),
        isActive: safeZoneFormActive
      };
      setEditSafeZones(prev => [...prev, newZone]);
    }
    setIsEditingSafeZone(false);
    setSafeZoneToEditId(null);
  };

  const handleDeleteSafeZone = (zoneId: string) => {
    setEditSafeZones(prev => prev.filter(z => z.id !== zoneId));
  };

  const handleSaveProfile = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          age: editAge,
          medicalInfo: editMedical,
          emergencyInstructions: editInstructions,
          contacts: editContacts,
          voicePhrases: editVoicePhrases,
          safeZones: editSafeZones
        })
      });
      if (response.ok) {
        const data = await response.json();
        onProfileSaved(data.profile);
      }
    } catch (err) {
      console.error("Failed to save profile parameters:", err);
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-slate-200 max-w-2xl w-full p-6 rounded-2xl space-y-4 shadow-2xl text-slate-800"
        >
          {/* Modal Title Header */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display tracking-tight">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Configure Account & Trusted Responder Network</span>
            </h3>
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Modal Tabs Bar */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setConfigModalTab("dossier")}
              className={`flex-1 py-2.5 font-mono text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                configModalTab === "dossier"
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>1. ACCOUNT DOSSIER</span>
            </button>
            <button
              type="button"
              onClick={() => setConfigModalTab("contacts")}
              className={`flex-1 py-2 font-mono text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                configModalTab === "contacts"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2. TRUSTED NETWORK</span>
              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {editContacts.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setConfigModalTab("voice_phrases")}
              className={`flex-1 py-2 font-mono text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                configModalTab === "voice_phrases"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>3. VOICE TRIGGERS</span>
              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {editVoicePhrases.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setConfigModalTab("safe_zones")}
              className={`flex-1 py-2 font-mono text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                configModalTab === "safe_zones"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>4. GEOFENCES</span>
              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {editSafeZones.length}
              </span>
            </button>
          </div>

          {/* Main Tabs Content */}
          <div className="min-h-[280px]">
            {configModalTab === "dossier" ? (
              /* Dossier Tab Content */
              <form className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                      Member Full Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 focus:outline-none focus:border-blue-500 font-sans"
                      placeholder="e.g. Maya Johnson"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                      Member Age:
                    </label>
                    <input
                      type="number"
                      required
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 focus:outline-none focus:border-blue-500 font-sans"
                      placeholder="e.g. 11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                    Relevant Medical Dossier Warnings:
                  </label>
                  <textarea
                    value={editMedical}
                    onChange={(e) => setEditMedical(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 p-3 focus:outline-none focus:border-blue-500 resize-none font-sans"
                    placeholder="e.g. Asthma. Uses rescue Albuterol inhaler. Allergies: Peanuts."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                    Post-Activation Responders Action instructions:
                  </label>
                  <textarea
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 p-3 focus:outline-none focus:border-blue-500 resize-none font-sans"
                    placeholder="e.g. Keep calm. Call Mother immediately, then School Safety Officer."
                  />
                </div>
              </form>
            ) : configModalTab === "contacts" ? (
              /* Contacts Tab Content */
              <div className="space-y-4">
                {isEditingContact ? (
                  /* Inline Contact Editor Subform */
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 text-xs"
                  >
                    <h4 className="font-bold text-slate-700 font-mono text-xs uppercase border-b border-slate-200 pb-1.5">
                      {contactToEditId ? "✏️ Edit Trusted Contact" : "➕ Add Trusted Contact"}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                          Full Name:
                        </label>
                        <input
                          type="text"
                          required
                          value={contactFormName}
                          onChange={(e) => setContactFormName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="e.g. Grandma Clara"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                          Relationship Role:
                        </label>
                        <select
                          value={contactFormRole}
                          onChange={(e) => setContactFormRole(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 px-3 py-2 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Primary Guardian">Primary Guardian</option>
                          <option value="Secondary Guardian">Secondary Guardian</option>
                          <option value="School Administrator">School Administrator</option>
                          <option value="School Safety Officer">School Safety Officer</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Caregiver">Caregiver</option>
                          <option value="Emergency Contact">Emergency Contact</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                          Relationship Details:
                        </label>
                        <input
                          type="text"
                          value={contactFormRel}
                          onChange={(e) => setContactFormRel(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="e.g. Maternal Grandmother"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                          Phone Number:
                        </label>
                        <input
                          type="tel"
                          required
                          value={contactFormPhone}
                          onChange={(e) => setContactFormPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="e.g. +1 (555) 234-5678"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block font-mono text-slate-500 uppercase tracking-wider font-bold">
                          Preferred SOS Alert Channels:
                        </label>
                        <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-150">
                          MULTI-SELECT CO-DISPATCH ACTIVE
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: "sms", label: "SMS Texts", icon: MessageSquare },
                          { value: "push", label: "Push Apps", icon: Bell },
                          { value: "call", label: "Phone Calls", icon: Phone },
                          { value: "email", label: "Email alerts", icon: Mail }
                        ].map(ch => {
                          const IconComp = ch.icon;
                          const isSelected = contactFormChannels.includes(ch.value);
                          return (
                            <button
                              key={ch.value}
                              type="button"
                              onClick={() => {
                                setContactFormChannels(prev => {
                                  const exists = prev.includes(ch.value);
                                  let next;
                                  if (exists) {
                                    next = prev.filter(v => v !== ch.value);
                                  } else {
                                    next = [...prev, ch.value];
                                  }
                                  return next.length > 0 ? next : prev; // ensure at least one
                                });
                              }}
                              className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-xs scale-[1.02]"
                                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                              }`}
                            >
                              <IconComp className={`w-4 h-4 ${isSelected ? "text-blue-600 scale-110" : "text-slate-400"}`} />
                              <span className="text-[10px] tracking-tight">{ch.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsEditingContact(false)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveContactForm}
                        disabled={!contactFormName.trim() || !contactFormPhone.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Confirm Contact
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Contacts list with edit/delete buttons */
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                        Current Trusted Responders in Safety Plan:
                      </p>
                      <button
                        type="button"
                        onClick={handleStartAddContact}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-250 text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Contact</span>
                      </button>
                    </div>

                    {editContacts.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-8 px-4 text-center">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-mono text-slate-400">
                          No trusted individuals in the network. Add at least one responder!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {editContacts.map((c) => {
                          const getRoleColor = (role: string) => {
                            switch (role) {
                              case "Parent": return "bg-blue-50 text-blue-700 border-blue-200";
                              case "School Safety Officer": return "bg-red-50 text-red-700 border-red-200";
                              case "Teacher": return "bg-purple-50 text-purple-700 border-purple-200";
                              default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
                            }
                          };

                          const getChannelIcon = (channel: string) => {
                            switch (channel) {
                              case "sms": return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
                              case "push": return <Bell className="w-3.5 h-3.5 text-indigo-600" />;
                              case "call": return <Phone className="w-3.5 h-3.5 text-green-600" />;
                              default: return <Mail className="w-3.5 h-3.5 text-slate-600" />;
                            }
                          };

                          return (
                            <div 
                              key={c.id} 
                              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-slate-800">{c.name}</span>
                                  {c.relationship && (
                                    <span className="text-[10px] text-slate-400">({c.relationship})</span>
                                  )}
                                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getRoleColor(c.role)}`}>
                                    {c.role}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {c.phone}
                                  </span>
                                  <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                                    <span className="text-slate-400 uppercase font-bold text-[8px]">CHANNELS:</span>
                                    <span className="flex gap-1">
                                      {(c.notificationChannels || [c.notificationChannel]).map((ch: string) => (
                                        <span key={ch} className="inline-flex items-center gap-1 bg-blue-50/50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold">
                                          {getChannelIcon(ch)}
                                          <span>{ch}</span>
                                        </span>
                                      ))}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditContact(c)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
                                  title="Edit contact"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContact(c.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors cursor-pointer"
                                  title="Delete contact"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : configModalTab === "voice_phrases" ? (
              /* Voice Trigger Phrases Content */
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-blue-800 flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wide">
                    <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>SILENT DURESS VOICE TRIGGER DEPLOYMENT</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    Custom voice activation phrases are evaluated continuously on the device by local AI. When any of these exact spoken phrases are detected in the active microphone stream, Billi instantly initiates a silent SOS distress broadcast to your trusted network with live GPS, video, and audio links, with <strong>absolutely no visual or audible indication</strong> on the student's device.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPhraseInput}
                      onChange={(e) => setNewPhraseInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newPhraseInput.trim()) {
                            setEditVoicePhrases(prev => [...prev, newPhraseInput.trim()]);
                            setNewPhraseInput("");
                          }
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 font-sans"
                      placeholder="Type a custom duress phrase, e.g. Code cobalt silent..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPhraseInput.trim()) {
                          setEditVoicePhrases(prev => [...prev, newPhraseInput.trim()]);
                          setNewPhraseInput("");
                        }
                      }}
                      disabled={!newPhraseInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Phrase</span>
                    </button>
                  </div>

                  {/* Simulated Voice Calibration Waveform Training (NEW FEATURE) */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 my-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Neural Safeword Calibration Simulator</span>
                      <span className="text-[8px] font-mono bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded uppercase font-bold">On-Device DSP</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      Test speech wave calibrations. Select any voice trigger phrase below to simulate on-device voice wake-up verification.
                    </p>
                    
                    <div className="flex items-center gap-3 bg-white border border-slate-200 p-3.5 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0 animate-pulse">
                        <Mic className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-600 font-bold">calibration_sample_raw.wav</span>
                          <span className="text-emerald-600 font-bold">98.4% Match Rate</span>
                        </div>
                        {/* Animated Waveform Blocks */}
                        <div className="h-6 flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2 overflow-hidden">
                          {[15, 45, 85, 30, 20, 60, 95, 75, 40, 20, 10, 50, 70, 90, 35, 15, 60, 45, 80, 20, 10, 30, 75, 10].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-violet-500 rounded-full"
                              style={{ height: `${h}%`, transition: 'height 0.3s ease' }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                      ACTIVE SECURE PHRASES ({editVoicePhrases.length}):
                    </p>

                    {editVoicePhrases.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-8 px-4 text-center">
                        <Mic className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-mono text-slate-400">
                          No voice-activation phrases configured. Add a custom phrase to activate!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {editVoicePhrases.map((phrase, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-xl flex items-center justify-between hover:border-slate-350 hover:bg-slate-100/50 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Mic className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span className="font-mono text-xs font-bold text-slate-700 italic">
                                "{phrase}"
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditVoicePhrases(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-slate-450 hover:text-red-600 hover:bg-white rounded transition-colors cursor-pointer"
                              title="Remove phrase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Safe Zones / Geofences Tab Content */
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-blue-800 flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wide">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>SECURE GEOFENCING & SAFE ZONE BOUNDARIES</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed font-sans text-[11px]">
                    Establish safe perimeter rings around critical recurring locations. If the student's background GPS coordinates deviate outside the active radius of all defined safe zones, Billi immediately and silently broadcasts a geofence-violation alert to your trusted contact network.
                  </p>
                </div>

                {isEditingSafeZone ? (
                  /* Safe Zone Form */
                  <form className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                    <p className="text-[10px] font-mono text-slate-450 uppercase tracking-widest font-bold">
                      {safeZoneToEditId ? "EDIT SAFE ZONE" : "NEW SAFE ZONE PARAMETERS"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Zone Name</label>
                        <input
                          type="text"
                          required
                          value={safeZoneFormName}
                          onChange={(e) => setSafeZoneFormName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs px-3 py-2 focus:outline-none focus:border-blue-500 font-sans"
                          placeholder="e.g. Pine Middle School"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Street Address (Optional)</label>
                        <input
                          type="text"
                          value={safeZoneFormAddress}
                          onChange={(e) => setSafeZoneFormAddress(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs px-3 py-2 focus:outline-none focus:border-blue-500 font-sans"
                          placeholder="e.g. 1155 Pine St, San Francisco"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={safeZoneFormLat}
                          onChange={(e) => setSafeZoneFormLat(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={safeZoneFormLng}
                          onChange={(e) => setSafeZoneFormLng(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                            Geofence Radius: <span className="text-blue-600 font-bold">{safeZoneFormRadius} meters</span>
                          </label>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="1000"
                          step="25"
                          value={safeZoneFormRadius}
                          onChange={(e) => setSafeZoneFormRadius(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <span>50m (Tight)</span>
                          <span>500m</span>
                          <span>1000m (Broad)</span>
                        </div>
                      </div>

                      {/* Dynamic Geofence Area Coverage Preview Widget (NEW FEATURE) */}
                      <div className="sm:col-span-2 border border-slate-200 bg-white p-4 rounded-xl space-y-2.5 my-3">
                        <span className="text-[9.5px] font-mono text-slate-550 uppercase tracking-widest font-bold block">Failsafe Area Coverage Preview</span>
                        <div className="bg-slate-900 h-32 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-950">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                          
                          {/* GPS Lat/Lng Indicator */}
                          <div className="absolute top-2.5 left-2.5 text-[8.5px] font-mono text-slate-500 leading-normal">
                            LAT: {safeZoneFormLat ? safeZoneFormLat.toFixed(5) : "37.77490"}<br />
                            LNG: {safeZoneFormLng ? safeZoneFormLng.toFixed(5) : "-122.41940"}
                          </div>
                          
                          {/* Distance Guide Scale */}
                          <div className="absolute bottom-2.5 left-2.5 text-[8px] font-mono text-slate-500">
                            SCALE: 100px = {safeZoneFormRadius} meters
                          </div>

                          {/* Reference Ring */}
                          <div className="w-20 h-20 border border-slate-800 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-mono text-slate-600">Primary Hub Core</span>
                          </div>

                          {/* Anchor Location Pin */}
                          <div className="absolute w-2.5 h-2.5 bg-red-500 rounded-full z-10" />
                          <MapPin className="w-4.5 h-4.5 text-red-500 absolute -translate-y-3 z-10 animate-bounce" />

                          {/* Dynamic Radius Overlay Card */}
                          <div 
                            className="absolute rounded-full border border-blue-500/80 bg-blue-500/10 flex items-center justify-center transition-all duration-300"
                            style={{
                              width: `${Math.max(30, (safeZoneFormRadius / 1000) * 180)}px`,
                              height: `${Math.max(30, (safeZoneFormRadius / 1000) * 180)}px`,
                            }}
                          >
                            <div className="text-[8px] font-mono font-bold text-blue-400 bg-slate-950/90 px-1.5 py-0.5 rounded border border-blue-900/60 pointer-events-none shadow-md">
                              {safeZoneFormRadius}m
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                          Coverage radius for <strong>{safeZoneFormName || "this custom safe zone"}</strong>. The background GPS system dynamically generates distress coordinate streams immediately upon cross-boundary drift.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:col-span-2 pt-1.5">
                        <input
                          type="checkbox"
                          id="safeZoneFormActive"
                          checked={safeZoneFormActive}
                          onChange={(e) => setSafeZoneFormActive(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="safeZoneFormActive" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Enable active geofencing enforcement for this zone
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsEditingSafeZone(false)}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-750 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSafeZoneForm}
                        disabled={!safeZoneFormName.trim()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <span>Save Zone</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Safe Zone List View */
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                        CONFIGURED SAFETY PERIMETERS ({editSafeZones.length}):
                      </p>
                      <button
                        type="button"
                        onClick={handleStartAddSafeZone}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Safe Zone</span>
                      </button>
                    </div>

                    {editSafeZones.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-8 px-4 text-center">
                        <Map className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-mono text-slate-400">
                          No safe zones or geofences defined. Click "Add Safe Zone" above to configure your first perimeter.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {editSafeZones.map((zone) => (
                          <div
                            key={zone.id}
                            className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex items-center justify-between hover:border-slate-350 hover:bg-slate-100/50 transition-colors"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <MapPin className={`w-3.5 h-3.5 ${zone.isActive ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
                                <span className="font-bold text-slate-700 text-xs">
                                  {zone.name}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase border ${
                                  zone.isActive 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}>
                                  {zone.isActive ? "Enforcing" : "Disabled"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-450 leading-normal">
                                {zone.address || "No address defined"}
                              </p>
                              <p className="text-[9px] font-mono text-slate-400">
                                Radius: <strong className="text-slate-600">{zone.radius}m</strong> | Coordinates: <strong className="text-slate-600">{zone.lat.toFixed(5)}, {zone.lng.toFixed(5)}</strong>
                              </p>
                            </div>

                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditSafeZone(zone)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
                                title="Edit perimeter"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSafeZone(zone.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors cursor-pointer"
                                title="Delete perimeter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Bottom Controls */}
          <div className="border-t border-slate-200 pt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-semibold py-2 px-4 rounded-xl cursor-pointer text-xs shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl cursor-pointer text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save Full Safety Plan</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
