import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Tag, Plus, Edit2, RotateCw } from "lucide-react";

export default async function AdminCategoriesPage() {
  const supabase = createSupabaseAdmin();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("phase", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500 font-bold">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 mt-1">Configure global product taxonomy and rollout phases.</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories?.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex items-start justify-between mb-4">
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

            <h3 className="text-lg font-black text-gray-900 mb-1">{cat.label}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-4">{cat.id}</p>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
              <button className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-[#53A318] hover:text-white transition-all flex items-center justify-center gap-2">
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
    </div>
  );
}
