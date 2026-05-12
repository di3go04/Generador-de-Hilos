"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Image, Video, QrCode, Palette, Type, ImagePlus, ScanText, Music, X, Maximize2, Mic, Code, Eraser, Waves } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import type { ToolId } from "@/types";

const toolItems: { id: ToolId; label: string; icon: React.ReactNode; group: string }[] = [
  { id: "threads", label: "Hilos IA", icon: <Sparkles className="w-4 h-4" />, group: "IA" },
  { id: "image-gen", label: "Imagen IA", icon: <ImagePlus className="w-4 h-4" />, group: "IA" },
  { id: "voice", label: "Voz a Texto", icon: <Mic className="w-4 h-4" />, group: "IA" },
  { id: "video", label: "Video Pro", icon: <Video className="w-4 h-4" />, group: "Media" },
  { id: "image", label: "Imágenes", icon: <Image className="w-4 h-4" />, group: "Media" },
  { id: "upscale", label: "Upscaler", icon: <Maximize2 className="w-4 h-4" />, group: "Media" },
  { id: "remove-bg", label: "Sin Fondo", icon: <Eraser className="w-4 h-4" />, group: "Media" },
  { id: "stem", label: "Stems", icon: <Waves className="w-4 h-4" />, group: "Audio" },
  { id: "audio", label: "Limpiador", icon: <Music className="w-4 h-4" />, group: "Audio" },
  { id: "code", label: "Código", icon: <Code className="w-4 h-4" />, group: "Texto" },
  { id: "text", label: "Texto", icon: <Type className="w-4 h-4" />, group: "Texto" },
  { id: "qr", label: "QR Pro", icon: <QrCode className="w-4 h-4" />, group: "Utilidades" },
  { id: "palette", label: "Paleta", icon: <Palette className="w-4 h-4" />, group: "Utilidades" },
  { id: "ocr", label: "OCR", icon: <ScanText className="w-4 h-4" />, group: "Utilidades" },
];

interface SidebarProps {
  activeTool: ToolId | null;
  onToolChange: (tool: ToolId) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const groups = Array.from(new Set(toolItems.map((t) => t.group)));

export default function Sidebar({ activeTool, onToolChange, mobileOpen, onMobileClose }: SidebarProps) {
  const isActive = (id: ToolId) => activeTool === id || (!activeTool && id === "threads");

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64
        md:translate-x-0 md:static md:z-auto
        transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full glass-strong border-r border-white/[0.04]">
          <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.04]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg gradient-cyan-violet shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">Urban</h1>
                <p className="text-[9px] text-white/30 -mt-0.5">Creative Suite</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={onMobileClose} className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-white/30 hover:text-white/70">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {groups.map((group) => (
              <div key={group}>
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/20">{group}</p>
                <div className="space-y-0.5">
                  {toolItems.filter((t) => t.group === group).map(({ id, label, icon }, i) => (
                    <motion.button
                      key={id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => { onToolChange(id); onMobileClose(); }}
                      className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive(id)
                          ? "text-white"
                          : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                      }`}
                    >
                      {isActive(id) && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/15"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className={`relative z-10 ${isActive(id) ? "text-cyan-300" : ""}`}>{icon}</span>
                      <span className="relative z-10">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="px-4 py-3 border-t border-white/[0.04]">
            <p className="text-[9px] text-white/15 text-center">The RW Flow</p>
          </div>
        </div>
      </aside>
    </>
  );
}
