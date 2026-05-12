"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";

interface TweetCardProps {
  tweet: { id: number; content: string };
  total: number;
  onEdit?: (id: number, newContent: string) => void;
}

export default function TweetCard({ tweet: { id, content: initialContent }, total, onEdit }: TweetCardProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, [editing]);

  const len = text.length;
  const overLimit = len > 280;
  const nearLimit = len > 240 && !overLimit;

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast.success("Tweet copiado");
      setTimeout(() => setCopied(false), 2000);
    } else toast.error("Error al copiar");
  };

  const handleBlur = () => {
    setEditing(false);
    if (text !== initialContent && onEdit) {
      onEdit(id, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setText(initialContent);
      setEditing(false);
    }
  };

  const borderColor =
    id === 1 ? "border-indigo-500/30" :
    id === total ? "border-emerald-500/30" :
    "border-white/[0.06]";

  const bgGradient =
    id === 1 ? "from-indigo-500/5 to-transparent" :
    id === total ? "from-emerald-500/5 to-transparent" :
    "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: id * 0.05 }}
      className={`group relative rounded-xl border ${borderColor} glass bg-gradient-to-br ${bgGradient} p-4 sm:p-5 transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5 ${
          id === 1 ? "bg-indigo-500/20 text-indigo-300" :
          id === total ? "bg-emerald-500/20 text-emerald-300" :
          "bg-white/[0.06] text-white/40"
        }`}>{id}</span>

        {editing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none bg-transparent text-sm sm:text-base leading-relaxed text-white/90 whitespace-pre-wrap outline-none border-b-2 border-indigo-400 min-h-[80px]"
            maxLength={350}
          />
        ) : (
          <p
            onClick={() => setEditing(true)}
            className="flex-1 text-sm sm:text-base leading-relaxed text-white/90 whitespace-pre-wrap cursor-text min-h-[3.5rem]"
          >
            {text}
          </p>
        )}

        <button onClick={handleCopy} aria-label="Copiar tweet"
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all glass hover:bg-white/[0.06] text-white/40 hover:text-white/70">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <span className={`text-xs font-medium ${overLimit ? "text-red-400" : nearLimit ? "text-amber-400" : "text-white/30"}`}>
          {len}/280
        </span>
        <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${overLimit ? "bg-red-500" : nearLimit ? "bg-amber-500" : "bg-indigo-500"}`}
            style={{ width: `${Math.min((len / 280) * 100, 100)}%` }} />
        </div>
      </div>
    </motion.div>
  );
}
