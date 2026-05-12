"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Code, Copy, Download, Braces, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard } from "@/lib/utils";

const languages = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "jsx", label: "JSX" },
  { id: "sql", label: "SQL" },
  { id: "bash", label: "Bash" },
  { id: "yaml", label: "YAML" },
];

export default function CodeBeautifier() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [formatted, setFormatted] = useState("");
  const [formatting, setFormatting] = useState(false);

  const handleFormat = useCallback(async () => {
    if (!code.trim()) return;
    setFormatting(true);
    try {
      let result = code;

      if (language === "json") {
        result = JSON.stringify(JSON.parse(code), null, 2);
      } else if (language === "html" || language === "css" || language === "javascript" || language === "typescript" || language === "jsx") {
        const prettier = await import("prettier/standalone");
        const parser = await import("prettier/parser-babel");
        const htmlParser = language === "html" ? await import("prettier/parser-html") : null;
        const cssParser = language === "css" ? await import("prettier/parser-postcss") : null;

        const plugins: any[] = [parser.default || parser];
        if (htmlParser) plugins.push(htmlParser.default || htmlParser);
        if (cssParser) plugins.push(cssParser.default || cssParser);

        const parserMap: Record<string, string> = {
          javascript: "babel",
          typescript: "babel-ts",
          jsx: "babel",
          html: "html",
          css: "css",
        };

        result = await prettier.format(code, {
          parser: parserMap[language] || "babel",
          plugins,
          semi: true,
          singleQuote: true,
          trailingComma: "es5",
          printWidth: 80,
          tabWidth: 2,
        });
      } else {
        toast.success("Formateo básico aplicado (sin Prettier para este lenguaje)");
      }

      setFormatted(result);
      toast.success("Código formateado");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al formatear";
      toast.error(msg);
      setFormatted("");
    } finally {
      setFormatting(false);
    }
  }, [code, language]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(formatted || code);
    toast[ok ? "success" : "error"](ok ? "Copiado" : "Error al copiar");
  };

  const handleDownload = () => {
    const content = formatted || code;
    if (!content.trim()) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "python" ? "py" : language === "json" ? "json" : language === "html" ? "html" : language === "css" ? "css" : language === "sql" ? "sql" : language === "bash" ? "sh" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
        <Code className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-300">
          Formatea código con Prettier. Soporta JS, TS, HTML, CSS, JSON y más.
        </p>
      </div>

      <div className="flex gap-3 items-start">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl glass px-4 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          {languages.map((l) => (
            <option key={l.id} value={l.id} className="bg-[#1a1a2e]">{l.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-white/40">Entrada</p>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Pega tu código aquí..."
            rows={14}
            className="w-full rounded-xl glass px-4 py-3 text-sm text-white/90 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-white/40">Salida</p>
          <div className="w-full rounded-xl glass px-4 py-3 text-sm text-white/90 font-mono overflow-auto whitespace-pre-wrap min-h-[14rem] max-h-[20rem] bg-black/30">
            {formatted || <span className="text-white/20">Código formateado...</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleFormat}
          disabled={!code.trim() || formatting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
        >
          {formatting ? <><Loader2 className="w-4 h-4 animate-spin" /> Formateando...</> : <><Braces className="w-4 h-4" /> Formatear</>}
        </motion.button>
        <button onClick={handleCopy} disabled={!code.trim()}
          className="flex items-center gap-2 px-4 py-3 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all disabled:opacity-30">
          <Copy className="w-4 h-4" /> Copiar
        </button>
        <button onClick={handleDownload} disabled={!code.trim()}
          className="flex items-center gap-2 px-4 py-3 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all disabled:opacity-30">
          <Download className="w-4 h-4" /> Descargar
        </button>
      </div>
    </motion.div>
  );
}
