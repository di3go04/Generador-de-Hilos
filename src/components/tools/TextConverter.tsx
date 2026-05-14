"use client";

import { useState } from "react";
import { Copy, Type, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TextConverter({ onAction }: { onAction: (a: any) => Promise<any> }) {
  const [text, setText] = useState("");

  const transform = async (type: "upper" | "lower" | "title") => {
    const action = async () => {
      let result = "";
      if (type === "upper") result = text.toUpperCase();
      else if (type === "lower") result = text.toLowerCase();
      else if (type === "title") {
        result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }
      setText(result);
      return result;
    };
    await onAction(action);
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado");
  };

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pega tu texto aquí..."
        className="w-full h-64 bg-gray-50 dark:bg-black/20 border-2 border-[var(--border-main)] rounded-3xl p-6 outline-none focus:border-indigo-500 transition-all resize-none font-medium"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => transform("upper")} className="btn-secondary py-3 text-xs font-bold uppercase">MAYÚSCULAS</button>
        <button onClick={() => transform("lower")} className="btn-secondary py-3 text-xs font-bold lowercase">minúsculas</button>
        <button onClick={() => transform("title")} className="btn-secondary py-3 text-xs font-bold">Formato Título</button>
        <button onClick={copy} className="btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2">
           <Copy className="w-3.5 h-3.5" /> COPIAR
        </button>
      </div>

      <button onClick={() => setText("")} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 px-2">
        <Trash2 className="w-3.5 h-3.5" /> LIMPIAR TODO
      </button>
    </div>
  );
}
