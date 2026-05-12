"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, ExternalLink, Waves, AlertTriangle } from "lucide-react";

export default function StemSplitter() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-300">
          La separación de stems requiere IA externa. Te guiamos para usar LALAL.AI.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-all">
        <Waves className="w-10 h-10 text-white/30" />
        <p className="text-sm text-white/50">
          {file ? file.name : "Arrastra o selecciona un archivo de audio"}
        </p>
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
      </label>

      {file && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="rounded-xl glass p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white/90">Opciones para separar stems</h3>

            <a
              href="https://www.lalal.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-400">L</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white/80 group-hover:text-white">LALAL.AI</p>
                  <p className="text-xs text-white/40">Separación por IA de hasta 10 stems</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
            </a>

            <div className="rounded-lg bg-white/[0.03] p-4 text-xs text-white/40 leading-relaxed space-y-1">
              <p>1. Sube tu archivo a LALAL.AI</p>
              <p>2. Selecciona los stems a separar (voz, batería, bajo, etc.)</p>
              <p>3. Descarga los tracks individuales</p>
              <p>4. Importa los stems a tu DAW favorito</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10">
            <Waves className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-sm text-cyan-300">
              Próximamente: separación de stems directamente en Urban mediante API.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
