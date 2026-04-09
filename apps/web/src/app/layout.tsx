import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import FTCDisclaimer from "@/components/FTCDisclaimer";
import Providers from "@/components/Providers";
import { ShoppingCart, Bell, User, Search, MapPin, Percent, ChevronDown } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "DealNexus | Find the Best Deals Near You",
  description: "Discover and save with the best local deals, spa treatments, restaurants, activities, and more. Up to 70% off top merchants near you.",
  keywords: "deals, discounts, local deals, spa, restaurants, activities, coupons, promo codes",
};

async function getActiveSeason() {
  return {
    name: 'Spring Sale',
    css_variables: '{"--primary": "#53A318", "--background": "#f0f7fb", "--text": "#171717"}'
  };
}

const NAV_CATEGORIES = [
  { label: 'Trending Deals', href: '#', active: true },
  { label: 'Beauty & Spas', href: '#' },
  { label: 'Things to Do', href: '#' },
  { label: 'Food & Drink', href: '#' },
  { label: 'Travel', href: '#' },
  { label: 'Health & Fitness', href: '#' },
  { label: 'Goods', href: '#' },
  { label: 'All Categories', href: '#', hasIcon: true },
];

const FOOTER_LINKS = {
  'Explore': ['Trending Deals', 'Beauty & Spas', 'Things To Do', 'Food & Drink', 'Travel', 'Health & Fitness'],
  'DealNexus': ['About Us', 'How It Works', 'Merchant Partners', 'Press', 'Careers', 'Blog'],
  'Support': ['Help Center', 'Contact Us', 'Report an Issue', 'Gift Cards', 'Accessibility'],
  'Legal': ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Affiliate Disclosure'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeSeason = await getActiveSeason();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          <ThemeProvider season={activeSeason}>

            {/* Top Announcement Bar */}
            <div className="bg-[#53A318] text-white text-center text-xs font-semibold py-2 px-4 tracking-wide">
              🌸 Spring Sale: Up to 70% off — <span className="underline cursor-pointer hover:text-white/80">Shop Now</span>
            </div>

            {/* Main Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">

                {/* Logo */}
                <a href="/" aria-label="DealNexus Home" className="flex items-center gap-2 flex-shrink-0 group">
                  <div className="w-9 h-9 bg-[#53A318] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Percent size={20} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-gray-900">
                    Deal<span className="text-[#53A318]">Nexus</span>
                  </span>
                </a>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl hidden md:flex items-center order-3 lg:order-none w-full lg:w-auto">
                  <div className="flex w-full border-2 border-gray-200 hover:border-[#53A318] focus-within:border-[#53A318] rounded-full overflow-hidden bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex-1 relative">
                      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="main-search"
                        type="text"
                        placeholder="Search for deals, spa, restaurants..."
                        className="w-full py-2.5 pl-10 pr-4 outline-none text-gray-700 placeholder-gray-400 font-medium text-sm"
                      />
                    </div>
                    <div className="border-l border-gray-200 px-4 flex items-center bg-gray-50 text-gray-600 min-w-[130px] cursor-pointer hover:bg-gray-100 transition-colors">
                      <MapPin size={14} className="mr-1.5 text-[#53A318] flex-shrink-0" />
                      <span className="text-sm font-semibold truncate">Seattle, WA</span>
                      <ChevronDown size={14} className="ml-auto opacity-50" />
                    </div>
                    <button
                      id="search-button"
                      aria-label="Search deals"
                      className="bg-[#53A318] hover:bg-[#438a10] px-5 text-white transition-colors flex items-center justify-center flex-shrink-0"
                    >
                      <Search size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-1 sm:gap-3 text-gray-600 flex-shrink-0">
                  <button id="notifications-btn" aria-label="Notifications" className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors hover:text-[#53A318]">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black leading-none">3</span>
                  </button>
                  <button id="cart-btn" aria-label="Shopping cart" className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors hover:text-[#53A318]">
                    <ShoppingCart size={20} />
                  </button>
                  <button
                    id="signin-btn"
                    className="hidden sm:flex items-center gap-2 border-2 border-[#53A318] text-[#53A318] hover:bg-[#53A318] hover:text-white py-2 px-4 rounded-full transition-all duration-200 font-bold text-sm"
                  >
                    <User size={15} /> Sign In
                  </button>
                </div>
              </div>

              {/* Secondary Nav Categories */}
              <nav aria-label="Deal categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-2 hidden lg:flex items-center gap-1 border-t border-gray-100 overflow-x-auto hide-scrollbar">
                {NAV_CATEGORIES.map((cat) => (
                  <a
                    key={cat.label}
                    href={cat.href}
                    className={`py-1.5 px-3 text-sm font-semibold whitespace-nowrap rounded-full transition-all hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1 ${
                      cat.active ? 'text-[#53A318] bg-[#e8f4e0]' : 'text-gray-600'
                    }`}
                  >
                    {cat.label}
                    {cat.hasIcon && <ChevronDown size={13} className="opacity-60" />}
                  </a>
                ))}
              </nav>
            </header>

            {/* Page Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-auto">
              {/* Main Footer Content */}
              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {/* Brand Column */}
                  <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-[#53A318] rounded-lg flex items-center justify-center">
                        <Percent size={16} className="text-white" strokeWidth={3} />
                      </div>
                      <span className="text-xl font-black text-white">
                        Deal<span className="text-[#53A318]">Nexus</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      Your #1 source for the best local deals on beauty, food, activities, and more.
                    </p>
                    <div className="flex gap-3">
                      {['𝕏', 'f', 'in', '▶'].map((social, i) => (
                        <a key={i} href="#" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold hover:bg-[#53A318] transition-colors">
                          {social}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Link Columns */}
                  {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                    <div key={heading}>
                      <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">{heading}</h3>
                      <ul className="space-y-2.5">
                        {links.map(link => (
                          <li key={link}>
                            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                  <span>© 2026 DealNexus Inc. All rights reserved.</span>
                  <div className="flex items-center gap-4">
                    <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Sitemap</a>
                  </div>
                </div>
              </div>

              <FTCDisclaimer />
            </footer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
