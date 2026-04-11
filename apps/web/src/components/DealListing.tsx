"use client";

import { useState, useEffect, useRef } from "react";
import DealCard from "./DealCard";
import { Loader2, ArrowDownWideNarrow } from "lucide-react";

type Deal = {
  id: string;
  title: string;
  merchant: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  image_url?: string;
  category_id: string;
  rating: number;
  review_count?: number;
  badge?: string | null;
  location?: string | null;
  isPopular?: boolean;
  is_popular?: boolean;
};

type SortOption = "discount_percentage" | "price_asc" | "price_desc" | "newest";

export default function DealListing({ 
  title, 
  categoryId, 
  seasonId,
  isFeatured,
  searchQuery,
  initialDeals = [] 
}: { 
  title: string; 
  categoryId?: string; 
  seasonId?: string;
  isFeatured?: boolean;
  searchQuery?: string;
  initialDeals?: Deal[] 
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("discount_percentage");
  // Only loading if no initial deals were provided
  const [loading, setLoading] = useState(initialDeals.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  // Default hasMore based on initial fetch size
  const [hasMore, setHasMore] = useState(initialDeals.length === 24);
  const isFirstRender = useRef(true);

  // Sync state if initialDeals change via prop (e.g. Next.js navigation)
  useEffect(() => {
    if (!isFirstRender.current) {
      setDeals(initialDeals);
      setHasMore(initialDeals.length === 24);
      setPage(1);
      setSort("discount_percentage");
    }
  }, [initialDeals]);

  const fetchDeals = async (p: number, currentSort: SortOption, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: p.toString(),
        limit: "24",
        sort: currentSort,
      });
      if (categoryId) params.append("category", categoryId);
      if (seasonId) params.append("season", seasonId);
      if (isFeatured) params.append("featured", "true");
      if (searchQuery) params.append("q", searchQuery);

      const res = await fetch(`/api/deals?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (data.deals?.length > 0) {
        setDeals(prev => reset ? data.deals : [...prev, ...data.deals]);
        setHasMore(data.deals.length === 24);
      } else {
        if (reset) setDeals([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load deals", err);
      // Fallback
      if (reset) {
         fetch("/data/deals.json").then(r => r.json()).then(offlineData => {
           let filtered = offlineData;
           if (categoryId) {
             filtered = filtered.filter((d: any) => d.category_id === categoryId || d.category === categoryId);
           }
           
           // Apply manual sorting for offline fallback
           filtered.sort((a: any, b: any) => {
             if (currentSort === "price_asc") return a.current_price - b.current_price;
             if (currentSort === "price_desc") return b.current_price - a.current_price;
             if (currentSort === "newest") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
             return (b.discount_percentage || 0) - (a.discount_percentage || 0); // default highest discount
           });
           
           setDeals(filtered);
           setHasMore(false);
         }).catch(() => setDeals([]));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Run on sort change or categoryId change, skip initial load if we have data
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialDeals.length > 0) return;
    }
    
    setPage(1);
    fetchDeals(1, sort, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, categoryId, seasonId, isFeatured, searchQuery]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchDeals(next, sort, false);
  };

  return (
    <div className="animate-in fade-in w-full pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        
        <div className="flex items-center gap-3">
          <label htmlFor="sort-deals" className="text-sm font-semibold text-gray-500 hidden sm:block">Sort by</label>
          <div className="relative">
            <select
              id="sort-deals"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-full pl-5 pr-10 py-2.5 outline-none hover:border-[#53A318] focus:border-[#53A318] transition-colors cursor-pointer shadow-sm"
            >
              <option value="discount_percentage">Highest Discount</option>
              <option value="newest">Newest Deals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ArrowDownWideNarrow size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-[#53A318]">
          <Loader2 size={40} className="animate-spin" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-50">
          <div className="text-6xl mb-4">👀</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No deals found</h2>
          <p className="text-gray-500">We couldn't find any active deals here right now.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {deals.map(deal => (
              <div key={deal.id} className="flex justify-center h-full">
                <DealCard deal={deal} layout="grid" />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-white border-2 border-[#53A318] text-[#53A318] hover:bg-[#53A318] hover:text-white font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore && <Loader2 size={16} className="animate-spin" />}
                {loadingMore ? "Loading..." : "Load More Deals"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
