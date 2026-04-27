"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryNav({ navs }: { navs: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Use Math.ceil because occasionally scaling causes subpixel rendering diffs
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [navs]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; 
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!navs || navs.length === 0) return null;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-2 hidden lg:flex items-center border-t border-gray-100 group">
      
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-white via-white to-transparent pr-8 py-1">
          <button 
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Nav Track */}
      <nav 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        aria-label="Product categories" 
        className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full"
      >
        {navs.map((nav: any) => {
          const label = nav.label_override || (nav.categories?.label ?? "Unknown");
          const isHighlighted = nav.is_highlighted;
          const activeCount = nav.categories?.active_deal_count || 0;
          const href = nav.href || (nav.category_id ? `/category/${nav.category_id}` : "#");

          // Only show categories that have active items
          if (activeCount === 0) return null;

          return (
            <a
              key={nav.id}
              href={href}
              className={
                isHighlighted
                  ? "shrink-0 py-1.5 px-3 text-sm font-bold whitespace-nowrap rounded-full text-[var(--primary)] bg-[var(--primary-light)] transition-all"
                  : "shrink-0 py-1.5 px-3 text-sm font-semibold whitespace-nowrap rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              }
            >
              {nav.categories?.emoji && !isHighlighted ? `${nav.categories.emoji} ` : ""}
              {label}
            </a>
          );
        })}
      </nav>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-white via-white to-transparent pl-8 py-1">
          <button 
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
