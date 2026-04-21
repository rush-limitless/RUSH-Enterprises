"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLang } from "@/lib/i18n";
import {
  LayoutDashboard, Package, ShoppingCart, Truck,
  Link2, Radio, FileText, FolderOpen,
  Search, Bell, Settings, Sun, Moon, ChevronRight, Menu, X, Globe,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/products", label: t.inventory, icon: Package, children: true },
    { href: "/dashboard/caisse", label: t.sales, icon: ShoppingCart },
    { href: "/dashboard/tasks", label: t.purchases, icon: Truck, children: true },
    { divider: true },
    { href: "/dashboard/reports", label: t.reports, icon: FileText },
    { href: "#", label: t.integrations, icon: Link2 },
    { href: "#", label: t.channels, icon: Radio },
    { href: "#", label: t.documents, icon: FolderOpen },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-52 bg-[#1e1e2d] flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-12 flex items-center px-4 border-b border-white/10">
          <span className="text-white font-bold text-base tracking-wide">📦 RUSH</span>
          <button className="ml-auto lg:hidden text-white/60" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {nav.map((item, i) => {
            if ("divider" in item) return <div key={i} className="my-2 border-t border-white/10" />;
            const Icon = item.icon;
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${isActive ? "bg-[#c0392b] text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <Icon size={16} /><span className="flex-1">{item.label}</span>
                {"children" in item && <ChevronRight size={14} className="opacity-40" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="flex-1 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder={t.search} className="w-full h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent text-xs font-medium" title="FR/EN">
              <Globe size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded hover:bg-accent">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="p-1.5 rounded hover:bg-accent"><Bell size={16} /></button>
            <button className="p-1.5 rounded hover:bg-accent"><Settings size={16} /></button>
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">R</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 bg-background">{children}</main>
      </div>
    </div>
  );
}
