"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Upload, Download, FileArchive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FileCompressor({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState("archivos_comprimidos");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createZip = async () => {
    if (files.length === 0) return;

    await onAction(async () => {
      const zip = new JSZip();
      
      files.forEach((file) => {
        zip.file(file.name, file);
      });

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${zipName}.zip`);
      
      return true; // Used for usage tracking
    });
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Compresor de Archivos</h2>
        <p className="text-slate-400">Selecciona varios archivos y descárgalos en un archivo ZIP.</p>
      </div>

      <div className="space-y-4">
        <label className="block p-10 border-2 border-dashed border-slate-700 rounded-xl text-center hover:bg-slate-800/50 hover:border-blue-500 cursor-pointer transition-all">
          <input type="file" className="hidden" multiple onChange={handleFileChange} />
          <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <span className="text-base text-slate-300 font-medium">Haz clic para añadir archivos</span>
          <p className="text-xs text-slate-500 mt-1">Cualquier tipo de archivo es compatible</p>
        </label>
        
        {files.length > 0 && (
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-200">
                {files.length} archivo(s) seleccionado(s)
              </h3>
              <span className="text-xs text-slate-400">Total: {(totalSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileArchive className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-slate-300 truncate">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => removeFile(i)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  placeholder="Nombre del archivo zip"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="inline-flex items-center px-3 rounded-lg bg-slate-800 text-slate-400 text-sm border border-slate-700">
                  .zip
                </span>
              </div>
              
              <Button 
                onClick={createZip} 
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Empaquetar y Descargar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
