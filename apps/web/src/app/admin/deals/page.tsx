import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Search, Filter, Edit3, ExternalLink, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminDealsPage() {
  const supabase = createSupabaseAdmin();

  // Fetch all deals for management (including non-active)
  const { data: deals, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500 uppercase font-black">Error loading inventory: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Deals Manager</h1>
          <p className="text-gray-500 mt-1">Manage platform inventory, verify prices, and update merchant links.</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2 flex-shrink-0">
          <span className="text-lg">+</span> Add New Deal
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search deals by title, merchant or category..." 
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 rounded-2xl bg-gray-50 text-gray-600 text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <Filter size={14} /> Status: All
          </button>
          <button className="px-4 py-2.5 rounded-2xl bg-gray-50 text-gray-600 text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <Filter size={14} /> Shop: All
          </button>
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
            {deals?.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                       {deal.image_url ? (
                         <img src={deal.image_url} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300">🖼️</div>
                       )}
                    </div>
                    <div className="flex flex-col gap-0.5 max-w-[300px]">
                      <span className="text-sm font-black text-gray-900 truncate leading-snug">{deal.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{deal.merchant}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{deal.category_id}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {deal.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#53A318] text-[10px] font-black uppercase ring-1 ring-emerald-100">
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
                    <span className="text-sm font-black text-[#53A318]">${deal.current_price.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 line-through">${deal.original_price.toFixed(2)}</span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 rounded mt-0.5">-{deal.discount_percentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Edit Deal" className="p-2 rounded-xl border border-gray-100 bg-white text-gray-600 hover:text-[#53A318] hover:border-[#53A318] transition-all shadow-sm">
                      <Edit3 size={15} />
                    </button>
                    <a href={deal.external_url} target="_blank" title="View Source" className="p-2 rounded-xl border border-gray-100 bg-white text-gray-600 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm">
                      <ExternalLink size={15} />
                    </a>
                    <button title="Delete Deal" className="p-2 rounded-xl border border-gray-100 bg-white text-gray-600 hover:text-red-500 hover:border-red-500 transition-all shadow-sm">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
