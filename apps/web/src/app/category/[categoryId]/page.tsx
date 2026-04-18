import DealListing from "@/components/DealListing";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function generateStaticParams() {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase.from("categories").select("id").eq("is_active", true);
  return (data || []).map((cat) => ({
    categoryId: cat.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const supabase = createSupabaseAdmin();
  
  const { data: cat } = await supabase
    .from("categories")
    .select("label")
    .eq("id", categoryId)
    .single();

  if (!cat) {
    return { title: "Category Not Found | HuntMyDeal" };
  }
  
  return {
    title: `${cat.label} Deals | HuntMyDeal`,
    description: `Find the best active deals for ${cat.label}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const supabase = createSupabaseAdmin();
  
  const { data: cat } = await supabase
    .from("categories")
    .select("label, emoji")
    .eq("id", categoryId)
    .single();

  if (!cat) return notFound();

  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("status", "active")
    .eq("in_stock", true)
    .eq("category_id", categoryId)
    .limit(24)
    .order("discount_percentage", { ascending: false });

  const deals = data || [];

  return <DealListing title={`${cat.emoji} ${cat.label} Deals`} categoryId={categoryId} initialDeals={deals} />;
}
