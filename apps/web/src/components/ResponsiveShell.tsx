"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  // Determine if we should show the mobile shell
  const isMobile = device === "mobile";
  const isLoading = device === "loading";


  // Immersive Mobile Experience
  if (isMobile) {
    return (
      <>
        {/* Only show splash on mobile while loading or on initial mount */}
        {isLoading && <SplashScreen />}
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
      <div className="bg-gradient-to-r from-[var(--primary-dark)] via-[var(--primary)] to-[var(--primary-dark)] text-white text-center text-[10px] font-black uppercase tracking-[0.2em] py-2.5 px-4 shadow-sm border-b border-white/10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
        <span>🎉 New deals added daily — Electronics, Fashion, Home &amp; more! <Link href="/deals" className="underline hover:text-white/80 transition-opacity ml-1">Browse Now →</Link></span>
        <span className="hidden sm:block opacity-30">|</span>
        <span className="text-[9px] lowercase font-medium opacity-80 tracking-normal normal-case">We may get paid by brands for deals, including promoted items.</span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(83,163,24,0.3)] group-hover:shadow-[0_8px_20px_-4px_rgba(83,163,24,0.4)] transition-all group-hover:scale-105">
              <Percent size={22} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">
              HuntMy<span className="text-[var(--primary)]">Deal</span>
            </span>
          </Link>

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
