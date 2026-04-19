"use client";

import { useState } from "react";
import { Copy, Check, Tag } from "lucide-react";

export default function PromoCodeCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  if (!code) return null;

  return (
    <div className="mb-6 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-1.5 pl-1">
        <Tag size={12} className="text-[var(--primary)]" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount Code</span>
      </div>
      
      <div 
        onClick={handleCopy}
        className="group relative flex items-center justify-between bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-xl p-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all"
      >
        <code className="text-lg font-black text-emerald-700 tracking-wider">
          {code}
        </code>
        
        <button className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all shadow-sm ${
          copied 
            ? "bg-emerald-600 text-white" 
            : "bg-white text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white"
        }`}>
          {copied ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
