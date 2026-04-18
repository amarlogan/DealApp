"use client";

import Link from "next/link";
import { Search, Percent } from "lucide-react";

export default function MobileHeader({ onSearchOpen }: { onSearchOpen: () => void }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 sm:px-6 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(83,163,24,0.3)]">
          <Percent size={20} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">
          Deal<span className="text-[var(--primary)]">Nexus</span>
        </span>
      </Link>

      {/* Action Icons */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onSearchOpen}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Open search"
        >
          <Search size={20} />
        </button>
      </div>
    </header>
  );
}
