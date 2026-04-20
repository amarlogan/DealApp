import DealListing from "@/components/DealListing";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "Search Deals | HuntMyDeal",
  description: "Search for the best deals on electronics, fashion, and more on HuntMyDeal.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const queryText = q ?? "";
  
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("deals")
    .select("*")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(24)
    .order("discount_percentage", { ascending: false });

  if (queryText) {
    query = query.or(`title.ilike.%${queryText}%,merchant.ilike.%${queryText}%,category_id.ilike.%${queryText}%`);
  }

  const { data } = await query;
  const deals = data || [];

  return (
    <DealListing 
      title={queryText ? `Search results for "${queryText}"` : "Search All Deals"} 
      searchQuery={queryText}
      initialDeals={deals} 
    />
  );
}
