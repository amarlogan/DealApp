"use client";

import { useState, useEffect, useRef } from "react";
import DealCard from "@/components/DealCard";
import { ChevronRight, ChevronLeft, Sparkles, Zap, TrendingUp, Percent } from "lucide-react";
import { HERO_COPY } from "@/config/categories";
import Link from "next/link";

type Deal = {
  id: string;
  title: string;
  description?: string;
  merchant: string;
  category_id?: string;
  category?: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  affiliate_url?: string;
  image_url?: string;
  rating: number;
  reviews?: string;
  review_count?: number;
  is_popular?: boolean;
  in_stock?: boolean;
  promo_code?: string | null;
  badge?: string | null;
  location?: string | null;
  deal_seasons?: { season_id: string }[] | { season_id: string };
};

// Extracted from DB types
type UICategory = { id: string; label: string; emoji: string; phase: number; description?: string };
type UISeason = { id: string; name: string; css_variables: any };
type LandingSection = { 
  id: string; 
  title: string | null; 
  sort_order: number; 
  category_id: string | null; 
  season_id: string | null;
  max_items: number; 
  categories?: UICategory | UICategory[];
  seasons?: UISeason | UISeason[];
};
type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string;
  accent_text?: string;
  tag_text?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  bg_gradient?: string;
};

function Carousel({ title, icon, deals, featured = false, seeAllHref = "#" }: {
  title: string; icon: React.ReactNode; deals: Deal[]; featured?: boolean; seeAllHref?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });

  if (deals.length === 0) return null;

  return (
    <div className="section-box">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[#53A318]">{icon}</span>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
        </div>
        <a href={seeAllHref} className="text-sm font-bold text-[#53A318] hover:text-[#3d7c10] flex items-center gap-1 group">
          See all <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
      <div className="relative">
        <button onClick={() => scroll("left")} aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div ref={ref} className="carousel-track">
          {deals.map(deal => <DealCard key={deal.id} deal={deal} featured={featured} />)}
        </div>
        <button onClick={() => scroll("right")} aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}

function useCountdown(h: number, m: number, s: number) {
  const [secs, setSecs] = useState(h * 3600 + m * 60 + s);
  useEffect(() => {
    const id = setInterval(() => setSecs(v => v > 0 ? v - 1 : 0), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    hh: String(Math.floor(secs / 3600)).padStart(2, "0"),
    mm: String(Math.floor((secs % 3600) / 60)).padStart(2, "0"),
    ss: String(secs % 60).padStart(2, "0"),
  };
}

const TILE_GRADIENTS = [
  { from: "from-indigo-500",  to: "to-blue-600" },
  { from: "from-emerald-500", to: "to-teal-600" },
  { from: "from-rose-400",    to: "to-pink-500" },
  { from: "from-slate-600",   to: "to-gray-700" },
];

function CategoryCarousel({ categories }: { categories: UICategory[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = 300; // Adjust based on card width + gap
    ref.current.scrollBy({ left: dir === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <div className="relative group/cat-carousel">
      {/* Navigation Arrows */}
      <button 
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-gray-100 items-center justify-center flex hover:bg-gray-50 transition-all opacity-0 group-hover/cat-carousel:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronLeft size={20} className="text-gray-600" />
      </button>

      <div ref={ref} className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth snap-x snap-mandatory">
        {categories.map((tile, i) => {
          const grad = TILE_GRADIENTS[i % TILE_GRADIENTS.length];
          return (
            <Link 
              key={tile.id} 
              href={`/category/${tile.id}`}
              className={`flex-shrink-0 w-[calc(100%/2-12px)] lg:w-[calc(100%/4-12px)] snap-start bg-gradient-to-br ${grad.from} ${grad.to} rounded-[2rem] p-6 text-white hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 relative overflow-hidden group/tile`}
            >
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/tile:opacity-100 transition-opacity" />
               <div className="relative z-10 flex flex-col h-full">
                  <div className="text-4xl mb-4 transform group-hover/tile:scale-110 transition-transform duration-500 origin-left">{tile.emoji}</div>
                  <div className="font-black text-xl leading-tight tracking-tight mb-1">{tile.label}</div>
                  <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{tile.description || "Explore Deals"}</div>
               </div>
            </Link>
          );
        })}
      </div>

      <button 
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-gray-100 items-center justify-center flex hover:bg-gray-50 transition-all opacity-0 group-hover/cat-carousel:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronRight size={20} className="text-gray-600" />
      </button>
    </div>
  );
}

export default function HomeClient({ 
  initialDeals,
  landingSections,
  topCategories,
  upcomingCategories,
  heroSlides = []
}: { 
  initialDeals: Deal[];
  landingSections: LandingSection[];
  topCategories: UICategory[];
  upcomingCategories: UICategory[];
  heroSlides?: HeroSlide[];
}) {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const deals = initialDeals;
  const { hh, mm, ss }   = useCountdown(4, 23, 17);

  // Auto-advance hero carousel
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const byCat = (id: string, max?: number) => {
    const arr = deals.filter(d => (d.category_id === id) || (d.category === id));
    return max ? arr.slice(0, max) : arr;
  };

  const bySeason = (id: string, max?: number) => {
    const arr = deals.filter(d => {
      if (!d.deal_seasons) return false;
      if (Array.isArray(d.deal_seasons)) {
        return d.deal_seasons.some(ds => ds.season_id === id);
      }
      return (d.deal_seasons as any).season_id === id;
    });
    return max ? arr.slice(0, max) : arr;
  };

  const featured   = deals.filter(d => d.is_popular || (d.discount_percentage ?? 0) >= 30);
  const flashDeals = deals.filter(d => (d.discount_percentage ?? 0) >= 38);

  return (
    <div className="animate-in w-full space-y-6 pb-10">

      {/* ── Hero Carousel ── */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[320px] lg:min-h-[460px] bg-black group/hero">
        {heroSlides.length > 0 ? (
          heroSlides.map((slide, idx) => (
            <div 
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                idx === currentHeroIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            >
              {/* Background with Gradient Overlay */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-linear ${
                   idx === currentHeroIndex ? "scale-110" : "scale-100"
                }`}
                style={{ backgroundImage: `url('${slide.image_url}')` }} 
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg_gradient || 'from-black/80 via-black/40 to-transparent'}`} />

              <div className="relative z-10 h-full p-8 lg:p-20 flex flex-col justify-center">
                <div className="max-w-2xl">
                  {slide.tag_text && (
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-[10px] lg:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/20 animate-in slide-in-from-bottom-4 duration-500">
                      <Sparkles size={12} className="text-[#90e050]" /> {slide.tag_text}
                    </div>
                  )}
                  <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.9] text-white mb-4 drop-shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                    {slide.title}<br />
                    {slide.accent_text && <span className="text-[#90e050] inline-block mt-2">{slide.accent_text}</span>}
                  </h1>
                  <p className="text-base lg:text-xl text-white/80 font-medium mb-10 max-w-lg leading-relaxed animate-in slide-in-from-bottom-10 duration-[900ms]">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom-12 duration-1000">
                    <Link href={slide.button_link || "/deals"} className="bg-[#53A318] hover:bg-[#3d7c10] text-white px-10 py-4 rounded-full font-black shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 text-sm lg:text-base">
                      <Percent size={18} /> {slide.button_text || "Browse Deals"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Fallback static hero if no slides */
          <div className="relative z-10 p-8 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 h-full bg-gradient-to-r from-[#1a3a0f] via-[#2a5c18] to-[#4a8a2a]">
             <div className="text-white max-w-xl">
               <h1 className="text-4xl font-black mb-4">Finding the Best Deals...</h1>
               <p className="text-white/70">Please wait while we fetch the latest offers for you.</p>
             </div>
          </div>
        )}

        {/* Carousel Indicators */}
        {heroSlides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentHeroIndex(idx)}
                        className={`h-1.5 transition-all rounded-full ${
                            idx === currentHeroIndex ? "w-8 bg-[#90e050]" : "w-1.5 bg-white/30 hover:bg-white/50"
                        }`}
                    />
                ))}
            </div>
        )}

        {/* Navigation Arrows (Desktop) */}
        {heroSlides.length > 1 && (
            <>
                <button 
                    onClick={() => setCurrentHeroIndex(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all duration-300 -translate-x-4 group-hover/hero:translate-x-0"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={() => setCurrentHeroIndex(prev => (prev + 1) % heroSlides.length)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all duration-300 translate-x-4 group-hover/hero:translate-x-0"
                >
                    <ChevronRight size={24} />
                </button>
            </>
        )}
      </div>

      {/* ── Manual Category Carousel ── */}
      <CategoryCarousel categories={topCategories} />

      {/* ── Flash Deals Timer ── */}
      {flashDeals.length > 0 && (
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2e2e2e] rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-4 shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <div className="text-white font-black text-lg">Flash Deals</div>
              <div className="text-gray-400 text-sm">40%+ off — ends soon!</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-gray-400 text-sm font-medium mr-1">Ends in:</div>
            {[{val:hh,label:"hr"},{val:mm,label:"min"},{val:ss,label:"sec"}].map((u,i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="bg-[#ff6128] text-white font-black text-xl px-3 py-1.5 rounded-lg min-w-[52px] text-center timer-digit">{u.val}</div>
                <span className="text-gray-500 text-xs">{u.label}</span>
                {i < 2 && <span className="text-[#ff6128] font-black text-xl">:</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Deal Carousels — Database Driven ── */}
      <div id="deals" className="space-y-0">
        <Carousel title="Top Deals Today 🔥" icon={<TrendingUp size={22}/>} deals={featured} featured seeAllHref="/deals?featured=true" />
        
        {landingSections.map(sec => {
          // Handle potential array or object from Supabase join
          const cat = Array.isArray(sec.categories) ? sec.categories[0] : sec.categories;
          const season = Array.isArray(sec.seasons) ? sec.seasons[0] : sec.seasons;

          if (cat && sec.category_id) {
            return (
              <Carousel
                key={sec.id}
                title={sec.title || cat.label}
                icon={<span className="text-xl">{cat.emoji}</span>}
                deals={byCat(sec.category_id, sec.max_items)}
                seeAllHref={`/category/${sec.category_id}`}
              />
            );
          }

          if (season && sec.season_id) {
            return (
              <Carousel
                key={sec.id}
                title={sec.title || season.name}
                icon={<Sparkles size={22} className="text-amber-500" />}
                deals={bySeason(sec.season_id, sec.max_items)}
                featured
                seeAllHref={`/deals?season=${sec.season_id}`}
              />
            );
          }

          return null;
        })}
      </div>

      {/* "See more categories" Section requested by user */}
      <div className="py-6 flex justify-center">
        <Link 
          href="/deals" 
          className="bg-white border-2 border-gray-200 text-gray-700 hover:border-[#53A318] hover:text-[#53A318] font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          View All Categories & Deals <ChevronRight size={18} />
        </Link>
      </div>

      {/* ── Coming Soon Section ── */}
      {upcomingCategories.length > 0 && (
        <div className="section-box text-center py-8">
          <h2 className="text-xl font-black text-gray-900 mb-2">More Categories Coming Soon 🚀</h2>
          <p className="text-gray-500 text-sm mb-5">We're adding beauty, food, travel & local deals. Stay tuned!</p>
          <div className="flex justify-center flex-wrap gap-3">
            {upcomingCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-semibold">
                {cat.emoji} {cat.label} <span className="coming-soon-badge">Soon</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Newsletter ── */}
      <div className="bg-gradient-to-br from-[#53A318] to-[#2d7a00] rounded-3xl p-8 lg:p-12 text-white text-center shadow-xl">
        <div className="text-4xl mb-3">📬</div>
        <h2 className="text-3xl font-black mb-2">Never Miss a Deal</h2>
        <p className="text-white/80 mb-6 font-medium">Get top discounts delivered daily. 200,000+ savvy shoppers already subscribed.</p>
        <div className="flex gap-2 max-w-md mx-auto">
          <input type="email" id="newsletter-email" placeholder="your@email.com"
            className="flex-1 px-5 py-3 rounded-full text-gray-900 font-medium outline-none placeholder-gray-400" />
          <button className="bg-[#ff6128] hover:bg-[#d44e1c] text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 whitespace-nowrap">
            Get Deals
          </button>
        </div>
      </div>
    </div>
  );
}
