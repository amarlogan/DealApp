"use client";

import { useState } from "react";
import { Save, AlertCircle, Palette, Calendar, Clock } from "lucide-react";

interface SeasonFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function SeasonForm({ initialData, onSave, isLoading }: SeasonFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    css_variables: {
      "--primary": "#53A318",
      "--background": "#FFFFFF",
      "--text": "#111827"
    },
    ...(initialData || {})
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name) {
      setError("Season name is required.");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setError("Start and end dates are required.");
      return;
    }

    await onSave(formData);
  };

  const updateCssVar = (key: string, value: string) => {
    setFormData({
      ...formData,
      css_variables: {
        ...formData.css_variables,
        [key]: value
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-bold border border-red-100 animate-in slide-in-from-top-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="md:col-span-2 space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Season Identity</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Summer Extravaganza 2026"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
            <Calendar size={12} /> Start Date
          </label>
          <input
            required
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
            <Clock size={12} /> End Date
          </label>
          <input
            required
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Theme Preview & Config */}
        <div className="md:col-span-2 space-y-4 pt-4">
          <div className="flex items-center justify-between pl-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Palette size={12} /> Theme Configuration
            </label>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: formData.css_variables["--primary"] }} />
                <span className="text-[10px] font-black text-gray-400 uppercase">Live Preview Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
              <span className="text-[10px] font-black text-gray-500 uppercase">Primary Color</span>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.css_variables["--primary"]} 
                  onChange={(e) => updateCssVar("--primary", e.target.value)}
                  className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                />
                <input 
                  type="text" 
                  value={formData.css_variables["--primary"]} 
                  onChange={(e) => updateCssVar("--primary", e.target.value)}
                  className="bg-transparent border-none p-0 text-xs font-mono font-bold w-20"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
              <span className="text-[10px] font-black text-gray-500 uppercase">Background</span>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.css_variables["--background"]} 
                  onChange={(e) => updateCssVar("--background", e.target.value)}
                  className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                />
                <input 
                  type="text" 
                  value={formData.css_variables["--background"]} 
                  onChange={(e) => updateCssVar("--background", e.target.value)}
                  className="bg-transparent border-none p-0 text-xs font-mono font-bold w-20"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
              <span className="text-[10px] font-black text-gray-500 uppercase">Text Color</span>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.css_variables["--text"]} 
                  onChange={(e) => updateCssVar("--text", e.target.value)}
                  className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                />
                <input 
                  type="text" 
                  value={formData.css_variables["--text"]} 
                  onChange={(e) => updateCssVar("--text", e.target.value)}
                  className="bg-transparent border-none p-0 text-xs font-mono font-bold w-20"
                />
              </div>
            </div>
          </div>
          
          {/* Visual Preview Box */}
          <div className="mt-4 p-6 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 transition-all">
             <div 
               className="w-full p-8 rounded-2xl shadow-lg flex flex-col items-center gap-3 border transition-all"
               style={{ 
                 backgroundColor: formData.css_variables["--background"],
                 color: formData.css_variables["--text"],
                 borderColor: formData.css_variables["--primary"] + '20'
               }}
             >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform rotate-12"
                  style={{ backgroundColor: formData.css_variables["--primary"] }}
                >
                  <Palette size={20} className="text-white" />
                </div>
                <h4 className="text-lg font-black tracking-tight">{formData.name || "Season Title"}</h4>
                <div 
                  className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                  style={{ backgroundColor: formData.css_variables["--primary"], color: 'white' }}
                >
                  Action Button
                </div>
             </div>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time Theme Preview</p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-end">
        <button
          disabled={isLoading}
          type="submit"
          className="bg-black text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
        >
          <Save size={18} />
          {isLoading ? "Preserving..." : initialData ? "Update Season" : "Launch Season"}
        </button>
      </div>
    </form>
  );
}
