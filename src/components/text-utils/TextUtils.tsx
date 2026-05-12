"use client";

import { useState, useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Copy, Eraser, ArrowUpAZ, ArrowDownZA, FlipVertical, CaseUpper, CaseLower, Indent, RemoveFormatting } from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard } from "@/lib/utils";
import { countWords, countChars, toUpperCase, toLowerCase, toTitleCase, removeExtraSpaces, reverseText, sortLines } from "@/lib/text-utils";

export default function TextUtils() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [stats, setStats] = useState({ words: 0, withSpaces: 0, withoutSpaces: 0 });

  const updateStats = useCallback((t: string) => {
    setStats({ words: countWords(t), ...countChars(t) });
  }, []);

  const handleChange = (value: string) => {
    setText(value);
    setResult(value);
    updateStats(value);
  };

  const apply = (fn: (s: string) => string) => {
    const r = fn(text);
    setResult(r);
    toast.success("Transformación aplicada");
  };

  const copyResult = async () => {
    const ok = await copyToClipboard(result);
    toast[ok ? "success" : "error"](ok ? "Texto copiado" : "Error al copiar");
  };

  const clearAll = () => {
    setText("");
    setResult("");
    setStats({ words: 0, withSpaces: 0, withoutSpaces: 0 });
  };

  return (
    <div className="space-y-6">
      <TextareaAutosize value={text} onChange={(e) => handleChange(e.target.value)} placeholder="Escribe o pega tu texto aquí..." minRows={5} maxRows={12}
        className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm" />

      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
          {stats.words} palabras
        </span>
        <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
          {stats.withSpaces} chars (con espacios)
        </span>
        <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
          {stats.withoutSpaces} chars (sin espacios)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => apply(toUpperCase)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <CaseUpper className="w-4 h-4 text-blue-500" /> MAYÚSCULAS
        </button>
        <button onClick={() => apply(toLowerCase)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <CaseLower className="w-4 h-4 text-blue-500" /> minúsculas
        </button>
        <button onClick={() => apply(toTitleCase)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <Indent className="w-4 h-4 text-blue-500" /> Título
        </button>
        <button onClick={() => apply(removeExtraSpaces)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <RemoveFormatting className="w-4 h-4 text-blue-500" /> Espacios
        </button>
        <button onClick={() => apply(reverseText)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <FlipVertical className="w-4 h-4 text-purple-500" /> Invertir
        </button>
        <button onClick={() => apply((s) => sortLines(s, true))} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <ArrowUpAZ className="w-4 h-4 text-purple-500" /> A-Z
        </button>
        <button onClick={() => apply((s) => sortLines(s, false))} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <ArrowDownZA className="w-4 h-4 text-purple-500" /> Z-A
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{result}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyResult} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Copy className="w-4 h-4" /> Copiar
            </button>
            <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Eraser className="w-4 h-4" /> Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
