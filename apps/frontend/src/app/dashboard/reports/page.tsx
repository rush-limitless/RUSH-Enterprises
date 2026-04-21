"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package, ShoppingCart, AlertTriangle } from "lucide-react";

interface Product { id: string; name: string; price: number; stock: number; type: string; minStock?: number; }

export default function ReportsPage() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [tab, setTab] = useState<"sales" | "products" | "services" | "alerts">("sales");

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(() => setProducts([]));
    api<Product[]>("/products/low-stock").then(setLowStock).catch(() => setLowStock([]));
  }, []);

  const totalValue = products.reduce((s, p) => s + p.price * (p.stock || 0), 0);
  const physicalValue = products.filter(p => p.type === "physical").reduce((s, p) => s + p.price * (p.stock || 0), 0);
  const digitalValue = products.filter(p => p.type === "digital").reduce((s, p) => s + p.price * (p.stock || 0), 0);

  const tabs = [
    { key: "sales", label: t.salesReport, icon: FileText },
    { key: "products", label: t.products, icon: Package },
    { key: "services", label: t.services, icon: ShoppingCart },
    { key: "alerts", label: t.alertsReport, icon: AlertTriangle },
  ] as const;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold">{t.reportsTitle}</h1>

      {/* Tab icons */}
      <div className="flex gap-4">
        {tabs.map(tb => {
          const Icon = tb.icon;
          return (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${tab === tb.key ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`}>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Icon size={18} /></div>
              <span className="text-[10px]">{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t.totalRevenue}</p><p className="text-2xl font-bold mt-1">{totalValue.toLocaleString("fr-FR")} {t.fcfa}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t.sales}</p><p className="text-2xl font-bold mt-1">{products.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t.avgBasket}</p><p className="text-2xl font-bold mt-1">{products.length > 0 ? Math.round(totalValue / products.length).toLocaleString("fr-FR") : 0} {t.fcfa}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t.discounts}</p><p className="text-2xl font-bold mt-1">0 {t.fcfa}</p></CardContent></Card>
      </div>

      {/* Donut chart */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{t.caBreakdown}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" className="dark:stroke-gray-700" />
                {totalValue > 0 && <circle cx="18" cy="18" r="14" fill="none" stroke="#2ecc71" strokeWidth="4" strokeDasharray={`${(physicalValue / totalValue) * 88} 88`} strokeLinecap="round" />}
                {totalValue > 0 && <circle cx="18" cy="18" r="14" fill="none" stroke="#f39c12" strokeWidth="4" strokeDasharray={`${(digitalValue / totalValue) * 88} 88`} strokeDashoffset={`-${(physicalValue / totalValue) * 88}`} strokeLinecap="round" />}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{totalValue.toLocaleString("fr-FR")}</span>
                <span className="text-[10px] text-muted-foreground">{t.fcfa}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-sm">{t.products}</span>
                <span className="text-sm font-semibold ml-auto">{physicalValue.toLocaleString("fr-FR")} {t.fcfa}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="text-sm">{t.services}</span>
                <span className="text-sm font-semibold ml-auto">{digitalValue.toLocaleString("fr-FR")} {t.fcfa}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts section */}
      {tab === "alerts" && lowStock.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{t.alertsReport}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-sm text-red-500 font-bold">{p.stock} {t.pcs}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
