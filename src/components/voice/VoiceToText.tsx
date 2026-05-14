"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Upload, Volume2, RefreshCw } from "lucide-react";

export default function VoiceToText() {
  const [file, setFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);

  const handleTranscribe = async () => {
    if (!file) return;
    setTranscribing(true);
    await new Promise(r => setTimeout(r, 2000));
    setTranscribing(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 glass-card p-8 rounded-[2.5rem] border-white/10 shadow-premium space-y-6">
           <div className="h-48 border-2 border-dashed border-brand-earth/10 rounded-2xl flex flex-col items-center justify-center gap-4">
             <Upload className="w-8 h-8 text-brand-terracota/40" />
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/20">Sube tu audio</p>
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
           </div>
           {file && (
             <div className="p-4 bg-brand-terracota/5 rounded-xl border border-brand-terracota/10 flex items-center gap-3">
               <Mic className="w-4 h-4 text-brand-terracota" />
               <span className="text-xs font-bold text-brand-earth truncate">{file.name}</span>
             </div>
           )}
           <button 
             onClick={handleTranscribe}
             disabled={!file || transcribing}
             className="w-full py-4 bg-brand-terracota text-white rounded-xl font-black tracking-tight shadow-glow-terracota disabled:opacity-50"
           >
             {transcribing ? "TRANSCRIBIENDO..." : "INICIAR"}
           </button>
        </div>
        <div className="lg:col-span-7 glass-card p-8 rounded-[2.5rem] border-white/10 min-h-[400px] bg-white/30">
          <div className="flex flex-col items-center justify-center h-full opacity-20 text-center gap-4">
            <Volume2 className="w-12 h-12" />
            <p className="text-xs font-black uppercase tracking-widest">Esperando audio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
