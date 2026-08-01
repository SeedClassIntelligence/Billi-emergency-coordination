import React, { useState, useRef, useEffect } from "react";
import { Info, X } from "lucide-react";

interface InfoTooltipProps {
  title: string;
  whatIsIt: string;
  whyIsItThere: string;
  capabilities?: string[];
  align?: "left" | "right" | "center";
}

export default function InfoTooltip({
  title,
  whatIsIt,
  whyIsItThere,
  capabilities,
  align = "center"
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const alignmentClasses = {
    left: "left-0 translate-x-0 origin-top-left",
    right: "right-0 translate-x-0 origin-top-right",
    center: "left-1/2 -translate-x-1/2 origin-top"
  };

  return (
    <div ref={containerRef} className="relative inline-block ml-1 z-30">
      {/* Help Trigger Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-blue-600 transition-colors duration-150 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 p-0.5 inline-flex items-center justify-center align-middle cursor-pointer"
        title={`Help: ${title}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip Content Container */}
      {isOpen && (
        <div 
          className={`absolute mt-2 w-72 bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left ${alignmentClasses[align]}`}
          style={{ top: "100%" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
            <h4 className="font-sans font-bold text-[11px] text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>💡 Explanation: {title}</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 rounded-lg p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-2.5 font-sans text-xs">
            <div>
              <p className="text-[10px] font-mono text-slate-450 uppercase tracking-widest font-bold">What is this?</p>
              <p className="text-slate-250 leading-relaxed mt-0.5">{whatIsIt}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-450 uppercase tracking-widest font-bold">Why is it here?</p>
              <p className="text-slate-250 leading-relaxed mt-0.5">{whyIsItThere}</p>
            </div>

            {capabilities && capabilities.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] font-mono text-slate-450 uppercase tracking-widest font-bold mb-1">Capabilities Explained</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {capabilities.map((cap, idx) => (
                    <span 
                      key={idx} 
                      className="bg-blue-950/60 border border-blue-900/40 text-blue-300 text-[9px] font-mono px-1.5 py-0.5 rounded"
                    >
                      • {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Small Arrow indicator */}
          <div 
            className={`absolute -top-1.5 w-3 h-3 bg-slate-900 border-t border-l border-slate-800 rotate-45 ${
              align === "left" ? "left-3" : align === "right" ? "right-3" : "left-1/2 -translate-x-1/2"
            }`}
          />
        </div>
      )}
    </div>
  );
}
