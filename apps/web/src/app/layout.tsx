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
import AuthListener from "@/components/AuthListener";
import AnalyticsListener from "@/components/AnalyticsListener";
import { Suspense } from "react";

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "HuntMyDeal | Best Deals on Electronics, Fashion, Home & More",
  description: "Find the best deals from top brands, updated every hour. HuntMyDeal helps you save more with hand-picked discounts.",
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
            <AuthListener />
            <Suspense fallback={null}>
              <AnalyticsListener />
            </Suspense>
            
            <ResponsiveShell navs={navs} activeSeason={activeSeason}>
              {children}
            </ResponsiveShell>

            {/* ── Minimalist Footer ── */}
            <footer className="bg-white border-t border-gray-100 hidden md:block pt-16 pb-8">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                  {/* Brand & Mission */}
                  <div className="max-w-sm">
                    <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                      <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                        <img src="/logo.svg" alt="HuntMyDeal" className="w-full h-full" />
                      </div>
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">HuntMy<span className="text-[var(--primary)]">Deal</span></span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                      Helping you find verified deals from top brands. We focus on quality and real savings, updated every hour.
                    </p>
                  </div>

                  {/* Minimal Links */}
                  <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest mb-4">Platform</h4>
                      <ul className="space-y-3">
                        <li><Link href="/deals" className="text-sm text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors">All Deals</Link></li>
                        <li><Link href="#" className="text-sm text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors">Categories</Link></li>
                        <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors">Contact Us</Link></li>
                        <li><Link href="#" className="text-sm text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors">Partner Brands</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest mb-4">Legal</h4>
                      <ul className="space-y-3">
                        <li><Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms-of-service" className="text-sm text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors">Terms of Service</Link></li>
                        <li><Link href="/affiliate-disclosure" className="text-sm text-gray-500 hover:text-[var(--primary)] font-semibold transition-colors">Affiliate Disclosure</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <span className="text-xs text-gray-400 font-medium">© 2026 HuntMyDeal Inc. All rights reserved.</span>
                  
                  {/* Subtle Disclosure Bar */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-medium max-w-xl text-center md:text-right">
                    <Shield size={12} className="shrink-0" />
                    <span>HuntMyDeal is a participant in affiliate programs. We may earn a commission when you click on links and buy items.</span>
                  </div>
                </div>
              </div>
            </footer>

          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
