"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, Tag, Calendar, 
  ChevronRight, MoreHorizontal, MessageSquare,
  Loader2, Inbox
} from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Thread {
  id: string;
  title: string;
  topic: string;
  status: string;
  createdAt: string;
  categories: Category[];
}

export function ThreadList() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  async function fetchData() {
    setLoading(true);
    try {
      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();
      if (catRes.ok) setCategories(catData.categories);

      const url = new URL("/api/threads", window.location.origin);
      if (selectedCategory) url.searchParams.append("categoryId", selectedCategory);
      if (search) url.searchParams.append("search", search);
      
      const threadRes = await fetch(url.toString());
      const threadData = await threadRes.json();
      if (threadRes.ok) setThreads(threadData.threads);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar hilos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === null 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-white dark:bg-slate-900 text-muted-foreground hover:border-primary/50"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
                selectedCategory === cat.id 
                  ? "shadow-lg" 
                  : "bg-white dark:bg-slate-900 text-muted-foreground hover:border-primary/50"
              }`}
              style={selectedCategory === cat.id ? {
                backgroundColor: cat.color,
                color: "white",
                borderColor: cat.color,
                boxShadow: `0 10px 15px -3px ${cat.color}40`
              } : {}}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">Actualizando hilos...</p>
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No se encontraron hilos.</p>
          <Link href="/dashboard/threads/new" className="mt-4 text-xs font-bold text-primary hover:underline">
            Crea tu primer hilo ahora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredThreads.map((thread) => (
            <Link 
              key={thread.id} 
              href={`/dashboard/threads/${thread.id}`}
              className="group bg-white dark:bg-slate-900 p-5 rounded-3xl border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-[var(--text-heading)] group-hover:text-primary transition-colors line-clamp-1">
                    {thread.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(thread.createdAt), "d 'de' MMMM", { locale: es })}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  thread.status === "PUBLISHED" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                  thread.status === "SCHEDULED" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" :
                  "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                }`}>
                  {thread.status}
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                "{thread.topic}"
              </p>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-slate-50 dark:border-white/5">
                {thread.categories.length > 0 ? (
                  thread.categories.map(cat => (
                    <CategoryBadge key={cat.id} name={cat.name} color={cat.color} size="sm" />
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-30">Sin categorías</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
