"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Loader2, Eraser, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { formatBytes } from "@/lib/utils";

export default function RemoveBackground() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [tolerance, setTolerance] = useState(30);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl("");
  }, []);

  const handleRemove = useCallback(() => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { toast.error("Error al procesar"); setProcessing(false); return; }
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const topLeft = { r: data[0], g: data[1], b: data[2] };

        const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) =>
          Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

        for (let i = 0; i < data.length; i += 4) {
          const dist = colorDist(data[i], data[i + 1], data[i + 2], topLeft.r, topLeft.g, topLeft.b);
          if (dist < tolerance) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const url = canvas.toDataURL("image/png");
        setResultUrl(url);
        toast.success("Fondo eliminado");
        setProcessing(false);
      };
      img.onerror = () => { toast.error("Error al cargar imagen"); setProcessing(false); };
      img.src = preview;
    } catch {
      toast.error("Error al procesar imagen");
      setProcessing(false);
    }
  }, [file, preview, tolerance]);

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `no-bg-${file.name.replace(/\.[^.]+$/, "")}.png`;
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start gap-3 p-3 rounded-xl border border-pink-500/20 bg-pink-500/10">
        <AlertTriangle className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
        <p className="text-sm text-pink-300">
          Eliminación de fondo por color (chroma key). Para resultados precisos usa remove.bg.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-all">
        <Eraser className="w-10 h-10 text-white/30" />
        <p className="text-sm text-white/50">{file ? file.name : "Selecciona una imagen"}</p>
        {file && <p className="text-xs text-white/30">{formatBytes(file.size)}</p>}
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-white/70">
              Tolerancia: {tolerance}
            </label>
            <input
              type="range"
              min={5}
              max={80}
              step={5}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
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
                <p className="text-xs text-white/40 mb-2">Sin fondo</p>
                <img src={resultUrl} alt="No BG" className="rounded-xl w-full object-contain max-h-48 bg-[#06080f]" />
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleRemove}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
          >
            {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><Eraser className="w-4 h-4" /> Eliminar Fondo</>}
          </motion.button>

          {resultUrl && (
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all">
              <Download className="w-4 h-4" /> Descargar PNG
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
