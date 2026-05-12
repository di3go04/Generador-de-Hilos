"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Copy, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard } from "@/lib/utils";

export default function VoiceToText() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES";

    recognition.onresult = (event: any) => {
      let final = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      setTranscript((prev) => prev + final);
      setInterim(interimText);
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error("Error al reconocer voz");
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
      setTranscript("");
      setInterim("");
    }
  }, [listening]);

  const handleCopy = async () => {
    const text = transcript + interim;
    if (!text.trim()) return;
    const ok = await copyToClipboard(text);
    toast[ok ? "success" : "error"](ok ? "Texto copiado" : "Error al copiar");
  };

  if (!supported) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">
            Tu navegador no soporta la API de reconocimiento de voz. Usa Chrome, Edge o Safari.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start gap-3 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10">
        <Mic className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-sm text-cyan-300">
          Reconocimiento de voz en tiempo real. Compatible con Chrome, Edge y Safari.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all ${
            listening
              ? "bg-red-500/20 border-2 border-red-500 shadow-lg shadow-red-500/20"
              : "glass hover:bg-white/[0.06]"
          }`}
        >
          {listening ? (
            <>
              <Square className="w-6 h-6 text-red-400" />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full border-2 border-red-500/30"
              />
            </>
          ) : (
            <Mic className="w-6 h-6 text-white/50" />
          )}
        </motion.button>
        <p className="text-sm text-white/40">
          {listening ? "Grabando... toca para detener" : "Toca para comenzar"}
        </p>
      </div>

      <div className="rounded-xl glass p-4 min-h-[120px]">
        {transcript || interim ? (
          <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
            {transcript}
            <span className="text-white/30">{interim}</span>
          </p>
        ) : (
          <p className="text-sm text-white/30 text-center py-8">El texto aparecerá aquí...</p>
        )}
      </div>

      {(transcript || interim) && (
        <button onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all">
          <Copy className="w-4 h-4" /> Copiar Texto
        </button>
      )}
    </motion.div>
  );
}
