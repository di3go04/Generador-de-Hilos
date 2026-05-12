"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Loader2, Maximize2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { formatBytes } from "@/lib/utils";

export default function ImageUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl("");
  }, []);

  const handleUpscale = useCallback(() => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { toast.error("Error al procesar"); setProcessing(false); return; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        const url = canvas.toDataURL("image/png");
        setResultUrl(url);
        toast.success(`Imagen escalada a ${w}x${h}px`);
        setProcessing(false);
      };
      img.onerror = () => { toast.error("Error al cargar imagen"); setProcessing(false); };
      img.src = preview;
    } catch {
      toast.error("Error al escalar imagen");
      setProcessing(false);
    }
  }, [file, preview, scale]);

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `upscaled-${file.name.replace(/\.[^.]+$/, "")}.png`;
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/10">
        <AlertTriangle className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <p className="text-sm text-violet-300">
          Escalado por interpolación vía Canvas API. Para resultados profesionales usa IA dedicada.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-all">
        <Maximize2 className="w-10 h-10 text-white/30" />
        <p className="text-sm text-white/50">{file ? file.name : "Selecciona una imagen"}</p>
        {file && <p className="text-xs text-white/30">{formatBytes(file.size)}</p>}
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-white/70">
              Escala: {scale}x
            </label>
            <input
              type="range"
              min={1.5}
              max={4}
              step={0.5}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40 mb-2">Original</p>
              <img src={preview} alt="Original" className="rounded-xl w-full object-contain max-h-48 bg-black/40" />
            </div>
            {resultUrl && (
              <div>
                <p className="text-xs text-white/40 mb-2">Escalado ({scale}x)</p>
                <img src={resultUrl} alt="Upscaled" className="rounded-xl w-full object-contain max-h-48 bg-black/40" />
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleUpscale}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
          >
            {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><Maximize2 className="w-4 h-4" /> Escalar Imagen</>}
          </motion.button>

          {resultUrl && (
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all">
              <Download className="w-4 h-4" /> Descargar PNG
            </button>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
