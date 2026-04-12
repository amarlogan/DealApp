"use client";

import { useState, useRef, useEffect } from "react";
import { User, Heart, Bell, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

export default function UserMenu() {
  const { user, role, signOut, openLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <button
        id="signin-btn"
        onClick={openLogin}
        className="hidden sm:flex items-center gap-1.5 border-2 border-[#53A318] text-[#53A318] hover:bg-[#53A318] hover:text-white py-2 px-4 rounded-full transition-all duration-200 font-bold text-sm"
      >
        <User size={15} /> Sign In
      </button>
    );
  }

  const initials = (user.user_metadata?.full_name ?? user.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
      >
        <div className="w-7 h-7 rounded-full bg-[#53A318] text-white text-xs font-black flex items-center justify-center">
          {initials}
        </div>
        <span className="font-semibold text-sm text-gray-800 max-w-[100px] truncate">{displayName}</span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="font-bold text-sm text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            {role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-black border-b border-gray-100"
              >
                <div className="w-4 h-4 rounded-sm bg-emerald-600 flex items-center justify-center">
                   <Settings size={10} className="text-white" />
                </div>
                Admin Dashboard
              </Link>
            )}
            {[
              { href: "/profile",        icon: <User size={15} />,    label: "My Dashboard" },
              { href: "/profile/saved",  icon: <Heart size={15} />,   label: "Saved Deals" },
              { href: "/profile/alerts", icon: <Bell size={15} />,    label: "Price Alerts" },
              { href: "/profile/settings", icon: <Settings size={15} />, label: "Interests & Settings" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#53A318] transition-colors font-medium"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
