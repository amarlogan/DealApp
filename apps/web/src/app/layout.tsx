import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Providers from "@/components/Providers";
import UserMenu from "@/components/UserMenu";
import { ShoppingCart, Bell, Search, MapPin, Percent, ChevronDown, ChevronRight } from "lucide-react";
import { ACTIVE_CATEGORIES, UPCOMING_CATEGORIES } from "@/config/categories";

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "DealNexus | Best Deals on Electronics, Fashion, Home & More",
  description: "Find the best discounts from 200+ brands on electronics, fashion, shoes, home & kitchen, sports, and more. Deals updated daily.",
  keywords: "deals, discounts, electronics deals, fashion sale, shoes deals, home deals, promo code, coupon",
};

const FOOTER_LINKS = {
  "Categories":  ["Electronics", "Home & Kitchen", "Fashion", "Shoes & Sneakers", "Sports & Outdoors", "Toys & Games"],
  "DealNexus":   ["About Us", "How It Works", "Partner Brands", "Affiliate Disclosure", "Blog", "Press"],
  "Your Account":["Sign In / Register", "Saved Deals", "Price Alerts", "Deal History", "Interests"],
  "Support":     ["Help Center", "Contact Us", "Report a Problem", "Accessibility", "Privacy Policy", "Terms"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-[#f0f7fb]`}>
        <Providers>
          <ThemeProvider season={{ name: "default", css_variables: '{"--primary":"#53A318"}' }}>

            {/* ── Announcement Strip ── */}
            <div className="bg-[#53A318] text-white text-center text-xs font-semibold py-2 px-4 tracking-wide">
              🎉 New deals added daily — Electronics, Fashion, Home &amp; more!{" "}
              <a href="/deals" className="underline hover:text-white/80">Browse Now →</a>
            </div>

            {/* ── Header ── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">

                {/* Logo */}
                <a href="/" aria-label="DealNexus Home" className="flex items-center gap-2 flex-shrink-0 group">
                  <div className="w-9 h-9 bg-[#53A318] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Percent size={20} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-gray-900">
                    Deal<span className="text-[#53A318]">Nexus</span>
                  </span>
                </a>

                {/* Search */}
                <div className="flex-1 max-w-2xl hidden md:flex">
                  <div className="flex w-full rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#53A318] focus-within:border-[#53A318] transition-colors shadow-sm">
                    <div className="flex-1 relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="main-search"
                        type="search"
                        placeholder="Search deals, brands, categories…"
                        className="w-full py-2.5 pl-10 pr-4 outline-none text-gray-700 placeholder-gray-400 text-sm font-medium bg-transparent"
                      />
                    </div>
                    <button id="search-button" aria-label="Search" className="bg-[#53A318] hover:bg-[#3d7c10] px-5 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Search size={18} className="text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Right icons */}
                <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
                  <button id="notifications-btn" aria-label="Notifications" className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#53A318]">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">3</span>
                  </button>
                  {/* UserMenu shows Sign In when logged out, avatar dropdown when logged in */}
                  <UserMenu />
                </div>
              </div>

              {/* ── Category Nav (product categories only) ── */}
              <nav aria-label="Product categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 hidden lg:flex items-center gap-1 border-t border-gray-100 overflow-x-auto hide-scrollbar">
                <a href="/deals" className="py-1.5 px-3 text-sm font-bold whitespace-nowrap rounded-full text-[#53A318] bg-[#e8f4e0] transition-all">
                  🔥 All Deals
                </a>
                {ACTIVE_CATEGORIES.map(cat => (
                  <a
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className="py-1.5 px-3 text-sm font-semibold whitespace-nowrap rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  >
                    {cat.emoji} {cat.label}
                  </a>
                ))}
                <div className="w-px h-4 bg-gray-200 mx-1 flex-shrink-0" />
                {UPCOMING_CATEGORIES.map(cat => (
                  <span key={cat.id} title="Coming soon!" className="py-1.5 px-3 text-sm font-semibold whitespace-nowrap rounded-full text-gray-400 flex items-center gap-1.5 cursor-not-allowed select-none">
                    {cat.emoji} {cat.label}
                    <span className="coming-soon-badge">Soon</span>
                  </span>
                ))}
              </nav>
            </header>

            {/* ── Page ── */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </main>

            {/* ── Footer ── */}
            <footer className="bg-gray-900 text-gray-300 mt-auto">
              <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#53A318] rounded-lg flex items-center justify-center">
                      <Percent size={16} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xl font-black text-white">Deal<span className="text-[#53A318]">Nexus</span></span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    The best deals on electronics, fashion, shoes, home & more — curated from 200+ top brands.
                  </p>
                  <div className="flex gap-2">
                    {["𝕏","f","in"].map((s,i) => (
                      <a key={i} href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold hover:bg-[#53A318] transition-colors">{s}</a>
                    ))}
                  </div>
                </div>

                {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                  <div key={heading}>
                    <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">{heading}</h3>
                    <ul className="space-y-2.5">
                      {links.map(link => (
                        <li key={link}><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                  <span>© 2026 DealNexus Inc. All rights reserved.</span>
                  <div className="flex gap-4">
                    <a href="#" className="hover:text-gray-300">Privacy</a>
                    <a href="#" className="hover:text-gray-300">Terms</a>
                    <a href="#" className="hover:text-gray-300">Affiliate Disclosure</a>
                  </div>
                </div>
                <p className="max-w-7xl mx-auto px-6 pb-4 text-center text-xs text-gray-600">
                  <strong>Affiliate Disclosure:</strong> DealNexus earns commissions from qualifying purchases made through our links. This does not affect the price you pay.
                </p>
              </div>
            </footer>

          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
