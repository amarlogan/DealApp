"use client";

import { useState } from "react";
import { Heart, Star, Flame, Zap, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DealCard({ deal, featured = false }: { deal: any; featured?: boolean }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      await supabase.from("favorites").insert({ deal_id: deal.id, user_id: 'dummy-auth-uid' }).catch(() => {});
    } else {
      await supabase.from("favorites").delete().eq("deal_id", deal.id).eq("user_id", 'dummy-auth-uid').catch(() => {});
    }
  };

  const fallbackBg = [
    'bg-gradient-to-br from-green-100 to-emerald-200',
    'bg-gradient-to-br from-blue-100 to-sky-200',
    'bg-gradient-to-br from-orange-100 to-amber-200',
    'bg-gradient-to-br from-purple-100 to-violet-200',
    'bg-gradient-to-br from-pink-100 to-rose-200',
  ];
  const fallbackGradient = fallbackBg[parseInt(deal.id) % fallbackBg.length];

  return (
    <a
      href={`/deal/${deal.id}`}
      className={`deal-card block group flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer ${
        featured ? 'w-[340px] sm:w-[380px]' : 'w-[260px] sm:w-[290px]'
      }`}
    >
      {/* Image Section */}
      <div className={`relative overflow-hidden ${featured ? 'h-56' : 'h-44'} w-full`}>
        {!imgError && deal.image_url ? (
          <img
            src={deal.image_url}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full ${fallbackGradient} flex items-center justify-center`}>
            <Tag size={48} className="text-white opacity-40" />
          </div>
        )}

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {deal.isPopular && (
            <div className="bg-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-[#d31872] shadow-md flex items-center gap-1">
              <Flame size={10} className="text-[#d31872]" /> Popular Gift
            </div>
          )}
          {deal.discount_percentage >= 40 && (
            <div className="bg-[#ff6128] px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider text-white shadow-md flex items-center gap-1">
              <Zap size={10} className="text-white" /> Hot Deal
            </div>
          )}
        </div>

        {/* Discount badge top right */}
        {deal.discount_percentage > 0 && (
          <div className="absolute top-3 right-10 bg-[#53A318] text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
            -{deal.discount_percentage}%
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          aria-label="Save to favorites"
          className="absolute top-3 right-3 rounded-full bg-white p-1.5 shadow-md hover:bg-red-50 transition-all duration-200 z-10 group/heart"
        >
          <Heart
            size={14}
            fill={isFavorite ? "#ff4d4d" : "transparent"}
            color={isFavorite ? "#ff4d4d" : "#9ca3af"}
            strokeWidth={2}
            className="group-hover/heart:scale-110 transition-transform"
          />
        </button>
      </div>

      {/* Content Section */}
      <div className={`p-4 flex flex-col justify-between ${featured ? 'h-[200px]' : 'h-[176px]'}`}>
        <div>
          <div className="text-[11px] text-gray-500 mb-1 font-semibold uppercase tracking-wide truncate">
            {deal.merchant}{deal.location ? ` · ${deal.location}` : ''}
          </div>
          <h3 className={`font-bold leading-snug line-clamp-2 text-gray-900 group-hover:text-[#53A318] transition-colors ${featured ? 'text-base' : 'text-[14px]'}`}>
            {deal.title}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  size={11}
                  fill={i <= Math.floor(deal.rating) ? "#f59e0b" : "transparent"}
                  color={i <= Math.floor(deal.rating) ? "#f59e0b" : "#d1d5db"}
                  strokeWidth={i <= Math.floor(deal.rating) ? 0 : 1.5}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-gray-700">{deal.rating.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({deal.reviews})</span>
          </div>
        </div>

        {/* Pricing Area */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-black text-[#53A318] leading-none">${deal.current_price.toFixed(2)}</span>
            <span className="text-sm text-gray-400 line-through leading-none">${deal.original_price.toFixed(2)}</span>
          </div>
          {deal.promo_code && (
            <div className="text-[11px] text-purple-600 font-semibold mt-1.5 bg-purple-50 px-2 py-0.5 rounded inline-flex items-center gap-1">
              <Tag size={10} /> Code: <span className="font-black">{deal.promo_code}</span>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
