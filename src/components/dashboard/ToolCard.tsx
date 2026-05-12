"use client";

import { motion } from "framer-motion";
import { Sparkles, Image, Video, QrCode, Palette, Type, ImagePlus, ScanText, Music, Maximize2, Mic, Code, Eraser, Waves } from "lucide-react";
import type { ToolId } from "@/types";

interface ToolCardProps {
  id: ToolId;
  title: string;
  description: string;
  onClick: () => void;
  featured?: boolean;
}

const iconMap: Record<ToolId, React.ReactNode> = {
  threads: <Sparkles className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  "image-gen": <ImagePlus className="w-5 h-5" />,
  upscale: <Maximize2 className="w-5 h-5" />,
  "remove-bg": <Eraser className="w-5 h-5" />,
  stem: <Waves className="w-5 h-5" />,
  voice: <Mic className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  audio: <Music className="w-5 h-5" />,
  ocr: <ScanText className="w-5 h-5" />,
  qr: <QrCode className="w-5 h-5" />,
  palette: <Palette className="w-5 h-5" />,
  text: <Type className="w-5 h-5" />,
};

const neonAccents: Record<ToolId, { icon: string; border: string; glow: string }> = {
  threads:      { icon: "from-cyan-500 to-violet-600",  border: "border-cyan-500/20",  glow: "glow-cyan" },
  video:        { icon: "from-rose-500 to-pink-600",    border: "border-rose-500/20",  glow: "glow-rose" },
  "image-gen":  { icon: "from-violet-500 to-cyan-500",  border: "border-violet-500/20", glow: "glow-violet" },
  upscale:      { icon: "from-emerald-500 to-teal-600", border: "border-emerald-500/20",glow: "glow-emerald" },
  "remove-bg":  { icon: "from-blue-500 to-indigo-600",  border: "border-blue-500/20",  glow: "glow-violet" },
  stem:         { icon: "from-purple-500 to-pink-500",   border: "border-purple-500/20", glow: "glow-violet" },
  voice:        { icon: "from-cyan-400 to-blue-500",     border: "border-cyan-500/20",  glow: "glow-cyan" },
  code:         { icon: "from-orange-500 to-amber-600",  border: "border-amber-500/20", glow: "glow-amber" },
  image:        { icon: "from-emerald-500 to-teal-600",  border: "border-emerald-500/20",glow: "glow-emerald" },
  audio:        { icon: "from-violet-500 to-purple-600", border: "border-violet-500/20", glow: "glow-violet" },
  ocr:          { icon: "from-cyan-500 to-blue-600",     border: "border-cyan-500/20",  glow: "glow-cyan" },
  qr:           { icon: "from-indigo-500 to-violet-600", border: "border-indigo-500/20", glow: "glow-violet" },
  palette:      { icon: "from-amber-500 to-orange-600",  border: "border-amber-500/20", glow: "glow-amber" },
  text:         { icon: "from-sky-500 to-cyan-600",      border: "border-sky-500/20",   glow: "glow-cyan" },
};

export default function ToolCard({ id, title, description, onClick, featured }: ToolCardProps) {
  const accent = neonAccents[id];

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group relative w-full text-left rounded-xl transition-all duration-300 ${
        featured
          ? `bento-card-neon ${accent.glow}`
          : "bento-card hover:shadow-lg"
      }`}
    >
      {/* Neon top-border line on featured */}
      {featured && (
        <div className={`absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r ${accent.icon} opacity-60`} />
      )}

      <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${accent.icon} shadow-lg text-white mb-3`}>
        {iconMap[id]}
      </div>
      <h3 className={`font-semibold text-white/90 ${featured ? "text-base" : "text-sm"}`}>{title}</h3>
      <p className={`text-xs text-white/40 leading-relaxed mt-1 ${featured ? "text-sm" : ""}`}>{description}</p>

      {/* Hover neon radial glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,242,255,0.06), transparent 40%)`,
        }}
      />

      {/* Featured hover intensify glow */}
      {featured && (
        <div
          className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${accent.glow}`}
          style={{ boxShadow: `inset 0 0 60px rgba(0,242,255,0.06)` }}
        />
      )}
    </motion.button>
  );
}
