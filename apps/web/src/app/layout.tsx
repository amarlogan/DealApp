import Link from "next/link";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Providers from "@/components/Providers";
import UserMenu from "@/components/UserMenu";
import NotificationBell from "@/components/NotificationBell";
import { ShoppingCart, Bell, Search, MapPin, Percent, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import SearchBar from "@/components/SearchBar";
import CategoryNav from "@/components/CategoryNav";

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "HuntMyDeal | Best Deals on Electronics, Fashion, Home & More",
  description: "Find the best discounts from 200+ brands on electronics, fashion, shoes, home & kitchen, sports, and more. Deals updated daily.",
  keywords: "deals, discounts, electronics deals, fashion sale, shoes deals, home deals, promo code, coupon",
};

const FOOTER_LINKS = {
  "Categories":  ["Electronics", "Home & Kitchen", "Fashion", "Shoes & Sneakers", "Sports & Outdoors", "Toys & Games"],
  "HuntMyDeal":   ["About Us", "How It Works", "Partner Brands", "Affiliate Disclosure", "Blog", "Press"],
  "Your Account":["Sign In / Register", "Saved Deals", "Price Alerts", "Deal History", "Interests"],
  "Support":     ["Help Center", "Contact Us", "Report a Problem", "Accessibility", "Privacy Policy", "Terms"],
};

export const revalidate = 60; // Revalidate layout every 60 seconds to catch DB updates

import ResponsiveShell from "@/components/ResponsiveShell";

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

  // Fetch active season
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
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          <ThemeProvider season={activeSeason}>
            
            <ResponsiveShell navs={navs} activeSeason={activeSeason}>
              {children}
            </ResponsiveShell>

            {/* ── Footer (Desktop Only) ── */}
            <footer className="bg-gray-900 text-gray-300 hidden md:block">
              <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2.5 mb-6 group cursor-pointer">
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Percent size={20} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter">HuntMy<span className="text-[var(--primary)]">Deal</span></span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Our mission is to help you find the absolute best deals from 200+ top brands. To keep our service free and accessible, we partner with retailers and may earn a small commission when you purchase through our links.
                  </p>
                  <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 flex items-center gap-2">
                       <Shield size={12} className="text-[var(--primary)]" /> Affiliate Disclosure
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-snug">
                      HuntMyDeal is a participant in affiliate advertising programs. When you click on links and buy items, we may receive a commission at no extra cost to you. These partnerships do not influence our editorial selections.
                    </p>
                  </div>
                </div>

                {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                  <div key={heading}>
                    <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">{heading}</h3>
                    <ul className="space-y-2.5">
                      {links.map(link => (
                        <li key={link}><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
                  <span>© 2026 HuntMyDeal Inc. All rights reserved.</span>
                </div>
              </div>
            </footer>

          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
