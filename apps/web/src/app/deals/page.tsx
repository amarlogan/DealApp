import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";
import DealsClient from "./DealsClient";

export const revalidate = 60; // Refresh more frequently than home

export default async function DealsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; tag?: string; season?: string }>;
}) {
  const { category, tag, season } = await searchParams;
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

  const { data: dealsData } = await query
    .limit(24)
    .order("created_at", { ascending: false });

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
    />
  );
}
