"use client";

import { useState } from "react";
import { Layers, GripVertical, Settings2, EyeOff, Layout, ChevronUp, ChevronDown, Check, X, Trash2, Save, RotateCcw, Plus, Search, Image as ImageIcon, ExternalLink, Edit3 } from "lucide-react";
import AddSectionModal from "@/components/admin/AddSectionModal";
import HeroForm from "@/components/admin/HeroForm";
import { useRouter } from "next/navigation";

interface HomepageLayoutManagerClientProps {
  initialSections: any[];
  initialHeroSlides: any[];
  categories: any[];
  seasons: any[];
}

export default function HomepageLayoutManagerClient({ initialSections, initialHeroSlides, categories, seasons }: HomepageLayoutManagerClientProps) {
  const [activeTab, setActiveTab] = useState<"carousels" | "hero">("hero");
  const [sections, setSections] = useState(initialSections);
  const [heroSlides, setHeroSlides] = useState(initialHeroSlides);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [heroFormConfig, setHeroFormConfig] = useState<{ isOpen: boolean; slide: any | null }>({ isOpen: false, slide: null });
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const filteredSections = sections.filter(s => {
    const label = s.title || s.categories?.label || s.seasons?.name || "";
    return label.toLowerCase().includes(search.toLowerCase());
  });

  // ── REORDERING LOGIC ───────────────────────────────────────────────────────
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    const [movedItem] = newSections.splice(index, 1);
    newSections.splice(newIndex, 0, movedItem);

    // Update sort_order based on new array index
    const reordered = newSections.map((s, i) => ({ ...s, sort_order: (i + 1) * 10 }));
    setSections(reordered);
    setHasChanges(true);
  };

  // ── UPDATE LOGIC ──────────────────────────────────────────────────────────
  const updateSectionLocal = (id: string, updates: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasChanges(true);
  };

  const saveAllChanges = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          data: {
            items: sections.map((s, i) => ({
              id: s.id,
              sort_order: (i + 1) * 10,
              title: s.title,
              max_items: s.max_items,
              is_visible: s.is_visible
            }))
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to save layout");
      
      setHasChanges(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (source: { type: 'category' | 'season', id: string, name: string }) => {
    setIsLoading(true);
    try {
      const payload = source.type === 'category' 
        ? { category_id: source.id, title: null, sort_order: (sections.length + 1) * 10 }
        : { season_id: source.id, title: null, sort_order: (sections.length + 1) * 10 };

      const response = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-section",
          data: payload
        }),
      });

      if (!response.ok) throw new Error("Failed to add section");
      
      setIsAddModalOpen(false);
      // Faster UI: refresh the whole data set from server
      router.refresh();
      // Temporary local addition
      const newSec = { 
        id: Math.random().toString(), // temp id
        ...payload, 
        categories: source.type === 'category' ? { label: source.name, emoji: '🏷️' } : null,
        seasons: source.type === 'season' ? { name: source.name } : null
      };
      setSections([...sections, newSec]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Are you sure? This carousel will be removed from the homepage.")) return;
    setIsLoading(true);
    try {
      await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-section", id }),
      });
      setSections(prev => prev.filter(s => s.id !== id));
      router.refresh();
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  // ── HERO SLIDE LOGIC ────────────────────────────────────────────────────────
  const saveHeroChanges = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: heroSlides.map((s, i) => ({ id: s.id, sort_order: (i + 1) * 10 }))
        }),
      });
      if (!response.ok) throw new Error("Failed to save sequence");
      setHasChanges(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroSave = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: heroFormConfig.slide ? "update" : "create",
          id: heroFormConfig.slide?.id,
          data
        }),
      });
      if (!response.ok) throw new Error("Failed to save slide");
      setHeroFormConfig({ isOpen: false, slide: null });
      router.refresh();
      // Optimization: Refresh local state manually if needed, but router.refresh() is safer
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHeroSlide = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setIsLoading(true);
    try {
      await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      setHeroSlides(prev => prev.filter(s => s.id !== id));
      router.refresh();
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const moveHeroSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= heroSlides.length) return;
    const newSlides = [...heroSlides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(newIndex, 0, moved);
    setHeroSlides(newSlides);
    setHasChanges(true);
  };

  const existingSourceIds = new Set(sections.map(s => s.category_id || s.season_id).filter(Boolean));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Homepage Layout</h1>
          <p className="text-gray-500 mt-1">Configure carousel order, featured sections, and visibility.</p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button 
              onClick={() => { 
                if (activeTab === 'carousels') setSections(initialSections); 
                else setHeroSlides(initialHeroSlides);
                setHasChanges(false); 
              }}
              className="bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
          )}
          <button 
            disabled={!hasChanges || isLoading}
            onClick={activeTab === 'carousels' ? saveAllChanges : saveHeroChanges}
            className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${
                hasChanges 
                ? "bg-[#53A318] text-white hover:scale-105" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Check size={16} /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 gap-8">
         <button 
            onClick={() => setActiveTab('hero')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                activeTab === 'hero' ? 'text-[#53A318]' : 'text-gray-400'
            }`}
         >
            Hero Banners
            {activeTab === 'hero' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#53A318] rounded-t-full" />}
         </button>
         <button 
            onClick={() => setActiveTab('carousels')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                activeTab === 'carousels' ? 'text-[#53A318]' : 'text-gray-400'
            }`}
         >
            Landing Carousels
            {activeTab === 'carousels' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#53A318] rounded-t-full" />}
         </button>
      </div>

      {/* Global Search Feature */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search homepage carousels..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {activeTab === 'carousels' ? (
          <>
            {filteredSections.length === 0 && (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-2">
                    <Layers size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No carousels matching your search.</p>
                </div>
            )}

            {filteredSections.map((section, index) => {
              const isEditing = editingSectionId === section.id;
              const label = section.title || section.categories?.label || section.seasons?.name || "Untitled Section";
              
              return (
                <div 
                  key={section.id} 
                  className={`bg-white p-4 rounded-3xl border transition-all flex flex-col gap-4 ${
                    isEditing ? "border-[#53A318] shadow-lg ring-4 ring-[#53A318]/5" : "border-gray-100 shadow-sm hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Drag / Sort Handle */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-lg text-gray-300 hover:text-[#53A318] hover:bg-emerald-50 disabled:opacity-30 transition-all font-bold"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button 
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-1 rounded-lg text-gray-300 hover:text-[#53A318] hover:bg-emerald-50 disabled:opacity-30 transition-all font-bold"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs border border-gray-100">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           {section.categories?.emoji && <span className="text-lg">{section.categories.emoji}</span>}
                           <h3 className="text-sm font-black text-gray-900 leading-none">{label}</h3>
                           {!section.is_visible && <EyeOff size={12} className="text-gray-400" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            section.category_id ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'
                          }`}>
                            {section.category_id ? 'Category' : 'Season'}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Source ID: {section.category_id || section.season_id}</span>
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Max Items</span>
                            <span className="text-sm font-black text-gray-900">{section.max_items || 15}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingSectionId(section.id)}
                              className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#53A318] hover:bg-emerald-50 transition-all border border-gray-100"
                            >
                              <Settings2 size={16} />
                            </button>
                            <button 
                              onClick={() => updateSectionLocal(section.id, { is_visible: !section.is_visible })}
                              className={`p-3 rounded-2xl transition-all border ${
                                section.is_visible ? "bg-gray-50 text-gray-400 hover:bg-gray-100" : "bg-red-50 text-red-500 border-red-100"
                              }`}
                            >
                              <EyeOff size={16} />
                            </button>
                            <button 
                              onClick={() => deleteSection(section.id)}
                              className="p-3 rounded-2xl bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Panel */}
                  {isEditing && (
                    <div className="mt-2 pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Override Landing Title</label>
                          <input 
                            type="text" 
                            value={section.title || ""} 
                            onChange={(e) => updateSectionLocal(section.id, { title: e.target.value })}
                            placeholder="Default category label"
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-[#53A318] transition-all"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Max Carousel Items</label>
                          <input 
                            type="number" 
                            value={section.max_items || 15} 
                            onChange={(e) => updateSectionLocal(section.id, { max_items: parseInt(e.target.value) })}
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-[#53A318] transition-all"
                          />
                       </div>
                       <div className="flex items-end gap-2">
                          <button 
                            onClick={() => setEditingSectionId(null)}
                            className="flex-1 bg-[#53A318] text-white py-3 rounded-xl text-xs font-black shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
                          >
                             <Check size={14} /> Finish Editing
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-6 text-gray-400 font-bold hover:border-[#53A318] hover:text-[#53A318] transition-all flex items-center justify-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="uppercase text-xs tracking-widest font-black">Add New Landing Carousel</span>
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {heroSlides.length === 0 && (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-2">
                    <ImageIcon size={40} className="text-gray-300" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hero slides created yet.</p>
                </div>
            )}

            {heroSlides.map((slide, index) => (
              <div key={slide.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all flex flex-col gap-4">
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => moveHeroSlide(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-lg text-gray-300 hover:text-[#53A318] disabled:opacity-30 transition-all"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button 
                          onClick={() => moveHeroSlide(index, 'down')}
                          disabled={index === heroSlides.length - 1}
                          className="p-1 rounded-lg text-gray-300 hover:text-[#53A318] disabled:opacity-30 transition-all"
                        >
                          <ChevronDown size={16} />
                        </button>
                    </div>
                    
                    <div className="w-16 h-12 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden relative group">
                        <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                        {!slide.is_active && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <EyeOff size={14} className="text-gray-500" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-black text-gray-900 leading-none">{slide.title}</h3>
                            {!slide.is_active && <span className="text-[9px] font-black uppercase text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">Hidden</span>}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 truncate max-w-[200px]">{slide.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Button</span>
                            <span className="text-[11px] font-black text-[#53A318]">{slide.button_text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => setHeroFormConfig({ isOpen: true, slide })}
                             className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#53A318] hover:bg-emerald-50 transition-all"
                           >
                              <Edit3 size={16} />
                           </button>
                           <button 
                             onClick={() => deleteHeroSlide(slide.id)}
                             className="p-3 rounded-2xl bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                    </div>
                 </div>
              </div>
            ))}

            <button 
              onClick={() => setHeroFormConfig({ isOpen: true, slide: null })}
              className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-6 text-gray-400 font-bold hover:border-[#53A318] hover:text-[#53A318] transition-all flex items-center justify-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="uppercase text-xs tracking-widest font-black">Add New Hero Slide</span>
            </button>
          </div>
        )}
      </div>

      <AddSectionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSection}
        categories={categories}
        seasons={seasons}
        existingSourceIds={existingSourceIds}
        isLoading={isLoading}
      />

      {/* Hero Slide Editor Modal */}
      {heroFormConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHeroFormConfig({ isOpen: false, slide: null })} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{heroFormConfig.slide ? "Edit Hero Slide" : "Create Hero Slide"}</h2>
                <p className="text-gray-500 text-sm">Design the main spotlight for the homepage.</p>
              </div>
              <button onClick={() => setHeroFormConfig({ isOpen: false, slide: null })} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <HeroForm 
                initialData={heroFormConfig.slide} 
                onSave={handleHeroSave} 
                onClose={() => setHeroFormConfig({ isOpen: false, slide: null })} 
                isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
