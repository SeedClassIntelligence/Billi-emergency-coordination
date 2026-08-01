import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AuditSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditSpecsModal({ isOpen, onClose }: AuditSpecsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 text-slate-100 max-w-4xl w-full rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 text-left max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">System Engineering Document</span>
            <h2 className="text-lg font-extrabold font-mono text-white tracking-wide uppercase flex items-center gap-2">
              <ShieldCheck className="w-5.5 h-5.5 text-blue-500 animate-pulse" />
              <span>BILLI PLATFORM AUDIT & TECHNICAL SPECIFICATIONS</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Box 1: Platform Overview & Mission (4 Cols) */}
          <div className="md:col-span-4 bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wider">1. Platform Mission</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Billi is a decentralized safety coordination protocol built for low-connectivity campus and urban environments. It converts physical consumer hardware into a collaborative safety mesh.
            </p>
            <div className="space-y-1 pt-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Operational Goals</span>
              <ul className="text-[10px] text-slate-300 space-y-1 list-disc pl-3">
                <li>Minimize locating latency to under 30s.</li>
                <li>Sustain active tracking on 10% battery.</li>
                <li>Verify locate reliability truthfully.</li>
              </ul>
            </div>
          </div>

          {/* Box 2: Telemetry capabilities (8 Cols) */}
          <div className="md:col-span-8 bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wider">2. System Telemetry & Sensor-Fusion Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Unlike traditional trackers that rely on single hardware signals, Billi treats physical devices as disposable sensor nodes. It automatically aggregates coordinates across whatever channels are alive:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono pt-1">
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-0.5">Continuous GPS Broadcast</strong>
                <p className="text-slate-400 text-[9px] leading-relaxed">
                  Maintains highly accurate L1/L5 dual-band GPS locks. Broadcasts compressed coordinates every 5 seconds.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-0.5">BLE Beacon Heartbeat</strong>
                <p className="text-slate-400 text-[9px] leading-relaxed">
                  Fallback beaconing with a low-latency 100ms BLE advertisement interval when main cellular signals are cut.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-0.5">Active Audio Buffer</strong>
                <p className="text-slate-400 text-[9px] leading-relaxed">
                  Decrypts local microphone feeds upon trigger. Encrypts sound clips to AES-GCM 256 before uploading.
                </p>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-0.5">Estimation Fallback</strong>
                <p className="text-slate-400 text-[9px] leading-relaxed">
                  Dead-reckoning calculations using last known GPS vectors and wearable accelerometer speed updates.
                </p>
              </div>
            </div>
          </div>

          {/* Box 3: Hardware specs (Bill of Materials) (12 Cols) */}
          <div className="md:col-span-12 bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wider">3. Hardware Specifications & Bill of Materials (BOM)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Item 1: BLE Tag */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-white block font-mono">BILLI BLE TAG</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold">$18.50 BOM</span>
                </div>
                <ul className="text-[9px] text-slate-400 space-y-1 font-mono leading-relaxed">
                  <li>• <strong>SoC:</strong> Nordic nRF52840</li>
                  <li>• <strong>Protocol:</strong> BLE 5.2 (Coded Phy)</li>
                  <li>• <strong>Range:</strong> 120m Open Air</li>
                  <li>• <strong>Trigger:</strong> Dual button squeeze</li>
                  <li>• <strong>Battery:</strong> CR2032 (18-Month Life)</li>
                </ul>
              </div>

              {/* Item 2: Apple Watch */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-white block font-mono">APPLE WATCH APP</span>
                  <span className="text-[9px] bg-blue-950 text-blue-400 px-1 py-0.2 rounded font-mono font-bold">$0.00 Addon</span>
                </div>
                <ul className="text-[9px] text-slate-400 space-y-1 font-mono leading-relaxed">
                  <li>• <strong>Core API:</strong> CoreLocation / Motion</li>
                  <li>• <strong>Sensors:</strong> High-G Accelerometer</li>
                  <li>• <strong>Uplink:</strong> LTE eSIM fallback</li>
                  <li>• <strong>Trigger:</strong> Tap wrist gesture / Fall</li>
                  <li>• <strong>Battery:</strong> Continuous 4h SOS GPS</li>
                </ul>
              </div>

              {/* Item 3: Audio Smart Glasses */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-white block font-mono">GLASSES PROXY</span>
                  <span className="text-[9px] bg-blue-950 text-blue-400 px-1 py-0.2 rounded font-mono font-bold">$0.00 Addon</span>
                </div>
                <ul className="text-[9px] text-slate-400 space-y-1 font-mono leading-relaxed">
                  <li>• <strong>Hardware:</strong> Ray-Ban Meta Glasses</li>
                  <li>• <strong>Audio:</strong> 5-Mic Stereo Array</li>
                  <li>• <strong>Keyword:</strong> "Billi, active safety"</li>
                  <li>• <strong>Cache:</strong> 10s Circular Ring-Buffer</li>
                  <li>• <strong>Uplink:</strong> Bluetooth proxy via Phone</li>
                </ul>
              </div>

              {/* Item 4: Phone Core Hub */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-white block font-mono">PHONE CORE HUB</span>
                  <span className="text-[9px] bg-purple-950 text-purple-400 px-1 py-0.2 rounded font-mono font-bold">Standard iOS/And</span>
                </div>
                <ul className="text-[9px] text-slate-400 space-y-1 font-mono leading-relaxed">
                  <li>• <strong>Software:</strong> Billi Core iOS & Kotlin</li>
                  <li>• <strong>Database:</strong> Encrypted SQLite/Room</li>
                  <li>• <strong>Uplink:</strong> LTE / Sat Fallback API</li>
                  <li>• <strong>Telemetry:</strong> Dual constellation GPS</li>
                  <li>• <strong>Battery:</strong> Active power-save node</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Box 4: Security and Locating Performance (12 Cols) */}
          <div className="md:col-span-12 bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-3 font-sans">
            <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wider">4. Security, Consent & Data Sovereignty Audit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 leading-normal">
              <div className="space-y-1">
                <strong className="text-white block">AES-GCM 256 Local Buffering</strong>
                <p className="text-slate-400 text-[11px]">
                  All telemetry and microphone evidence clips are encrypted locally before transmitting. Only guardians holding public keys can decrypt actual records.
                </p>
              </div>
              <div className="space-y-1">
                <strong className="text-white block">Decentralized Trust Delegation</strong>
                <p className="text-slate-400 text-[11px]">
                  No centralized database continuously monitors location. Coordination is purely active-duty: location variables are strictly locked until an SOS is fired.
                </p>
              </div>
              <div className="space-y-1">
                <strong className="text-white block">Truthful Signal Degradation</strong>
                <p className="text-slate-400 text-[11px]">
                  When the central node goes dark, the platform does not fabricate coordinates. It computes age and accuracy metrics transparently so coordinators never operate on false assumptions.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Controls */}
        <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span>BILLI SAFETY PROTOCOL VERSION: 2.14-REV-C</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold py-2 px-5 rounded-xl cursor-pointer text-xs shadow-md transition-colors"
          >
            Close Audit Document
          </button>
        </div>
      </motion.div>
    </div>
  );
}
