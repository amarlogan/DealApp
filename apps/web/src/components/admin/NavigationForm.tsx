"use client";

import { useState } from "react";
import { Save, AlertCircle, Link, Tag, Flame, Eye, EyeOff } from "lucide-react";

interface NavigationFormProps {
  initialData?: any;
  categories: any[];
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function NavigationForm({ initialData, categories, onSave, isLoading }: NavigationFormProps) {
  const [formData, setFormData] = useState({
    category_id: null,
    label_override: "",
    href: "",
    is_highlighted: false,
    is_visible: true,
    ...(initialData || {})
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation link
    if (!formData.category_id && !formData.href) {
      setError("Navigation item must have either a Category source or a custom Link (URL).");
      return;
    }

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-bold border border-red-100 animate-in slide-in-from-top-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Source Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Link Source</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={formData.category_id || ""}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null, href: e.target.value ? "" : formData.href })}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-[#53A318] transition-all appearance-none"
              >
                <option value="">-- Custom Link --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Link size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                disabled={!!formData.category_id}
                type="text"
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                placeholder={formData.category_id ? "Linked to Category" : "e.g. /deals or https://..."}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-[#53A318] transition-all disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Labels & Visibility */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Label Override (Optional)</label>
          <input
            type="text"
            value={formData.label_override || ""}
            onChange={(e) => setFormData({ ...formData, label_override: e.target.value })}
            placeholder="Defaults to Category Label or Link Title"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_highlighted: !formData.is_highlighted })}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                formData.is_highlighted 
                ? "bg-amber-50 border-amber-200 text-amber-600" 
                : "bg-gray-50 border-transparent text-gray-400"
              }`}
            >
              <Flame size={14} /> {formData.is_highlighted ? "Highlighted" : "Standard Link"}
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_visible: !formData.is_visible })}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                formData.is_visible 
                ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                : "bg-red-50 border-red-200 text-red-500"
              }`}
            >
              {formData.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
              {formData.is_visible ? "Visible in Nav" : "Hidden"}
            </button>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100">
        <button
          disabled={isLoading}
          type="submit"
          className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
        >
          <Save size={18} />
          {isLoading ? "Saving..." : initialData ? "Update Navigation Link" : "Add to Navigation"}
        </button>
      </div>
    </form>
  );
}
