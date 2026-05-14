"use client";

import { TOOLS } from "@/lib/tools-config";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Sparkles, ArrowRight, Lock } from "lucide-react";
import { useState } from "react";

export default function DashboardHome({ plan, usageCount }: { plan: string, usageCount: number }) {
  const [search, setSearch] = useState("");

  const filteredTools = TOOLS.filter(tool => 
    tool.title.toLowerCase().includes(search.toLowerCase()) || 
    tool.description.toLowerCase().includes(search.toLowerCase()) ||
    tool.category.toLowerCase().includes(search.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Bienvenido a Urban Suite</span>
          </div>
          <h1 className="text-4xl font-black text-[var(--text-heading)] tracking-tight">
            ¿Qué quieres crear hoy?
          </h1>
          <p className="text-[var(--text-muted)] max-w-xl">
            Explora nuestra colección de herramientas inteligentes diseñadas para potenciar tu productividad y presencia digital.
          </p>
        </div>

        {/* Plan & Usage Summary */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-[var(--border-main)] shadow-sm">
           <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">Consumo de hoy</p>
              <p className="text-sm font-black text-[var(--text-heading)]">
                {plan === "FREE" ? `${usageCount} / 3 usos` : "Ilimitado"}
              </p>
           </div>
           <div className="w-px h-8 bg-[var(--border-main)]" />
           <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <div className="relative">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping absolute inset-0" />
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 relative" />
              </div>
           </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar herramienta por nombre o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-white/5 border border-[var(--border-main)] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium transition-all shadow-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Tools Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          const isLocked = tool.isPro && plan === "FREE";

          return (
            <motion.div key={tool.slug} variants={item}>
              <Link 
                href={isLocked ? "/pricing" : `/dashboard/tools/${tool.slug}`}
                className="group relative flex flex-col h-full bg-white dark:bg-white/5 border border-[var(--border-main)] hover:border-indigo-500/50 rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden"
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                    {tool.category}
                  </span>
                  {tool.isPro && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-1 rounded-lg">
                      <Lock className="w-3 h-3" />
                      PRO
                    </span>
                  )}
                </div>

                {/* Icon & Title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${
                    isLocked ? "bg-gray-200 dark:bg-white/5" : "bg-indigo-600 shadow-lg shadow-indigo-500/20"
                  }`}>
                    <Icon className={`w-6 h-6 ${isLocked ? "text-gray-400" : "text-white"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-heading)] group-hover:text-indigo-600 transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-6 flex-1">
                  {tool.description}
                </p>

                {/* Bottom Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border-main)]/50">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {isLocked ? "Desbloquear ahora" : "Abrir herramienta"}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Hover decoration */}
                <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredTools.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-[var(--border-main)]">
          <p className="text-[var(--text-muted)] font-medium">No se encontraron herramientas que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
