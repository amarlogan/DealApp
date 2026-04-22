"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Grid, Search, Bookmark, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function MobileBottomNav({ onSearchOpen }: { onSearchOpen: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openLogin } = useAuth();

  const handleAuthNav = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      openLogin();
    }
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: Grid },
    { label: "Search", href: "#", icon: Search, onClick: onSearchOpen },
    { label: "Saved", href: "/profile/saved", icon: Bookmark, requireAuth: true },
    { label: "Profile", href: "/profile", icon: User, requireAuth: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-2 pb-safe z-[100] md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <nav className="flex items-center justify-between max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-1 rounded-xl transition-colors text-gray-400 group-hover:text-[var(--primary)]">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[var(--primary)]">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.requireAuth ? (e) => handleAuthNav(e, item.href) : undefined}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? "text-[var(--primary)]" : "text-gray-400 group-hover:text-[var(--primary)]"}`}>
                <Icon size={24} strokeWidth={2.5} fill={isActive ? "currentColor" : "none"} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? "text-[var(--primary)]" : "text-gray-400 group-hover:text-[var(--primary)]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
