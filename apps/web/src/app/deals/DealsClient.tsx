"use client";

import { useState, useEffect, useRef } from "react";
import DealCard from "@/components/DealCard";
import { TrendingUp, Sparkles, Filter, ChevronDown, LayoutGrid, List, FilterX } from "lucide-react";
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
  favoriteIds = [],
  initialCategory = "",
  initialTag = "",
  initialSeason = "",
  initialSeasonName = "",
  initialFeatured = false,
  allCategories = []
}: { 
  initialDeals: Deal[];
  favoriteIds: string[];
  initialCategory?: string;
  initialTag?: string;
  initialSeason?: string;
  initialSeasonName?: string;
  initialFeatured?: boolean;
  allCategories?: { id: string, label: string, emoji: string }[];
}) {
  const { user, openLogin } = useAuth();
  const [pagedDeals, setPagedDeals] = useState<Deal[]>(initialDeals);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialDeals.length >= 24);
  const [autoScrollCount, setAutoScrollCount] = useState(0);
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);
  const [season, setSeason] = useState(initialSeason);
  const [featured, setFeatured] = useState(initialFeatured);
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

  const loadMoreDeals = async (overridePage?: number) => {
    const pageToFetch = overridePage || page;
    if (loading || (!hasMore && !overridePage)) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: "24",
        sort
      });
      if (category) query.append("category", category);
      if (tag) query.append("tag", tag);
      if (season) query.append("season", season);
      if (featured) query.append("featured", "true");

      const res = await fetch(`/api/deals?${query.toString()}`);
      const data = await res.json();
      if (data.deals && data.deals.length > 0) {
        if (overridePage === 1) {
          setPagedDeals(data.deals);
        } else {
          setPagedDeals(prev => [...prev, ...data.deals]);
        }
        setPage(pageToFetch + 1);
        if (overridePage === 1) setAutoScrollCount(0);
        else setAutoScrollCount(c => c + 1);
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

  // Re-fetch when sort, category, or tag changes
  useEffect(() => {
    // Only run if not initial mount to avoid duplicate fetch, since initialDeals is passed.
    // Wait, since initialDeals doesn't respect the local state initially, we should just fetch if any state is not default.
    // Let's just reset page to 1 and fetch.
    if (sort !== "newest" || category !== initialCategory || tag !== initialTag || season !== initialSeason || featured !== initialFeatured) {
      setHasMore(true);
      loadMoreDeals(1);
    } else {
      setPagedDeals(initialDeals);
      setPage(2);
      setHasMore(initialDeals.length >= 24);
      setAutoScrollCount(0);
    }
  }, [sort, category, tag, season, featured]);

  let pageTitle = "All Deals";
  if (season) pageTitle = initialSeasonName;
  else if (featured) pageTitle = "Top Deals Today";

  return (
    <div className="animate-in fade-in w-full pt-1 pb-16">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
            <TrendingUp size={20} className="fill-orange-500/20" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="relative">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-[13px] font-bold rounded-full pl-4 pr-9 py-2.5 outline-none hover:border-[var(--primary)] transition-colors cursor-pointer shadow-sm capitalize"
            >
              <option value="">All Categories</option>
              {allCategories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-[13px] font-bold rounded-full pl-4 pr-9 py-2.5 outline-none hover:border-[var(--primary)] transition-colors cursor-pointer shadow-sm"
            >
              <option value="">All Tags</option>
              {["Hot Deal", "Deal of the Day", "Best Seller", "Amazon Choice", "Rollback", "Editor's Choice", "Flash Deal", "Price Drop"].map(t => (
                 <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {(category || tag) && (
            <button 
              onClick={() => {
                setCategory("");
                setTag("");
              }}
              title="Clear all filters"
              className="relative group flex items-center justify-center p-2.5 rounded-full bg-gradient-to-br from-red-500/10 to-rose-600/20 border border-red-500/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              <FilterX size={16} className="text-red-500" strokeWidth={2.5} />
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-3 whitespace-nowrap bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                Reset Filters
              </div>
            </button>
          )}

          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

          <div className="relative flex items-center gap-2">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest hidden lg:block">Sort By</span>
            <div className="relative">
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-[13px] font-bold rounded-full pl-4 pr-9 py-2.5 outline-none hover:border-[var(--primary)] transition-colors cursor-pointer shadow-sm"
              >
                <option value="discount_percentage">Highest Discount</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header (Matches HomeClient Compact View) */}
      <div className="md:hidden mb-4 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-50 rounded-md text-orange-500">
              <TrendingUp size={16} className="fill-orange-500/20" />
            </div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">{pageTitle}</h1>
          </div>
          
          {(category || tag || season || featured) && (
            <button 
              onClick={() => { setCategory(""); setTag(""); setSeason(""); setFeatured(false); }}
              className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1 active:scale-95 transition-transform"
            >
              <FilterX size={12} /> Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 shadow-sm text-gray-700 text-[11px] font-bold rounded-lg pl-2 pr-6 py-2 outline-none focus:border-[var(--primary)] transition-colors capitalize"
            >
              <option value="">All Categories</option>
              {allCategories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 shadow-sm text-gray-700 text-[11px] font-bold rounded-lg pl-2 pr-6 py-2 outline-none focus:border-[var(--primary)] transition-colors"
            >
              <option value="">Tag</option>
              {["Hot Deal", "Deal of the Day", "Best Seller", "Amazon Choice", "Rollback", "Editor's Choice", "Flash Deal", "Price Drop"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 shadow-sm text-gray-700 text-[11px] font-bold rounded-lg pl-2 pr-6 py-2 outline-none focus:border-[var(--primary)] transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="discount_percentage">Discount</option>
              <option value="price_asc">Price Low</option>
              <option value="price_desc">Price High</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
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
              onClick={() => loadMoreDeals()}
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
