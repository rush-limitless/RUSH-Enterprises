"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Product { id: string; name: string; price: number; stock: number; }

export default function DashboardPage() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowCount, setLowCount] = useState(0);

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch(() => setProducts([]));
    api<Product[]>("/products/low-stock").then(d => setLowCount(d.length)).catch(() => setLowCount(0));
  }, []);

  const count = products.length;
  const totalValue = products.reduce((s, p) => s + p.price * (p.stock || 0), 0);
  const topSelling = products.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{t.salesActivity}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { val: count, label: t.toBePacked, color: "border-blue-500", text: "text-blue-600" },
                { val: lowCount, label: t.toBeShipped, color: "border-orange-400", text: "text-orange-500" },
                { val: 0, label: t.toBeDelivered, color: "border-green-500", text: "text-green-600" },
                { val: 0, label: t.toBeInvoiced, color: "border-red-400", text: "text-red-500" },
              ].map((k, i) => (
                <div key={i} className={`border-b-2 ${k.color} pb-3 text-center`}>
                  <p className={`text-2xl font-bold ${k.text}`}>{k.val}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{k.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{t.inventorySummary}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-muted-foreground uppercase">{t.qtyInHand}</span>
              <span className="text-lg font-bold">{totalValue.toLocaleString("fr-FR")}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-muted-foreground uppercase">{t.qtyToReceive}</span>
              <span className="text-lg font-bold">{count}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{t.productDetails}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between"><span className="text-red-500 font-medium">{t.lowStockItems}</span><span className="text-red-500 font-bold">{lowCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t.allItemGroup}</span><span className="font-semibold">{count}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t.allItems}</span><span className="font-semibold">{count}</span></div>
              </div>
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#e5e7eb" strokeWidth="5" className="dark:stroke-gray-700" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#2ecc71" strokeWidth="5"
                    strokeDasharray={`${count > 0 ? Math.max(10, ((count - lowCount) / count) * 82) : 0} 82`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold">{count > 0 ? Math.round(((count - lowCount) / count) * 100) : 0}%</span>
                </div>
                <div className="absolute -right-2 top-0 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[9px] text-muted-foreground">{t.activeItems}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">{t.topSelling}</CardTitle>
            <span className="text-[10px] text-muted-foreground">{t.previousYear} ▾</span>
          </CardHeader>
          <CardContent>
            {topSelling.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{t.noData}</p> : (
              <div className="flex gap-4">
                {topSelling.map(p => (
                  <div key={p.id} className="text-center flex-1">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-accent flex items-center justify-center text-lg mb-2">📦</div>
                    <p className="text-[11px] text-muted-foreground truncate">{p.name}</p>
                    <p className="text-xs font-bold">{p.stock} {t.pcs}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">{t.purchaseOrder}</CardTitle>
            <span className="text-[10px] text-muted-foreground">{t.thisMonth} ▾</span>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p className="text-xs text-muted-foreground">{t.qtyOrdered}</p>
            <p className="text-3xl font-bold text-primary mt-1">{totalValue.toLocaleString("fr-FR")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{t.salesOrder}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">{t.channel}</TableHead>
                  <TableHead className="text-[11px]">{t.draft}</TableHead>
                  <TableHead className="text-[11px]">{t.confirmed}</TableHead>
                  <TableHead className="text-[11px]">{t.packed}</TableHead>
                  <TableHead className="text-[11px]">{t.shipped}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs">{t.directSales}</TableCell>
                  <TableCell className="text-xs">0</TableCell>
                  <TableCell className="text-xs">{count}</TableCell>
                  <TableCell className="text-xs">0</TableCell>
                  <TableCell className="text-xs">0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
