"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";

const MID = "demo-manager";
interface Session { id: string; openingBalance: number; }
interface Tx { id: string; type: string; amount: number; description: string; createdAt: string; isCancelled?: boolean; }

export default function CaissePage() {
  const { t } = useLang();
  const [session, setSession] = useState<Session | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [ob, setOb] = useState(""); const [amt, setAmt] = useState(""); const [desc, setDesc] = useState(""); const [cb, setCb] = useState("");
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showClose, setShowClose] = useState(false);

  useEffect(() => { loadS(); }, []);
  async function loadS() { try { const s = await api<Session>(`/caisse/active/${MID}`); setSession(s); if (s?.id) loadTx(s.id); } catch { setSession(null); } finally { setLoading(false); } }
  async function loadTx(id: string) { try { setTxs(await api<Tx[]>(`/transactions/caisse/${id}`)); } catch { setTxs([]); } }
  async function openC() { setError(""); try { const s = await api<Session>(`/caisse/open/${MID}`, { method: "POST", body: JSON.stringify({ openingBalance: Number(ob) || 0 }) }); setSession(s); setOb(""); } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); } }
  async function addTx(type: string) { if (!session || !amt) return; setError(""); try { await api("/transactions", { method: "POST", body: JSON.stringify({ caisseId: session.id, type, amount: Number(amt), description: desc || undefined }) }); setAmt(""); setDesc(""); loadTx(session.id); } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); } }
  async function cancelTx(id: string) { if (!session) return; try { await api(`/transactions/${id}/cancel`, { method: "PATCH" }); loadTx(session.id); } catch {} }
  async function closeC() { if (!session) return; try { await api(`/caisse/close/${session.id}`, { method: "POST", body: JSON.stringify({ closingBalance: Number(cb) || 0 }) }); setSession(null); setTxs([]); setCb(""); setShowClose(false); } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); } }

  const total = txs.filter(x => !x.isCancelled).reduce((s, x) => x.type === "sale" ? s + x.amount : s - x.amount, session?.openingBalance || 0);
  if (loading) return <p className="text-muted-foreground text-sm">{t.loading}</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold">{t.cashRegister}</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!session ? (
        <Card className="max-w-sm">
          <CardHeader><CardTitle className="text-sm">{t.openRegister}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">{t.openingBalance} ({t.fcfa})</Label><Input type="number" value={ob} onChange={e => setOb(e.target.value)} className="mt-1 h-8 text-sm" /></div>
            <Button onClick={openC} className="w-full h-9 bg-primary hover:bg-primary/90">{t.open}</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase">{t.opening}</p><p className="text-xl font-bold">{session.openingBalance.toLocaleString("fr-FR")} <span className="text-xs font-normal">{t.fcfa}</span></p></CardContent></Card>
            <Card className="border-primary/30 bg-primary/5"><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase">{t.currentBalance}</p><p className="text-xl font-bold text-primary">{total.toLocaleString("fr-FR")} <span className="text-xs font-normal">{t.fcfa}</span></p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase">{t.transactions}</p><p className="text-xl font-bold">{txs.length}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t.newTransaction}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[120px]"><Label className="text-xs">{t.amount} ({t.fcfa})</Label><Input type="number" value={amt} onChange={e => setAmt(e.target.value)} className="mt-1 h-8 text-sm" /></div>
                <div className="flex-1 min-w-[150px]"><Label className="text-xs">{t.description}</Label><Input value={desc} onChange={e => setDesc(e.target.value)} className="mt-1 h-8 text-sm" placeholder={t.optional} /></div>
                <Button onClick={() => addTx("sale")} size="sm" className="bg-green-600 hover:bg-green-700 h-8">{t.sale}</Button>
                <Button onClick={() => addTx("expense")} size="sm" variant="outline" className="border-orange-400 text-orange-500 hover:bg-orange-50 h-8">{t.expense}</Button>
              </div>
            </CardContent>
          </Card>
          {txs.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{t.transactions}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-[11px]">{t.type}</TableHead>
                    <TableHead className="text-[11px] text-right">{t.amount}</TableHead>
                    <TableHead className="text-[11px]">{t.description}</TableHead>
                    <TableHead className="text-[11px]">Heure</TableHead>
                    <TableHead className="text-[11px] w-16"></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {txs.map(x => (
                      <TableRow key={x.id} className={x.isCancelled ? "opacity-40 line-through" : ""}>
                        <TableCell><Badge className={`text-[10px] ${x.type === "sale" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"}`}>{x.type === "sale" ? t.sale : t.expense}</Badge></TableCell>
                        <TableCell className={`text-xs text-right font-semibold ${x.type === "sale" ? "text-green-600" : "text-orange-500"}`}>{x.type === "sale" ? "+" : "-"}{x.amount.toLocaleString("fr-FR")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{x.description || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(x.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                        <TableCell>{!x.isCancelled && <button onClick={() => cancelTx(x.id)} className="text-[10px] text-red-400 hover:text-red-600">{t.cancel}</button>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          <Button onClick={() => setShowClose(true)} variant="outline" size="sm" className="border-red-300 text-red-500 hover:bg-red-50">{t.closeRegister}</Button>
          {showClose && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setShowClose(false)}>
              <Card className="w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between pb-3"><CardTitle className="text-base">{t.closeRegister}</CardTitle><button onClick={() => setShowClose(false)}><X size={18} /></button></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{t.theoretical}: <strong>{total.toLocaleString("fr-FR")} {t.fcfa}</strong></p>
                  <div><Label className="text-xs">{t.actualBalance} ({t.fcfa})</Label><Input type="number" value={cb} onChange={e => setCb(e.target.value)} className="mt-1 h-8 text-sm" /></div>
                  {cb && <p className={`text-xs font-semibold ${Number(cb) - total === 0 ? "text-green-600" : "text-red-500"}`}>{t.gap}: {(Number(cb) - total).toLocaleString("fr-FR")} {t.fcfa}</p>}
                  <Button onClick={closeC} className="w-full h-9 bg-red-500 hover:bg-red-600 text-white">{t.confirmClose}</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
