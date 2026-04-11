import HomeClient from "./HomeClient";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createSupabaseAdmin();
  
  // 1. Fetch Deals
  const { data: dealsData } = await supabase
    .from("deals")
    .select("*")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(48)
    .order("discount_percentage", { ascending: false });

  // 2. Fetch Landing Sections with their categories
  const { data: sectionsData } = await supabase
    .from("landing_sections")
    .select(`
      id, title, sort_order, category_id, max_items,
      categories ( id, label, emoji, phase )
    `)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  // 3. Fetch Top Categories for category tiles (phase 1)
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .eq("phase", 1)
    .order("sort_order", { ascending: true })
    .limit(4);

  // 4. Fetch Coming Soon Categories
  const { data: upcomingData } = await supabase
    .from("categories")
    .select("*")
    .eq("phase", 2)
    .order("sort_order", { ascending: true });

  return (
    <HomeClient 
      initialDeals={dealsData || []} 
      landingSections={(sectionsData as any) || []}
      topCategories={categoriesData || []}
      upcomingCategories={upcomingData || []}
    />
  );
}
