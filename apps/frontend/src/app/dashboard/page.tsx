"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Users,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock?: number;
  price: number;
}

interface CaisseSession {
  id: string;
  managerId: string;
  openingBalance: number;
  status: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
}

interface DayData {
  label: string;
  revenue: number;
  expense: number;
}

const MANAGER_ID = "demo-manager";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [activeCaisses, setActiveCaisses] = useState<CaisseSession[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [weekData, setWeekData] = useState<DayData[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [prods, low] = await Promise.all([
        api<Product[]>("/products").catch(() => []),
        api<Product[]>("/products/low-stock").catch(() => []),
      ]);
      setProducts(prods);
      setLowStock(low);
    } catch {
      /* fallback already set */
    }

    try {
      const session = await api<CaisseSession>(
        `/caisse/active/${MANAGER_ID}`
      ).catch(() => null);
      if (session?.id) {
        setActiveCaisses([session]);
        const txs = await api<Transaction[]>(
          `/transactions/caisse/${session.id}`
        ).catch(() => []);
        const rev = txs
          .filter((t) => t.type === "sale")
          .reduce((s, t) => s + t.amount, 0);
        const exp = txs
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + t.amount, 0);
        setTodayRevenue(rev);
        setTodayExpense(exp);
      }
    } catch {
      /* no active session */
    }

    // Mock week data for chart
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    setWeekData(
      days.map((label) => ({
        label,
        revenue: Math.floor(Math.random() * 500000) + 100000,
        expense: Math.floor(Math.random() * 200000) + 50000,
      }))
    );
  }

  const maxChart = Math.max(
    ...weekData.map((d) => Math.max(d.revenue, d.expense)),
    1
  );

  const kpis = [
    {
      title: "CA du jour",
      value: `${todayRevenue.toLocaleString("fr-FR")} FCFA`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Dépenses",
      value: `${todayExpense.toLocaleString("fr-FR")} FCFA`,
      icon: TrendingDown,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
    {
      title: "Produits",
      value: products.length.toString(),
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Alertes stock",
      value: lowStock.length.toString(),
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="shadow-sm">
            <CardContent className="flex items-center gap-4 pt-2">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Caisses */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bar Chart */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>CA vs Dépenses (semaine)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {weekData.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center gap-1 h-40">
                    <div
                      className="w-3 rounded-t bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                      style={{ height: `${(d.revenue / maxChart) * 100}%` }}
                      title={`${d.revenue.toLocaleString("fr-FR")} FCFA`}
                    />
                    <div
                      className="w-3 rounded-t bg-orange-400 dark:bg-orange-500 transition-all duration-500"
                      style={{ height: `${(d.expense / maxChart) * 100}%` }}
                      title={`${d.expense.toLocaleString("fr-FR")} FCFA`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Revenus
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-orange-400" /> Dépenses
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Caisses ouvertes */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Caisses ouvertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCaisses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune caisse ouverte</p>
            ) : (
              activeCaisses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-accent/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{c.managerId}</p>
                    <p className="text-xs text-muted-foreground">
                      Ouverture : {c.openingBalance.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    Active
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stocks critiques */}
      {lowStock.length > 0 && (
        <Card className="shadow-sm border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Stocks critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30"
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.price.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <Badge variant="destructive" className="animate-pulse-red">
                    {p.stock} restant{p.stock > 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
