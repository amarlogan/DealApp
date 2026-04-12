import { createSupabaseAdmin } from "@/lib/supabase-server";
import DealsManagerClient from "./DealsManagerClient";

export default async function AdminDealsPage() {
  const supabase = createSupabaseAdmin();

  // 1. Fetch all deals for management with their associated seasons
  const { data: deals, error: dealsError } = await supabase
    .from("deals")
    .select("*, deal_seasons(season_id)")
    .order("created_at", { ascending: false });

  // 2. Fetch categories for the deal creation/edit form
  const { data: categories } = await supabase
    .from("categories")
    .select("id, label, emoji")
    .eq("is_active", true)
    .order("label", { ascending: true });

  // 3. Fetch all seasons for the tagging selector
  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, name")
    .order("name", { ascending: true });

  if (dealsError) {
    return <div className="p-8 text-red-500 uppercase font-black">Error loading inventory: {dealsError.message}</div>;
  }

  return (
    <DealsManagerClient 
      deals={deals || []} 
      categories={categories || []} 
      seasons={seasons || []}
    />
  );
}
