"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, ScanText, Copy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard } from "@/lib/utils";

export default function OCRExtractor() {
  const [image, setImage] = useState<string>("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setText("");
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    multiple: false,
  });

  const handleExtract = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(image, "spa+eng", {
        logger: (m) => { if (m.status === "recognizing text") null; },
      });
      const result = data.text.trim();
      if (!result) throw new Error("No se pudo extraer texto de la imagen");
      setText(result);
      toast.success(`Texto extraído (${result.split(/\s+/).filter(Boolean).length} palabras)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al extraer texto";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    toast[ok ? "success" : "error"](ok ? "Texto copiado" : "Error al copiar");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragActive ? "border-cyan-500 bg-cyan-500/5" : "border-white/[0.08] hover:border-white/[0.15]"
      }`}>
        <input {...getInputProps()} />
        {image ? (
          <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto mb-3 text-white/30" />
            <p className="text-sm text-white/50">Sube una captura o imagen con texto</p>
            <p className="text-xs text-white/30 mt-1">PNG, JPG, WebP</p>
          </>
        )}
      </div>

      {image && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleExtract}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Extrayendo texto...</> : <><ScanText className="w-4 h-4" /> Extraer Texto</>}
        </motion.button>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}

      {text && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="rounded-xl glass p-4">
            <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">{text}</p>
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all">
            <Copy className="w-4 h-4" /> Copiar Texto
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
