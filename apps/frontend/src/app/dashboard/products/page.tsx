"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Download, Package, X } from "lucide-react";

interface Product {
  id: string; name: string; category: string; type: string; price: number; stock: number; minStock?: number;
}

const emptyForm = { name: "", category: "", type: "physical", price: "", stock: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try { setProducts(await api<Product[]>("/products")); } catch { setProducts([]); }
  }

  async function submit() {
    setError("");
    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
  }

  async function remove(id: string) {
    try { await api(`/products/${id}`, { method: "DELETE" }); load(); } catch {}
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Chercher des produi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-card border-0 shadow-sm shadow-black/5 h-11"
          />
        </div>
        <button className="w-11 h-11 rounded-xl bg-card shadow-sm shadow-black/5 flex items-center justify-center" aria-label="Download">
          <Download size={20} className="text-muted-foreground" />
        </button>
        <button onClick={load} className="w-11 h-11 rounded-xl bg-card shadow-sm shadow-black/5 flex items-center justify-center" aria-label="Refresh">
          <RefreshCw size={20} className="text-muted-foreground" />
        </button>
      </div>

      {error && <p className="text-sm text-destructive px-4">{error}</p>}

      {/* Modal overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Nouveau produit</h2>
              <button onClick={() => setShowForm(false)}><X size={22} /></button>
            </div>
            <div><Label>Nom</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
            <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Type</Label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="physical">Physique</option>
                <option value="digital">Numérique</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prix (FCFA)</Label><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="mt-1" /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className="mt-1" /></div>
            </div>
            <Button onClick={submit} className="w-full h-12 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-base font-semibold">Créer</Button>
          </div>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-[#2E7D32] flex items-center justify-center mb-4">
            <Package size={40} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-1">Aucun produit</h3>
          <p className="text-sm text-muted-foreground text-center">Ajoute ton premier produit pour commencer.</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="shadow-sm border-0 shadow-black/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{p.type === "digital" ? "Numérique" : "Physique"}</Badge>
                    <span className="text-sm font-semibold">{p.price} FCFA</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${p.minStock && p.stock <= p.minStock ? "text-red-500" : ""}`}>{p.stock}</span>
                  <p className="text-[10px] text-muted-foreground">en stock</p>
                  <button onClick={() => remove(p.id)} className="text-xs text-red-400 mt-1 hover:text-red-600">Supprimer</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FAB override for add */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-14 h-14 bg-[#2E7D32] rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#1B5E20] transition-colors"
        aria-label="Ajouter un produit"
      >
        <span className="text-white text-3xl leading-none">+</span>
      </button>
    </div>
  );
}
