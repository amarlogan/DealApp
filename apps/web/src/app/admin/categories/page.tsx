import { createSupabaseAdmin } from "@/lib/supabase-server";
import CategoriesManagerClient from "./CategoriesManagerClient";

export default async function AdminCategoriesPage() {
  const supabase = createSupabaseAdmin();

  // Fetch categories, navigation items, and landing sections in parallel
  const [categoriesRes, navRes, landingRes] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("phase", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase
      .from("navigation_items")
      .select("category_id"),
    supabase
      .from("landing_sections")
      .select("category_id")
  ]);

  if (categoriesRes.error) {
    return <div className="p-8 text-red-500 font-bold uppercase tracking-tight">Error: {categoriesRes.error.message}</div>;
  }

  // Create sets for fast lookup
  const navSet = new Set(navRes.data?.map(n => n.category_id).filter(Boolean));
  const landingSet = new Set(landingRes.data?.map(l => l.category_id).filter(Boolean));

  // Enrich categories with visibility flags
  const enrichedCategories = (categoriesRes.data || []).map(cat => ({
    ...cat,
    show_in_nav: navSet.has(cat.id),
    show_on_home: landingSet.has(cat.id)
  }));

  return <CategoriesManagerClient initialCategories={enrichedCategories} />;
}
