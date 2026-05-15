"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Copy, Check, Twitter,
  Calendar, Download, RefreshCw, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

const TONES = [
  { value: "professional", label: "Profesional" },
  { value: "casual", label: "Casual" },
  { value: "educational", label: "Educativo" },
  { value: "viral", label: "Viral" },
  { value: "storytelling", label: "Historia" },
];

export default function ThreadGeneratorNew() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [tweetCount, setTweetCount] = useState(7);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ title: string; tweets: string[] } | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useState(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => {});
  });

  async function generate() {
    if (!topic.trim()) { toast.error("Escribe un tema para el hilo"); return; }
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/threads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, language, tweetCount, includeEmojis, includeHashtags }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Error al generar"); return; }
      setResult(data);
      toast.success("¡Hilo generado!");
    } catch { toast.error("Error de conexión"); }
    finally { setGenerating(false); }
  }

  async function saveThread(publish?: boolean, scheduleAt?: string) {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title, topic, content: result.tweets, tone,
          language, status: scheduleAt ? "SCHEDULED" : publish ? "PUBLISHED" : "DRAFT",
          scheduleAt,
          categoryIds: selectedCategories,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Error al guardar"); return; }
      toast.success(scheduleAt ? "Hilo programado ✅" : publish ? "Publicando en Twitter..." : "Hilo guardado");
      router.push(`/dashboard/threads/${data.thread.id}`);
    } catch { toast.error("Error al guardar"); }
    finally { setSaving(false); }
  }

  function copyTweet(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAll() {
    if (!result) return;
    navigator.clipboard.writeText(result.tweets.join("\n\n---\n\n"));
    toast.success("Hilo copiado al portapapeles");
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-heading)]">
          Crear nuevo hilo <span className="text-indigo-500">con IA</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Describe el tema y la IA generará un hilo viral optimizado.
        </p>
      </div>

      {/* Config Card */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        {/* Topic */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-heading)] mb-2">
            Tema del hilo *
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="ej: Cómo aprender programación en 2025 sin gastar dinero..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-main)] bg-white dark:bg-white/5 text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm"
          />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tone */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Tono
            </label>
            <div className="relative">
              <select value={tone} onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-main)] bg-white dark:bg-white/5 text-[var(--text-heading)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm appearance-none">
                {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Idioma
            </label>
            <div className="flex rounded-xl border border-[var(--border-main)] overflow-hidden">
              {(["es", "en"] as const).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${language === lang ? "bg-indigo-600 text-white" : "bg-white dark:bg-white/5 text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-white/10"}`}>
                  {lang === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Selection */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Asignar Categorías
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategories(prev => 
                        prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                      isSelected 
                        ? "shadow-md scale-105" 
                        : "bg-white dark:bg-white/5 text-[var(--text-muted)] border-[var(--border-main)] hover:border-indigo-500/50"
                    }`}
                    style={isSelected ? {
                      backgroundColor: cat.color,
                      color: "white",
                      borderColor: cat.color,
                    } : {}}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : ""}`} style={!isSelected ? { backgroundColor: cat.color } : {}} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tweet count + toggles */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--text-heading)]">Tweets:</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setTweetCount(Math.max(3, tweetCount - 1))}
                className="w-8 h-8 rounded-lg border border-[var(--border-main)] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 font-bold">−</button>
              <span className="w-6 text-center font-bold text-[var(--text-heading)]">{tweetCount}</span>
              <button onClick={() => setTweetCount(Math.min(20, tweetCount + 1))}
                className="w-8 h-8 rounded-lg border border-[var(--border-main)] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 font-bold">+</button>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-sm text-[var(--text-heading)]">Emojis</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-sm text-[var(--text-heading)]">Hashtags</span>
          </label>
        </div>

        <button onClick={generate} disabled={generating || !topic.trim()}
          className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Generando hilo...</>
          ) : (
            <><Sparkles className="w-4 h-4" />Generar hilo con IA</>
          )}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[var(--text-heading)]">{result.title}</h2>
              <div className="flex items-center gap-2">
                <button onClick={copyAll} className="btn-ghost text-xs py-1.5 px-3">
                  <Copy className="w-3.5 h-3.5" />Copiar todo
                </button>
                <button onClick={generate} className="btn-ghost text-xs py-1.5 px-3">
                  <RefreshCw className="w-3.5 h-3.5" />Regenerar
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {result.tweets.map((tweet, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-xl p-4 flex gap-3 group"
                >
                  <span className="text-xs font-bold text-[var(--text-muted)] w-5 flex-shrink-0 pt-0.5">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-[var(--text-heading)] leading-relaxed">{tweet}</p>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <button onClick={() => copyTweet(tweet, i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      {copied === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                    </button>
                    <span className={`text-[10px] font-mono ${tweet.length > 260 ? "text-red-500" : "text-[var(--text-muted)]"}`}>
                      {tweet.length}/280
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-heading)]">¿Qué quieres hacer?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => saveThread()} disabled={saving}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-[var(--border-main)] hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all group">
                  <Download className="w-5 h-5 text-[var(--text-muted)] group-hover:text-indigo-500" />
                  <span className="text-xs font-semibold text-[var(--text-heading)]">Guardar borrador</span>
                </button>
                <button onClick={() => saveThread(true)} disabled={saving}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-[var(--border-main)] hover:border-sky-500/50 hover:bg-sky-50/30 dark:hover:bg-sky-500/5 transition-all group">
                  <Twitter className="w-5 h-5 text-[var(--text-muted)] group-hover:text-sky-500" />
                  <span className="text-xs font-semibold text-[var(--text-heading)]">Publicar ahora</span>
                </button>
                <div className="flex flex-col gap-2">
                  <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-main)] bg-white dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                  <button onClick={() => saveThread(false, scheduleDate)} disabled={saving || !scheduleDate}
                    className="flex items-center justify-center gap-2 p-2 rounded-xl border-2 border-dashed border-[var(--border-main)] hover:border-purple-500/50 hover:bg-purple-50/30 dark:hover:bg-purple-500/5 transition-all disabled:opacity-40 group">
                    <Calendar className="w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-500" />
                    <span className="text-xs font-semibold text-[var(--text-heading)]">Programar</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
