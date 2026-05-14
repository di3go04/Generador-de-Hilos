"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  onClick: () => void;
  featured?: boolean;
}

export default function ToolCard({ title, description, onClick, featured }: ToolCardProps) {
  const IconComponent = (Icons as any)[title.split(' ')[0]] || Sparkles;

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        group relative w-full text-left p-8 rounded-2xl glass-card
        ${featured ? "md:col-span-2" : ""}
        hover:border-brand-accent/20
      `}
    >
      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
        <div className="flex justify-between items-start">
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500
            ${featured 
              ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
              : "bg-black/5 dark:bg-white/5 text-brand-accent group-hover:bg-brand-accent group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-accent/20"}
          `}>
            <IconComponent className="w-7 h-7" />
          </div>
          
          <div className="w-8 h-8 rounded-full border border-black/5 dark:border-white/5 flex items-center justify-center group-hover:bg-brand-accent group-hover:text-white transition-all duration-500">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">
            {title}
          </h3>
          <p className="text-sm opacity-60 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:text-brand-accent group-hover:opacity-100 transition-all">
              AI Engine v2
            </span>
            {featured && (
              <span className="px-3 py-1 rounded-full bg-brand-secondary/10 text-[9px] font-black uppercase tracking-widest text-brand-secondary">
                Más Popular
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
