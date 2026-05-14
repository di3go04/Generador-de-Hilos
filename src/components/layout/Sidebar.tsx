"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, Video, ImagePlus, Maximize2, Eraser, 
  Waves, Mic, Code, Image as ImageIcon, Music, 
  X, UserCircle, Settings, ChevronRight
} from "lucide-react";
import type { ToolId } from "@/types";

import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  activeTool: ToolId | null;
  onToolChange: (tool: ToolId) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const menuGroups = [
  {
    label: "Creatividad IA",
    items: [
      { id: "threads", label: "Hilos IA", icon: Sparkles },
      { id: "image-gen", label: "Imagen IA", icon: ImagePlus },
      { id: "video", label: "Video Pro", icon: Video },
    ]
  },
  {
    label: "Edición Visual",
    items: [
      { id: "upscale", label: "Upscaler", icon: Maximize2 },
      { id: "remove-bg", label: "Sin Fondo", icon: Eraser },
    ]
  },
  {
    label: "Audio & Voz",
    items: [
      { id: "stem", label: "Stems", icon: Waves },
      { id: "voice", label: "Voz a Texto", icon: Mic },
    ]
  }
];

export default function Sidebar({ activeTool, onToolChange, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onMobileClose}
      />

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 m-4
        flex flex-col gap-6
        transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"}
      `}>
        {/* Logo Card */}
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Urban</h1>
              <p className="text-[9px] uppercase tracking-widest text-brand-accent/60 font-black">Studio</p>
            </div>
          </div>
          <button onClick={onMobileClose} className="md:hidden p-2 opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4 space-y-3">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black opacity-20 px-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onToolChange(item.id as ToolId)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                        ${isActive 
                          ? "nav-item-active shadow-sm" 
                          : "text-text-body/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-heading hover:translate-x-1"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-accent" : "text-text-body/40"}`} />
                      <span className="text-sm font-semibold">{item.label}</span>
                      <ChevronRight className={`ml-auto w-3 h-3 transition-transform ${isActive ? "rotate-90" : "opacity-10"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions & Profile */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <ThemeToggle />
            <button className="flex-1 glass-card rounded-xl p-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-brand-accent transition-colors">
              <Settings className="w-4 h-4" />
              Configurar
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="20" cy="20" r="18" className="stroke-black/5 dark:stroke-white/5 fill-none" strokeWidth="3" />
                  <motion.circle 
                     cx="20" cy="20" r="18" 
                     className="stroke-brand-accent fill-none" 
                     strokeWidth="3"
                     strokeLinecap="round"
                     strokeDasharray="113"
                     initial={{ strokeDashoffset: 113 }}
                     animate={{ strokeDashoffset: 113 - (113 * 0.65) }}
                     transition={{ duration: 2, ease: "circOut" }}
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-brand-accent">65%</span>
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-accent">Uso IA</p>
                <p className="text-[9px] opacity-40 font-bold italic">Pro Plan</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-black/5 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-heading font-bold">
                MC
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Mafer Clavijo</p>
                <p className="text-[10px] opacity-40">Editora Jefe</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
