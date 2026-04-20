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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produits</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Ajouter"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card className="max-w-lg">
          <CardHeader><CardTitle>Nouveau produit</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="w-full rounded border bg-background px-3 py-2 text-sm"
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
                <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
              </div>
            </div>
            <Button onClick={submit} className="w-full">Créer</Button>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {p.type === "digital" ? "Numérique" : "Physique"}
                </Badge>
              </TableCell>
              <TableCell>{p.price} FCFA</TableCell>
              <TableCell>
                {p.minStock && p.stock <= p.minStock ? (
                  <Badge variant="destructive">{p.stock}</Badge>
                ) : (
                  p.stock
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Aucun produit
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
