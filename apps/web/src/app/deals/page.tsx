import DealListing from "@/components/DealListing";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "All Deals | HuntMyDeal",
  description: "Browse all active deals across every category on HuntMyDeal.",
};

export const dynamic = "force-dynamic";

export default async function DealsPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const seasonId = searchParams.season;
  const isFeatured = searchParams.featured === "true";
  
  const supabase = createSupabaseAdmin();
  let title = "🔥 All Active Deals";
  let seasonData = null;

  // 1. If seasonal, fetch season metadata for the title
  if (seasonId) {
    const { data } = await supabase
      .from("seasons")
      .select("name")
      .eq("id", seasonId)
      .single();
    if (data) {
      seasonData = data;
      title = `${data.name} Deals`;
    }
  } else if (isFeatured) {
    title = "Top Deals Today 🔥";
  }

  // 2. Fetch initial deals with same filters as the client will use
  let query = supabase
    .from("deals")
    .select(seasonId ? "*, deal_seasons!inner(season_id)" : "*")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(24)
    .order("discount_percentage", { ascending: false });

  if (seasonId) {
    query = query.eq("deal_seasons.season_id", seasonId);
  }
  if (isFeatured) {
    query = query.or("is_popular.eq.true,discount_percentage.gte.30");
  }

  const { data: dealsData } = await (query as any);
  const deals = dealsData || [];

  return (
    <DealListing 
      title={title} 
      initialDeals={deals} 
      seasonId={seasonId}
      isFeatured={isFeatured}
    />
  );
}
