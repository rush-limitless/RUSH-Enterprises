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

  useEffect(() => {
    loadSession();
  }, []);

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

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Caisse</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!session ? (
        <Card className="max-w-md">
          <CardHeader><CardTitle>Ouvrir la caisse</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Solde d&apos;ouverture (FCFA)</Label>
              <Input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
            </div>
            <Button onClick={openCaisse} className="w-full">Ouvrir</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge>Caisse ouverte</Badge>
            <span className="text-sm text-muted-foreground">
              Solde d&apos;ouverture : {session.openingBalance} FCFA
            </span>
          </div>

          <Card>
            <CardHeader><CardTitle>Nouvelle transaction</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Montant (FCFA)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => addTransaction("sale")}>
                  Vente
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => addTransaction("expense")}>
                  Dépense
                </Button>
              </div>
            </CardContent>
          </Card>

          {transactions.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Badge variant={t.type === "sale" ? "default" : "secondary"}>
                            {t.type === "sale" ? "Vente" : "Dépense"}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.amount} FCFA</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(t.createdAt).toLocaleTimeString("fr-FR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card className="max-w-md">
            <CardHeader><CardTitle>Fermer la caisse</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Solde réel (FCFA)</Label>
                <Input
                  type="number"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                />
              </div>
              <Button variant="destructive" onClick={closeCaisse} className="w-full">
                Fermer la caisse
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
