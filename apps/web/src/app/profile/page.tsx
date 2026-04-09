"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Heart, Bell, Zap, TrendingUp, Settings, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";

type Stats = { saved: number; alerts: number; clicks: number };

export default function ProfilePage() {
  const { user, openLogin } = useAuth();
  const [stats, setStats]   = useState<Stats>({ saved: 0, alerts: 0, clicks: 0 });
  const [recentSaved, setRecentSaved] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const sb = createClient();

    Promise.all([
      sb.from("favorites").select("deal_id, created_at, deals(id,title,current_price,image_url,merchant,discount_percentage)", { count: "exact" })
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
      sb.from("price_alerts").select("id", { count: "exact" }).eq("user_id", user.id).eq("is_active", true),
      sb.from("deal_clicks").select("id", { count: "exact" }).eq("user_id", user.id),
    ]).then(([fav, alerts, clicks]) => {
      setStats({ saved: fav.count ?? 0, alerts: alerts.count ?? 0, clicks: clicks.count ?? 0 });
      setRecentSaved((fav.data ?? []).map((f: any) => f.deals).filter(Boolean));
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-black text-gray-900">Sign in to view your profile</h1>
        <p className="text-gray-500">Save deals, set price alerts, and personalize your experience.</p>
        <button onClick={openLogin} className="bg-[#53A318] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3d7c10] transition-colors">
          Sign In Free
        </button>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const initials    = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in">
      {/* Profile Header */}
      <div className="section-box flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#53A318] to-[#2d7a00] text-white text-3xl font-black flex items-center justify-center flex-shrink-0 shadow-lg">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-gray-900 truncate">{displayName}</h1>
          <p className="text-gray-500 text-sm truncate">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">Member since {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>
        </div>
        <Link href="/profile/settings" className="flex items-center gap-2 text-sm border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50 font-medium text-gray-600 transition-colors flex-shrink-0">
          <Settings size={15} /> Settings
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Heart size={22} />, label: "Saved Deals", value: stats.saved, href: "/profile/saved", color: "text-rose-500 bg-rose-50" },
          { icon: <Bell size={22} />,  label: "Price Alerts", value: stats.alerts, href: "/profile/alerts", color: "text-amber-500 bg-amber-50" },
          { icon: <Zap size={22} />,   label: "Deals Clicked", value: stats.clicks, href: "#", color: "text-blue-500 bg-blue-50" },
        ].map(s => (
          <Link key={s.label} href={s.href} className="section-box text-center hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mx-auto mb-3`}>{s.icon}</div>
            <div className="text-3xl font-black text-gray-900 group-hover:text-[#53A318] transition-colors">{s.value}</div>
            <div className="text-sm text-gray-500 font-medium mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Recently Saved */}
      {recentSaved.length > 0 && (
        <div className="section-box">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><Heart size={18} className="text-rose-500" /> Recently Saved</h2>
            <Link href="/profile/saved" className="text-sm font-bold text-[#53A318] flex items-center gap-1 hover:text-[#3d7c10]">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentSaved.map((d: any) => (
              <Link key={d.id} href={`/deal/${d.id}`} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-32 bg-gray-100 overflow-hidden">
                  {d.image_url && <img src={d.image_url} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1">{d.title}</p>
                  <p className="text-sm font-black text-[#53A318]">${d.current_price?.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="section-box">
        <h2 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/profile/saved",     icon: <Heart size={18} />,     label: "My Saved Deals",          sub: "View all your bookmarked deals" },
            { href: "/profile/alerts",    icon: <Bell size={18} />,      label: "Price Alerts",             sub: "Get notified when prices drop" },
            { href: "/profile/settings",  icon: <Settings size={18} />,  label: "Interests & Preferences",  sub: "Personalize your deal feed" },
            { href: "/deals",             icon: <TrendingUp size={18} />, label: "Browse All Deals",         sub: "Explore all active deals" },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#53A318] hover:bg-[#f8fef4] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#e8f4e0] text-[#53A318] flex items-center justify-center flex-shrink-0 group-hover:bg-[#53A318] group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 truncate">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-gray-400 flex-shrink-0 group-hover:text-[#53A318] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
