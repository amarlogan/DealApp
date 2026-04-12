import { createSupabaseAdmin } from "@/lib/supabase-server";
import HomepageLayoutManagerClient from "./HomepageLayoutManagerClient";

export default async function AdminHomepagePage() {
  const supabase = createSupabaseAdmin();

  // Fetch sections, categories, and seasons in parallel for source selection
  const [sectionsRes, categoriesRes, seasonsRes] = await Promise.all([
    supabase
      .from("landing_sections")
      .select(`
        *,
        categories ( label, emoji ),
        seasons ( name )
      `)
      .order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("id, label, emoji")
      .order("label"),
    supabase
      .from("seasons")
      .select("id, name, start_date, end_date, css_variables")
      .order("start_date", { ascending: false })
  ]);

  if (sectionsRes.error) {
    return (
      <div className="p-8 text-red-500 font-bold uppercase tracking-widest border-2 border-red-100 bg-red-50 rounded-3xl">
        Configuration Load Error: {sectionsRes.error.message}
      </div>
    );
  }

  return (
    <HomepageLayoutManagerClient 
      initialSections={sectionsRes.data || []} 
      categories={categoriesRes.data || []}
      seasons={seasonsRes.data || []}
    />
  );
}
