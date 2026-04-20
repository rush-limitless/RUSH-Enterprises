"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, CheckCircle2, Circle, X } from "lucide-react";

interface Task { id: string; title: string; description?: string; dueDate?: string; status: string; isCompleted?: boolean; }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try { setTasks(await api<Task[]>("/tasks")); } catch { setTasks([]); }
  }

  async function submit() {
    if (!title) return;
    setError("");
    try {
      await api("/tasks", { method: "POST", body: JSON.stringify({ title, description: description || undefined, dueDate: dueDate || undefined }) });
      setTitle(""); setDescription(""); setDueDate(""); setShowForm(false); load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
  }

  async function complete(id: string) {
    try { await api(`/tasks/${id}/complete`, { method: "PATCH" }); load(); } catch {}
  }

  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  const now = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col h-full">
      {/* Search + Period */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-card border-0 shadow-sm shadow-black/5 h-11"
          />
        </div>
        <button className="h-11 px-4 rounded-xl bg-card shadow-sm shadow-black/5 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          Période
        </button>
      </div>

      {error && <p className="text-sm text-destructive px-4">{error}</p>}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Nouvelle tâche</h2>
              <button onClick={() => setShowForm(false)}><X size={22} /></button>
            </div>
            <div><Label>Titre</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
            <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" /></div>
            <div><Label>Échéance</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" /></div>
            <Button onClick={submit} className="w-full h-12 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-base font-semibold">Créer</Button>
          </div>
        </div>
      )}

      {/* Tasks list */}
      <div className="px-4 pt-2 space-y-2 flex-1">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground pt-20">Aucun mouvement sur la période</p>
        ) : (
          filtered.map((t) => {
            const done = t.status === "completed" || t.isCompleted;
            const overdue = t.dueDate && !done && t.dueDate.split("T")[0] < now;
            return (
              <Card key={t.id} className={`shadow-sm border-0 shadow-black/5 ${done ? "opacity-60" : ""}`}>
                <CardContent className="p-3 flex items-start gap-3">
                  <button onClick={() => !done && complete(t.id)} className="mt-0.5 flex-shrink-0">
                    {done
                      ? <CheckCircle2 size={22} className="text-[#2E7D32]" />
                      : <Circle size={22} className="text-muted-foreground/40" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                    {t.description && <p className="text-xs text-muted-foreground truncate">{t.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {t.dueDate && (
                        <Badge className={`text-[10px] ${overdue ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                        </Badge>
                      )}
                      <Badge className={`text-[10px] ${done ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>
                        {done ? "Terminée" : "En cours"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-14 h-14 bg-[#2E7D32] rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#1B5E20] transition-colors"
        aria-label="Ajouter une tâche"
      >
        <span className="text-white text-3xl leading-none">+</span>
      </button>
    </div>
  );
}
