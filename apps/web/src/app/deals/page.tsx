import DealListing from "@/components/DealListing";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "All Deals | DealNexus",
  description: "Browse all active deals across every category on DealNexus.",
};

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(24)
    .order("discount_percentage", { ascending: false });

  const deals = data || [];

  return <DealListing title="🔥 All Active Deals" initialDeals={deals} />;
}
