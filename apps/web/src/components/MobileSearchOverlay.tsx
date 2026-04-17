"use client";

import { X, Search as SearchIcon, ArrowLeft } from "lucide-react";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";

export default function MobileSearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setMounted(true);
    } else {
      document.body.style.overflow = "unset";
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-white z-[200] transition-all duration-300 ease-in-out ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <SearchBar autoFocus />
          </div>
        </div>

        {/* Popular Searches / Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Popular Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            {["Electronics", "Fashion", "Shoes", "Home & Kitchen", "Sports", "Toys"].map(cat => (
              <a 
                key={cat} 
                href={`/category/${cat.toLowerCase().replace(/ & /g, "-")}`}
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-2xl text-sm font-bold text-gray-700 transition-colors flex items-center justify-between"
              >
                {cat}
                <SearchIcon size={14} className="text-gray-300" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
