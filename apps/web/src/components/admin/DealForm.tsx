"use client";

import { useState, useEffect } from "react";
import { Save, AlertTriangle, Percent, Trash2 } from "lucide-react";

interface DealFormProps {
  initialData?: any;
  categories: any[];
  seasons: any[];
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

interface DealFormData {
  title: string;
  merchant: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  image_url: string;
  external_url: string;
  category_id: string;
  is_popular: boolean;
  status: string;
  badge: string;
  season_ids: string[];
}

export default function DealForm({ initialData, categories, seasons, onSave, isLoading }: DealFormProps) {
  const [formData, setFormData] = useState<DealFormData>({
    title: "",
    merchant: "",
    current_price: 0,
    original_price: 0,
    discount_percentage: 0,
    image_url: "",
    external_url: "",
    category_id: "other",
    is_popular: false,
    status: "active",
    badge: "",
    season_ids: [] as string[],
    ...(initialData || {})
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Automatically calculate discount percentage
  useEffect(() => {
    if (formData.original_price > 0) {
      const discount = Math.round(((formData.original_price - formData.current_price) / formData.original_price) * 100);
      setFormData(prev => ({ ...prev, discount_percentage: Math.max(0, discount) }));
    }
  }, [formData.current_price, formData.original_price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Client-side guard rails
    const localErrors = [];
    if (formData.current_price > formData.original_price) {
      localErrors.push("GUARD RAIL: Current price cannot be higher than original price.");
    }
    if (!formData.title) localErrors.push("Title is required.");
    if (!formData.external_url) localErrors.push("Product URL is required.");

    if (localErrors.length > 0) {
      setErrors(localErrors);
      return;
    }

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 text-red-600 text-xs font-bold">
              <AlertTriangle size={12} /> {err}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Product Title</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. 15.6'' Business Laptop High Performance"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold placeholder:text-gray-300 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Pricing */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Current Price ($)</label>
          <input
            required
            type="number"
            step="0.01"
            value={formData.current_price}
            onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-black text-[#53A318] focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Original Price ($)</label>
          <input
            required
            type="number"
            step="0.01"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Merchant & URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Merchant / Store</label>
          <select
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          >
            <option value="">Select Store</option>
            <option value="Amazon">Amazon</option>
            <option value="Walmart">Walmart</option>
            <option value="Nike">Nike</option>
            <option value="Adidas">Adidas</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
        </div>

        {/* Seasonal Tags */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Seasonal Tags</label>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
            {seasons.length === 0 ? (
               <span className="text-xs text-gray-400 font-medium">No seasons defined. Manage them in "Seasonal & Themes"</span>
            ) : (
              seasons.map(season => {
                const isSelected = formData.season_ids.includes(season.id);
                return (
                  <button
                    key={season.id}
                    type="button"
                    onClick={() => {
                      const newIds = isSelected 
                        ? formData.season_ids.filter(id => id !== season.id)
                        : [...formData.season_ids, season.id];
                      setFormData({ ...formData, season_ids: newIds });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                      isSelected 
                        ? "bg-[#53A318] text-white border-[#53A318] shadow-md scale-105" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {season.name}
                  </button>
                );
              })
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-medium pl-1">Selected deals will appear in dedicated seasonal carousels on the homepage.</p>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Merchant Affiliate URL</label>
          <input
            required
            type="url"
            value={formData.external_url}
            onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl md:col-span-2">
           <label className="flex items-center gap-2 cursor-pointer select-none">
             <input
              type="checkbox"
              checked={formData.is_popular}
              onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
              className="w-4 h-4 text-[#53A318] rounded focus:ring-[#53A318]"
             />
             <span className="text-sm font-bold text-gray-700">Mark as Popular</span>
           </label>

           <label className="flex items-center gap-2 cursor-pointer select-none">
             <input
              type="checkbox"
              checked={formData.status === 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'expired' })}
              className="w-4 h-4 text-[#53A318] rounded focus:ring-[#53A318]"
             />
             <span className="text-sm font-bold text-gray-700">Is Active</span>
           </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-2 text-[#53A318] bg-emerald-50 px-4 py-2 rounded-xl">
           <Percent size={16} />
           <span className="text-xs font-black uppercase tracking-widest">Auto-Calculated Discount: {formData.discount_percentage}%</span>
         </div>
         
         <button
          disabled={isLoading}
          type="submit"
          className="bg-[#53A318] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
         >
           <Save size={18} />
           {isLoading ? "Saving..." : initialData ? "Update Deal" : "Create Deal"}
         </button>
      </div>
    </form>
  );
}
