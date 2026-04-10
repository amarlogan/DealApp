import DealListing from "@/components/DealListing";
import { getCategoryLabel, getCategoryEmoji, CATEGORIES } from "@/config/categories";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    categoryId: category.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const label = getCategoryLabel(categoryId);
  if (!label || categoryId === categoryId.toLowerCase() && label === categoryId) {
    return { title: "Category Not Found | DealNexus" };
  }
  return {
    title: `${label} Deals | DealNexus`,
    description: `Find the best active deals for ${label}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const label = getCategoryLabel(categoryId);
  // fallback check, getCategoryLabel returns 'id' if not found.
  if (!label || label === categoryId) return notFound();

  const emoji = getCategoryEmoji(categoryId);

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("status", "active")
    .eq("in_stock", true)
    .eq("category_id", categoryId)
    .limit(24)
    .order("discount_percentage", { ascending: false });

  const deals = data || [];

  return <DealListing title={`${emoji} ${label} Deals`} categoryId={categoryId} initialDeals={deals} />;
}
