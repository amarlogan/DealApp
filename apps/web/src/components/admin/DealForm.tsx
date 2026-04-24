"use client";

import { useState, useEffect, useRef } from "react";
import { Save, AlertTriangle, Percent, Trash2, Info, Bold, Italic, List, Link as LinkIcon, Quote } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import TurndownService from "turndown";

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
  promo_code: string;
  description: string;
  season_ids: string[];
  images: string[];
  expires_at: string | null;
}

export default function DealForm({ initialData, categories, seasons, onSave, isLoading }: DealFormProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<DealFormData>({
    title: initialData?.title || "",
    merchant: initialData?.merchant || "",
    current_price: initialData?.current_price || 0,
    original_price: initialData?.original_price || 0,
    discount_percentage: initialData?.discount_percentage || 0,
    image_url: initialData?.image_url || "",
    external_url: initialData?.external_url || "",
    category_id: initialData?.category_id || "electronics",
    is_popular: initialData?.is_popular || false,
    status: initialData?.status || "active",
    badge: initialData?.badge || "",
    promo_code: initialData?.promo_code || "",
    description: initialData?.description || "",
    season_ids: initialData?.season_ids || [],
    images: initialData?.images || [],
    expires_at: initialData?.expires_at ? new Date(initialData.expires_at).toISOString().slice(0, 16) : null
  });

  const [errors, setErrors] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = formData.description;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selection}${suffix}${after}`;
    setFormData({ ...formData, description: newText });

    // Reset focus and selection
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced'
      });
      const markdown = turndownService.turndown(html);
      
      const start = textareaRef.current!.selectionStart;
      const end = textareaRef.current!.selectionEnd;
      const text = formData.description;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      setFormData({ ...formData, description: `${before}${markdown}${after}` });
    }
  };

  // Automatically calculate discount percentage
  useEffect(() => {
    const current = formData.current_price || 0;
    const original = formData.original_price || 0;
    
    if (original > 0 && !isNaN(current) && !isNaN(original)) {
      const discount = Math.round(((original - current) / original) * 100);
      setFormData(prev => ({ ...prev, discount_percentage: Math.max(0, discount) }));
    } else {
      setFormData(prev => ({ ...prev, discount_percentage: 0 }));
    }
  }, [formData.current_price, formData.original_price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Client-side guard rails
    const localErrors = [];
    
    if (isNaN(formData.current_price) || isNaN(formData.original_price)) {
      localErrors.push("Please enter valid numeric prices.");
    } else if (formData.current_price > formData.original_price) {
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
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
              setFormData({ ...formData, current_price: val });
            }}
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
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
              setFormData({ ...formData, original_price: val });
            }}
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
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Primary Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Gallery Images */}
        <div className="md:col-span-2 space-y-3 p-4 bg-gray-50/50 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between pl-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Image Gallery (Additional Photos)</label>
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
              className="text-[10px] font-black text-[#53A318] uppercase tracking-widest hover:underline"
            >
              + Add Photo
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.images.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[index] = e.target.value;
                    setFormData({ ...formData, images: newImages });
                  }}
                  placeholder="https://..."
                  className="flex-1 bg-white border-none rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {formData.images.length === 0 && (
              <p className="text-[10px] text-gray-400 font-medium pl-1 italic">No additional images. The primary image will be shown alone.</p>
            )}
          </div>
        </div>

        {/* Description / Markdown */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between pl-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Deal Description (Markdown)</label>
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
               <button 
                 type="button"
                 onClick={() => setPreviewMode(false)}
                 className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!previewMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
               >
                 Write
               </button>
               <button 
                 type="button"
                 onClick={() => setPreviewMode(true)}
                 className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${previewMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
               >
                 Preview
               </button>
            </div>
          </div>
          
          {previewMode ? (
            <div className="w-full bg-white border-2 border-gray-50 rounded-2xl p-6 min-h-[300px] shadow-inner overflow-y-auto max-h-[500px]">
               <MarkdownContent content={formData.description || "_No content to preview yet._"} />
            </div>
          ) : (
            <div className="space-y-0 overflow-hidden rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-[#53A318] transition-all">
              {/* Toolbar */}
              <div className="bg-gray-100/80 p-2 flex items-center gap-1 border-b border-gray-100">
                <button type="button" onClick={() => insertMarkdown("**", "**")} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-all" title="Bold"><Bold size={16} /></button>
                <button type="button" onClick={() => insertMarkdown("_", "_")} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-all" title="Italic"><Italic size={16} /></button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button type="button" onClick={() => insertMarkdown("- ")} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-all" title="Bullet List"><List size={16} /></button>
                <button type="button" onClick={() => insertMarkdown("> ")} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-all" title="Quote"><Quote size={16} /></button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button type="button" onClick={() => insertMarkdown("[", "](url)")} className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-all" title="Insert Link"><LinkIcon size={16} /></button>
                <div className="flex-1" />
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest pr-2">Paste HTML to convert</span>
              </div>
              
              <textarea
                ref={textareaRef}
                value={formData.description}
                onPaste={handlePaste}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Introduce the deal, add product details and store info using Markdown (**bold**, - bullets, [links]()...)"
                rows={12}
                className="w-full bg-gray-50 border-none p-4 text-sm font-semibold placeholder:text-gray-300 focus:ring-0 transition-all resize-none min-h-[300px]"
              />
            </div>
          )}
          <p className="text-[10px] text-gray-400 font-medium pl-1 flex items-center gap-1">
            <Info size={10} className="text-blue-500" /> Use standard Markdown for professional formatting.
          </p>
        </div>

        {/* Marketing Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Promo Code</label>
          <input
            type="text"
            value={formData.promo_code}
            onChange={(e) => setFormData({ ...formData, promo_code: e.target.value })}
            placeholder="e.g. SAVE20"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-black text-purple-600 placeholder:text-gray-300 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Display Tag / Badge</label>
            <span className="text-[10px] text-gray-400 font-bold pr-1">Displayed on images</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {["Hot Deal", "Deal of the Day", "Best Seller", "Amazon Choice", "Rollback", "Editor's Choice", "Flash Deal", "Price Drop"].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setFormData({ ...formData, badge: formData.badge === tag ? "" : tag })}
                className={`px-3 py-1.5 text-[11px] font-black rounded-full border transition-all ${
                  formData.badge === tag 
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            placeholder="Or type a custom badge (e.g. Clearance)"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold placeholder:text-gray-300 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>

        {/* Expiry Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Deal Expiry (Optional)</label>
          <input
            type="datetime-local"
            value={formData.expires_at || ""}
            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value || null })}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#53A318] transition-all"
          />
          <p className="text-[10px] text-gray-400 font-medium pl-1 italic">Leave blank for no expiry.</p>
        </div>

        <div className="flex items-center gap-6 p-4 bg-gray-100/50 rounded-2xl md:col-span-2">
           <label className="flex items-center gap-2 cursor-pointer select-none">
             <input
              type="checkbox"
              checked={formData.is_popular}
              onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
              className="w-4 h-4 text-[#53A318] rounded focus:ring-[#53A318]"
             />
             <span className="text-sm font-black text-gray-700">Mark as Popular</span>
           </label>

           <label className="flex items-center gap-2 cursor-pointer select-none">
             <input
              type="checkbox"
              checked={formData.status === 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'expired' })}
              className="w-4 h-4 text-[#53A318] rounded focus:ring-[#53A318]"
             />
             <span className="text-sm font-black text-gray-700">Is Active Deal</span>
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
