"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/caisse", label: "Caisse" },
  { href: "/dashboard/products", label: "Produits" },
  { href: "/dashboard/tasks", label: "Tâches" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4 flex flex-col">
        <h2 className="font-bold text-lg mb-6">RUSH</h2>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded px-3 py-2 text-sm hover:bg-accent",
                pathname === item.href && "bg-accent font-medium"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? "☀️ Mode clair" : "🌙 Mode sombre"}
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
