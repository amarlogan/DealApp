import { createSupabaseAdmin } from "@/lib/supabase-server";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function CategoriesPage() {
  const supabase = createSupabaseAdmin();

  // Fetch all visible categories through navigation_items to match desktop nav
  const { data: navItems } = await supabase
    .from("navigation_items")
    .select(`
      id, label_override, category_id,
      categories ( id, label, emoji, description )
    `)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  const categories = navItems || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <a href="/" className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </a>
        <h1 className="text-xl font-black text-gray-900">All Categories</h1>
      </div>

      {/* Grid */}
      <div className="p-6 pb-24 grid grid-cols-1 gap-4">
        {categories.map((item: any) => {
          const cat = item.categories;
          const label = item.label_override || cat?.label || "Unknown";
          const href = item.category_id ? `/category/${item.category_id}` : "#";

          return (
            <a 
              key={item.id}
              href={href}
              className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-[var(--primary-light)] border border-transparent hover:border-[var(--primary)] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat?.emoji || "📦"}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-gray-900 group-hover:text-[var(--primary)] transition-colors tracking-tight">
                    {label}
                  </span>
                  {cat?.description && (
                    <span className="text-xs text-gray-400 line-clamp-1">{cat.description}</span>
                  )}
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
            </a>
          );
        })}
      </div>

      {/* Branding Footer */}
      <div className="px-6 py-8 text-center bg-gray-50 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">HuntMyDeal</p>
        <p className="text-[10px] text-gray-300 italic">Finding you the best deals, every single day.</p>
      </div>
    </div>
  );
}
