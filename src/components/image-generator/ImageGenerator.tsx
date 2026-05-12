"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { Sparkles, Download, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) { toast.error("Escribe un prompt"); return; }
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar");
      setImageUrl(data.url);
      toast.success("Imagen generada");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `urban-${Date.now()}.png`;
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Describe la imagen que quieres generar</label>
        <TextareaAutosize value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="Un paisaje cyberpunk con neones rosas y azules, estilo synthwave..."
          minRows={3} maxRows={6}
          className="w-full resize-none rounded-xl glass px-4 py-3 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-indigo-pink disabled:opacity-50 text-white font-semibold text-sm shadow-lg transition-all"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</> : <><Sparkles className="w-4 h-4" /> Generar Imagen</>}
      </motion.button>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}

      {imageUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <img src={imageUrl} alt="Generada por IA" className="w-full h-auto" />
          </div>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all">
            <Download className="w-4 h-4" /> Descargar
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
