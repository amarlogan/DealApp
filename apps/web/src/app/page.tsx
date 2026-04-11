import HomeClient from "./HomeClient";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createSupabaseAdmin();
  
  // 1. Fetch Deals with their seasonal associations
  // Increased limit to 200 to ensure we have enough diversity for all sections
  const { data: dealsData, error: dealsError } = await supabase
    .from("deals")
    .select("*, deal_seasons(season_id)")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(200)
    .order("discount_percentage", { ascending: false });

  if (dealsError) {
    console.error("Error fetching deals:", dealsError);
  }
  
  // 2. Fetch Landing Sections with their categories OR seasons
  const { data: sectionsData, error: sectionsError } = await supabase
    .from("landing_sections")
    .select(`
      id, title, sort_order, category_id, season_id, max_items,
      categories ( id, label, emoji, phase ),
      seasons ( id, name, css_variables )
    `)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    console.error("Error fetching landing sections:", sectionsError);
  }

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
