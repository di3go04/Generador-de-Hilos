"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Download, Image as ImageIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImageConverter({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("image/jpeg");
  const [quality, setQuality] = useState<number>(0.8);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setCompressedFile(null);
      setCompressedPreview(null);
    }
  };

  const processImage = async () => {
    if (!file) return;

    await onAction(async () => {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: targetFormat,
        initialQuality: quality,
      };

      try {
        const output = await imageCompression(file, options);
        // If the format changed, we might need to recreate the file to force the extension
        const extension = targetFormat === "image/jpeg" ? "jpg" : targetFormat === "image/webp" ? "webp" : "png";
        const finalFile = new File([output], `converted_image.${extension}`, { type: targetFormat });
        
        setCompressedFile(finalFile);
        setCompressedPreview(URL.createObjectURL(finalFile));
      } catch (error) {
        throw new Error("Failed to process image");
      }
    });
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Conversor de Imágenes</h2>
        <p className="text-slate-400">Comprime y cambia el formato de tus imágenes localmente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block p-8 border-2 border-dashed border-slate-700 rounded-xl text-center hover:bg-slate-800/50 hover:border-blue-500 cursor-pointer transition-all">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <span className="text-sm text-slate-300">Selecciona una imagen</span>
          </label>
          
          {preview && (
            <div className="relative rounded-lg overflow-hidden border border-slate-700">
              <img src={preview} alt="Original" className="w-full object-cover max-h-48" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-white">
                Original: {(file!.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Ajustes
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Formato de salida</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
              >
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Calidad ({(quality * 100).toFixed(0)}%)</label>
              <input 
                type="range" min="0.1" max="1" step="0.1" 
                value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            
            <Button 
              onClick={processImage} 
              disabled={!file}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Procesar Imagen
            </Button>
          </div>
          
          {compressedPreview && compressedFile && (
            <div className="relative rounded-lg overflow-hidden border border-green-500/30">
              <img src={compressedPreview} alt="Comprimida" className="w-full object-cover max-h-48" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-green-400 flex justify-between items-center">
                <span>Nuevo: {(compressedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                <a 
                  href={compressedPreview} 
                  download={compressedFile.name}
                  className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-500 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Descargar
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
