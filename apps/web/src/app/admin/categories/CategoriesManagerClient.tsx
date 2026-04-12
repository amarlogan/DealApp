"use client";

import { useState } from "react";
import { Plus, Edit2, RotateCw, Search, Filter } from "lucide-react";
import AdminModal from "@/components/admin/AdminModal";
import CategoryForm from "@/components/admin/CategoryForm";
import { useRouter } from "next/navigation";

export default function CategoriesManagerClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<number | 'all'>('all');

  const router = useRouter();

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.label.toLowerCase().includes(search.toLowerCase()) || 
                          cat.id.toLowerCase().includes(search.toLowerCase());
    const matchesPhase = phaseFilter === 'all' || cat.phase === phaseFilter;
    return matchesSearch && matchesPhase;
  });

  const handleSave = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingCategory ? "update" : "create",
          catId: editingCategory?.id,
          data
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      // Local update for immediate feedback
      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? result.category : c));
      } else {
        setCategories(prev => [result.category, ...prev]);
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 mt-1">Configure global product taxonomy and rollout phases.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search categories by label or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPhaseFilter(prev => prev === 'all' ? 1 : prev === 1 ? 2 : 'all')}
            className="px-4 py-2.5 rounded-2xl bg-gray-50 text-gray-600 text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Filter size={14} /> Phase: {phaseFilter === 'all' ? 'All' : `Phase ${phaseFilter}`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group overflow-hidden">
            {/* Background highlight for active status */}
             {!cat.is_active && <div className="absolute inset-0 bg-gray-50/50 grayscale-[0.5] -z-0 pointer-events-none" /> }

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                {cat.emoji || "🏷️"}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  cat.phase === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  Phase {cat.phase}
                </span>
                <span className="text-[10px] font-bold text-gray-400">Order: {cat.sort_order}</span>
              </div>
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1 relative z-10">{cat.label}</h3>
            
            {/* Visibility Indicators */}
            <div className="flex gap-2 mb-4 relative z-10">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                cat.show_in_nav ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 text-gray-400 border-gray-100 opacity-50'
              }`}>
                {cat.show_in_nav ? '✓ Top Nav' : 'No Nav'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                cat.show_on_home ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-100 opacity-50'
              }`}>
                {cat.show_on_home ? '✓ Homepage' : 'No Home'}
              </span>
            </div>

            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-4 relative z-10">{cat.id}</p>
            {cat.description && <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">{cat.description}</p>}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-50 relative z-10">
              <button 
                onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-[#53A318] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={12} /> Edit Config
              </button>
              <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-all">
                <RotateCw size={14} />
              </button>
            </div>

            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${cat.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`} />
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        title={editingCategory ? "Update Category Config" : "Initialize New Category"}
      >
        <CategoryForm 
          initialData={editingCategory}
          onSave={handleSave}
          isLoading={isLoading}
        />
      </AdminModal>
    </div>
  );
}
