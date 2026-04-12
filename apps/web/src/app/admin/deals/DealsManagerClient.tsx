"use client";

import { useState } from "react";
import { Search, Filter, Edit3, ExternalLink, Trash2, CheckCircle2, XCircle, Plus, ShoppingBag } from "lucide-react";
import AdminModal from "@/components/admin/AdminModal";
import DealForm from "@/components/admin/DealForm";
import { useRouter } from "next/navigation";

export default function DealsManagerClient({ 
  deals: initialDeals, 
  categories, 
  seasons 
}: { 
  deals: any[], 
  categories: any[], 
  seasons: any[] 
}) {
  const [deals, setDeals] = useState(initialDeals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleOpenCreate = () => {
    setEditingDeal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (deal: any) => {
    setEditingDeal(deal);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingDeal ? "update" : "create",
          dealId: editingDeal?.id,
          data
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save deal");

      // Refresh list
      setIsModalOpen(false);
      router.refresh(); // Request server component re-fetch
      
      // Optmistically update local state for immediate feedback
      if (editingDeal) {
        setDeals(deals.map(d => d.id === result.deal.id ? result.deal : d));
      } else {
        setDeals([result.deal, ...deals]);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal? This action cannot be undone.")) return;
    
    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", dealId: id })
      });

      if (!res.ok) throw new Error("Failed to delete deal");
      setDeals(deals.filter(d => d.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredDeals = deals.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.merchant.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Deals Manager</h1>
          <p className="text-gray-500 mt-1">Manage platform inventory, verify prices, and update merchant links.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#53A318] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={18} /> Add New Deal
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative text-gray-400 focus-within:text-[#53A318] transition-colors">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search deals by title or merchant..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-gray-100 rounded-xl p-1 gap-1">
             <div className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">All ({deals.length})</div>
             <div className="text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg">Active ({deals.filter(d => d.status === 'active').length})</div>
          </div>
        </div>
      </div>

      {/* ── Deals Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Deal Info</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Pricing</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <ShoppingBag size={48} strokeWidth={1} />
                    <p className="font-bold">No deals found matching your search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                         {deal.image_url ? (
                           <img src={deal.image_url} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-xs">NO IMG</div>
                         )}
                      </div>
                      <div className="flex flex-col gap-0.5 max-w-[350px]">
                        <span className="text-sm font-black text-gray-900 truncate leading-snug">{deal.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{deal.merchant}</span>
                          <span className="text-gray-300 text-[10px]">•</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{deal.category_id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {deal.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase ring-1 ring-emerald-100">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-400 text-[10px] font-black uppercase ring-1 ring-gray-100">
                          <XCircle size={10} /> {deal.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-emerald-600">${deal.current_price.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 line-through">${deal.original_price.toFixed(2)}</span>
                      <div className="bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                         <span className="text-[9px] font-black text-emerald-700">-{deal.discount_percentage}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(deal)}
                        title="Edit Deal" 
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-600 hover:text-[#53A318] hover:border-[#53A318] transition-all shadow-sm hover:scale-110"
                      >
                        <Edit3 size={16} />
                      </button>
                      <a 
                        href={deal.external_url} 
                        target="_blank" 
                        title="View Source" 
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-600 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm hover:scale-110"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button 
                        onClick={() => handleDelete(deal.id)}
                        title="Delete Deal" 
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal ── */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingDeal ? "Edit Deal Inventory" : "Register New Deal"}
      >
        <DealForm 
          initialData={editingDeal ? {
            ...editingDeal,
            season_ids: editingDeal.deal_seasons?.map((ds: any) => ds.season_id) || []
          } : null} 
          categories={categories}
          seasons={seasons}
          onSave={handleSave} 
          isLoading={isLoading} 
        />
      </AdminModal>
    </div>
  );
}
