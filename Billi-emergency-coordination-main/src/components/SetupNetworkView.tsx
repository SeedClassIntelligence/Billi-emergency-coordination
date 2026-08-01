/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Users, 
  Mic, 
  Compass, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  MessageSquare, 
  Bell, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  Lock,
  ArrowRight,
  Radio,
  FileText
} from "lucide-react";
import { Profile, SafeZone, Contact } from "../types";

interface SetupNetworkViewProps {
  profile: Profile | null;
  onSaveProfile: (updatedProfile: Partial<Profile>) => Promise<void>;
  onNavigateToDashboard: () => void;
}

export default function SetupNetworkView({
  profile,
  onSaveProfile,
  onNavigateToDashboard
}: SetupNetworkViewProps) {
  const [activeTab, setActiveTab] = useState<"dossier" | "contacts" | "voice_phrases" | "safe_zones">("dossier");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Dossier Form State
  const [editName, setEditName] = useState(profile?.name || "Maya Johnson");
  const [editAge, setEditAge] = useState(profile?.age || 11);
  const [editMedical, setEditMedical] = useState(profile?.medicalInfo || "Asthma. Uses rescue Albuterol inhaler. Allergies: Peanuts.");
  const [editInstructions, setEditInstructions] = useState(profile?.emergencyInstructions || "Keep calm. Locate rescue inhaler in backpack. Call Mother immediately, then School Safety Officer.");
  
  // Contacts Network State
  const [editContacts, setEditContacts] = useState<Contact[]>(profile?.contacts || []);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactToEditId, setContactToEditId] = useState<string | null>(null);
  const [contactFormName, setContactFormName] = useState("");
  const [contactFormRole, setContactFormRole] = useState<string>("Primary Guardian");
  const [contactFormRel, setContactFormRel] = useState("");
  const [contactFormPhone, setContactFormPhone] = useState("");
  const [contactFormChannels, setContactFormChannels] = useState<string[]>(["sms", "push"]);

  // Voice Phrases State
  const [editVoicePhrases, setEditVoicePhrases] = useState<string[]>(profile?.voicePhrases || ["Billi active safety", "Billi emergency help"]);
  const [newPhraseInput, setNewPhraseInput] = useState("");

  // Safe Zones Geofences State
  const [editSafeZones, setEditSafeZones] = useState<SafeZone[]>(profile?.safeZones || []);
  const [isEditingSafeZone, setIsEditingSafeZone] = useState(false);
  const [safeZoneFormName, setSafeZoneFormName] = useState("");
  const [safeZoneFormAddress, setSafeZoneFormAddress] = useState("");
  const [safeZoneFormRadius, setSafeZoneFormRadius] = useState(150);

  const handleStartAddContact = () => {
    setContactToEditId(null);
    setContactFormName("");
    setContactFormRole("Secondary Guardian");
    setContactFormRel("");
    setContactFormPhone("");
    setContactFormChannels(["sms", "push"]);
    setIsEditingContact(true);
  };

  const handleStartEditContact = (c: Contact) => {
    setContactToEditId(c.id);
    setContactFormName(c.name);
    setContactFormRole(c.role);
    setContactFormRel(c.relationship || "");
    setContactFormPhone(c.phone);
    setContactFormChannels(c.notificationChannels || [c.notificationChannel]);
    setIsEditingContact(true);
  };

  const handleSaveContactForm = () => {
    if (!contactFormName.trim() || !contactFormPhone.trim()) return;

    if (contactToEditId) {
      setEditContacts(prev => prev.map(c => c.id === contactToEditId ? {
        ...c,
        name: contactFormName.trim(),
        role: contactFormRole,
        relationship: contactFormRel.trim(),
        phone: contactFormPhone.trim(),
        notificationChannel: contactFormChannels[0] || "sms",
        notificationChannels: contactFormChannels
      } : c));
    } else {
      const newContact: Contact = {
        id: `contact_${Date.now()}`,
        name: contactFormName.trim(),
        role: contactFormRole,
        relationship: contactFormRel.trim(),
        phone: contactFormPhone.trim(),
        notificationChannel: contactFormChannels[0] || "sms",
        notificationChannels: contactFormChannels,
        alertStatus: "queued",
        respondStatus: "none"
      };
      setEditContacts(prev => [...prev, newContact]);
    }
    setIsEditingContact(false);
  };

  const handleDeleteContact = (id: string) => {
    setEditContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleAddVoicePhrase = () => {
    if (!newPhraseInput.trim()) return;
    setEditVoicePhrases(prev => [...prev, newPhraseInput.trim()]);
    setNewPhraseInput("");
  };

  const handleDeleteVoicePhrase = (index: number) => {
    setEditVoicePhrases(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSafeZone = () => {
    if (!safeZoneFormName.trim()) return;
    const newZone: SafeZone = {
      id: `zone_${Date.now()}`,
      name: safeZoneFormName.trim(),
      address: safeZoneFormAddress.trim() || "Configured Radius",
      lat: 37.7749,
      lng: -122.4194,
      radius: safeZoneFormRadius,
      isActive: true
    };
    setEditSafeZones(prev => [...prev, newZone]);
    setSafeZoneFormName("");
    setSafeZoneFormAddress("");
    setIsEditingSafeZone(false);
  };

  const handleDeleteSafeZone = (id: string) => {
    setEditSafeZones(prev => prev.filter(z => z.id !== id));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveProfile({
        name: editName,
        age: editAge,
        medicalInfo: editMedical,
        emergencyInstructions: editInstructions,
        contacts: editContacts,
        voicePhrases: editVoicePhrases,
        safeZones: editSafeZones
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-48 h-48 text-blue-400" />
        </div>

        <div className="flex items-center gap-2 text-blue-300 font-mono text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>FIRST-TIME & PRIMARY ACCOUNT SETUP</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
          Account Dossier & Trusted Network Setup
        </h1>

        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
          This is the foundational safety configuration for BILLI. Define the protected individual's medical dossier, assemble trusted guardians & campus responders, register voice activation triggers, and establish safe geofences.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>SAFETY PLAN SAVED!</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white" />
                <span>{isSaving ? "Saving to Firestore..." : "Save Safety Plan & Network"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Proceed to Emergency Command Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STEP TABS NAVIGATION */}
      <div className="bg-white border border-slate-200/80 p-2 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("dossier")}
          className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === "dossier"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. MEMBER DOSSIER</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contacts")}
          className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === "contacts"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. TRUSTED NETWORK ({editContacts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("voice_phrases")}
          className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === "voice_phrases"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>3. VOICE TRIGGERS ({editVoicePhrases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("safe_zones")}
          className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === "safe_zones"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>4. GEOFENCES & ACCESSORIES ({editSafeZones.length})</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm">
        
        {/* TAB 1: MEMBER DOSSIER */}
        {activeTab === "dossier" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Protected Individual Member Dossier</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter primary identity details, medical alerts, and post-activation instructions for responding guardians and campus security.
              </p>
            </div>

            <form className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block font-mono text-slate-600 uppercase tracking-wider font-bold">
                    Full Legal Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-sans"
                    placeholder="e.g. Maya Johnson"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-slate-600 uppercase tracking-wider font-bold">
                    Member Age:
                  </label>
                  <input
                    type="number"
                    required
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-sans"
                    placeholder="e.g. 11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-slate-600 uppercase tracking-wider font-bold">
                  Medical Dossier Warnings & Chronic Conditions:
                </label>
                <textarea
                  value={editMedical}
                  onChange={(e) => setEditMedical(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none font-sans leading-relaxed"
                  placeholder="e.g. Asthma. Uses rescue Albuterol inhaler in backpack. Severe Peanut allergy."
                />
                <p className="text-[10px] text-slate-400 font-mono">This medical alert is securely delivered to responding campus officers during an active SOS.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-slate-600 uppercase tracking-wider font-bold">
                  Post-Activation Responders Action Instructions:
                </label>
                <textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none font-sans leading-relaxed"
                  placeholder="e.g. Keep calm. Locate rescue inhaler in backpack. Call Mother immediately, then School Safety Officer."
                />
              </div>
            </form>
          </motion.div>
        )}

        {/* TAB 2: TRUSTED RESPONDER NETWORK */}
        {activeTab === "contacts" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Trusted Emergency Responders Network</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Assemble family members, guardians, and campus security officers who receive instant multi-channel SOS alerts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartAddContact}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Responder</span>
              </button>
            </div>

            {isEditingContact ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 text-xs"
              >
                <h3 className="font-bold text-slate-800 font-mono text-sm uppercase border-b border-slate-200 pb-2">
                  {contactToEditId ? "✏️ Edit Trusted Responder" : "➕ Add New Trusted Responder"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-slate-600 uppercase font-bold">Full Name:</label>
                    <input
                      type="text"
                      required
                      value={contactFormName}
                      onChange={(e) => setContactFormName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Evelyn Johnson"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-slate-600 uppercase font-bold">Role in Safety Network:</label>
                    <select
                      value={contactFormRole}
                      onChange={(e) => setContactFormRole(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Primary Guardian">Primary Guardian (Mother / Father)</option>
                      <option value="Secondary Guardian">Secondary Guardian</option>
                      <option value="School Safety Officer">School Safety Officer</option>
                      <option value="School Administrator">School Administrator</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Caregiver">Caregiver</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-slate-600 uppercase font-bold">Relationship Details:</label>
                    <input
                      type="text"
                      value={contactFormRel}
                      onChange={(e) => setContactFormRel(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Mother / Campus Dispatcher"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-slate-600 uppercase font-bold">Phone Number:</label>
                    <input
                      type="tel"
                      required
                      value={contactFormPhone}
                      onChange={(e) => setContactFormPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. +1 (555) 987-6543"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-slate-600 uppercase font-bold">Preferred Multi-Channel SOS Alert Options:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { value: "sms", label: "SMS Text Feed", icon: MessageSquare },
                      { value: "push", label: "Push App Alert", icon: Bell },
                      { value: "call", label: "Phone Call", icon: Phone },
                      { value: "email", label: "Email Notice", icon: Mail }
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
                              return exists ? prev.filter(v => v !== ch.value) : [...prev, ch.value];
                            });
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-xs"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          <IconComp className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                          <span className="text-xs">{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveContactForm}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-sm"
                  >
                    Confirm & Save Responder
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {editContacts.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-12 px-4 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-mono text-slate-500 font-bold">No trusted responders added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Add at least one guardian or officer to receive emergency SOS alerts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editContacts.map(c => (
                      <div key={c.id} className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-blue-300 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{c.name}</span>
                            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                              {c.role}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                            {c.relationship && <span className="text-slate-400">({c.relationship})</span>}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditContact(c)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteContact(c.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: VOICE TRIGGERS */}
        {activeTab === "voice_phrases" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <Mic className="w-5 h-5 text-blue-600" />
                <span>Custom Voice Activation Triggers</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure voice keywords processed locally on-device for hands-free SOS activation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPhraseInput}
                  onChange={(e) => setNewPhraseInput(e.target.value)}
                  placeholder="e.g. 'Billi emergency help'"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                />
                <button
                  type="button"
                  onClick={handleAddVoicePhrase}
                  disabled={!newPhraseInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Phrase</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {editVoicePhrases.map((phrase, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-800">
                      <Mic className="w-4 h-4 text-blue-600" />
                      <span>"{phrase}"</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVoicePhrase(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: GEOFENCES & ACCESSORIES */}
        {activeTab === "safe_zones" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Safe Geofences & Paired Accessories</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Establish trusted geographical zones (Home, School, After-school) and inspect paired wearable telemetry accessories.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {editSafeZones.map(zone => (
                  <div key={zone.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-slate-800 font-mono uppercase">{zone.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteSafeZone(zone.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans">{zone.address}</p>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block font-bold">
                      Radius: {zone.radiusMeters}m Geofence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* FOOTER SAVE ACTION BAR */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs text-slate-500">
          <span className="font-bold text-slate-700 block">Ready to deploy safety plan?</span>
          <span>Ensure all responder contacts and medical notes are accurate before saving.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all flex-1 sm:flex-initial"
          >
            {saveSuccess ? "✓ Saved to Firestore" : isSaving ? "Saving..." : "Save Safety Plan"}
          </button>
          
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all flex-1 sm:flex-initial"
          >
            <span>Launch Unified Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
