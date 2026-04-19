"use client";

import { useState, useEffect, useRef } from "react";
import DealCard from "@/components/DealCard";
import { TrendingUp, Sparkles, Filter, ChevronDown, LayoutGrid, List } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type Deal = {
  id: string;
  title: string;
  merchant: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  image_url: string;
  view_count: number;
  comment_count: number;
  score: number;
  is_popular: boolean;
  is_hot?: boolean;
  badge?: string;
  promo_code?: string;
  location?: string;
};

export default function DealsClient({ 
  initialDeals,
  favoriteIds = []
}: { 
  initialDeals: Deal[];
  favoriteIds: string[];
}) {
  const { user, openLogin } = useAuth();
  const [pagedDeals, setPagedDeals] = useState<Deal[]>(initialDeals);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialDeals.length >= 24);
  const [autoScrollCount, setAutoScrollCount] = useState(0);
  const [sort, setSort] = useState("newest");
  const loaderRef = useRef<HTMLDivElement>(null);
  const favSet = new Set(favoriteIds);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && autoScrollCount < 5) {
          loadMoreDeals();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, autoScrollCount]);

  const loadMoreDeals = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/deals?page=${page}&limit=24&sort=${sort}`);
      const data = await res.json();
      if (data.deals && data.deals.length > 0) {
        setPagedDeals(prev => [...prev, ...data.deals]);
        setPage(p => p + 1);
        setAutoScrollCount(c => c + 1);
        if (data.deals.length < 24) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading deals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in w-full pt-1 pb-16">
      {/* ── Compact Header Bar (Matching DealListing.tsx Spacing) ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
            <TrendingUp size={20} className="fill-orange-500/20" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            All Deals
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-500 hidden sm:block">Sort by</span>
          <div className="relative">
            <select 
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
                setPagedDeals([]);
                setHasMore(true);
                setAutoScrollCount(0);
              }}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-full pl-5 pr-10 py-2.5 outline-none hover:border-[var(--primary)] transition-colors cursor-pointer shadow-sm"
            >
              <option value="discount_percentage">Highest Discount</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <button className="bg-white border border-gray-100 text-gray-400 p-2.5 rounded-xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* ── Deals Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 auto-rows-fr">
        {pagedDeals.map((deal, idx) => (
          <div key={`${deal.id}-${idx}`} className="h-full">
            <DealCard 
              deal={deal} 
              layout="grid"
              initialIsSaved={favSet.has(deal.id)} 
            />
          </div>
        ))}
      </div>

      {/* ── Loader & Load More ── */}
      {hasMore && (
        <div className="py-20 flex flex-col items-center gap-6">
          {autoScrollCount >= 5 ? (
            <button 
              onClick={loadMoreDeals}
              disabled={loading}
              className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-12 py-5 rounded-3xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Fetching More...
                </>
              ) : (
                <>Load More Deals</>
              )}
            </button>
          ) : (
            <div ref={loaderRef} className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)] animate-bounce" />
                <div className="w-3 h-3 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Scanning Catalog</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && pagedDeals.length > 0 && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-6 py-3 rounded-full font-bold text-sm">
            🎉 You've seen all the latest deals!
          </div>
        </div>
      )}
    </div>
  );
}
