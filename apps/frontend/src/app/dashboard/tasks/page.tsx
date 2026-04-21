"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, CheckCircle2, X } from "lucide-react";

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
  async function load() { try { setTasks(await api<Task[]>("/tasks")); } catch { setTasks([]); } }

  async function submit() {
    if (!title) return; setError("");
    try { await api("/tasks", { method: "POST", body: JSON.stringify({ title, description: description || undefined, dueDate: dueDate || undefined }) }); setTitle(""); setDescription(""); setDueDate(""); setShowForm(false); load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
  }

  async function complete(id: string) { try { await api(`/tasks/${id}/complete`, { method: "PATCH" }); load(); } catch {} }

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  const now = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Purchase Orders</h1>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-primary hover:bg-primary/90 gap-1.5"><Plus size={15} /> New</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">New Task</CardTitle>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} className="mt-1 h-8 text-sm" /></div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 h-8 text-sm" /></div>
              <Button onClick={submit} className="w-full h-9 bg-primary hover:bg-primary/90">Create</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] w-10"></TableHead>
                <TableHead className="text-[11px]">Title</TableHead>
                <TableHead className="text-[11px]">Description</TableHead>
                <TableHead className="text-[11px]">Due Date</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => {
                const done = t.status === "completed" || t.isCompleted;
                const overdue = t.dueDate && !done && t.dueDate.split("T")[0] < now;
                return (
                  <TableRow key={t.id} className={done ? "opacity-50" : ""}>
                    <TableCell>
                      {!done ? (
                        <button onClick={() => complete(t.id)} className="text-muted-foreground hover:text-green-600"><CheckCircle2 size={16} /></button>
                      ) : (
                        <CheckCircle2 size={16} className="text-green-600" />
                      )}
                    </TableCell>
                    <TableCell className={`text-sm ${done ? "line-through text-muted-foreground" : "font-medium"}`}>{t.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.description || "—"}</TableCell>
                    <TableCell>
                      {t.dueDate ? (
                        <span className={`text-xs ${overdue ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                          {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${done ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : overdue ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>
                        {done ? "Done" : overdue ? "Overdue" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No tasks found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
