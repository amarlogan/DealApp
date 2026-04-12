"use client";

import { useState } from "react";
import AdminModal from "./AdminModal";
import { Search, Tag, Palette, Calendar, Plus } from "lucide-react";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (source: { type: 'category' | 'season', id: string, name: string }) => Promise<void>;
  categories: any[];
  seasons: any[];
  existingSourceIds: Set<string>;
  isLoading: boolean;
}

export default function AddSectionModal({ isOpen, onClose, onAdd, categories, seasons, existingSourceIds, isLoading }: AddSectionModalProps) {
  const [tab, setTab] = useState<'categories' | 'seasons'>('categories');
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter(c => 
    !existingSourceIds.has(c.id) && 
    (c.label.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredSeasons = seasons.filter(s => 
    !existingSourceIds.has(s.id) && 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Homepage Section"
    >
      <div className="space-y-6">
        {/* Search & Tabs */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search available sources..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
            />
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-2xl">
            <button 
              onClick={() => setTab('categories')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
                tab === 'categories' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Tag size={14} /> Categories
            </button>
            <button 
              onClick={() => setTab('seasons')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
                tab === 'seasons' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Palette size={14} /> Seasons
            </button>
          </div>
        </div>

        {/* Source List */}
        <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {tab === 'categories' ? (
            filteredCategories.length === 0 ? (
               <p className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-widest">No available categories</p>
            ) : filteredCategories.map(cat => (
              <button
                key={cat.id}
                disabled={isLoading}
                onClick={() => onAdd({ type: 'category', id: cat.id, name: cat.label })}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#53A318] hover:bg-emerald-50/30 transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 leading-none mb-1">{cat.label}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{cat.id}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#53A318] group-hover:text-white transition-all">
                  <Plus size={16} />
                </div>
              </button>
            ))
          ) : (
            filteredSeasons.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-widest">No available seasons</p>
            ) : filteredSeasons.map(season => (
              <button
                key={season.id}
                disabled={isLoading}
                onClick={() => onAdd({ type: 'season', id: season.id, name: season.name })}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#53A318] hover:bg-emerald-50/30 transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: (season.css_variables as any)["--primary"] || "#000" }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 leading-none mb-1">{season.name}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{season.start_date} to {season.end_date}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#53A318] group-hover:text-white transition-all">
                  <Plus size={16} />
                </div>
              </button>
            ))
          )}
        </div>

        <p className="text-center text-[10px] text-gray-400 font-medium">Selecting a source will create a new live carousel on the homepage.</p>
      </div>
    </AdminModal>
  );
}
