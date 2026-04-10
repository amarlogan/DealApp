import HomeClient from "./HomeClient";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(48)
    .order("discount_percentage", { ascending: false });

  if (error) {
    console.error("Home Server Component fetch error:", error);
  }

  const deals = data || [];

  return <HomeClient initialDeals={deals} />;
}
