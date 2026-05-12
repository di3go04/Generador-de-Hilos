"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ImageDropZoneProps {
  onFiles: (files: File[]) => void;
}

export default function ImageDropZone({ onFiles }: ImageDropZoneProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    const items = accepted.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(items);
    onFiles(accepted);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"] },
    multiple: true,
  });

  const clear = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    onFiles([]);
  };

  return (
    <div>
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/[0.08] hover:border-white/[0.15]"
      }`}>
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-white/30" />
        <p className="text-sm text-white/50">Arrastra imágenes aquí o haz clic para seleccionar</p>
        <p className="text-xs text-white/30 mt-1">PNG, JPEG, WebP, GIF, BMP</p>
      </div>
      {previews.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">{previews.length} archivo(s)</span>
            <button onClick={clear} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><X className="w-3 h-3" /> Limpiar</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {previews.map((p, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden glass border border-white/[0.06]">
                <img src={p.url} alt={p.file.name} className="w-full h-24 object-cover" />
                <div className="p-2 bg-black/20">
                  <p className="text-xs truncate text-white/80">{p.file.name}</p>
                  <p className="text-xs text-white/40">{formatBytes(p.file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
