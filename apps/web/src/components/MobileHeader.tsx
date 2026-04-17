"use client";

import { Search, Percent } from "lucide-react";

export default function MobileHeader({ onSearchOpen }: { onSearchOpen: () => void }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 sm:px-6 flex items-center justify-between">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-sm">
          <Percent size={18} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-xl font-black tracking-tight text-gray-900 leading-none">
          Deal<span className="text-[var(--primary)]">Nexus</span>
        </span>
      </a>

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
