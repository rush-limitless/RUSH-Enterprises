"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  DollarSign,
  XCircle,
} from "lucide-react";

const MANAGER_ID = "demo-manager";

interface CaisseSession {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  status?: string;
}

export default function CaissePage() {
  const [session, setSession] = useState<CaisseSession | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadSession(); }, []);

  async function loadSession() {
    try {
      const s = await api<CaisseSession>(`/caisse/active/${MANAGER_ID}`);
      setSession(s);
      if (s?.id) loadTransactions(s.id);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions(caisseId: string) {
    try {
      setTransactions(await api<Transaction[]>(`/transactions/caisse/${caisseId}`));
    } catch {
      setTransactions([]);
    }
  }

  async function openCaisse() {
    setError("");
    try {
      const s = await api<CaisseSession>(`/caisse/open/${MANAGER_ID}`, {
        method: "POST",
        body: JSON.stringify({ openingBalance: Number(openingBalance) || 0 }),
      });
      setSession(s);
      setOpeningBalance("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur ouverture");
    }
  }

  async function addTransaction(type: string) {
    if (!session || !amount) return;
    setError("");
    try {
      await api("/transactions", {
        method: "POST",
        body: JSON.stringify({
          caisseId: session.id,
          type,
          amount: Number(amount),
          description: description || undefined,
        }),
      });
      setAmount("");
      setDescription("");
      loadTransactions(session.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur transaction");
    }
  }

  async function cancelTransaction(id: string) {
    setError("");
    try {
      await api(`/transactions/${id}/cancel`, { method: "PATCH" });
      if (session) loadTransactions(session.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur annulation");
    }
  }

  async function closeCaisse() {
    if (!session) return;
    setError("");
    try {
      await api<CaisseSession>(`/caisse/close/${session.id}`, {
        method: "POST",
        body: JSON.stringify({ closingBalance: Number(closingBalance) || 0 }),
      });
      setSession(null);
      setTransactions([]);
      setClosingBalance("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur fermeture");
    }
  }

  const activeTxs = transactions.filter((t) => t.status !== "cancelled");
  const totalSales = activeTxs.filter((t) => t.type === "sale").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = activeTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const expectedBalance = (session?.openingBalance || 0) + totalSales - totalExpenses;
  const ecart = closingBalance ? Number(closingBalance) - expectedBalance : 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Chargement…
      </div>
    );
  }

  // No session — open screen
  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
        <Card className="w-full max-w-sm shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Wallet className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-lg">Ouvrir la caisse</CardTitle>
            <p className="text-sm text-muted-foreground">
              Saisissez le solde d&apos;ouverture pour démarrer
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="text-left">
              <Label>Solde d&apos;ouverture (FCFA)</Label>
              <Input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0"
                className="text-center text-lg"
              />
            </div>
            <Button onClick={openCaisse} className="w-full gap-2" size="lg">
              <Wallet className="h-4 w-4" /> Ouvrir
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active session
  return (
    <div className="space-y-6 animate-fade-in">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Total banner */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-1 py-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              Caisse ouverte
            </Badge>
            <span className="text-sm text-muted-foreground">
              Ouverture : {session.openingBalance.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-muted-foreground">Solde attendu</p>
            <p className="text-2xl font-bold text-primary">
              {expectedBalance.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Split: form left, history right */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Transaction form */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Nouvelle transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Montant (FCFA)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-lg"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => addTransaction("sale")}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                size="lg"
              >
                <ArrowUpRight className="h-4 w-4" /> Vente
              </Button>
              <Button
                onClick={() => addTransaction("expense")}
                className="gap-2 bg-orange-500 text-white hover:bg-orange-600"
                size="lg"
              >
                <ArrowDownRight className="h-4 w-4" /> Dépense
              </Button>
            </div>
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
                <p className="text-[10px] text-muted-foreground">Ventes</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {totalSales.toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3 text-center dark:bg-orange-950/30">
                <p className="text-[10px] text-muted-foreground">Dépenses</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {totalExpenses.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card className="shadow-sm lg:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle>Historique ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Aucune transaction
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow
                      key={t.id}
                      className={t.status === "cancelled" ? "opacity-40 line-through" : ""}
                    >
                      <TableCell>
                        {t.type === "sale" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            Vente
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                            Dépense
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {t.type === "sale" ? "+" : "-"}
                        {t.amount.toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.description || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        {t.status !== "cancelled" && (
                          <button
                            onClick={() => cancelTransaction(t.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Annuler"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Close session */}
      <Card className="shadow-sm border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Lock className="h-4 w-4" /> Fermer la caisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>Solde réel compté (FCFA)</Label>
              <Input
                type="number"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Attendu : <span className="font-medium text-foreground">{expectedBalance.toLocaleString("fr-FR")}</span></p>
              {closingBalance && (
                <p className={ecart === 0 ? "text-emerald-600" : "text-destructive font-medium"}>
                  Écart : {ecart > 0 ? "+" : ""}{ecart.toLocaleString("fr-FR")} FCFA
                </p>
              )}
            </div>
            <Button variant="destructive" onClick={closeCaisse} className="gap-2">
              <Lock className="h-4 w-4" /> Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
