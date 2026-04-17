"use client";

import { useState } from "react";
import useDevice from "@/lib/useDevice";
import MobileBottomNav from "./MobileBottomNav";
import MobileHeader from "./MobileHeader";
import MobileSearchOverlay from "./MobileSearchOverlay";
import SplashScreen from "./SplashScreen";
import CategoryNav from "./CategoryNav";
import SearchBar from "./SearchBar";
import NotificationBell from "@/components/NotificationBell";
import UserMenu from "@/components/UserMenu";
import { Percent } from "lucide-react";

export default function ResponsiveShell({ 
  children, 
  navs,
  activeSeason 
}: { 
  children: React.ReactNode; 
  navs: any[];
  activeSeason: any;
}) {
  const device = useDevice();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Still loading device type
  if (device === "loading") {
    return <SplashScreen />;
  }

  // Immersive Mobile Experience
  if (device === "mobile") {
    return (
      <>
        <SplashScreen />
        <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        
        <div className="flex flex-col min-h-screen pb-[var(--bottom-nav-height)]">
          <MobileHeader onSearchOpen={() => setIsSearchOpen(true)} />
          
          <main className="flex-1 w-full px-4 py-4 overflow-x-hidden">
            {children}
          </main>

          <MobileBottomNav onSearchOpen={() => setIsSearchOpen(true)} />
        </div>
      </>
    );
  }

  // Standard Desktop Experience (PRESERVING LEGACY LAYOUT)
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f7fb]">
      {/* Announcement Strip */}
      <div className="bg-[var(--primary)] text-white text-center text-xs font-semibold py-2 px-4 tracking-wide">
        🎉 New deals added daily — Electronics, Fashion, Home &amp; more!{" "}
        <a href="/deals" className="underline hover:text-white/80">Browse Now →</a>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Percent size={20} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Deal<span className="text-[var(--primary)]">Nexus</span>
            </span>
          </a>

          {/* Search */}
          <div className="flex-1 max-w-2xl hidden md:flex">
            <SearchBar />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>

        {/* Dynamic Category Nav */}
        <CategoryNav navs={navs} />
      </header>

      {/* Page */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Footer (Simplified for Shell refactor, actual footer stays in layout.tsx) */}
    </div>
  );
}
