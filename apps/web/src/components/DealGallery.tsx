"use client";

import { useState } from "react";
import DealImage from "./DealImage";

interface DealGalleryProps {
  primaryImage: string;
  additionalImages: string[];
  title: string;
  discountPercentage?: number;
  badge?: string;
  isHot?: boolean;
  isPopular?: boolean;
}

export default function DealGallery({ 
  primaryImage, 
  additionalImages = [], 
  title,
  discountPercentage = 0,
  badge,
  isHot,
  isPopular
}: DealGalleryProps) {
  // Consolidate images and remove duplicates/empty strings
  const allImages = Array.from(new Set([primaryImage, ...additionalImages])).filter(Boolean);
  const [activeImage, setActiveImage] = useState(allImages[0] || "");

  return (
    <div className="lg:col-span-5 p-4 lg:p-6 bg-gray-50/50 relative">
      {/* Main Image View */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-white group cursor-zoom-in relative">
        <DealImage 
          src={activeImage} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          fallbackIconSize={60}
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          {badge === "Best Seller" || badge === "Amazon Choice" ? (
            <span className="bg-[#ff9900] text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1">
              {badge === "Amazon Choice" ? "✦" : "🏆"} {badge}
            </span>
          ) : badge === "Rollback" ? (
            <span className="bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full shadow">
              🔵 Rollback
            </span>
          ) : isHot || badge === "Hot Deal" || badge === "Deal of the Day" ? (
            <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1 animate-seasonal-glow">
              🔥 {isHot && !badge ? "HOT DEAL" : badge}
            </span>
          ) : isPopular ? (
            <span className="bg-white text-pink-600 text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1 border border-pink-100">
              🎁 Popular
            </span>
          ) : badge ? (
            <span className="bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1">
              {badge}
            </span>
          ) : null}

          {discountPercentage >= 40 && !badge && (
            <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1">
              ⚡ Flash Deal
            </span>
          )}
        </div>

        {/* Discount Overlay */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4 bg-[#53A318] text-white font-black text-sm px-3 py-1 rounded-full shadow-md z-10 pointer-events-none">
            -{discountPercentage}%
          </div>
        )}
      </div>
      
      {/* Thumbnails Gallery */}
      {allImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, i) => (
            <button 
              key={i} 
              type="button"
              onClick={() => setActiveImage(img)}
              className={`w-16 h-16 rounded-xl border-2 shadow-sm overflow-hidden flex-shrink-0 cursor-pointer transition-all ${
                activeImage === img ? "border-[var(--primary)] scale-105" : "border-white opacity-50 hover:opacity-100"
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt={`${title} - image ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
