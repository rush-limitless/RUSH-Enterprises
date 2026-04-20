"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home, Package, Wallet, ArrowUpDown, BarChart3,
  Bell, MoreVertical, Plus, Sun, Moon,
} from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/products", label: "Produits", icon: Package },
  { href: "/dashboard/caisse", label: "Caisse", icon: Wallet },
  { href: "/dashboard/tasks", label: "Mouveme...", icon: ArrowUpDown },
  { href: "/dashboard/reports", label: "Rapports", icon: BarChart3 },
];

function getPageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Accueil";
  if (pathname.includes("products")) return "Produits";
  if (pathname.includes("caisse")) return "Caisse";
  if (pathname.includes("tasks")) return "Tâches";
  if (pathname.includes("reports")) return "Rapports";
  return "RUSH";
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background relative">
      {/* Green header */}
      <header className="bg-[#1B5E20] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex-1" />
        <h1 className="text-lg font-semibold">{getPageTitle(pathname)}</h1>
        <div className="flex-1 flex items-center justify-end gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors" aria-label="Menu">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* FAB */}
      <Link
        href="/dashboard/products"
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-14 h-14 bg-[#2E7D32] rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#1B5E20] transition-colors"
        style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto" }}
      >
        <Plus size={28} className="text-white" />
      </Link>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href === "/dashboard/reports" ? "/dashboard" : tab.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[60px] transition-colors ${
                  isActive ? "text-[#1B5E20]" : "text-muted-foreground"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] leading-tight ${isActive ? "font-semibold" : ""}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
