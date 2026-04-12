"use client";

import { useState } from "react";
import { Palette, Calendar, Clock, Edit2, Plus, Trash2, Eye, Search } from "lucide-react";
import AdminModal from "@/components/admin/AdminModal";
import SeasonForm from "@/components/admin/SeasonForm";
import { useRouter } from "next/navigation";

export default function SeasonsManagerClient({ initialSeasons }: { initialSeasons: any[] }) {
  const [seasons, setSeasons] = useState(initialSeasons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const filteredSeasons = seasons.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingSeason ? "update" : "create",
          id: editingSeason?.id,
          data
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (editingSeason) {
        setSeasons(prev => prev.map(s => s.id === editingSeason.id ? result.season : s));
      } else {
        setSeasons(prev => [result.season, ...prev]);
      }

      setIsModalOpen(false);
      setEditingSeason(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the season and its deal associations.")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      if (!response.ok) throw new Error("Failed to delete");
      
      setSeasons(prev => prev.filter(s => s.id !== id));
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Seasonal & Themes</h1>
          <p className="text-gray-500 mt-1">Manage platform-wide thematic events and visual branding cycles.</p>
        </div>
        <button 
          onClick={() => { setEditingSeason(null); setIsModalOpen(true); }}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={16} /> New Season
        </button>
      </div>

      {/* Global Search Feature */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search seasons by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredSeasons.length === 0 && (
          <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-2">
            <Palette size={40} className="text-gray-300" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No seasons matching your search.</p>
          </div>
        )}

        {filteredSeasons.map((season) => {
          const isActive = today >= season.start_date && today <= season.end_date;
          const isUpcoming = today < season.start_date;
          const primaryColor = (season.css_variables as any)["--primary"] || "#000";
          
          return (
            <div key={season.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-md">
              <div 
                className="w-full md:w-56 p-8 flex flex-col items-center justify-center text-white relative"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30 shadow-lg">
                  <Palette size={32} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest opacity-80">
                   {isActive ? "Live Now" : isUpcoming ? "Scheduled" : "Concluded"}
                </span>
                {isActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" />}
              </div>

              <div className="flex-1 p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-gray-900">{season.name}</h2>
                    {isActive && (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">Active Theme</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mr-1">Starts</span>
                      <span className="font-bold text-gray-700">{season.start_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mr-1">Ends</span>
                      <span className="font-bold text-gray-700">{season.end_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => { setEditingSeason(season); setIsModalOpen(true); }}
                    className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-gray-50 text-gray-900 font-bold text-xs hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(season.id)}
                    className="p-3 rounded-2xl bg-red-50 text-red-400 hover:text-white hover:bg-red-500 transition-all border border-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSeason(null); }}
        title={editingSeason ? "Refine Season Profile" : "Initialize New Season"}
      >
        <SeasonForm 
          initialData={editingSeason}
          onSave={handleSave}
          isLoading={isLoading}
        />
      </AdminModal>
    </div>
  );
}
