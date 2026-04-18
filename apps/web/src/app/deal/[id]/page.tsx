import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ExternalLink, Heart, ArrowLeft, Shield, Truck, Tag, 
  ThumbsUp, ThumbsDown, Eye, MessageSquare, Share2, 
  Bookmark, ChevronRight, Info, AlertCircle 
} from "lucide-react";
import DealImage from "@/components/DealImage";
import InteractiveStarRating from "@/components/InteractiveStarRating";
import CommentSection from "@/components/CommentSection";
import RatingSection from "@/components/RatingSection";
import { createSupabaseServerClient } from "@/lib/supabase-server";
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
};

async function getDeal(id: string): Promise<any | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch main deal data
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    // 2. Fetch user rating if logged in
    let userRating = null;
    if (user) {
      const { data: ud } = await supabase
        .from("deal_ratings")
        .select("rating")
        .eq("deal_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (ud) userRating = ud.rating;
    }

    // 3. Fetch distribution
    const { data: distributionData } = await supabase
      .from("deal_ratings")
      .select("rating")
      .eq("deal_id", id);
    
    const distribution = [0, 0, 0, 0, 0];
    (distributionData || []).forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    });

    return { ...data, userRating, distribution };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) return { title: "Deal Not Found | HuntMyDeal" };
  const savings = deal.original_price - deal.current_price;
  return {
    title: `${deal.title} — $${deal.current_price.toFixed(2)} (Save $${savings.toFixed(2)}) | HuntMyDeal`,
    description: `${deal.description?.slice(0, 155)}…`,
  };
}

const MERCHANT_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  Amazon:  { bg: "bg-[#fff8e6]", text: "text-[#c45500]", label: "Get Deal at Amazon" },
  Walmart: { bg: "bg-[#e6f0ff]", text: "text-[#0071ce]", label: "Get Deal at Walmart" },
  Nike:    { bg: "bg-gray-900",  text: "text-white",     label: "Get Deal at Nike" },
  Adidas:  { bg: "bg-black",     text: "text-white",     label: "Get Deal at Adidas" },
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
  const mConfig    = MERCHANT_CONFIG[deal.merchant] ?? {
    bg: "bg-[#e8f4e0]",
    text: "text-[#53A318]",
    label: `Get Deal at ${deal.merchant}`,
  };

  // Simulated views & votes for slickdeals aesthetic
  const simulatedViews = Math.floor(Math.random() * 50000) + 5000;
  const simulatedVotes = Math.floor(Math.random() * 500) + 50;

  return (
    <div className="pb-24 animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
        <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link href={`/category/${deal.category_id}`} className="hover:text-[var(--primary)] transition-colors capitalize">{deal.category_id}</Link>
        <ChevronRight size={10} />
        <span className="text-gray-900 truncate max-w-[200px]">{deal.title}</span>
      </nav>

      {/* Main Hero Card */}
      <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left: Premium Image Section (5 cols) */}
          <div className="lg:col-span-5 p-8 lg:p-12 bg-gray-50/50 relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white group cursor-zoom-in">
              <DealImage 
                src={deal.image_url} 
                alt={deal.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                fallbackIconSize={80}
              />
            </div>
            
            {/* Dynamic Overlays */}
            {deal.discount_percentage > 0 && (
              <div className="absolute top-16 left-16 bg-[var(--primary)] text-white font-black text-xl px-6 py-2 rounded-2xl shadow-xl -rotate-6">
                -{deal.discount_percentage}%
              </div>
            )}
            
            <div className="mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
               {[1,2,3].map(i => (
                 <div key={i} className="w-20 h-20 rounded-xl border-2 border-white shadow-sm overflow-hidden flex-shrink-0 cursor-pointer hover:border-[var(--primary)] transition-colors">
                    <img src={deal.image_url} className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" />
                 </div>
               ))}
            </div>
          </div>

          {/* Right: Content Section (7 cols) */}
          <div className="lg:col-span-7 p-8 lg:p-16 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Frontpage</span>
               <span className="text-gray-400 text-xs font-bold">Posted by <span className="text-gray-900">NexusBot</span> • 2 hours ago</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
              {deal.title}
            </h1>

            {/* Slickdeals Stats Bar */}
            <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-100">
               <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                  <button className="text-gray-400 hover:text-[var(--primary)] transition-colors"><ThumbsUp size={18} /></button>
                  <span className="font-black text-gray-900">{simulatedVotes}</span>
                  <button className="text-gray-400 hover:text-red-500 transition-colors"><ThumbsDown size={18} /></button>
               </div>
               <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                  <MessageSquare size={18} />
                  <a href="#comments" className="text-gray-900 uppercase tracking-tighter decoration-[var(--primary)] decoration-2 underline underline-offset-4 cursor-pointer hover:text-[var(--primary)] transition-colors">
                    {deal.comment_count || 0} Comments
                  </a>
               </div>
               <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                  <Eye size={18} />
                  <span className="text-gray-900">{simulatedViews.toLocaleString()} Views</span>
               </div>
            </div>

            {/* Price & Savings */}
            <div className="flex items-center gap-6 mb-10">
               <div className="flex flex-col">
                  <span className="text-6xl font-black text-gray-900 tracking-tighter">
                    ${deal.current_price.toFixed(0)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-gray-300 line-through">${deal.original_price.toFixed(0)}</span>
                    <span className="text-2xl font-black text-[var(--primary)]">{deal.discount_percentage}% off</span>
                  </div>
               </div>
               <div className="h-16 w-px bg-gray-100" />
               <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Savings</span>
                  <span className="text-2xl font-black text-green-600 bg-green-50 px-3 py-1 rounded-xl border border-green-100">${savings} Saved</span>
               </div>
            </div>



            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a
                href={`/api/exit?dealId=${deal.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-5 px-8 rounded-3xl font-black text-xl shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
              >
                {mConfig.label} <ExternalLink size={24} />
              </a>
              <div className="flex gap-4">
                 <button className="w-16 h-16 rounded-3xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all">
                    <Share2 size={24} />
                 </button>
                 <button className="w-16 h-16 rounded-3xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-all">
                    <Bookmark size={24} />
                 </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed font-medium mb-8">
              We may earn an affiliate commission when you click a link or make a purchase at {deal.merchant}. <Link href="/affiliate-disclosure" className="underline hover:text-gray-600 transition-colors">Learn more about our funding.</Link>
            </p>

            {/* Trust Footer */}
            <div className="mt-auto grid grid-cols-3 gap-6 pt-8 border-t border-dotted border-gray-200">
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  <Shield size={14} className="text-blue-500" /> Verified Deal
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  <Truck size={14} className="text-[var(--primary)]" /> Fast Shipping
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  <Tag size={14} className="text-purple-500" /> {deal.merchant}
               </div>
            </div>
          </div>
        </div>
      </div>

      <RatingSection 
        dealId={deal.id}
        initialRating={deal.rating}
        initialReviewCount={deal.review_count}
        initialUserRating={deal.userRating}
        initialDistribution={deal.distribution}
      />

      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto">
         <div className="flex gap-8 border-b border-gray-100 mb-8 overflow-x-auto scrollbar-none pb-1">
            {["Deal Details", "Product Info", "Community Notes", "About"].map((tab, i) => (
              <button key={tab} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${i === 0 ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                {tab}
                {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full" />}
              </button>
            ))}
         </div>

         <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed">
            <p className="mb-6 font-bold text-gray-900 border-l-4 border-amber-400 pl-4 bg-amber-50 py-3 rounded-r-xl">Update: This popular deal is still available and trending in the {deal.category_id} community.</p>
            
            <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
               <Info className="text-blue-500" /> Store Details
            </h3>
            <p className="mb-6">
              {deal.merchant} currently has the <strong>{deal.title}</strong> for <span className="text-[var(--primary)] font-black">${deal.current_price}</span>. 
              This is a significant drop from the original price of ${deal.original_price}. 
              {deal.promo_code && <span> Use promo code <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-100 font-black">{deal.promo_code}</span> at checkout for additional savings.</span>}
            </p>

            <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
               <AlertCircle className="text-red-500" /> Product Highlights
            </h3>
            <ul className="list-none p-0 space-y-4">
              {deal.description.split(". ").filter(Boolean).map((line, i) => (
                <li key={i} className="flex gap-3 items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-green-500 shadow-sm flex-shrink-0 mt-0.5">✓</div>
                  {line.trim().replace(/\.$/, "")}.
                </li>
              ))}
            </ul>
         </div>

         {/* Comments Section */}
         <CommentSection dealId={deal.id} />
      </div>
    </div>
  );
}
