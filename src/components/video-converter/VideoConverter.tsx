"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import VideoDropZone from "./VideoDropZone";
import type { OutputVideoFormat, VideoResolution, VideoBitrate } from "@/types";
import type { FFmpeg as FFmpegType } from "@ffmpeg/ffmpeg";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<OutputVideoFormat, string> = {
  mp4: "MP4 (H.264)", webm: "WebM (VP8)", gif: "GIF animado", mp3: "MP3 (audio)",
  mov: "MOV (QuickTime)", avi: "AVI", mkv: "MKV (Matroska)",
  flv: "FLV (Flash)", wmv: "WMV (Windows)", wav: "WAV (audio)",
};

const RESOLUTION_MAP: Record<Exclude<VideoResolution, "original">, string> = {
  "2160p": "3840:2160", "1080p": "1920:1080", "720p": "1280:720", "480p": "854:480",
};

const BITRATE_LABELS: Record<VideoBitrate, string> = {
  auto: "Automático", "500k": "500 Kbps", "1M": "1 Mbps",
  "2M": "2 Mbps", "4M": "4 Mbps", "8M": "8 Mbps",
};

const RESOLUTION_LABELS: Record<VideoResolution, string> = {
  original: "Original", "2160p": "4K (2160p)", "1080p": "1080p",
  "720p": "720p", "480p": "480p",
};

const MIME_MAP: Record<OutputVideoFormat, string> = {
  mp4: "video/mp4", webm: "video/webm", gif: "image/gif", mp3: "audio/mpeg",
  mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska",
  flv: "video/x-flv", wmv: "video/x-ms-wmv", wav: "audio/wav",
};

const CORE_CDN = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm";
const FFMPEG_CDN = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/esm";

// ---------------------------------------------------------------------------
// FFmpeg worker loader — inlines deps into a blob: URL + intercepts Worker
// ---------------------------------------------------------------------------

async function createInlineWorkerBlob(): Promise<string> {
  const base = FFMPEG_CDN;
  const [workerSrc, constSrc, errorsSrc] = await Promise.all(
    ["worker.js", "const.js", "errors.js"].map((f) =>
      fetch(`${base}/${f}`).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch ${f}`);
        return r.text();
      }),
    ),
  );

  // Strip exports from deps, remove static imports from worker, combine
  const combined = [
    constSrc.replace(/^export /gm, ""),
    errorsSrc.replace(/^export /gm, ""),
    workerSrc.replace(/^import .+ from ["'].+["'];?$/gm, ""),
  ].join("\n");

  const blob = new Blob([combined], { type: "text/javascript" });
  return URL.createObjectURL(blob);
}

function patchWorkerForFFmpeg(blobURL: string): () => void {
  const NativeWorker = globalThis.Worker;
  globalThis.Worker = class PatchedWorker extends NativeWorker {
    constructor(url: string | URL, opts?: WorkerOptions) {
      const str = typeof url === "string" ? url : url.href;
      if (str.includes("/@ffmpeg/ffmpeg@") && str.endsWith("/worker.js")) {
        super(blobURL, opts);
      } else {
        super(url, opts);
      }
    }
  };
  return () => { globalThis.Worker = NativeWorker; };
}

/**
 * Load an ES module from a CDN URL by injecting a <script type="module"> tag.
 * This bypasses Turbopack's import() interception.
 */
function importFromCDN<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const key = `__cdn_mod_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import * as mod from ${JSON.stringify(url)};
      window[${JSON.stringify(key)}] = mod;
    `;
    script.onerror = () => {
      delete (window as any)[key];
      reject(new Error(`Failed to load ${url}`));
    };
    document.head.appendChild(script);

    const check = setInterval(() => {
      if ((window as any)[key]) {
        clearInterval(check);
        const mod = (window as any)[key];
        delete (window as any)[key];
        script.remove();
        resolve(mod as T);
      }
    }, 30);

    setTimeout(() => {
      clearInterval(check);
      delete (window as any)[key];
      script.remove();
      reject(new Error(`Timeout loading ${url}`));
    }, 30000);
  });
}

// ---------------------------------------------------------------------------
// FFmpeg argument builder
// ---------------------------------------------------------------------------

interface FfmpegParams {
  inputName: string;
  format: OutputVideoFormat;
  resolution: VideoResolution;
  quality: number;
  bitrate: VideoBitrate;
}

function buildFfmpegArgs(params: FfmpegParams): { args: string[]; outputName: string } {
  const { inputName, format, resolution, quality, bitrate } = params;
  const args: string[] = ["-i", inputName];
  let outputName = `output.${format}`;
  const crf = String(Math.round((1 - quality) * 51));

  const resStr = resolution !== "original" ? RESOLUTION_MAP[resolution] : null;

  let vfFilter = "";
  if (format === "gif") {
    vfFilter = "fps=10";
    if (resStr) {
      vfFilter += `,scale=${resStr}:force_original_aspect_ratio=decrease:flags=lanczos`;
    } else {
      vfFilter += ",scale=480:-1:flags=lanczos";
    }
  } else if (resStr) {
    vfFilter = `scale=${resStr}:force_original_aspect_ratio=decrease`;
  }
  if (vfFilter) args.push("-vf", vfFilter);

  switch (format) {
    case "mp4":  args.push("-c:v", "libx264", "-crf", crf); break;
    case "webm": args.push("-c:v", "libvpx", "-crf", crf); break;
    case "gif":  break;
    case "mp3":  args.push("-vn", "-acodec", "libmp3lame"); outputName = "output.mp3"; break;
    case "mov":  args.push("-c:v", "libx264", "-crf", crf, "-pix_fmt", "yuv420p"); break;
    case "avi":  args.push("-c:v", "libxvid", "-q:v", String(Math.round((1 - quality) * 10))); break;
    case "mkv":  args.push("-c:v", "libx264", "-crf", crf); break;
    case "flv":  args.push("-c:v", "libx264", "-crf", crf, "-f", "flv"); break;
    case "wmv":  args.push("-c:v", "wmv2", "-b:v", "2M"); break;
    case "wav":  args.push("-vn", "-acodec", "pcm_s16le"); outputName = "output.wav"; break;
  }

  if (bitrate !== "auto" && format !== "gif" && format !== "mp3" && format !== "wav") {
    args.push("-b:v", bitrate);
  }

  args.push(outputName);
  return { args, outputName };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function triggerDownload(data: Uint8Array, filename: string, mime: string): void {
  const blob = new Blob([data as unknown as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputVideoFormat>("mp4");
  const [resolution, setResolution] = useState<VideoResolution>("original");
  const [quality, setQuality] = useState(0.8);
  const [bitrate, setBitrate] = useState<VideoBitrate>("auto");
  const [converting, setConverting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [conversionDone, setConversionDone] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [sabAvailable, setSabAvailable] = useState(true);
  const ffmpegRef = useRef<FFmpegType | null>(null);
  const workerBlobURLRef = useRef<string | null>(null);

  useEffect(() => {
    setSabAvailable(typeof SharedArrayBuffer !== "undefined");
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setConverting(true);
    setConversionDone(false);
    setConversionError(null);
    setProgress(0);

    const log = (msg: string) => setLogs((prev) => [...prev.slice(-100), msg]);

    log(`Iniciando conversión: ${file.name} → ${format.toUpperCase()}`);
    log(`Resolución: ${RESOLUTION_LABELS[resolution]}, Bitrate: ${BITRATE_LABELS[bitrate]}`);

    const tempFiles: string[] = [];
    let restoreWorker: (() => void) | null = null;

    try {
      log("Cargando ffmpeg.wasm…");

      // 1. Inline worker deps + blob URL
      log("Preparando worker…");
      const wBlob = await createInlineWorkerBlob();
      workerBlobURLRef.current = wBlob;

      // 2. Patch Worker constructor to redirect CDN worker → blob URL
      restoreWorker = patchWorkerForFFmpeg(wBlob);

      // 3. Load FFmpeg from CDN (bypasses Turbopack)
      const FFMPEG_MODULE = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/esm/index.js";
      const UTIL_MODULE = "https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js";
      const [ffmpegMod, utilMod] = await Promise.all([
        importFromCDN<Record<string, any>>(FFMPEG_MODULE),
        importFromCDN<{ fetchFile: any; toBlobURL: any }>(UTIL_MODULE),
      ]);
      const FFmpegClass = ffmpegMod.FFmpeg || ffmpegMod.default;
      const { fetchFile, toBlobURL: toBlob } = utilMod;

      // 4. Core files via toBlobURL (fetch-based, no Worker constructor)
      const coreURL = await toBlob(`${CORE_CDN}/ffmpeg-core.js`, "text/javascript");
      const wasmURL = await toBlob(`${CORE_CDN}/ffmpeg-core.wasm`, "application/wasm");

      // 5. Create instance and load — internal Worker() call is intercepted
      const ffmpeg: FFmpegType = new FFmpegClass();
      await ffmpeg.load({ coreURL, wasmURL });

      // Restore native Worker constructor
      if (restoreWorker) { restoreWorker(); restoreWorker = null; }

      log("ffmpeg.wasm listo");
      ffmpegRef.current = ffmpeg;

      const ext = file.name.substring(file.name.lastIndexOf("."));
      const inputName = `input${ext}`;
      tempFiles.push(inputName);

      const fileData = await fetchFile(file);
      await ffmpeg.writeFile(inputName, fileData);
      log(`Archivo de entrada escrito: ${inputName} (${file.name})`);

      const { args, outputName } = buildFfmpegArgs({ inputName, format, resolution, quality, bitrate });
      tempFiles.push(outputName);
      log(`Ejecutando: ffmpeg ${args.join(" ")}`);

      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.min(Math.round(p * 100), 99));
      });

      await ffmpeg.exec(args);
      setProgress(99);

      const readData: Uint8Array = await ffmpeg.readFile(outputName) as Uint8Array;

      if (!readData || readData.length === 0) {
        throw new Error("El archivo de salida está vacío");
      }

      const outName = `${file.name.replace(/\.[^.]+$/, "")}.${format}`;
      triggerDownload(readData, outName, MIME_MAP[format]);
      setProgress(100);
      log("Conversión completada — descarga iniciada");
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
      log(`Error: ${msg}`);
      setConversionError(msg);
    } finally {
      if (ffmpegRef.current) {
        for (const f of tempFiles) {
          try { await ffmpegRef.current.deleteFile(f); } catch { /* ignore */ }
        }
        ffmpegRef.current.terminate();
        ffmpegRef.current = null;
      }
      if (restoreWorker) { restoreWorker(); }
      if (workerBlobURLRef.current) {
        URL.revokeObjectURL(workerBlobURLRef.current);
        workerBlobURLRef.current = null;
      }
      setConverting(false);
      setConversionDone(true);
    }
  }, [file, format, resolution, quality, bitrate]);

  // -- SharedArrayBuffer warning --------------------------------------------
  const sabWarning = !sabAvailable ? (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-300">
        <p className="font-semibold">Modo compatibilidad activado</p>
        <p className="mt-1">
          Tu navegador no soporta SharedArrayBuffer. Se usará la versión single-thread de ffmpeg.
          La conversión será más lenta pero funcionará igual.
        </p>
      </div>
    </div>
  ) : null;

  // -- Result banner ---------------------------------------------------------
  const resultBanner = conversionDone && !converting ? (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${
      conversionError
        ? "border-red-500/20 bg-red-500/10"
        : "border-emerald-500/20 bg-emerald-500/10"
    }`}>
      {conversionError
        ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      }
      <p className={`text-sm ${conversionError ? "text-red-300" : "text-emerald-300"}`}>
        {conversionError || "Conversión exitosa. El archivo debería descargarse automáticamente."}
      </p>
    </div>
  ) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {sabWarning}

      <VideoDropZone onFiles={(f) => setFile(f[0] || null)} />

      {file && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="fmt" className="block text-sm font-medium text-white/70 mb-2">Formato</label>
              <select id="fmt" value={format} onChange={(e) => setFormat(e.target.value as OutputVideoFormat)}
                className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                {(Object.keys(FORMAT_LABELS) as OutputVideoFormat[]).map((f) => (
                  <option key={f} value={f} className="bg-[#1a1a2e]">{FORMAT_LABELS[f]}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="res" className="block text-sm font-medium text-white/70 mb-2">Resolución</label>
              <select id="res" value={resolution} onChange={(e) => setResolution(e.target.value as VideoResolution)}
                className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                {(Object.keys(RESOLUTION_LABELS) as VideoResolution[]).map((r) => (
                  <option key={r} value={r} className="bg-[#1a1a2e]">{RESOLUTION_LABELS[r]}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-white/70 mb-2">Calidad: {Math.round(quality * 100)}%</label>
              <input id="quality" type="range" min={0.1} max={1} step={0.05} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <label htmlFor="bitrate" className="block text-sm font-medium text-white/70 mb-2">Bitrate</label>
              <select id="bitrate" value={bitrate} onChange={(e) => setBitrate(e.target.value as VideoBitrate)}
                className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                {(Object.keys(BITRATE_LABELS) as VideoBitrate[]).map((b) => (
                  <option key={b} value={b} className="bg-[#1a1a2e]">{BITRATE_LABELS[b]}</option>
                ))}
              </select>
            </div>
          </div>

          {(converting || conversionDone) && (
            <div className="space-y-3">
              <div className="w-full glass rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${conversionError ? "bg-red-500" : "gradient-indigo-pink"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="h-32 overflow-y-auto rounded-xl bg-black/40 p-3 text-xs font-mono">
                {logs.map((log, i) => (
                  <div key={i} className={`truncate ${log.startsWith("Error") ? "text-red-400" : "text-green-400/80"}`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultBanner}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleConvert}
            disabled={converting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
          >
            {converting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Convirtiendo…</>
            ) : (
              <><Download className="w-4 h-4" /> Convertir y Descargar</>
            )}
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
