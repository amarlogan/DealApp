"use client";

import { useState, useEffect, useRef } from "react";
import DealCard from "@/components/DealCard";
import { ChevronRight, ChevronLeft, Sparkles, Zap, TrendingUp, Percent } from "lucide-react";
import { ACTIVE_CATEGORIES, UPCOMING_CATEGORIES, HERO_COPY, getCategoryEmoji } from "@/config/categories";

type Deal = {
  id: string;
  title: string;
  description?: string;
  merchant: string;
  category_id: string;
  category?: string;           // fallback key from deals.json
  current_price: number;
  original_price: number;
  discount_percentage: number;
  affiliate_url?: string;
  image_url?: string;
  rating: number;
  reviews?: string;
  review_count?: number;
  isPopular?: boolean;
  is_popular?: boolean;
  in_stock?: boolean;
  promo_code?: string | null;
  badge?: string | null;
  location?: string | null;
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

// Category promo tiles — product categories, not stores
const CATEGORY_TILES = [
  { id: "electronics",  emoji: "⚡", title: "Electronics",    sub: "TVs, phones & more",         from: "from-indigo-500",  to: "to-blue-600" },
  { id: "home-kitchen", emoji: "🏠", title: "Home & Kitchen",  sub: "Appliances & décor",          from: "from-emerald-500", to: "to-teal-600" },
  { id: "fashion",      emoji: "👗", title: "Fashion",         sub: "Clothing & accessories",      from: "from-rose-400",    to: "to-pink-500" },
  { id: "shoes",        emoji: "👟", title: "Shoes",           sub: "Sneakers & footwear",         from: "from-slate-600",   to: "to-gray-700" },
];

import Link from "next/link";

export default function HomeClient({ initialDeals }: { initialDeals: Deal[] }) {
  const deals = initialDeals;
  const { hh, mm, ss }   = useCountdown(4, 23, 17);

  const byCat = (id: string) => deals.filter(d => (d.category_id ?? d.category) === id);
  const featured   = deals.filter(d => d.is_popular || d.isPopular || (d.discount_percentage ?? 0) >= 30);
  const flashDeals = deals.filter(d => (d.discount_percentage ?? 0) >= 38);

  return (
    <div className="animate-in w-full space-y-6 pb-10">

      {/* ── Hero ── */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-xl min-h-[280px] bg-gradient-to-r from-[#1a3a0f] via-[#2a5c18] to-[#4a8a2a]">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=60')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a0f]/90 via-[#1a3a0f]/60 to-transparent" />

        <div className="relative z-10 p-8 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-white max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-white/30">
              <Sparkles size={11} /> {HERO_COPY.tag}
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-3 drop-shadow-sm">
              {HERO_COPY.headline}<br /><span className="text-[#90e050]">{HERO_COPY.accent}</span>
            </h1>
            <p className="text-base lg:text-lg text-white/80 font-medium mb-6 max-w-md">{HERO_COPY.sub}</p>
            <div className="flex flex-wrap gap-3">
              <a href="#deals" className="bg-[#53A318] hover:bg-[#3d7c10] text-white px-7 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <Percent size={16} /> {HERO_COPY.cta}
              </a>
              <Link href="/category/electronics" className="bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-full font-semibold border border-white/30 transition-all">
                ⚡ Electronics
              </Link>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { value: `${deals.length || "50"}+`, label: "Active Deals" },
              { value: "Up to 47%",                label: "Max Savings" },
              { value: "200+",                     label: "Top Brands" },
              { value: "4.8 ⭐",                   label: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 text-center min-w-[120px]">
                <div className="text-2xl font-black text-[#53A318]">{s.value}</div>
                <div className="text-xs text-gray-600 font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CATEGORY_TILES.map(tile => (
          <Link key={tile.id} href={`/category/${tile.id}`}
            className={`bg-gradient-to-br ${tile.from} ${tile.to} rounded-2xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
            <div className="text-3xl mb-2">{tile.emoji}</div>
            <div className="font-black text-base leading-tight">{tile.title}</div>
            <div className="text-xs font-medium text-white/80 mt-0.5">{tile.sub}</div>
          </Link>
        ))}
      </div>

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

      {/* ── Deal Carousels — by product category ── */}
      <div id="deals" className="space-y-0">
        <Carousel title="Top Deals Today 🔥" icon={<TrendingUp size={22}/>} deals={featured} featured seeAllHref="/deals" />
        {ACTIVE_CATEGORIES.map(cat => (
          <Carousel
            key={cat.id}
            title={cat.label}
            icon={<span className="text-xl">{cat.emoji}</span>}
            deals={byCat(cat.id)}
            seeAllHref={`/category/${cat.id}`}
          />
        ))}
      </div>

      {/* ── Coming Soon Section ── */}
      <div className="section-box text-center py-8">
        <h2 className="text-xl font-black text-gray-900 mb-2">More Categories Coming Soon 🚀</h2>
        <p className="text-gray-500 text-sm mb-5">We're adding beauty, food, travel & local deals. Stay tuned!</p>
        <div className="flex justify-center flex-wrap gap-3">
          {UPCOMING_CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-semibold">
              {cat.emoji} {cat.label} <span className="coming-soon-badge">Soon</span>
            </div>
          ))}
        </div>
      </div>

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
