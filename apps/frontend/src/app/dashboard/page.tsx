import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Ventes du jour</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0 FCFA</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Transactions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Alertes stock</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">0</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
