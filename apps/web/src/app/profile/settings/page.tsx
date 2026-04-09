"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { CATEGORIES } from "@/config/categories";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<string[]>([]);
  const [notifEmail, setNotifEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    if (!user) return;
    createClient()
      .from("profiles")
      .select("interests, notification_email")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setInterests(data.interests ?? []);
          setNotifEmail(data.notification_email ?? true);
        }
      });
  }, [user]);

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    await createClient()
      .from("profiles")
      .upsert({ id: user.id, interests, notification_email: notifEmail, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in">
        <div className="text-6xl">⚙️</div>
        <h1 className="text-2xl font-black">Sign in to manage settings</h1>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-gray-500 hover:text-gray-800 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-black text-gray-900">Interests & Settings</h1>
      </div>

      {/* Category interests */}
      <div className="section-box">
        <h2 className="text-lg font-black text-gray-900 mb-1">Deal Interests</h2>
        <p className="text-sm text-gray-500 mb-5">Select the categories you care about. We'll surface those deals first on your homepage.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(cat => {
            const selected = interests.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                disabled={cat.phase === 2}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed ${
                  selected
                    ? "border-[#53A318] bg-[#f0f9e8] text-[#53A318]"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <p className="text-sm font-bold leading-tight">{cat.label}</p>
                  {cat.phase === 2 && <p className="text-xs text-gray-400 font-medium">Coming soon</p>}
                </div>
                {selected && <CheckCircle size={16} className="ml-auto flex-shrink-0 text-[#53A318]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="section-box">
        <h2 className="text-lg font-black text-gray-900 mb-4">Notifications</h2>
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="font-bold text-gray-900">Email Deal Alerts</p>
            <p className="text-sm text-gray-500">Get notified when tracked prices drop below your target.</p>
          </div>
          <div
            onClick={() => { setNotifEmail(v => !v); setSaved(false); }}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${notifEmail ? "bg-[#53A318]" : "bg-gray-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifEmail ? "translate-x-7" : "translate-x-1"}`} />
          </div>
        </label>
      </div>

      {/* Save button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="w-full bg-[#53A318] hover:bg-[#3d7c10] text-white py-4 rounded-2xl font-black text-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {saving && <Loader2 size={20} className="animate-spin" />}
        {saved  ? "✓ Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
