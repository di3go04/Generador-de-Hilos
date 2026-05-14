"use client";

import { tools, Tool } from "@/app/herramientas/toolsData";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";

export function ToolsGrid({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tools.map((tool, idx) => (
        <ToolCard key={tool.slug} tool={tool} idx={idx} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}

function ToolCard({ tool, idx, isLoggedIn }: { tool: Tool; idx: number; isLoggedIn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <Link
        href={`/herramientas/${tool.slug}`}
        className="card-tool group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="tool-icon group-hover:bg-primary group-hover:text-white transition-colors">
            {tool.icon}
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
               <CheckCircle2 className="w-3 h-3" />
               ILIMITADO
            </div>
          ) : (
            tool.isPro && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-full">
                 <Lock className="w-3 h-3" />
                 PRO
              </div>
            )
          )}
        </div>

        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
          {tool.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Usar herramienta
            <ArrowRight className="w-3 h-3" />
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {tool.category}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
