import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Home, Layers, GripVertical, Settings2, EyeOff, Layout } from "lucide-react";

export default async function AdminHomepagePage() {
  const supabase = createSupabaseAdmin();

  const { data: sections, error } = await supabase
    .from("landing_sections")
    .select(`
      *,
      categories ( label, emoji ),
      seasons ( name )
    `)
    .order("sort_order", { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500 font-bold uppercase tracking-widest">Load Error: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Homepage Layout</h1>
          <p className="text-gray-500 mt-1">Configure carousel order, featured sections, and visibility.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors">
            Reset Layout
          </button>
          <button className="bg-[#53A318] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
            <Layers size={16} /> Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sections?.map((section, index) => (
          <div key={section.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-[#53A318]/30 transition-colors">
            <div className="flex items-center gap-4">
              <button className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                <GripVertical size={20} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-[#f0f7fb] flex items-center justify-center text-[#53A318] shadow-inner font-black text-xs">
                {index + 1}
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
              <div className="flex-1">
                <h3 className="text-sm font-black text-gray-900 leading-none mb-1.5 flex items-center gap-2">
                  {section.title || section.categories?.label || section.seasons?.name || "Untitled Section"}
                  {!section.is_visible && <EyeOff size={12} className="text-gray-300" />}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Type: <span className="text-gray-600">{section.category_id ? 'Category' : section.season_id ? 'Season' : 'Manual'}</span>
                  </span>
                  <span className="text-gray-300 font-light">|</span>
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Source: <span className="text-gray-600">{section.category_id || section.season_id || 'Static'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Items</span>
                  <span className="text-sm font-black text-gray-900">{section.max_items || 12}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#53A318] hover:bg-[#f0f7fb] transition-all">
                    <Settings2 size={16} />
                  </button>
                  <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <EyeOff size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-6 text-gray-400 font-bold hover:border-[#53A318] hover:text-[#53A318] transition-all flex items-center justify-center gap-2 group">
          <Layout size={18} className="group-hover:scale-110 transition-transform" />
          <span>Add Custom Homepage Section</span>
        </button>
      </div>
    </div>
  );
}
