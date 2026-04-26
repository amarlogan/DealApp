"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Bookmark, ExternalLink, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SavedDealsPage() {
  const { user, openLogin } = useAuth();
  const [deals, setDeals]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    const sb = createClient();
    const { data } = await sb
      .from("favorites")
      .select("deal_id, created_at, deals(id,title,current_price,original_price,discount_percentage,image_url,merchant,category_id,affiliate_url,rating,review_count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setDeals((data ?? []).map((f: any) => f.deals).filter(Boolean));
    setLoading(false);
  };

  const removeFavorite = async (dealId: string) => {
    const sb = createClient();
    await sb.from("favorites").delete().eq("user_id", user!.id).eq("deal_id", dealId);
    setDeals(prev => prev.filter(d => d.id !== dealId));
  };

  useEffect(() => { fetchSaved(); }, [user]);

  if (!user || user.is_anonymous) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in">
        <div className="text-6xl text-[#53A318]"><Bookmark size={60} fill="currentColor" /></div>
        <h1 className="text-2xl font-black">Sign in to see your saved deals</h1>
        <button onClick={openLogin} className="bg-[#53A318] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3d7c10] transition-colors">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-gray-500 hover:text-gray-800 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Bookmark size={22} className="text-[#53A318]" fill="currentColor" /> Saved Deals
          {deals.length > 0 && <span className="text-base font-bold text-gray-400">({deals.length})</span>}
        </h1>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-64" />
          ))}
        </div>
      )}

      {!loading && deals.length === 0 && (
        <div className="section-box text-center py-16">
          <div className="text-5xl mb-4">🔖</div>
          <h2 className="text-xl font-black text-gray-900 mb-2">No saved deals yet</h2>
          <p className="text-gray-500 mb-5">Click the bookmark icon on any deal card to save it here.</p>
          <Link href="/" className="bg-[#53A318] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3d7c10] transition-colors inline-block">
            Browse Deals
          </Link>
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map(deal => (
            <div key={deal.id} className="section-box group p-0 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {deal.image_url && (
                  <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                {deal.discount_percentage > 0 && (
                  <div className="absolute top-2 left-2 bg-[#53A318] text-white text-xs font-black px-2 py-0.5 rounded-full">
                    -{deal.discount_percentage}% OFF
                  </div>
                )}
                <button
                  onClick={() => removeFavorite(deal.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{deal.merchant}</p>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">{deal.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-black text-[#53A318]">${deal.current_price?.toFixed(2)}</span>
                  <span className="text-sm text-gray-400 line-through">${deal.original_price?.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/deal/${deal.id}`} className="flex-1 text-center text-sm font-bold text-[#53A318] border-2 border-[#53A318] py-2 rounded-xl hover:bg-[#53A318] hover:text-white transition-colors">
                    View Deal
                  </Link>
                  <a
                    href={`/api/exit?dealId=${deal.id}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1 text-sm font-bold text-white bg-[#ff6128] py-2 px-3 rounded-xl hover:bg-[#d44e1c] transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
