"use client";

import { useState } from "react";
import { 
  FolderPlus, Folder, MoreVertical, 
  Search, Grid, List, Plus, 
  Sparkles, FileText, ChevronRight
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Link from "next/link";

export default function FoldersPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const folders = [
    { id: "1", name: "Marketing 2026", count: 12, color: "#6366f1" },
    { id: "2", name: "Hilos Personales", count: 5, color: "#ec4899" },
    { id: "3", name: "Ideas Virales", count: 24, color: "#f59e0b" },
    { id: "4", name: "Educación / Tutoriales", count: 8, color: "#10b981" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter">Tus Carpetas</h1>
            <p className="text-[var(--text-muted)] font-medium">Organiza tus hilos por temas, proyectos o clientes.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-[var(--border-main)]">
              <button 
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-white dark:bg-white/10 shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-white dark:bg-white/10 shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Carpeta</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Buscar por nombre de carpeta..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-[var(--border-main)] outline-none focus:ring-4 ring-indigo-500/10 transition-all font-medium text-sm"
          />
        </div>

        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
          {folders.map((f) => (
            <Link 
              key={f.id} 
              href={`/dashboard/threads?folder=${f.id}`}
              className={`
                group glass-card border-[var(--border-main)] hover:border-indigo-600/30 transition-all duration-300
                ${view === "grid" ? "p-6 rounded-[2.5rem] space-y-4" : "p-4 rounded-2xl flex items-center gap-4"}
              `}
            >
              <div className={`
                rounded-2xl flex items-center justify-center shrink-0
                ${view === "grid" ? "w-14 h-14" : "w-10 h-10"}
              `} style={{ backgroundColor: `${f.color}15` }}>
                <Folder className="w-6 h-6" style={{ color: f.color }} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--text-heading)] truncate">{f.name}</h3>
                <p className="text-xs text-[var(--text-muted)] font-medium">{f.count} hilos guardados</p>
              </div>

              {view === "list" && (
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-white/10" />
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                </div>
              )}
              
              {view === "grid" && (
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-white/10" />
                    ))}
                  </div>
                  <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-[var(--text-muted)]">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              )}
            </Link>
          ))}
          
          <button className={`
            border-2 border-dashed border-[var(--border-main)] rounded-[2.5rem] hover:border-indigo-600/30 hover:bg-indigo-600/5 transition-all text-[var(--text-muted)] hover:text-indigo-600 flex flex-col items-center justify-center gap-2
            ${view === "grid" ? "p-10 aspect-square" : "p-4 hidden"}
          `}>
            <Plus className="w-8 h-8" />
            <span className="text-xs font-black uppercase tracking-widest">Crear Nueva</span>
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
