"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Bell, Trash2, ArrowLeft, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PriceAlertsPage() {
  const { user, openLogin } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!user) return;
    const sb = createClient();
    const { data } = await sb
      .from("price_alerts")
      .select("id, target_price, is_active, created_at, notified_at, deals(id,title,current_price,original_price,image_url,merchant,discount_percentage)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  };

  const deleteAlert = async (alertId: string) => {
    await fetch(`/api/alerts?alertId=${alertId}`, { method: "DELETE" });
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  useEffect(() => { fetchAlerts(); }, [user]);

  if (!user || user.is_anonymous) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in">
        <div className="text-6xl">🔔</div>
        <h1 className="text-2xl font-black">Sign in to manage price alerts</h1>
        <button onClick={openLogin} className="bg-[#53A318] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3d7c10] transition-colors">Sign In</button>
      </div>
    );
  }

  const active   = alerts.filter(a => a.is_active);
  const inactive = alerts.filter(a => !a.is_active);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12 animate-in">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-gray-500 hover:text-gray-800 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Bell size={22} className="text-amber-500" /> Price Alerts
          {active.length > 0 && <span className="text-base font-bold text-gray-400">({active.length} active)</span>}
        </h1>
      </div>

      {!loading && alerts.length === 0 && (
        <div className="section-box text-center py-16">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="text-xl font-black text-gray-900 mb-2">No price alerts set</h2>
          <p className="text-gray-500 mb-5">On any deal page, click the 🔔 bell to get notified when the price drops.</p>
          <Link href="/" className="bg-[#53A318] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3d7c10] transition-colors inline-block">
            Browse Deals
          </Link>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => {
            const deal = alert.deals;
            const priceReached = deal && alert.target_price && deal.current_price <= alert.target_price;
            return (
              <div key={alert.id} className="section-box flex items-center gap-4">
                {/* Deal image */}
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                  {deal?.image_url && <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{deal?.merchant}</p>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{deal?.title ?? "—"}</h3>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-base font-black text-[#53A318]">${deal?.current_price?.toFixed(2)}</span>
                    {alert.target_price && (
                      <span className="text-xs font-semibold text-gray-500">
                        Alert at: <span className="font-black text-amber-600">${Number(alert.target_price).toFixed(2)}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    {priceReached ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Price reached!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertCircle size={11} /> Watching
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Set {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {deal && (
                    <a
                      href={`/api/exit?dealId=${deal.id}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex items-center gap-1 text-xs font-bold text-white bg-[#53A318] px-3 py-2 rounded-xl hover:bg-[#3d7c10] transition-colors"
                    >
                      <ExternalLink size={12} /> Shop
                    </a>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
