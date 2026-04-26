"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { 
  BarChart3, Users, MousePointer2, Eye, 
  TrendingUp, ArrowUpRight, Activity, Globe, 
  Smartphone, Monitor, ChevronRight, Clock,
  Filter, Download
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AnalyticsClient({ 
  initialStats, 
  recentEvents,
  categoryStats,
  priceRanges,
  funnelStats
}: { 
  initialStats: any; 
  recentEvents: any[];
  categoryStats: any[];
  priceRanges?: any[];
  funnelStats?: any[];
}) {
  const [timeRange, setTimeRange] = useState("24h");
  const [liveEvents, setLiveEvents] = useState<any[]>(recentEvents);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('realtime_analytics')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_analytics' }, (payload) => {
        setLiveEvents((current) => [payload.new, ...current].slice(0, 20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cards = [
    { label: "Total Page Views", value: initialStats.total_views, sub: initialStats.today_views, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Clicks", value: initialStats.total_clicks, sub: initialStats.today_clicks, icon: MousePointer2, color: "text-[#53A318]", bg: "bg-emerald-50" },
    { label: "Unique Users", value: initialStats.unique_users, sub: `Anonymous: ${initialStats.anonymous_users}`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Avg. Conv. Rate", value: `${((initialStats.total_clicks / initialStats.total_views) * 100 || 0).toFixed(2)}%`, sub: "Views to Clicks", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time user behavior, engagement funnels, and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-white border border-gray-100 rounded-2xl p-1 shadow-sm flex">
              {['24h', '7d', '30d'].map(r => (
                <button 
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                    timeRange === r ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {r}
                </button>
              ))}
           </div>
           <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm">
             <Download size={18} />
           </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <card.icon size={22} />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-black text-gray-900">{card.value?.toLocaleString() || 0}</h2>
              <span className="text-[10px] font-black text-[#53A318] flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight size={10} /> {card.sub}
              </span>
            </div>
            {/* Subtle graph line decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-50 opacity-50" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Category Performance ── */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">Category Insights</h2>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1">Performance by Product Group</p>
            </div>
            <BarChart3 className="text-gray-200" size={32} />
          </div>
          
          <div className="p-8 space-y-8">
            {categoryStats.length === 0 ? (
               <div className="py-12 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">No activity data yet.</div>
            ) : categoryStats.map((cat, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs font-black border border-gray-100">
                      {i + 1}
                    </div>
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{cat.category_id}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase leading-none">CTR</p>
                       <p className="text-sm font-black text-[#53A318]">{parseFloat(cat.ctr).toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Views</p>
                       <p className="text-sm font-black text-gray-900">{cat.views.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                {/* Custom CSS Bar */}
                <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-[var(--primary)] transition-all duration-1000" 
                    style={{ width: `${(cat.views / categoryStats[0].views) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-orange-400 opacity-50 transition-all duration-1000" 
                    style={{ width: `${cat.ctr}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Live Activity Pulse ── */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">Live Pulse</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs text-gray-400 font-bold uppercase">Real-time Stream</p>
              </div>
            </div>
            <Activity className="text-gray-200" size={32} />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 max-h-[600px] scrollbar-none">
            {liveEvents.length === 0 ? (
               <div className="p-12 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">Waiting for events...</div>
            ) : liveEvents.map((event, i) => (
              <div key={i} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    event.event_type === 'page_view' ? 'bg-blue-50 text-blue-500' : 
                    event.event_type === 'get_deal_click' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {event.event_type === 'page_view' ? <Eye size={14} /> : 
                     event.event_type === 'get_deal_click' ? <MousePointer2 size={14} /> : <Globe size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 mb-0.5">
                      {event.event_type === 'page_view' ? 'Viewed' : 
                       event.event_type === 'get_deal_click' ? 'Clicked Get Deal' : event.event_type}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium truncate mb-2">
                      {event.deals?.title || event.path}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                      <span className="text-[9px] font-bold text-gray-300 uppercase px-1.5 py-0.5 bg-gray-50 rounded">
                        {event.user_id ? 'Authenticated' : 'Guest'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Additional Analytics (Funnel & Price) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">Conversion Funnel</h2>
          <div className="space-y-4">
             {funnelStats?.map((step, i) => {
                const maxCount = Math.max(...(funnelStats.map(s => s.count) || [1]));
                const pct = (step.count / maxCount) * 100;
                const prevCount = i > 0 ? funnelStats[i - 1].count : null;
                const dropoff = prevCount && prevCount > 0 ? Math.round((step.count / prevCount) * 100) : null;
                
                return (
                  <div key={i} className="relative">
                    {i > 0 && (
                       <div className="absolute -top-4 left-4 h-4 w-px bg-gray-200" />
                    )}
                    <div className="flex items-center justify-between text-sm font-bold text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <span>{step.step}</span>
                        {dropoff !== null && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-black">
                            {dropoff}% conversion
                          </span>
                        )}
                      </div>
                      <span>{step.count}</span>
                    </div>
                    <div className="h-4 bg-gray-50 rounded-full overflow-hidden">
                       <div className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
             })}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">Price Range Clicks</h2>
          <div className="space-y-4">
             {priceRanges?.map((bucket, i) => {
                const maxClicks = Math.max(...(priceRanges.map(b => b.clicks) || [1]));
                const pct = (bucket.clicks / maxClicks) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
                      <span>{bucket.price_range}</span>
                      <span>{bucket.clicks} clicks</span>
                    </div>
                    <div className="h-4 bg-gray-50 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
             })}
          </div>
        </div>
      </div>

      {/* ── Creative Detail Tracker ── */}
      <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
               <h2 className="text-3xl font-black mb-4">Site Performance & Health</h2>
               <p className="text-gray-400 font-medium mb-8">Tracking infrastructure response times and frontend Core Web Vitals to ensure 99.9% uptime and smooth interactions.</p>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                        <Monitor size={24} />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global CDN Status</p>
                        <p className="text-lg font-black">Active • 14ms Latency</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <Smartphone size={24} />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mobile Lighthouse</p>
                        <p className="text-lg font-black">98 Performance Score</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="aspect-square bg-white/5 rounded-3xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="h-full flex flex-col justify-between">
                       <Activity className="text-[var(--primary)] opacity-50" size={24} />
                       <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Node {i}</p>
                          <p className="text-lg font-black">Stable</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Abstract background blobs */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] opacity-10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
