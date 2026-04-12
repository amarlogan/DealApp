import { createSupabaseAdmin } from "@/lib/supabase-server";
import NavigationManagerClient from "./NavigationManagerClient";

export default async function AdminNavigationPage() {
  const supabase = createSupabaseAdmin();

  // Fetch navigation items (with category labels) and all categories for selection
  const [navRes, catRes] = await Promise.all([
    supabase
      .from("navigation_items")
      .select(`
        *,
        categories (
            label
        )
      `)
      .order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("id, label, emoji")
      .order("label")
  ]);

  if (navRes.error) {
    return (
      <div className="p-8 text-red-500 font-black tracking-tight uppercase border-2 border-red-100 bg-red-50 rounded-3xl">
        Navigation Sync Error: {navRes.error.message}
      </div>
    );
  }

  return (
    <NavigationManagerClient 
      initialItems={navRes.data || []} 
      categories={catRes.data || []} 
    />
  );
}
