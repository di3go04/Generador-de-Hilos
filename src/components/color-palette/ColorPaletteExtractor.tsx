"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Copy, Check, Palette, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard } from "@/lib/utils";
import { extractPalette } from "@/lib/color-utils";
import type { PaletteColor } from "@/types";

export default function ColorPaletteExtractor() {
  const [image, setImage] = useState<string>("");
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [colorCount, setColorCount] = useState(8);
  const [extracting, setExtracting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    multiple: false,
  });

  const handleExtract = useCallback(() => {
    if (!image) return;
    setExtracting(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = extractPalette(imageData, colorCount);
      setPalette(colors);
      setExtracting(false);
    };
    img.src = image;
  }, [image, colorCount]);

  const handleCopyColor = async (color: PaletteColor, index: number) => {
    const ok = await copyToClipboard(color.hex);
    if (ok) {
      setCopiedIndex(index);
      toast.success(`Color ${color.hex} copiado`);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
        }`}>
          <input {...getInputProps()} />
          {image ? (
            <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Sube una imagen para extraer su paleta</p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Colores a extraer: {colorCount}</label>
            <input type="range" min={5} max={15} value={colorCount} onChange={(e) => setColorCount(Number(e.target.value))} className="w-full accent-amber-500" />
          </div>
          <button onClick={handleExtract} disabled={!image || extracting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold shadow-lg transition-all">
            {extracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Extrayendo...</> : <><Palette className="w-4 h-4" /> Extraer paleta</>}
          </button>

          {palette.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Paleta extraída</h3>
              <div className="grid grid-cols-2 gap-2">
                {palette.map((color, i) => (
                  <button key={i} onClick={() => handleCopyColor(color, i)}
                    className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left">
                    <div className="w-8 h-8 rounded-lg shrink-0 border border-slate-200" style={{ backgroundColor: color.hex }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{color.hex}</p>
                      <p className="text-xs text-slate-400">{color.rgb!.r}, {color.rgb!.g}, {color.rgb!.b}</p>
                    </div>
                    {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <Copy className="w-3 h-3 text-slate-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
