"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Music, Play, Pause, Download, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { formatBytes } from "@/lib/utils";

export default function AudioCleaner() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [playing, setPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [gain, setGain] = useState(1.0);
  const [noiseGate, setNoiseGate] = useState(0.02);
  const audioRef = useRef<HTMLAudioElement>(null);
  const processedRef = useRef<HTMLAudioElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setProcessedUrl("");
  }, []);

  const togglePlay = (ref: React.RefObject<HTMLAudioElement | null>) => {
    if (!ref.current) return;
    if (ref.current.paused) {
      ref.current.play();
      setPlaying(true);
    } else {
      ref.current.pause();
      setPlaying(false);
    }
  };

  const processAudio = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const audioCtx = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const processed = new Float32Array(rawData.length);

      for (let i = 0; i < rawData.length; i++) {
        let sample = rawData[i] * gain;
        if (Math.abs(sample) < noiseGate) sample = 0;
        processed[i] = Math.max(-1, Math.min(1, sample));
      }

      const newBuffer = audioCtx.createBuffer(1, processed.length, audioBuffer.sampleRate);
      newBuffer.copyToChannel(processed, 0);

      const offlineCtx = new OfflineAudioContext(1, processed.length, audioBuffer.sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = newBuffer;
      source.connect(offlineCtx.destination);
      source.start();

      const rendered = await offlineCtx.startRendering();
      const wavBlob = await audioBufferToWav(rendered);
      const url = URL.createObjectURL(wavBlob);
      setProcessedUrl(url);
      toast.success("Audio procesado");
    } catch (err) {
      toast.error("Error al procesar audio");
    } finally {
      setProcessing(false);
    }
  }, [file, gain, noiseGate]);

  const audioBufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const length = buffer.length;
      const data = buffer.getChannelData(0);
      const wavData = new Float32Array(length);

      for (let i = 0; i < length; i++) wavData[i] = data[i];

      const wavBuffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(wavBuffer);

      const writeStr = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
      };

      writeStr(0, "RIFF");
      view.setUint32(4, 36 + length * 2, true);
      writeStr(8, "WAVE");
      writeStr(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, "data");
      view.setUint32(40, length * 2, true);

      for (let i = 0; i < length; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }

      resolve(new Blob([wavBuffer], { type: "audio/wav" }));
    });
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `cleaned-${file?.name.replace(/\.[^.]+$/, "") || "audio"}.wav`;
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/10">
        <AlertTriangle className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <p className="text-sm text-violet-300">
          Procesamiento 100% local. Soporta MP3, WAV, OGG, M4A.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/[0.15] cursor-pointer transition-all">
        <Music className="w-10 h-10 text-white/30" />
        <p className="text-sm text-white/50">{file ? file.name : "Selecciona un archivo de audio"}</p>
        {file && <p className="text-xs text-white/30">{formatBytes(file.size)}</p>}
        <input type="file" accept="audio/*" onChange={handleFile} className="hidden" />
      </label>

      {audioUrl && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Ganancia: {gain.toFixed(1)}x</label>
              <input type="range" min={0.1} max={2} step={0.1} value={gain}
                onChange={(e) => setGain(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Filtro de ruido: {noiseGate.toFixed(2)}</label>
              <input type="range" min={0} max={0.1} step={0.005} value={noiseGate}
                onChange={(e) => setNoiseGate(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => togglePlay(audioRef)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm text-white/70 hover:text-white transition-all">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} Original
            </button>
            {processedUrl && (
              <button onClick={() => togglePlay(processedRef)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm text-white/70 hover:text-white transition-all">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} Procesado
              </button>
            )}
          </div>

          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
          <audio ref={processedRef} src={processedUrl} onEnded={() => setPlaying(false)} className="hidden" />

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={processAudio}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
          >
            {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><Music className="w-4 h-4" /> Limpiar Audio</>}
          </motion.button>

          {processedUrl && (
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all">
              <Download className="w-4 h-4" /> Descargar WAV
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}


