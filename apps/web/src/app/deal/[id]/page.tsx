import { notFound } from "next/navigation";
import { ExternalLink, Star, Heart, ArrowLeft, Shield, Truck, Tag } from "lucide-react";
import DealImage from "@/components/DealImage";
import type { Metadata } from "next";

type Deal = {
  id: string;
  title: string;
  description: string;
  merchant: string;
  category: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  affiliate_url: string;
  image_url: string;
  rating: number;
  reviews: string;
  isPopular: boolean;
  in_stock: boolean;
  promo_code: string | null;
  badge: string | null;
};

async function getDeal(id: string): Promise<Deal | null> {
  try {
    // SSR: absolute URL needed in server components
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/data/deals.json`, {
      next: { revalidate: 3600 }, // revalidate every hour
    });
    if (!res.ok) return null;
    const deals: Deal[] = await res.json();
    return deals.find((d) => d.id === id) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) return { title: "Deal Not Found | DealNexus" };
  const savings = deal.original_price - deal.current_price;
  return {
    title: `${deal.title} — $${deal.current_price.toFixed(2)} (Save $${savings.toFixed(2)}) | DealNexus`,
    description: `${deal.description?.slice(0, 155)}…`,
  };
}

const MERCHANT_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  Amazon:  { bg: "bg-[#fff8e6]", text: "text-[#c45500]", label: "Shop on Amazon" },
  Walmart: { bg: "bg-[#e6f0ff]", text: "text-[#0071ce]", label: "Shop on Walmart" },
  Nike:    { bg: "bg-gray-900",  text: "text-white",     label: "Shop on Nike" },
  Adidas:  { bg: "bg-black",     text: "text-white",     label: "Shop on Adidas" },
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) notFound();

  const savings  = (deal.original_price - deal.current_price).toFixed(2);
  const merchant = MERCHANT_BADGE[deal.merchant] ?? {
    bg: "bg-[#e8f4e0]",
    text: "text-[#53A318]",
    label: `Shop on ${deal.merchant}`,
  };

  return (
    <div className="animate-in pb-16">
      {/* Back link */}
      <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#53A318] transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Deals
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Left: Image ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-100 shadow-inner min-h-[360px] lg:min-h-[460px]">
          <DealImage 
            src={deal.image_url} 
            alt={deal.title}
            className="w-full h-full object-cover"
            fallbackClassName="w-full h-full flex items-center justify-center"
            fallbackIconSize={64}
          />

          {/* Discount ribbon */}
          {deal.discount_percentage > 0 && (
            <div className="absolute top-5 left-5 bg-[#53A318] text-white font-black text-base px-4 py-1.5 rounded-full shadow-lg">
              -{deal.discount_percentage}% OFF
            </div>
          )}
          {deal.badge && (
            <div className="absolute top-5 right-5 bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-full shadow-lg">
              {deal.badge}
            </div>
          )}
        </div>

        {/* ── Right: Info ── */}
        <div className="flex flex-col gap-5">
          {/* Merchant + category */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`${merchant.bg} ${merchant.text} text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-current/20`}>
              {deal.merchant}
            </span>
            <span className="text-sm text-gray-400 font-semibold capitalize">📂 {deal.category}</span>
            {deal.in_stock ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">✓ In Stock</span>
            ) : (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">✗ Out of Stock</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
            {deal.title}
          </h1>

          {/* Stars */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i <= Math.floor(deal.rating) ? "#f59e0b" : "transparent"}
                  color={i <= Math.floor(deal.rating) ? "#f59e0b" : "#d1d5db"}
                  strokeWidth={i <= Math.floor(deal.rating) ? 0 : 1.5}
                />
              ))}
            </div>
            <span className="font-bold text-gray-800">{deal.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({deal.reviews} reviews)</span>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-black text-[#53A318]">
                ${deal.current_price.toFixed(2)}
              </span>
              <span className="text-xl text-gray-400 line-through">
                ${deal.original_price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                💰 You save ${savings}
              </span>
              {deal.promo_code && (
                <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1">
                  <Tag size={12} /> Code: <span className="font-black">{deal.promo_code}</span>
                </span>
              )}
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: <Truck size={15} />, label: "Fast Shipping Available" },
              { icon: <Shield size={15} />, label: "Secure Checkout on " + deal.merchant },
              { icon: <Heart size={15} />, label: "Save to Favorites" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                <span className="text-[#53A318]">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Primary CTA — goes through /api/exit for click tracking */}
          <a
            href={`/api/exit?dealId=${deal.id}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            id={`cta-deal-${deal.id}`}
            className="flex items-center justify-center gap-3 w-full bg-[#53A318] hover:bg-[#3d7c10] text-white py-4 px-8 rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            {merchant.label} <ExternalLink size={20} />
          </a>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            You'll be taken to {deal.merchant}'s website to complete your purchase. DealNexus may earn an affiliate commission at no extra cost to you.
          </p>

          {/* Description */}
          {deal.description && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="font-black text-gray-900 mb-3 text-lg">About This Deal</h2>
              <ul className="space-y-2">
                {deal.description.split(". ").filter(Boolean).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="text-[#53A318] font-bold mt-0.5 flex-shrink-0">✓</span>
                    {line.trim().replace(/\.$/, "")}.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
