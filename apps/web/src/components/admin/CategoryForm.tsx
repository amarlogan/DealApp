"use client";

import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";

interface CategoryFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function CategoryForm({ initialData, onSave, isLoading }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    label: "",
    emoji: "🏷️",
    description: "",
    is_active: true,
    sort_order: 0,
    show_in_nav: false,
    show_on_home: false,
    ...(initialData || {})
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.id || formData.id.length < 2) {
      setError("ID must be at least 2 characters.");
      return;
    }

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-bold border border-red-100">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Unique Slug ID</label>
          <input
            required
            disabled={!!initialData}
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            placeholder="e.g. electronics"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all disabled:opacity-50"
          />
          {!initialData && <p className="text-[10px] text-gray-400 font-medium pl-1">Lowercase letters and hyphens only.</p>}
        </div>

        {/* Emoji */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Icon / Emoji</label>
          <input
            required
            type="text"
            value={formData.emoji}
            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Label */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Display Label</label>
          <input
            required
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g. Electronics & Gadgets"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Short Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Sort Order */}

        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Sort Order Index</label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Active Toggle */}
        <div className="md:col-span-2 px-4 py-3 bg-gray-50 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Is Active / Visible</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.is_active} 
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#53A318]"></div>
            </label>
        </div>

        {/* Placement Toggles */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Platform Placement</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-700 uppercase tracking-tight">Global Navigation</span>
                <span className="text-[10px] text-gray-400 font-bold">Show in top scrollable bar</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer scale-90">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.show_in_nav} 
                  onChange={(e) => setFormData({ ...formData, show_in_nav: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#53A318]"></div>
              </label>
            </div>

            <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-700 uppercase tracking-tight">Homepage Carousel</span>
                <span className="text-[10px] text-gray-400 font-bold">Show as featured section</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer scale-90">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.show_on_home} 
                  onChange={(e) => setFormData({ ...formData, show_on_home: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#53A318]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          disabled={isLoading}
          type="submit"
          className="bg-black text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
        >
          <Save size={18} />
          {isLoading ? "Synchronizing..." : initialData ? "Update Configuration" : "Initialize Category"}
        </button>
      </div>
    </form>
  );
}
