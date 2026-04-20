import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingCart, AlertTriangle, Tag, Wallet, BarChart3 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

async function getData() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const opts = { cache: "no-store" as const, signal: controller.signal };
    const [products, lowStock] = await Promise.all([
      fetch(`${API}/api/products`, opts).then((r) => r.json()),
      fetch(`${API}/api/products/low-stock`, opts).then((r) => r.json()),
    ]);
    clearTimeout(timeout);
    return { productCount: products.length, lowStockCount: lowStock.length };
  } catch {
    return { productCount: 0, lowStockCount: 0 };
  }
}

const kpis = [
  { label: "Valeur du St...", value: "0", unit: "FCFA", dot: "bg-[#2E7D32]", icon: Wallet, arrow: true },
  { label: "C.A. du jour", value: "0", unit: "FCFA", dot: "bg-orange-400", icon: ShoppingCart, arrow: true },
  { label: "Ventes du Jour", value: "0", unit: "", dot: "bg-gray-800 dark:bg-gray-300", icon: Package, arrow: false },
  { label: "Alertes Stock", value: "ALERTS", unit: "", dot: "bg-red-500", icon: AlertTriangle, arrow: true },
  { label: "Remise du Jour", value: "0", unit: "FCFA", dot: "bg-orange-400", icon: Tag, arrow: false },
  { label: "Produits", value: "PRODUCTS", unit: "", dot: "bg-[#2E7D32]", icon: BarChart3, arrow: false },
];

export default async function DashboardPage() {
  const { productCount, lowStockCount } = await getData();

  return (
    <div className="px-4 pt-4 space-y-6">
      {/* KPI Grid 2x3 */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const displayValue = kpi.value === "ALERTS" ? String(lowStockCount) : kpi.value === "PRODUCTS" ? String(productCount) : kpi.value;
          const isAlert = kpi.value === "ALERTS" && lowStockCount > 0;
          return (
            <Card key={i} className="shadow-sm border-0 shadow-black/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${kpi.dot}`} />
                  {kpi.arrow && <span className="text-muted-foreground text-xs">›</span>}
                  <span className="text-xs text-muted-foreground truncate">{kpi.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`text-2xl font-bold ${isAlert ? "text-red-500" : kpi.dot.includes("orange") ? "text-orange-500" : ""}`}>
                      {displayValue}
                    </span>
                    {kpi.unit && <span className="text-sm text-muted-foreground ml-2">{kpi.unit}</span>}
                  </div>
                  <Icon size={20} className="text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-base font-bold mb-3">Quick Stats</h2>
        <Card className="shadow-sm border-0 shadow-black/5">
          <CardContent className="p-5">
            <h3 className="font-semibold text-base mb-1">Répartition C.A.</h3>
            <p className="text-xs text-muted-foreground mb-5">Produits vs services</p>
            <div className="flex items-center gap-8">
              {/* Donut chart CSS */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/50" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#2E7D32" strokeWidth="4" strokeDasharray="0 88" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">0</span>
                  <span className="text-[10px] text-muted-foreground">FCFA</span>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                  <div>
                    <span className="text-sm">Produits:</span>
                    <span className="text-sm font-semibold ml-1">0 FCFA</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <div>
                    <span className="text-sm">Services:</span>
                    <span className="text-sm font-semibold ml-1">0 FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
