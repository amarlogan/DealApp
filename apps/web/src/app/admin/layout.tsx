import { LayoutDashboard, Tag, ShoppingBag, Palette, Home, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Deals Manager", href: "/admin/deals", icon: ShoppingBag },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Seasonal & Themes", href: "/admin/seasons", icon: Palette },
  { label: "Homepage Layout", href: "/admin/homepage", icon: Home },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900 group-hover:text-[#53A318] transition-colors">
              Admin<span className="text-gray-400">Nexus</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#53A318] transition-all group"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
