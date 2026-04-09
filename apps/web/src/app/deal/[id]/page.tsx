import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { ExternalLink } from "lucide-react";

// Server-Side Rendering (SSR) for Deal Pages to maximize SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data } = await supabase.from('deals').select('title,description').eq('id', params.id).single();
  return {
    title: data?.title || "Deal Details",
    description: data?.description || "View this amazing deal on DealNexus.",
  };
}

export default async function DealPage({ params }: { params: { id: string } }) {
  const { data: deal, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !deal) {
    return <div className="text-center p-24 text-xl">Deal not found or expired.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8">
      <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
        <h1 className="text-4xl font-black mb-4">{deal.title}</h1>
        <p className="text-lg text-gray-300 mb-8">{deal.description}</p>
        
        <div className="flex items-center gap-6 mb-12">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-outfit text-[var(--color-primary)]">${deal.current_price}</span>
              <span className="text-2xl text-gray-500 line-through">${deal.original_price}</span>
            </div>
            {deal.discount_percentage > 0 && (
              <span className="rounded-full bg-red-500/90 py-2 px-4 font-bold text-white shadow-md">
                {deal.discount_percentage}% OFF
              </span>
            )}
        </div>

        <a 
          href={`/api/exit?dealId=${deal.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center gap-3 w-full sm:w-auto rounded-2xl bg-[var(--color-primary,#4f46e5)] px-8 py-4 text-xl font-bold text-white shadow-lg hover:opacity-90 hover:scale-105 transition-all"
        >
          View Deal on {deal.merchant} <ExternalLink size={24} />
        </a>
      </div>
    </div>
  );
}
