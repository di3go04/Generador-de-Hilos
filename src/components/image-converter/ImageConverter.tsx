"use client";

import { useState, useRef, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import ImageDropZone from "./ImageDropZone";
import { convertImages, loadImage } from "@/lib/image-utils";
import type { OutputImageFormat } from "@/types";

export default function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<OutputImageFormat>("png");
  const [quality, setQuality] = useState(0.9);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;
    setConverting(true);
    setProgress(0);
    try {
      const canvases = await Promise.all(
        files.map(async (file) => {
          const img = await loadImage(file);
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          if (format === "jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          return { canvas, name: file.name.replace(/\.[^.]+$/, "") };
        })
      );
      await convertImages(canvases, format, quality, setProgress);
    } catch (e) {
      console.error(e);
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [files, format, quality]);

  return (
    <div className="space-y-6">
      <ImageDropZone onFiles={setFiles} />
      {files.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Formato de salida</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as OutputImageFormat)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Calidad: {quality}</label>
              <input type="range" min={0.1} max={1} step={0.1} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
          </div>
          {converting && progress > 0 && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <button onClick={handleConvert} disabled={converting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold shadow-lg transition-all">
            {converting ? <><Loader2 className="w-4 h-4 animate-spin" /> Convirtiendo...</> : <><Download className="w-4 h-4" /> Convertir y Descargar</>}
          </button>
        </>
      )}
      <canvas ref={(el) => { if (el) canvasRefs.current.push(el); }} style={{ display: "none" }} />
    </div>
  );
}
