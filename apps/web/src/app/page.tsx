import HomeClient from "./HomeClient";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300; // 5 minutes fresh

export default async function Home() {
  const supabaseAdmin = createSupabaseAdmin();
  const supabaseServer = await createSupabaseServerClient();
  
  // 1. Fetch User Session (to sync favorite status)
  const { data: { user } } = await supabaseServer.auth.getUser();
  let favoriteIds: string[] = [];
  
  if (user) {
    const { data: favData } = await supabaseServer
      .from("favorites")
      .select("deal_id")
      .eq("user_id", user.id);
    
    if (favData) {
      favoriteIds = favData.map(f => f.deal_id);
    }
  }

  // 2. Fetch Deals with their seasonal associations
  // Increased limit to 200 to ensure we have enough diversity for all sections
  const { data: dealsData, error: dealsError } = await supabaseAdmin
    .from("deals")
    .select("*, deal_seasons(season_id)")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(200)
    .order("discount_percentage", { ascending: false });

  if (dealsError) {
    console.error("Error fetching deals:", dealsError);
  }
  
  const { data: sectionsData, error: sectionsError } = await supabaseAdmin
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

  // 3. Fetch All Active Categories with their deal counts
  const { data: categoriesData } = await supabaseAdmin
    .from("categories")
    .select(`
      *,
      deal_count:deals(count)
    `)
    .eq("is_active", true)
    .eq("deals.status", "active")
    .eq("deals.in_stock", true)
    .order("sort_order", { ascending: true })
    .limit(50);

  // Transform to make deal_count a single number
  const topCategories = (categoriesData || []).map(cat => ({
    ...cat,
    deal_count: (cat as any).deal_count?.[0]?.count || 0
  }));

  // 4. Fetch Coming Soon Categories
  const { data: upcomingData } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("phase", 2)
    .order("sort_order", { ascending: true });

  // 5. Fetch Hero Slides
  const { data: heroSlidesData } = await supabaseAdmin
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <HomeClient 
      initialDeals={dealsData || []} 
      landingSections={(sectionsData as any) || []}
      topCategories={categoriesData || []}
      upcomingCategories={upcomingData || []}
      heroSlides={heroSlidesData || []}
      favoriteIds={favoriteIds}
    />
  );
}
