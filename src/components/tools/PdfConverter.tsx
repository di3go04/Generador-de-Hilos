"use client";

import { useState } from "react";
import { Upload, FileText, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";

export default function PdfConverter({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProgress(0);
    }
  };

  const simulateConversion = async () => {
    if (!file) return;

    await onAction(async () => {
      setIsProcessing(true);
      
      // Simulate complex PDF to Word processing
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 300));
      }

      // Generate a dummy text file to simulate the extracted word document
      const blob = new Blob(["Contenido extraído del PDF. (Esta es una simulación cliente, la conversión real a DOCX requiere backend)."], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${file.name.split('.')[0]}.txt`);
      
      setIsProcessing(false);
      setProgress(0);
      return true;
    });
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Conversor de PDF</h2>
        <p className="text-slate-400">Extrae texto de documentos PDF (Versión cliente).</p>
      </div>

      <div className="space-y-6">
        <label className="block p-10 border-2 border-dashed border-slate-700 rounded-xl text-center hover:bg-slate-800/50 hover:border-blue-500 cursor-pointer transition-all">
          <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <span className="text-base text-slate-300 font-medium">Sube tu documento PDF</span>
          {file && <p className="text-sm text-blue-400 mt-2">{file.name}</p>}
        </label>

        {file && (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            
            <Button 
              onClick={simulateConversion} 
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Procesando ({progress}%)
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5 mr-2" />
                  Extraer Texto (Simulado)
                </>
              )}
            </Button>

            {isProcessing && (
              <div className="w-full bg-slate-900 rounded-full h-2 mt-4 overflow-hidden border border-slate-700">
                <div className="bg-blue-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
