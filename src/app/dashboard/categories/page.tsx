"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Plus, Tag, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", 
  "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4",
  "#f97316", "#14b8a6", "#d946ef", "#64748b"
];

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { threads: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories);
    } catch (error) {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, data.category]);
        setIsCreateOpen(false);
        setName("");
        toast.success("Categoría creada");
      } else {
        toast.error(data.error || "Error al crear");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editingCategory || !name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(categories.map(c => c.id === data.category.id ? data.category : c));
        setEditingCategory(null);
        setName("");
        toast.success("Categoría actualizada");
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Se desvinculará de todos los hilos.")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
        toast.success("Categoría eliminada");
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-1">
              <Tag className="w-4 h-4" />
              <span>Organización</span>
            </div>
            <h1 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter">Categorías</h1>
            <p className="text-[var(--text-muted)] font-medium">Gestiona etiquetas para organizar tus hilos y proyectos.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if(open) { setName(""); setColor(PRESET_COLORS[0]); }
          }}>
            <DialogTrigger asChild>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Nueva Categoría</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Nombre</label>
                  <Input 
                    placeholder="ej: Marketing, Hilos Personales..." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-full aspect-square rounded-lg border-2 transition-all ${color === c ? "border-indigo-600 scale-110 shadow-lg" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Vista Previa</label>
                   <CategoryBadge name={name || "Nueva Categoría"} color={color} size="md" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={submitting || !name.trim()}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Crear Categoría
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
             <p className="text-sm font-medium text-[var(--text-muted)]">Cargando tus categorías...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-[2.5rem] border-dashed border-2 border-[var(--border-main)]">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <Tag className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2">No tienes categorías aún</h3>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto mb-8 font-medium">Crea tu primera categoría para empezar a organizar tus hilos de forma profesional.</p>
            <button onClick={() => setIsCreateOpen(true)} className="btn-primary py-3 px-8">Crear mi primera categoría</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="glass-card rounded-3xl p-6 border-[var(--border-main)] hover:border-indigo-600/20 transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <CategoryBadge name={cat.name} color={cat.color} size="md" />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEdit(cat)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)] font-medium">Hilos asignados</span>
                    <span className="font-bold text-[var(--text-heading)]">{cat._count?.threads ?? 0}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ backgroundColor: cat.color, width: `${Math.min((cat._count?.threads ?? 0) * 10, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Nombre</label>
                <Input 
                  placeholder="Nombre de la categoría" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${color === c ? "border-indigo-600 scale-110 shadow-lg" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancelar</Button>
              <Button onClick={handleUpdate} disabled={submitting || !name.trim()}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
