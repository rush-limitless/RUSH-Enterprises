import { ReactNode } from "react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/caisse", label: "Caisse" },
  { href: "/dashboard/products", label: "Produits" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4 space-y-2">
        <h2 className="font-bold text-lg mb-4">RUSH</h2>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded px-3 py-2 text-sm hover:bg-accent"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
