"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="flex w-full rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#53A318] focus-within:border-[#53A318] transition-colors shadow-sm"
    >
      <div className="flex-1 relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          id="main-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deals, brands, categories…"
          className="w-full py-2.5 pl-10 pr-4 outline-none text-gray-700 placeholder-gray-400 text-sm font-medium bg-transparent"
        />
      </div>
      <button 
        type="submit" 
        id="search-button" 
        aria-label="Search" 
        className="bg-[#53A318] hover:bg-[#3d7c10] px-5 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        <Search size={18} className="text-white" strokeWidth={2.5} />
      </button>
    </form>
  );
}
