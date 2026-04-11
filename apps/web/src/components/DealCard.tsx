"use client";

import { useState } from "react";
import { Heart, Star, Flame, Zap, Bell, Tag } from "lucide-react";
import { useAuth } from "./AuthProvider";
import DealImage from "./DealImage";

// Merchant color/label map
const MERCHANT_STYLES: Record<string, { cls: string; label: string; flag?: string }> = {
  Amazon:  { cls: "amazon",  label: "Amazon",  flag: "🇺🇸" },
  Walmart: { cls: "walmart", label: "Walmart", flag: "🔵" },
  Nike:    { cls: "nike",    label: "Nike" },
  Adidas:  { cls: "adidas",  label: "Adidas" },
  "H&M":   { cls: "generic", label: "H&M" },
  Zara:    { cls: "generic", label: "Zara" },
};

export default function DealCard({
  deal,
  featured = false,
  layout = "carousel",
}: {
  deal: any;
  featured?: boolean;
  layout?: "carousel" | "grid";
}) {
  const { user, openLogin } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [alertSet,  setAlertSet]   = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { openLogin(); return; }
    const next = !isFavorite;
    setIsFavorite(next);
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId: deal.id, action: next ? "add" : "remove" }),
    });
  };

  const setAlert = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { openLogin(); return; }
    setAlertSet(true);
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId: deal.id }),
    });
  };

  const merchant = MERCHANT_STYLES[deal.merchant] ?? { cls: "generic", label: deal.merchant };

  // Gradient fallbacks when no image loaded
  const gradients = [
    "from-indigo-100 to-sky-200",
    "from-emerald-100 to-teal-200",
    "from-orange-100 to-amber-200",
    "from-rose-100 to-pink-200",
    "from-violet-100 to-purple-200",
  ];
  const fallback = gradients[parseInt(deal.id?.replace(/\D/g, "") || "0") % gradients.length];

  const cardW = layout === "grid" 
    ? "w-full h-full" 
    : featured ? "w-[340px] sm:w-[370px] flex-shrink-0" : "w-[260px] sm:w-[285px] flex-shrink-0";
  const imgH  = featured ? "h-52" : "h-44";
  const bodyH = featured && layout !== "grid" ? "min-h-[192px]" : "min-h-[172px]";

  return (
    <a
      href={`/deal/${deal.id}`}
      id={`deal-card-${deal.id}`}
      className={`deal-card block group bg-white rounded-2xl overflow-hidden cursor-pointer ${cardW}`}
    >
      {/* ── Image ── */}
      <div className={`relative ${imgH} w-full overflow-hidden bg-gray-100`}>
        <DealImage
          src={deal.image_url}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          fallbackClassName={`w-full h-full bg-gradient-to-br ${fallback} flex items-center justify-center`}
          fallbackIconSize={44}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {deal.badge === "Best Seller" || deal.badge === "Amazon Choice" ? (
            <span className="bg-[#ff9900] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
              {deal.badge === "Amazon Choice" ? "✦" : "🏆"} {deal.badge}
            </span>
          ) : deal.badge === "Rollback" ? (
            <span className="bg-blue-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
              🔵 Rollback
            </span>
          ) : deal.badge === "Hot Deal" || deal.badge === "Deal of the Day" ? (
            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
              <Flame size={9} /> {deal.badge}
            </span>
          ) : deal.isPopular ? (
            <span className="bg-white text-pink-600 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-pink-100">
              🎁 Popular
            </span>
          ) : null}

          {deal.discount_percentage >= 40 && !deal.badge && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
              <Zap size={9} /> Flash Deal
            </span>
          )}
        </div>

        {/* Discount pill — top right area */}
        {deal.discount_percentage > 0 && (
          <div className="absolute top-2.5 right-9 z-10 bg-[#53A318] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            -{deal.discount_percentage}%
          </div>
        )}

        {/* Alert + heart buttons */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <button onClick={setAlert} aria-label="Set price alert"
            className="rounded-full bg-white p-1.5 shadow-md hover:scale-110 transition-transform">
            <Bell size={13} fill={alertSet ? "#f59e0b" : "transparent"} color={alertSet ? "#f59e0b" : "#9ca3af"} strokeWidth={2} />
          </button>
          <button onClick={toggleFavorite} aria-label="Save to favorites"
            className="rounded-full bg-white p-1.5 shadow-md hover:scale-110 transition-transform">
            <Heart size={13} fill={isFavorite ? "#ef4444" : "transparent"} color={isFavorite ? "#ef4444" : "#9ca3af"} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`p-4 flex flex-col gap-2 ${bodyH}`}>
        {/* Merchant badge */}
        <div className="flex items-center gap-2">
          <span className={`merchant-badge ${merchant.cls}`}>
            {merchant.label}
          </span>
          {deal.location && (
            <span className="text-[11px] text-gray-400 font-medium truncate">
              📍 {deal.location}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-bold leading-snug line-clamp-2 text-gray-900 group-hover:text-[#53A318] transition-colors ${
            featured ? "text-[15px]" : "text-[13px]"
          }`}
        >
          {deal.title}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1">
          <span className="stars-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={11}
                fill={i <= Math.floor(deal.rating) ? "#f59e0b" : "transparent"}
                color={i <= Math.floor(deal.rating) ? "#f59e0b" : "#d1d5db"}
                strokeWidth={i <= Math.floor(deal.rating) ? 0 : 1.5}
              />
            ))}
          </span>
          <span className="text-[11px] font-bold text-gray-700">{deal.rating?.toFixed(1)}</span>
          <span className="text-[11px] text-gray-400">({deal.reviews ?? deal.review_count ?? 0})</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="border-t border-gray-50 pt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#53A318] leading-none">
              ${deal.current_price?.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 line-through leading-none">
              ${deal.original_price?.toFixed(2)}
            </span>
          </div>
          {deal.promo_code && (
            <div className="mt-1.5 inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-purple-100">
              <Tag size={9} /> Code: {deal.promo_code}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
