"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    try {
      await api(`/tasks/${id}/complete`, { method: "PATCH" });
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tâches</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Ajouter"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card className="max-w-lg">
          <CardHeader><CardTitle>Nouvelle tâche</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Échéance</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <Button onClick={submit} className="w-full">Créer</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {tasks.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className={t.status === "completed" ? "line-through text-muted-foreground" : "font-medium"}>
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                )}
                {t.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Échéance : {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.status === "completed" ? "secondary" : "default"}>
                  {t.status === "completed" ? "Terminée" : "En cours"}
                </Badge>
                {t.status !== "completed" && (
                  <Button size="sm" variant="outline" onClick={() => complete(t.id)}>
                    Terminer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground">Aucune tâche</p>
        )}
      </div>
    </div>
  );
}
