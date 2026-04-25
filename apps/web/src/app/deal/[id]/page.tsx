import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ExternalLink, ArrowLeft, Shield, Truck, Tag, 
  ThumbsUp, ThumbsDown, Eye, MessageSquare, Share2, 
  Bookmark, ChevronRight, Info, AlertCircle 
} from "lucide-react";
import DealImage from "@/components/DealImage";
import DealActions from "@/components/DealActions";
import PromoCodeCopy from "@/components/PromoCodeCopy";
import VotingSection from "@/components/VotingSection";
import CommentSection from "@/components/CommentSection";
import ViewTracker from "@/components/ViewTracker";
import MarkdownContent from "@/components/MarkdownContent";
import DealGallery from "@/components/DealGallery";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatDistanceToNow } from "@/lib/utils";
import type { Metadata } from "next";

type Deal = {
  id: string;
  title: string;
  description: string;
  merchant: string;
  category_id: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  affiliate_url: string;
  image_url: string;
  rating: number;
  review_count: number;
  is_popular: boolean;
  in_stock: boolean;
  promo_code: string | null;
  badge: string | null;
  comment_count: number;
  upvotes: number;
  downvotes: number;
  view_count: number;
  score: number;
  is_hot: boolean;
  created_at: string;
  images: string[];
  profiles?: {
    display_name: string;
  };
};

async function getDeal(id: string): Promise<any | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let deal = null;
  let userRating = null;
  let isSaved = false;
  let distribution = [0, 0, 0, 0, 0];

  // 1. Try Supabase if ID looks like a UUID
  if (isUUID) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("deals")
        .select("*, profiles!deals_user_id_fkey(display_name)")
        .eq("id", id)
        .single();

      if (error) {
        // Log error and fall through to JSON fallback
      } else if (data) {
        deal = data;

        // Fetch user engagement if logged in
        if (user) {
          const [ratingRes, favoriteRes] = await Promise.all([
            supabase
              .from("deal_ratings")
              .select("rating")
              .eq("deal_id", id)
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("favorites")
              .select("deal_id")
              .eq("deal_id", id)
              .eq("user_id", user.id)
              .maybeSingle()
          ]);
          if (ratingRes.data) userRating = ratingRes.data.rating;
          if (favoriteRes.data) isSaved = true;
        }

        // Fetch distribution
        const { data: distData } = await supabase
          .from("deal_ratings")
          .select("rating")
          .eq("deal_id", id);
        
        (distData || []).forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
        });
      }
    } catch (err) {
      console.warn("Supabase fetch error:", err);
    }
  }

  // 2. Fallback to Local JSON (Mock Data)
  if (!deal) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const res = await fetch(`${baseUrl}/data/deals.json`);
      if (res.ok) {
        const deals = await res.json();
        const mockDeal = deals.find((d: any) => d.id === id);
        if (mockDeal) {
          deal = mockDeal;
          // Mock data doesn't have live engagement, use defaults
        }
      }
    } catch (err) {
      console.error("JSON fallback failed:", err);
    }
  }

  if (!deal) return null;

  const score = (deal.upvotes || 0) - (deal.downvotes || 0);
  const is_hot = score >= 10 || (deal.discount_percentage >= 25) || (deal.view_count >= 100) || deal.is_popular;

  return { 
    ...deal, 
    userRating, 
    isSaved, 
    distribution, 
    score, 
    is_hot,
    current_price: deal.current_price ?? 0,
    original_price: deal.original_price ?? 0,
    created_at: deal.created_at || new Date().toISOString(),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDeal(id);
  const title = deal?.title || "Deal";
  return {
    title: `${title} | HuntMyDeal`,
    description: `Save big on ${title}. Found on HuntMyDeal.`,
  };
}

const MERCHANT_STYLES: Record<string, { cls: string; label: string }> = {
  Amazon:  { cls: "amazon",  label: "Amazon" },
  Walmart: { cls: "walmart", label: "Walmart" },
  Nike:    { cls: "nike",    label: "Nike" },
  Adidas:  { cls: "adidas",  label: "Adidas" },
  "H&M":   { cls: "generic", label: "H&M" },
  Zara:    { cls: "generic", label: "Zara" },
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) notFound();

  const savings    = (deal.original_price - deal.current_price).toFixed(2);
  const merchant   = MERCHANT_STYLES[deal.merchant] ?? { cls: "generic", label: deal.merchant };

  // Simulated views & votes for slickdeals aesthetic
  const simulatedViews = Math.floor(Math.random() * 50000) + 5000;
  const simulatedVotes = Math.floor(Math.random() * 500) + 50;

  return (
    <div className="pb-12 min-h-screen bg-gray-50/50 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto md:px-4 pt-4 md:pt-8 space-y-4 md:space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none px-4 md:px-0">
          <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href={`/category/${deal.category_id}`} className="hover:text-[var(--primary)] transition-colors capitalize">{deal.category_id}</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900 truncate max-w-[200px]">{deal.title}</span>
        </nav>

        {/* Main Hero Card */}
        <div className="bg-white md:rounded-[24px] md:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border-y md:border-x border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 shrink-layout">
            
            {/* Left: Premium Image Section (5 cols) */}
            <DealGallery 
              primaryImage={deal.image_url}
              additionalImages={deal.images || []}
              title={deal.title}
              discountPercentage={deal.discount_percentage}
              badge={deal.badge}
              isHot={deal.is_hot}
              isPopular={deal.is_popular}
            />

            {/* Right: Content Section (7 cols) */}
            <div className="lg:col-span-7 p-5 md:p-6 lg:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className={`merchant-badge ${merchant.cls}`}>
                  {merchant.label}
                </span>
                <span className="text-gray-400 text-[11px] font-bold">
                  Posted by <span className="text-gray-900 font-bold">{deal.profiles?.display_name || "DealBot"}</span> • {formatDistanceToNow(deal.created_at)}
                </span>
              </div>

              <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight mb-3 tracking-tight">
                {deal.title}
              </h1>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5 px-1 rounded-xl">
                  <div className="text-gray-400 hover:text-green-600 cursor-pointer"><ThumbsUp size={14} /></div>
                  <span className={`text-[13px] font-black ${deal.score >= 10 ? "text-red-500" : "text-gray-900"}`}>
                    {deal.score > 0 ? `+${deal.score}` : deal.score}
                  </span>
                  <div className="text-gray-400 hover:text-red-500 cursor-pointer"><ThumbsDown size={14} /></div>
                </div>
                <div className="w-px h-3 bg-gray-100" />
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                  <MessageSquare size={14} />
                  <a href="#comments" className="text-gray-900 uppercase tracking-tighter hover:text-[var(--primary)] transition-colors">
                    {deal.comment_count || 0} Comments
                  </a>
                </div>
                <div className="w-px h-3 bg-gray-100" />
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                  <Eye size={14} />
                  <span className="text-gray-900">{deal.view_count?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-center justify-between gap-6 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                    ${deal.current_price.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-300 line-through font-bold">${deal.original_price.toFixed(2)}</span>
                  <span className="text-sm font-black text-[var(--primary)] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{deal.discount_percentage.toFixed(2)}% OFF</span>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Savings</span>
                  <span className="text-xl font-black text-green-600">${savings}</span>
                </div>
              </div>

              {/* Promo Code (Conditional) */}
        {/* Promo Code (Conditional) */}
              {deal.promo_code && <PromoCodeCopy code={deal.promo_code} />}

              {/* CTAs & Local Voting */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <a 
                    href={deal.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-black px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    Get Deal at {merchant.label}
                    <ExternalLink size={20} />
                  </a>
                  <DealActions 
                    dealId={deal.id} 
                    initialIsSaved={deal.isSaved} 
                    title={deal.title} 
                  />
                </div>
                
                {/* Integrated Voting Bar */}
                <div className="bg-gray-50/50 rounded-xl px-4 py-2.5 border border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">Helpful?</span>
                  <VotingSection 
                    dealId={deal.id}
                    initialUpvotes={deal.upvotes || 0}
                    initialDownvotes={deal.downvotes || 0}
                    initialUserRating={deal.userRating}
                    viewCount={deal.view_count || 0}
                    compact={true}
                  />
                </div>
              </div>

              <p className="text-[9px] text-gray-400 text-center leading-tight font-medium opacity-70 mt-4">
                We may earn an affiliate commission when you click a link or make a purchase at {deal.merchant}. <Link href="/affiliate-disclosure" className="underline hover:text-gray-600">Funding Policy.</Link>
              </p>
            </div>
          </div>
        </div>

        <ViewTracker dealId={deal.id} />

        {/* Deal Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-[14px] font-black uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 inline-block pb-1">
              Deal Details
            </h2>
          </div>
          <div className="p-8">
            <MarkdownContent content={deal.description} />
            
            {/* Fallback if no description yet */}
            {!deal.description && (
              <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed">
                <div className="mb-6 font-bold text-gray-900 border-l-4 border-amber-400 pl-4 bg-amber-50 py-3 rounded-r-xl">
                  Update: This popular deal is currently available and being discussed in the community.
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="text-blue-500" size={18} /> Store Details
                </h3>
                <p className="mb-6">
                  {deal.merchant} currently has the <strong>{deal.title}</strong> for <span className="text-[var(--primary)] font-black">${deal.current_price}</span>. 
                  This is a significant drop from the original price of ${deal.original_price}. 
                  {deal.promo_code && <span> Use promo code <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-100 font-black">{deal.promo_code}</span> at checkout for additional savings.</span>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section Card */}
        <CommentSection dealId={deal.id} />
      </div>
    </div>
  );
}
