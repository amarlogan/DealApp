import { createSupabaseAdmin } from "@/lib/supabase-server";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const supabase = createSupabaseAdmin();

  // 1. Total Events Summary
  const { data: stats } = await supabase.rpc('get_analytics_summary');

  // 2. Fetch Recent Raw Events for the "Live Pulse"
  const { data: recentEvents } = await supabase
    .from('site_analytics')
    .select('*, deals(title)')
    .order('created_at', { ascending: false })
    .limit(20);

  // 3. Fetch Top Categories by Views
  const { data: categoryStats } = await supabase.rpc('get_category_analytics');

  return (
    <AnalyticsClient 
      initialStats={stats || {}} 
      recentEvents={recentEvents || []}
      categoryStats={categoryStats || []}
    />
  );
}
