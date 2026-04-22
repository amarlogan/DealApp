"use client";

import { useState } from "react";
import { X, Image as ImageIcon, Link as LinkIcon, Type, Plus, Save, Check, Sparkles } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface HeroSlideFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

const GRADIENTS = [
  { label: 'Subtle Shadow (Show Image)', value: 'from-black/60 via-black/20 to-transparent' },
  { label: 'Emerald Forest', value: 'from-[#1a3a0f] via-[#2a5c18] to-transparent' },
  { label: 'Deep Ocean', value: 'from-[#0f172a] via-[#1e293b] to-transparent' },
  { label: 'Midnight Purple', value: 'from-[#2e1065] via-[#4c1d95] to-transparent' },
  { label: 'Crimson Night', value: 'from-[#450a0a] via-[#7f1d1d] to-transparent' },
  { label: 'Gilded Gold', value: 'from-[#451a03] via-[#78350f] to-transparent' },
  { label: 'Slate Gray', value: 'from-[#1e293b] via-[#334155] to-transparent' },
];

export default function HeroForm({ initialData, onSave, onClose, isLoading }: HeroSlideFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    accent_text: initialData?.accent_text || "",
    tag_text: initialData?.tag_text || "",
    image_url: initialData?.image_url || "",
    featured_image_url: initialData?.featured_image_url || "",
    button_text: initialData?.button_text || "Browse Deals",
    button_link: initialData?.button_link || "/deals",
    bg_gradient: initialData?.bg_gradient || "from-black/60 via-black/20 to-transparent",
    is_active: initialData?.is_active ?? true,
    is_image_only: initialData?.is_image_only ?? false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Metadata */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Tag Line</label>
            <div className="relative">
              <Plus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="text"
                placeholder="e.g. Top Deals — Updated Daily"
                className="admin-input pl-11"
                value={formData.tag_text}
                onChange={e => setFormData({ ...formData, tag_text: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Main Headline</label>
            <div className="relative">
              <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="text"
                placeholder="e.g. Shop Smarter."
                className="admin-input pl-11"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Accent Headline</label>
            <input
              type="text"
              placeholder="e.g. Save More."
              className="admin-input"
              value={formData.accent_text}
              onChange={e => setFormData({ ...formData, accent_text: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Subheadline / Description</label>
            <textarea
              rows={3}
              placeholder="Detailed description for the slide..."
              className="admin-input py-3"
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>
        </div>

        {/* Right Column: Visuals & CTA */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2 pr-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Background Image URL</label>
              <ImageUpload 
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })} 
                label="Upload Local File"
              />
            </div>
            <div className="relative">
              <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="text"
                placeholder="Unsplash or Supabase URL"
                className="admin-input pl-11"
                value={formData.image_url}
                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 pr-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Featured Promotional Image</label>
              <ImageUpload 
                onUploadComplete={(url) => setFormData({ ...formData, featured_image_url: url })} 
                label="Upload Promo Pic"
              />
            </div>
            <div className="relative">
              <Sparkles size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Optional product or promo image URL"
                className="admin-input pl-11"
                value={formData.featured_image_url}
                onChange={e => setFormData({ ...formData, featured_image_url: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Button Text</label>
              <input
                type="text"
                className="admin-input"
                value={formData.button_text}
                onChange={e => setFormData({ ...formData, button_text: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Button Link</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="admin-input pl-11"
                  value={formData.button_link}
                  onChange={e => setFormData({ ...formData, button_link: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
             <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Color Scheme & theme</label>
             <div className="grid grid-cols-3 gap-2 mb-4">
                {GRADIENTS.map((g) => (
                    <button
                        key={g.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, bg_gradient: g.value })}
                        className={`h-12 rounded-xl border-2 transition-all relative overflow-hidden group ${
                            formData.bg_gradient === g.value ? 'border-[#53A318] ring-2 ring-[#53A318]/20' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        title={g.label}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${g.value}`} />
                        {formData.bg_gradient === g.value && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Check size={16} className="text-white" />
                            </div>
                        )}
                    </button>
                ))}
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight pl-1">Advanced Gradient (Tailwind Classes)</label>
                <input
                    type="text"
                    className="admin-input-small"
                    value={formData.bg_gradient}
                    onChange={e => setFormData({ ...formData, bg_gradient: e.target.value })}
                    placeholder="from-black/80 via-black/40 to-transparent"
                />
             </div>
          </div>

          <div>
             <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Settings</label>
             <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 accent-[#53A318] rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 leading-none">Display this slide live</span>
                      <span className="text-[10px] text-gray-500 font-medium">Toggle visibility on the homepage</span>
                    </div>
                </label>
                
                <div className="h-px bg-gray-200 w-full" />
                
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={formData.is_image_only}
                        onChange={e => setFormData({ ...formData, is_image_only: e.target.checked })}
                        className="w-5 h-5 accent-[#53A318] rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 leading-none">Image-Only Banner Mode</span>
                      <span className="text-[10px] text-gray-500 font-medium">Hides all text/buttons. The entire Background Image acts as a link.</span>
                    </div>
                </label>
             </div>
          </div>

          {!formData.is_image_only && (
            <div className={`p-4 rounded-2xl text-white transition-all duration-500 bg-gradient-to-r ${formData.bg_gradient} relative overflow-hidden`}>
               <div className="text-[10px] font-black uppercase text-white/50 mb-2">Live Theme Preview</div>
               <div className="flex items-center gap-4 relative z-10">
                 <div className="flex-1 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#90e050] mb-1">{formData.tag_text || "Tag Placeholder"}</div>
                    <div className="text-lg font-black leading-tight">{formData.title || "Headline"}</div>
                    <div className="text-[#90e050] font-black text-sm">{formData.accent_text}</div>
                    <div className="bg-[#53A318] text-[10px] font-bold px-3 py-1.5 rounded-full inline-block mt-2 shadow-lg">
                        {formData.button_text}
                    </div>
                 </div>
                 {formData.featured_image_url && (
                   <div className="w-20 h-20 rounded-xl bg-white/20 border border-white/20 overflow-hidden shadow-2xl rotate-3">
                     <img src={formData.featured_image_url} className="w-full h-full object-cover" alt="Promo" />
                   </div>
                 )}
               </div>
            </div>
          )}
          {formData.is_image_only && (
            <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200">
               <div className="text-[10px] font-black uppercase text-gray-400 mb-2">Image-Only Preview</div>
               <p className="text-xs text-gray-500 font-bold">Text and gradient will be hidden. The banner will only display your selected Background Image.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-8 py-2.5 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {isLoading ? "Saving..." : "Save Carousel Slide"}
        </button>
      </div>
    </form>
  );
}
