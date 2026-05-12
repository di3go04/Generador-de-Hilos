"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Film } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface VideoDropZoneProps {
  onFiles: (files: File[]) => void;
}

export default function VideoDropZone({ onFiles }: VideoDropZoneProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    const items = accepted.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(items);
    onFiles(accepted);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".mpeg"] },
    multiple: false,
  });

  const clear = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    onFiles([]);
  };

  return (
    <div>
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragActive ? "border-red-500 bg-red-500/10" : "border-white/[0.08] hover:border-white/[0.15]"
      }`}>
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-white/30" />
        <p className="text-sm text-white/50">Arrastra un video aquí o haz clic</p>
        <p className="text-xs text-white/30 mt-1">MP4, WebM, MOV, AVI, MKV, MPEG</p>
      </div>
      {previews.length > 0 && (
        <div className="mt-4">
          {previews.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 text-red-400"><Film className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{p.file.name}</p>
                <p className="text-xs text-white/40">{formatBytes(p.file.size)}</p>
              </div>
              <button onClick={clear} className="text-white/30 hover:text-red-400"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
