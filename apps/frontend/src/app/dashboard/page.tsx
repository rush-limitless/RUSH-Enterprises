import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

async function getData() {
  try {
    const [products, lowStock] = await Promise.all([
      fetch(`${API}/api/products`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API}/api/products/low-stock`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    return { productCount: products.length, lowStockCount: lowStock.length };
  } catch {
    return { productCount: 0, lowStockCount: 0 };
  }
}

export default async function DashboardPage() {
  const { productCount, lowStockCount } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ventes du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 FCFA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alertes stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{lowStockCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
