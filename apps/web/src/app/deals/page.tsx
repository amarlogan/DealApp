import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";
import DealsClient from "./DealsClient";

export const revalidate = 60; // Refresh more frequently than home

export default async function DealsPage() {
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

  // 2. Fetch Initial Deals (Page 1)
  const { data: dealsData } = await supabaseAdmin
    .from("deals")
    .select("*")
    .eq("status", "active")
    .eq("in_stock", true)
    .limit(24)
    .order("created_at", { ascending: false });

  return (
    <DealsClient 
      initialDeals={dealsData || []} 
      favoriteIds={favoriteIds}
    />
  );
}
