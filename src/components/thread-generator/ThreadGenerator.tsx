"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileVideo, Upload, CheckCircle2, 
  Settings2, Download, Zap, RefreshCw, 
  Loader2, AlertTriangle, FileType, XCircle, Cloud
} from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import toast from "react-hot-toast";

export default function ThreadGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const loadFFmpeg = async () => {
    if (ffmpegLoaded || loading) return;
    
    setLoading(true);
    setLoadError(false);
    setErrorDetails(null);

    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("log", ({ message }) => {
        console.log("FFMPEG:", message);
      });

      ffmpeg.on("progress", ({ progress }) => {
        // El progreso viene de 0 a 1
        setProgress(Math.round(progress * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setFfmpegLoaded(true);
      setLoading(false);
    } catch (err: any) {
      console.error("FFmpeg Load Error Details:", err);
      setLoadError(true);
      setLoading(false);
      setErrorDetails(err.message || "Error desconocido al cargar el motor.");
      toast.error("No pudimos cargar el motor de conversión.");
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const handleConvert = async () => {
    if (!file || !ffmpegRef.current || !ffmpegLoaded) return;

    setConverting(true);
    setProgress(0);
    setDone(false);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = `input_${Date.now()}.mp4`;
      const outputName = `output_${Date.now()}.mkv`;

      // Cargar archivo al sistema de archivos virtual de FFmpeg
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // Ejecutar conversión
      // -i: input
      // -codec copy: no recodificar (rápido, mantiene calidad)
      await ffmpeg.exec(["-i", inputName, "-codec", "copy", outputName]);

      // Leer el resultado
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: "video/x-matroska" }));
      
      setDownloadUrl(url);
      setDone(true);
      toast.success("¡Conversión completada!");
    } catch (err) {
      console.error("Conversion Error:", err);
      toast.error("Error durante la conversión. Intenta con un archivo más pequeño.");
    } finally {
      setConverting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDone(false);
    setProgress(0);
    setDownloadUrl(null);
  };

  if (loadError) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-96 text-center space-y-8 glass-card rounded-[2.5rem] border-red-500/10"
      >
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center relative">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-brand-heading uppercase tracking-tighter">Motor Local No Disponible</h3>
          <p className="text-brand-body max-w-sm mx-auto text-sm">
            Tu navegador o conexión está bloqueando el procesamiento local. 
            No te preocupes, puedes usar nuestra infraestructura en la nube.
          </p>
          {errorDetails && (
            <p className="text-[10px] font-mono text-red-400 opacity-50 mt-4 max-w-xs truncate">
              Log: {errorDetails}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button className="w-full py-4 rounded-2xl bg-brand-heading text-white font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3">
            <Cloud className="w-5 h-5 text-brand-terracota" />
            USAR CLOUD ENGINE
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs font-black text-brand-body/40 uppercase tracking-widest hover:text-brand-terracota transition-colors"
          >
            Reintentar inicialización
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-brand-heading tracking-tight">
          Generador de <span className="text-brand-terracota italic">Hilos Video</span>
        </h2>
        <p className="text-brand-body text-sm">Convierte tus videos .mp4 a formato .mkv con calidad original.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Zone */}
        <div className={`glass-card rounded-2xl p-8 border-2 border-dashed transition-all
          ${file ? "border-brand-terracota/30 bg-brand-terracota/5" : "border-black/[0.05] hover:border-brand-terracota/20"}
          flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden`}
        >
          {!file ? (
            <>
              <div className="w-16 h-16 rounded-xl bg-brand-cream flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-brand-terracota" />
              </div>
              <p className="text-sm font-bold text-brand-heading">Sube tu archivo .mp4</p>
              <p className="text-xs text-brand-body mt-1">O arrastra y suelta aquí</p>
              <input 
                type="file" 
                accept="video/mp4"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-brand-terracota flex items-center justify-center mx-auto shadow-md">
                <FileVideo className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-heading truncate max-w-[200px]">{file.name}</p>
                <p className="text-[10px] text-brand-body uppercase font-black">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button onClick={reset} className="text-[10px] font-black text-brand-terracota uppercase tracking-widest hover:underline">
                Cambiar archivo
              </button>
            </div>
          )}
        </div>

        {/* Action Zone */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-brand-heading font-bold text-xs uppercase tracking-widest pb-3 border-b border-black/[0.03]">
              <Settings2 className="w-4 h-4 text-brand-terracota" />
              <span>Ajustes de Salida</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] border border-black/[0.03]">
              <div className="flex items-center gap-3">
                <FileType className="w-5 h-5 text-brand-olive" />
                <span className="text-sm font-bold">Formato .mkv</span>
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recomendado</span>
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!file || converting || !ffmpegLoaded}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
              ${!file || converting || !ffmpegLoaded 
                ? "bg-black/[0.05] text-brand-body/30 cursor-not-allowed" 
                : "btn-primary shadow-md hover:scale-[1.02] active:scale-[0.98]"}`}
          >
            {converting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Convirtiendo {progress}%</span>
              </>
            ) : !ffmpegLoaded ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Iniciando Motor...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Convertir a .mkv</span>
              </>
            )}
          </button>

          {done && downloadUrl && (
            <motion.a
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              href={downloadUrl}
              download={`${file?.name.split('.')[0]}.mkv`}
              className="w-full py-4 rounded-xl bg-brand-olive text-white font-bold flex items-center justify-center gap-3 hover:bg-[#6c7b5f] shadow-md transition-all"
            >
              <Download className="w-5 h-5" />
              Descargar MKV
            </motion.a>
          )}
        </div>
      </div>

      {converting && (
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-body">
            <span>Progreso de conversión</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-black/[0.05] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-terracota"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
