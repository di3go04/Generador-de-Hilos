"use client";

import { Sparkles, Copy, RefreshCw, Download, Loader2 } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";
import { useState, useCallback } from "react";
import { generateThread } from "@/lib/ai-service";
import { copyToClipboard } from "@/lib/utils";
import ToneSelector from "./ToneSelector";
import TweetCard from "./TweetCard";
import type { Tone, Tweet } from "@/types";

export default function ThreadGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("Casual");
  const [numTweets, setNumTweets] = useState(5);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const handleGenerate = useCallback(async () => {
    const trimmed = topic.trim();
    if (!trimmed) { toast.error("Escribe un tema"); return; }
    setTweets([]);
    setLoading(true);
    setError(null);
    try {
      const result = await generateThread({ topic: trimmed, tone, numTweets, includeEmojis, includeHashtags });
      setTweets(result.tweets);
      setIsDemo(result.isDemo);
      if (result.isDemo) toast.success("Modo demo - configura una API key", { duration: 4000 });
      else toast.success(`Hilo generado con ${result.tweets.length} tweets`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al generar";
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }, [topic, tone, numTweets, includeEmojis, includeHashtags]);

  const handleCopyAll = async () => {
    const text = tweets.map((t) => `${t.content}`).join("\n\n");
    const ok = await copyToClipboard(text);
    toast[ok ? "success" : "error"](ok ? "Hilo copiado" : "Error al copiar");
  };

  const handleEditTweet = (id: number, newContent: string) => {
    setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, content: newContent } : t)));
  };

  const handleDownload = () => {
    const text = tweets.map((t) => `${t.id}/${tweets.length} ${t.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `thread-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Hilo descargado");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">¿Sobre qué quieres escribir?</label>
        <TextareaAutosize value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej: Cómo aprendí React en 30 días..." minRows={3} maxRows={6}
          className="w-full resize-none rounded-xl glass px-4 py-3 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          aria-label="Tema del hilo" />
      </div>

      <ToneSelector value={tone} onChange={setTone} />

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Tweets: <span className="text-indigo-400 font-bold">{numTweets}</span>
        </label>
        <input type="range" min={1} max={10} value={numTweets} onChange={(e) => setNumTweets(Number(e.target.value))}
          className="w-full" aria-label="Número de tweets" />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)}
            className="rounded border-white/[0.15] bg-white/5 text-indigo-500 focus:ring-indigo-500/40" />
          <span className="text-sm text-white/70">Incluir emojis</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)}
            className="rounded border-white/[0.15] bg-white/5 text-indigo-500 focus:ring-indigo-500/40" />
          <span className="text-sm text-white/70">Hashtags al final</span>
        </label>
      </div>

      <button onClick={handleGenerate} disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-indigo-pink disabled:opacity-50 text-white font-semibold text-sm shadow-lg transition-all"
        aria-label="Generar hilo">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</> : <><Sparkles className="w-4 h-4" /> Generar Hilo</>}
      </button>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>}

      {tweets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">Tu hilo</h2>
            {isDemo && <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium">Demo</span>}
          </div>
          <div className="space-y-3">
            {tweets.map((t) => <TweetCard key={t.id} tweet={t} total={tweets.length} onEdit={handleEditTweet} />)}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopyAll} className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all"><Copy className="w-4 h-4" /> Copiar todo</button>
            <button onClick={handleGenerate} className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all"><RefreshCw className="w-4 h-4" /> Regenerar</button>
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all"><Download className="w-4 h-4" /> Descargar .txt</button>
          </div>
        </div>
      )}
    </div>
  );
}
