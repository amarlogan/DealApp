import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";
import DealsClient from "./DealsClient";

export const revalidate = 60; // Refresh more frequently than home

export default async function DealsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; tag?: string; season?: string; featured?: string }>;
}) {
  const { category, tag, season, featured } = await searchParams;
  const isFeatured = featured === "true";
  const supabaseAdmin = createSupabaseAdmin();
  const supabaseServer = await createSupabaseServerClient();
  
  let seasonName = "";
  if (season) {
    const { data: sData } = await supabaseAdmin
      .from("seasons")
      .select("name")
      .eq("id", season)
      .single();
    if (sData) seasonName = sData.name;
  }
  
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

  // 2. Fetch Initial Deals (Page 1)
  let selectString = "*";
  if (season) {
    selectString = "*, deal_seasons!inner(season_id)";
  }

  let query = supabaseAdmin
    .from("deals")
    .select(selectString)
    .eq("status", "active")
    .eq("in_stock", true);

  if (category) query = query.eq("category_id", category);
  if (tag) {
    if (tag === "Flash Deal") {
      query = query.gte("discount_percentage", 40).is("badge", null);
    } else {
      query = query.eq("badge", tag);
    }
  }
  if (season) query = query.eq("deal_seasons.season_id", season);
  if (isFeatured) {
    query = query.or("is_popular.eq.true,discount_percentage.gte.30");
  }

  const [{ data: dealsData }, { data: categoriesData }] = await Promise.all([
    query.limit(24).order("created_at", { ascending: false }),
    supabaseAdmin
      .from("categories")
      .select(`
        id, label, emoji,
        deals ( count )
      `)
      .eq("is_active", true)
      .eq("deals.status", "active")
      .eq("deals.in_stock", true)
      .order("sort_order", { ascending: true })
  ]);

  // Filter categories to only those with active deals
  const filteredCategories = (categoriesData || [])
    .map(cat => ({
      ...cat,
      active_deal_count: (cat as any).deals?.[0]?.count || 0
    }))
    .filter(cat => cat.active_deal_count > 0);

  const enrichedDeals = (dealsData || []).map((deal: any) => ({
    ...deal,
    score: (deal.upvotes || 0) - (deal.downvotes || 0)
  }));

  return (
    <DealsClient 
      initialDeals={enrichedDeals as any} 
      favoriteIds={favoriteIds}
      initialCategory={category}
      initialTag={tag}
      initialSeason={season}
      initialSeasonName={seasonName}
      initialFeatured={isFeatured}
      allCategories={filteredCategories as any}
    />
  );
}
