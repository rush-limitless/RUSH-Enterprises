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
import { Plus, X, Trash2, Package, Filter } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  stock: number;
  minStock?: number;
}

const emptyForm = { name: "", category: "", type: "physical", price: "", stock: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [filterCat, setFilterCat] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try { setProducts(await api<Product[]>("/products")); } catch { setProducts([]); }
  }

  async function submit() {
    setError("");
    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function remove(id: string) {
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur suppression");
    }
  }

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const filtered = filterCat
    ? products.filter((p) => p.category === filterCat)
    : products;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Produits</h1>
            <p className="text-xs text-muted-foreground">{products.length} produit{products.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Modal overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md mx-4 shadow-xl animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nouveau produit</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nom du produit" />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Ex: Boissons" />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  <option value="physical">Physique</option>
                  <option value="digital">Numérique</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prix (FCFA)</Label>
                  <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" />
                </div>
              </div>
              <Button onClick={submit} className="w-full">Créer le produit</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setFilterCat("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !filterCat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat === filterCat ? "" : cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterCat === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <Card className="shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const critical = p.minStock != null && p.stock <= p.minStock;
              return (
                <TableRow key={p.id} className={critical ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.category || "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        p.type === "digital"
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                          : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                      }
                    >
                      {p.type === "digital" ? "Numérique" : "Physique"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {p.price.toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-center">
                    {critical ? (
                      <Badge variant="destructive" className="animate-pulse-red">
                        {p.stock}
                      </Badge>
                    ) : (
                      <span className="text-sm">{p.stock}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Aucun produit
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
