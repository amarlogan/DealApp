import { createSupabaseAdmin } from "@/lib/supabase-server";
import { ShoppingBag, Star, TrendingUp, AlertCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = createSupabaseAdmin();

  const { count: activeDeals } = await supabase
    .from("deals")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { count: alertsCount } = await supabase
    .from("price_alerts")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const { data: popularDeals } = await supabase
    .from("deals")
    .select("title, current_price, discount_percentage")
    .eq("is_popular", true)
    .limit(5);

  const { count: newInquiries } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  const { data: recentInquiries } = await supabase
    .from("contact_submissions")
    .select("id, name, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and quick metrics.</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Active Deals", value: activeDeals || 0, icon: ShoppingBag, color: "bg-blue-500" },
          { label: "Price Alerts", value: alertsCount || 0, icon: AlertCircle, color: "bg-orange-500" },
          { label: "High Interest", value: popularDeals?.length || 0, icon: TrendingUp, color: "bg-emerald-500" },
          { label: "New Inquiries", value: newInquiries || 0, icon: MessageSquare, color: "bg-purple-500", highlight: (newInquiries || 0) > 0 },
          { label: "Platform Rating", value: "4.8", icon: Star, color: "bg-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
            {stat.highlight && (
              <div className="absolute top-0 right-0 w-2 h-full bg-purple-500 animate-pulse" />
            )}
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.highlight ? "text-purple-600" : "text-gray-900"}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Popular Deals ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-black text-gray-900">Trending Deals</h2>
            <span className="text-xs font-bold text-[#53A318] bg-emerald-50 px-3 py-1 rounded-full">Live Monitor</span>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {popularDeals?.map((deal, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-0.5 max-w-[70%]">
                  <span className="text-sm font-bold text-gray-900 truncate">{deal.title}</span>
                  <span className="text-[11px] text-gray-400 font-medium">Currently ${deal.current_price}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-[#53A318]">-{deal.discount_percentage}%</span>
                </div>
              </div>
            ))}
            {(!popularDeals || popularDeals.length === 0) && (
              <div className="p-8 text-center text-gray-400 text-sm font-medium">No trending deals yet.</div>
            )}
          </div>
        </div>

        {/* ── Recent Inquiries ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-black text-gray-900">Recent Inquiries</h2>
            <Link href="/admin/contact" className="text-xs font-bold text-purple-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {recentInquiries?.map((inq, i) => (
              <div key={i} className="p-4 flex flex-col gap-1 hover:bg-gray-50 transition-colors relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">{inq.name}</span>
                  {inq.status === 'new' && (
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium line-clamp-1">{inq.subject}</span>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                  {new Date(inq.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!recentInquiries || recentInquiries.length === 0) && (
              <div className="p-8 text-center text-gray-400 text-sm font-medium">No inquiries found.</div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="space-y-6">
          <div className="bg-[#53A318] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group h-full flex flex-col justify-center">
            <div className="relative z-10 text-center">
              <h3 className="text-xl font-black mb-2">Manage All Inventory</h3>
              <p className="text-emerald-100 text-sm mb-6">Update prices, categories, and marketplace status in real-time.</p>
              <a href="/admin/deals" className="inline-flex items-center justify-center bg-white text-[#53A318] px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                Open Deals Manager
              </a>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <ShoppingBag size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
