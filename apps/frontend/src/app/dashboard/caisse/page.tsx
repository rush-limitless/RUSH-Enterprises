"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, X } from "lucide-react";

const MANAGER_ID = "demo-manager";

interface CaisseSession { id: string; openingBalance: number; closingBalance?: number; status: string; }
interface Transaction { id: string; type: string; amount: number; description: string; createdAt: string; isCancelled?: boolean; }

export default function CaissePage() {
  const [session, setSession] = useState<CaisseSession | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showClose, setShowClose] = useState(false);

  useEffect(() => { loadSession(); }, []);

  async function loadSession() {
    try {
      const s = await api<CaisseSession>(`/caisse/active/${MANAGER_ID}`);
      setSession(s);
      if (s?.id) loadTx(s.id);
    } catch { setSession(null); }
    finally { setLoading(false); }
  }

  async function loadTx(id: string) {
    try { setTransactions(await api<Transaction[]>(`/transactions/caisse/${id}`)); } catch { setTransactions([]); }
  }

  async function openCaisse() {
    setError("");
    try {
      const s = await api<CaisseSession>(`/caisse/open/${MANAGER_ID}`, { method: "POST", body: JSON.stringify({ openingBalance: Number(openingBalance) || 0 }) });
      setSession(s);
      setOpeningBalance("");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
  }

  async function addTx(type: string) {
    if (!session || !amount) return;
    setError("");
    try {
      await api("/transactions", { method: "POST", body: JSON.stringify({ caisseId: session.id, type, amount: Number(amount), description: description || undefined }) });
      setAmount(""); setDescription("");
      loadTx(session.id);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
  }

  async function cancelTx(id: string) {
    if (!session) return;
    try { await api(`/transactions/${id}/cancel`, { method: "PATCH" }); loadTx(session.id); } catch {}
  }

  async function closeCaisse() {
    if (!session) return;
    try {
      await api(`/caisse/close/${session.id}`, { method: "POST", body: JSON.stringify({ closingBalance: Number(closingBalance) || 0 }) });
      setSession(null); setTransactions([]); setClosingBalance(""); setShowClose(false);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
  }

  const total = transactions.filter(t => !t.isCancelled).reduce((s, t) => t.type === "sale" ? s + t.amount : s - t.amount, session?.openingBalance || 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Chargement…</div>;

  return (
    <div className="px-4 pt-4 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!session ? (
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="w-20 h-20 rounded-2xl bg-[#2E7D32] flex items-center justify-center mb-4">
            <Wallet size={40} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-1">Aucune caisse ouverte</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center">Ouvre ta caisse pour commencer.</p>
          <Card className="w-full shadow-sm border-0 shadow-black/5">
            <CardContent className="p-5 space-y-3">
              <div>
                <Label>Solde d&apos;ouverture (FCFA)</Label>
                <Input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} className="mt-1" />
              </div>
              <Button onClick={openCaisse} className="w-full h-12 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-semibold">Ouvrir la caisse</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Balance banner */}
          <Card className="bg-[#2E7D32] text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-xs opacity-80">Solde théorique</p>
              <p className="text-3xl font-bold">{total.toLocaleString("fr-FR")} FCFA</p>
              <Badge className="mt-1 bg-white/20 text-white border-0 text-[10px]">Caisse ouverte • {session.openingBalance} FCFA initial</Badge>
            </CardContent>
          </Card>

          {/* Quick transaction */}
          <Card className="shadow-sm border-0 shadow-black/5">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label>Montant (FCFA)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" placeholder="0" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" placeholder="Optionnel" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => addTx("sale")} className="h-11 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-semibold">Vente</Button>
                <Button onClick={() => addTx("expense")} variant="outline" className="h-11 rounded-xl border-orange-400 text-orange-500 hover:bg-orange-50 font-semibold">Dépense</Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          {transactions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Transactions</h3>
              {transactions.map((t) => (
                <Card key={t.id} className={`shadow-sm border-0 shadow-black/5 ${t.isCancelled ? "opacity-50" : ""}`}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${t.type === "sale" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          {t.type === "sale" ? "Vente" : "Dépense"}
                        </Badge>
                        {t.isCancelled && <Badge variant="destructive" className="text-[10px]">Annulé</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t.description || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.type === "sale" ? "text-[#2E7D32]" : "text-orange-500"}`}>
                        {t.type === "sale" ? "+" : "-"}{t.amount} FCFA
                      </p>
                      <p className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                      {!t.isCancelled && (
                        <button onClick={() => cancelTx(t.id)} className="text-[10px] text-red-400 hover:text-red-600">Annuler</button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Close button */}
          <Button onClick={() => setShowClose(true)} variant="outline" className="w-full h-11 rounded-xl border-red-300 text-red-500 hover:bg-red-50 font-semibold">
            Fermer la caisse
          </Button>

          {/* Close modal */}
          {showClose && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setShowClose(false)}>
              <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Fermer la caisse</h2>
                  <button onClick={() => setShowClose(false)}><X size={22} /></button>
                </div>
                <p className="text-sm text-muted-foreground">Solde théorique: <strong>{total.toLocaleString("fr-FR")} FCFA</strong></p>
                <div>
                  <Label>Solde réel (FCFA)</Label>
                  <Input type="number" value={closingBalance} onChange={(e) => setClosingBalance(e.target.value)} className="mt-1" />
                </div>
                {closingBalance && (
                  <p className={`text-sm font-semibold ${Number(closingBalance) - total === 0 ? "text-[#2E7D32]" : "text-red-500"}`}>
                    Écart: {(Number(closingBalance) - total).toLocaleString("fr-FR")} FCFA
                  </p>
                )}
                <Button onClick={closeCaisse} className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold">Confirmer la fermeture</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
