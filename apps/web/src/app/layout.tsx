import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Providers from "@/components/Providers";
import UserMenu from "@/components/UserMenu";
import NotificationBell from "@/components/NotificationBell";
import { ShoppingCart, Bell, Search, MapPin, Percent, ChevronDown, ChevronRight } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import SearchBar from "@/components/SearchBar";
import CategoryNav from "@/components/CategoryNav";

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

export const revalidate = 60; // Revalidate layout every 60 seconds to catch DB updates

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseAdmin();
  
  // Fetch dynamic navigation mapping
  const { data: navItems } = await supabase
    .from("navigation_items")
    .select(`
      id, href, label_override, is_highlighted, sort_order, category_id,
      categories ( id, label, emoji, phase )
    `)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  const navs = navItems || [];

  // Fetch active season (current date between start and end)
  const today = new Date().toISOString().split('T')[0];
  const { data: seasonData } = await supabase
    .from("seasons")
    .select("*")
    .lte("start_date", today)
    .gte("end_date", today)
    .limit(1)
    .maybeSingle();

  const activeSeason = seasonData || { name: "default", css_variables: { "--primary": "var(--primary)" } };

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-[#f0f7fb]`}>
        <Providers>
          <ThemeProvider season={activeSeason}>

            {/* ── Announcement Strip ── */}
            <div className="bg-[var(--primary)] text-white text-center text-xs font-semibold py-2 px-4 tracking-wide">
              🎉 New deals added daily — Electronics, Fashion, Home &amp; more!{" "}
              <a href="/deals" className="underline hover:text-white/80">Browse Now →</a>
            </div>

            {/* ── Header ── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">

                {/* Logo */}
                <a href="/" aria-label="DealNexus Home" className="flex items-center gap-2 flex-shrink-0 group">
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

              {/* ── Dynamic Category Nav ── */}
              <CategoryNav navs={navs} />
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
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                      <Percent size={16} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xl font-black text-white">Deal<span className="text-[var(--primary)]">Nexus</span></span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    The best deals on electronics, fashion, shoes, home & more — curated from 200+ top brands.
                  </p>
                  <div className="flex gap-2">
                    {["𝕏","f","in"].map((s,i) => (
                      <a key={i} href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold hover:bg-[var(--primary)] transition-colors">{s}</a>
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
