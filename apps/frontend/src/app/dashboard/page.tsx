import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

async function getData() {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 5000);
    const o = { cache: "no-store" as const, signal: c.signal };
    const [products, lowStock] = await Promise.all([
      fetch(`${API}/api/products`, o).then(r => r.json()),
      fetch(`${API}/api/products/low-stock`, o).then(r => r.json()),
    ]);
    clearTimeout(t);
    return { products, lowStock, count: products.length, lowCount: lowStock.length };
  } catch {
    return { products: [], lowStock: [], count: 0, lowCount: 0 };
  }
}

export default async function DashboardPage() {
  const { products, lowStock, count, lowCount } = await getData();
  const totalValue = products.reduce((s: number, p: { price: number; stock: number }) => s + p.price * (p.stock || 0), 0);
  const topSelling = products.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Activity */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-foreground">Sales Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { val: count, label: "TO BE PACKED", color: "border-blue-500", text: "text-blue-600" },
                { val: lowCount, label: "TO BE SHIPPED", color: "border-orange-400", text: "text-orange-500" },
                { val: 0, label: "TO BE DELIVERED", color: "border-green-500", text: "text-green-600" },
                { val: 0, label: "TO BE INVOICED", color: "border-red-400", text: "text-red-500" },
              ].map((k, i) => (
                <div key={i} className={`border-b-2 ${k.color} pb-3 text-center`}>
                  <p className={`text-2xl font-bold ${k.text}`}>{k.val}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{k.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Summary */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Inventory Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-muted-foreground uppercase">Quantity in Hand</span>
              <span className="text-lg font-bold">{totalValue.toLocaleString("fr-FR")}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-muted-foreground uppercase">Quantity to be Received</span>
              <span className="text-lg font-bold">{count}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Product Details */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Product Details</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between">
                  <span className="text-red-500 font-medium">Low Stock Items</span>
                  <span className="text-red-500 font-bold">{lowCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All Item Group</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All Items</span>
                  <span className="font-semibold">{count}</span>
                </div>
              </div>
              {/* Donut */}
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
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[9px] text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Top Selling Items</CardTitle>
            <span className="text-[10px] text-muted-foreground">Previous Year ▾</span>
          </CardHeader>
          <CardContent>
            {topSelling.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data</p>
            ) : (
              <div className="flex gap-4">
                {topSelling.map((p: { id: string; name: string; price: number; stock: number }) => (
                  <div key={p.id} className="text-center flex-1">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-accent flex items-center justify-center text-lg mb-2">📦</div>
                    <p className="text-[11px] text-muted-foreground truncate">{p.name}</p>
                    <p className="text-xs font-bold">{p.stock} pcs</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Purchase Order */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Purchase Order</CardTitle>
            <span className="text-[10px] text-muted-foreground">This Month ▾</span>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p className="text-xs text-muted-foreground">Quantity Ordered</p>
            <p className="text-3xl font-bold text-primary mt-1">{totalValue.toLocaleString("fr-FR")}</p>
          </CardContent>
        </Card>

        {/* Sales Order */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Sales Order</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Channel</TableHead>
                  <TableHead className="text-[11px]">Draft</TableHead>
                  <TableHead className="text-[11px]">Confirmed</TableHead>
                  <TableHead className="text-[11px]">Packed</TableHead>
                  <TableHead className="text-[11px]">Shipped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs">Direct sales</TableCell>
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
