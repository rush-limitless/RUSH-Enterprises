"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Plus,
  X,
  CheckCircle2,
  Clock,
  CalendarDays,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try { setTasks(await api<Task[]>("/tasks")); } catch { setTasks([]); }
  }

  async function submit() {
    if (!title) return;
    setError("");
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || undefined,
          dueDate: dueDate || undefined,
        }),
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function complete(id: string) {
    setCompleting(id);
    try {
      await api(`/tasks/${id}/complete`, { method: "PATCH" });
      setTimeout(() => {
        load();
        setCompleting(null);
      }, 400);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
      setCompleting(null);
    }
  }

  const pending = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");

  function isOverdue(d?: string) {
    if (!d) return false;
    return new Date(d) < new Date();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CheckSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tâches</h1>
            <p className="text-xs text-muted-foreground">
              {pending.length} en cours · {done.length} terminée{done.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md mx-4 shadow-xl animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nouvelle tâche</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la tâche" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel" />
              </div>
              <div>
                <Label>Échéance</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button onClick={submit} className="w-full">Créer la tâche</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">En cours</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((t) => {
              const overdue = isOverdue(t.dueDate);
              return (
                <Card
                  key={t.id}
                  className={`shadow-sm border-l-4 transition-all ${
                    completing === t.id
                      ? "animate-check-pop border-l-emerald-500"
                      : overdue
                        ? "border-l-red-500"
                        : "border-l-primary"
                  }`}
                >
                  <CardContent className="flex items-start justify-between gap-3 pt-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{t.title}</p>
                      {t.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground truncate">{t.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" /> En cours
                        </Badge>
                        {t.dueDate && (
                          <Badge
                            className={
                              overdue
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                            }
                          >
                            <CalendarDays className="mr-1 h-3 w-3" />
                            {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => complete(t.id)}
                      className="shrink-0 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Terminer
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Terminées</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {done.map((t) => (
              <Card key={t.id} className="shadow-sm border-l-4 border-l-emerald-400 opacity-70">
                <CardContent className="pt-4">
                  <p className="font-medium line-through text-muted-foreground">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground/70 line-through truncate">{t.description}</p>
                  )}
                  <div className="mt-2">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Terminée
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CheckSquare className="mb-3 h-10 w-10 opacity-30" />
          <p>Aucune tâche pour le moment</p>
        </div>
      )}
    </div>
  );
}
