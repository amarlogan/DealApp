"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Bookmark, Star, Flame, Zap, Bell, Tag, MessageSquare, ThumbsUp, Eye } from "lucide-react";
import { useAuth } from "./AuthProvider";
import DealImage from "./DealImage";
import InteractiveStarRating from "./InteractiveStarRating";

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
  initialIsSaved = false,
}: {
  deal: any;
  featured?: boolean;
  layout?: "carousel" | "grid";
  initialIsSaved?: boolean;
}) {
  const { user, openLogin } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [alertSet,  setAlertSet]   = useState(false);

  // Sync state with prop if it changes (e.g. on mount/rerender from parent)
  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { openLogin(); return; }
    const next = !isSaved;
    setIsSaved(next);
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
    ? "w-full flex-grow flex-shrink" 
    : featured ? "w-[340px] sm:w-[370px] flex-shrink-0" : "w-[260px] sm:w-[285px] flex-shrink-0";
  const imgH  = featured ? "h-52" : "h-44";
  const bodyH = layout === "grid" ? "flex-1" : (featured ? "min-h-[192px]" : "min-h-[172px]");
  const initialScore = deal.score !== undefined ? deal.score : ((deal.upvotes || 0) - (deal.downvotes || 0));
  const [localScore, setLocalScore] = useState(initialScore);
  const [hasLiked, setHasLiked] = useState(false);

  const handleQuickLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { openLogin(); return; }
    if (hasLiked) return;

    setHasLiked(true);
    setLocalScore(prev => prev + 1);

    await fetch("/api/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId: deal.id, rating: 5 }), // 5 = Upvote
    });
  };

  return (
    <div
      id={`deal-card-${deal.id}`}
      className={`deal-card relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100/50 ${cardW}`}
    >
      {/* Primary Deal Link (Stretched) */}
      <Link 
        href={`/deal/${deal.id}`} 
        className="absolute inset-0 z-10" 
        aria-label={deal.title}
      />

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
          ) : deal.is_hot || deal.badge === "Hot Deal" || deal.badge === "Deal of the Day" ? (
            <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 animate-seasonal-glow">
              <Flame size={10} fill="white" /> {deal.is_hot ? "HOT DEAL" : deal.badge}
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
          <div className="absolute top-2.5 right-9 z-10 bg-[var(--primary)] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            -{deal.discount_percentage}%
          </div>
        )}

        {/* Alert + bookmark buttons */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
          <button onClick={setAlert} aria-label="Set price alert"
            className="relative rounded-full bg-white p-1.5 shadow-md hover:scale-110 transition-transform">
            <Bell size={13} fill={alertSet ? "#f59e0b" : "transparent"} color={alertSet ? "#f59e0b" : "#9ca3af"} strokeWidth={2} />
          </button>
          <button onClick={toggleSave} aria-label="Save deal"
            className="relative rounded-full bg-white p-1.5 shadow-md hover:scale-110 transition-transform">
            <Bookmark size={13} fill={isSaved ? "#53A318" : "transparent"} color={isSaved ? "#53A318" : "#9ca3af"} strokeWidth={2} />
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
          className={`font-bold leading-snug line-clamp-2 text-gray-900 group-hover:text-[var(--primary)] transition-colors ${
            featured ? "text-[15px]" : "text-[13px]"
          }`}
        >
          {deal.title}
        </h3>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-[11px] font-bold relative z-20">
          {/* Votes/Score */}
          <button 
            onClick={handleQuickLike}
            className="flex items-center gap-1.5 transition-all active:scale-95 group/vote"
            title="Like this deal"
          >
            <ThumbsUp 
              size={12} 
              className={localScore >= 10 ? "text-red-500" : localScore > 0 ? "text-green-600" : "text-gray-500"} 
              fill={hasLiked || localScore > 0 ? "currentColor" : "none"}
              fillOpacity={0.2}
            />
            <span className={`transition-colors ${localScore >= 10 ? "text-red-600 font-black" : "text-gray-900 font-black"}`}>
              {String(localScore)}
            </span>
          </button>
          
          <div className="w-px h-3 bg-gray-100" />

          {/* Views */}
          <div className="flex items-center gap-1.5">
            <Eye size={12} className="text-gray-500" />
            <span className="text-gray-900 font-black">{String(deal.view_count || 0)}</span>
          </div>

          <div className="w-px h-3 bg-gray-100" />

          {/* Comments */}
          <a
            href={`/deal/${deal.id}#comments`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors group/stat"
          >
            <MessageSquare size={12} className="text-gray-500 group-hover/stat:text-[var(--primary)]" />
            <span className="text-gray-900 font-black group-hover/stat:text-[var(--primary)]">{String(deal.comment_count || 0)}</span>
          </a>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="border-t border-gray-50 pt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[var(--primary)] leading-none">
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
    </div>
  );
}
