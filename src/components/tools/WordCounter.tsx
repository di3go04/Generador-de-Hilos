"use client";

import { useState, useEffect } from "react";
import { Type, Hash, Clock, FileText } from "lucide-react";

export default function WordCounter({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [text, setText] = useState("");
  const [tracked, setTracked] = useState(false);

  const stats = {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    sentences: text.split(/[.!?]+/).filter(Boolean).length,
    paragraphs: text.split(/\n+/).filter(Boolean).length,
    readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200), // 200 words per minute
  };

  useEffect(() => {
    if (text.length > 50 && !tracked) {
      onAction(async () => true);
      setTracked(true);
    }
  }, [text, tracked, onAction]);

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-200">{value}</p>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Contador de Palabras</h2>
        <p className="text-slate-400">Analiza tu texto en tiempo real con estadísticas detalladas.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Type} label="Palabras" value={stats.words} />
        <StatCard icon={Hash} label="Caracteres" value={stats.chars} />
        <StatCard icon={FileText} label="Párrafos" value={stats.paragraphs} />
        <StatCard icon={Clock} label="Lectura (min)" value={stats.readingTime || "< 1"} />
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe o pega tu texto aquí para comenzar el análisis..."
          className="w-full h-80 bg-slate-800 border border-slate-700 rounded-xl p-6 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none text-lg leading-relaxed"
        />
        <div className="absolute bottom-4 right-4 flex gap-4 text-xs text-slate-500">
          <span>Sin espacios: {stats.charsNoSpaces}</span>
          <span>Oraciones: {stats.sentences}</span>
        </div>
      </div>
    </div>
  );
}
