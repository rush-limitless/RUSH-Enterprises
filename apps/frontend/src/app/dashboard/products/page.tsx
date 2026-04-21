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
import { Plus, Search, Trash2, X } from "lucide-react";

interface Product { id: string; name: string; category: string; type: string; price: number; stock: number; minStock?: number; }
const empty = { name: "", category: "", type: "physical", price: "", stock: "" };

export default function ProductsPage() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);
  async function load() { try { setProducts(await api<Product[]>("/products")); } catch { setProducts([]); } }
  async function submit() {
    setError("");
    try { await api("/products", { method: "POST", body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }) }); setForm(empty); setShowForm(false); load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
  }
  async function remove(id: string) { try { await api(`/products/${id}`, { method: "DELETE" }); load(); } catch {} }
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t.allItemsTitle}</h1>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-primary hover:bg-primary/90 gap-1.5"><Plus size={15} />{t.newItem}</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t.searchItems} value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">{t.newItem}</CardTitle>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="text-xs">{t.name}</Label><Input value={form.name} onChange={e => set("name", e.target.value)} className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">{t.category}</Label><Input value={form.category} onChange={e => set("category", e.target.value)} className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">{t.type}</Label>
                <select className="w-full mt-1 h-8 rounded-md border bg-background px-2 text-sm" value={form.type} onChange={e => set("type", e.target.value)}>
                  <option value="physical">{t.physical}</option><option value="digital">{t.digital}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">{t.price} ({t.fcfa})</Label><Input type="number" value={form.price} onChange={e => set("price", e.target.value)} className="mt-1 h-8 text-sm" /></div>
                <div><Label className="text-xs">{t.stock}</Label><Input type="number" value={form.stock} onChange={e => set("stock", e.target.value)} className="mt-1 h-8 text-sm" /></div>
              </div>
              <Button onClick={submit} className="w-full h-9 bg-primary hover:bg-primary/90">{t.create}</Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-[11px]">{t.name}</TableHead>
              <TableHead className="text-[11px]">{t.category}</TableHead>
              <TableHead className="text-[11px]">{t.type}</TableHead>
              <TableHead className="text-[11px] text-right">{t.price}</TableHead>
              <TableHead className="text-[11px] text-right">{t.stock}</TableHead>
              <TableHead className="text-[11px] w-10"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium text-primary">{p.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{p.type === "digital" ? t.digital : t.physical}</Badge></TableCell>
                  <TableCell className="text-xs text-right">{p.price.toLocaleString("fr-FR")} {t.fcfa}</TableCell>
                  <TableCell className="text-right"><span className={`text-xs font-semibold ${p.minStock && p.stock <= p.minStock ? "text-red-500" : ""}`}>{p.stock}</span></TableCell>
                  <TableCell><button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">{t.noItems}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
