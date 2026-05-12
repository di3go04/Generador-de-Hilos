"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeft, Loader2, Sparkles } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ToolCard from "@/components/dashboard/ToolCard";
import Footer from "@/components/layout/Footer";
import type { ToolId, ToolConfig } from "@/types";

const ThreadGenerator = lazy(() => import("@/components/thread-generator/ThreadGenerator"));
const ImageGenerator = lazy(() => import("@/components/image-generator/ImageGenerator"));
const VoiceToText = lazy(() => import("@/components/voice-to-text/VoiceToText"));
const VideoConverter = lazy(() => import("@/components/video-converter/VideoConverter"));
const ImageConverter = lazy(() => import("@/components/image-converter/ImageConverter"));
const ImageUpscaler = lazy(() => import("@/components/image-upscaler/ImageUpscaler"));
const RemoveBackground = lazy(() => import("@/components/remove-bg/RemoveBackground"));
const StemSplitter = lazy(() => import("@/components/stem-splitter/StemSplitter"));
const AudioCleaner = lazy(() => import("@/components/audio-cleaner/AudioCleaner"));
const CodeBeautifier = lazy(() => import("@/components/code-beautifier/CodeBeautifier"));
const TextUtils = lazy(() => import("@/components/text-utils/TextUtils"));
const QRGenerator = lazy(() => import("@/components/qr-generator/QRGenerator"));
const ColorPaletteExtractor = lazy(() => import("@/components/color-palette/ColorPaletteExtractor"));
const OCRExtractor = lazy(() => import("@/components/ocr/OCRExtractor"));

const tools: ToolConfig[] = [
  { id: "threads", title: "Hilos IA", description: "Generador de hilos virales con inteligencia artificial.", icon: "Sparkles" },
  { id: "video", title: "Video Pro", description: "Conversor multi-formato con ffmpeg.wasm.", icon: "Video" },
  { id: "image-gen", title: "Imagen IA", description: "Crea imágenes desde texto con DALL-E.", icon: "ImagePlus" },
  { id: "upscale", title: "Upscaler", description: "Mejora la resolución de tus imágenes.", icon: "Maximize2" },
  { id: "remove-bg", title: "Sin Fondo", description: "Elimina fondos de imágenes al instante.", icon: "Eraser" },
  { id: "stem", title: "Stems", description: "Separa voz e instrumentos del audio.", icon: "Waves" },
  { id: "voice", title: "Voz a Texto", description: "Transcribe notas de voz a texto.", icon: "Mic" },
  { id: "code", title: "Código", description: "Formatea y comparte código con estilo.", icon: "Code" },
  { id: "image", title: "Imágenes", description: "Convierte entre PNG, JPEG y WebP.", icon: "Image" },
  { id: "audio", title: "Limpiador", description: "Filtra y mejora archivos de audio.", icon: "Music" },
  { id: "ocr", title: "OCR", description: "Extrae texto de capturas de pantalla.", icon: "ScanText" },
  { id: "qr", title: "QR Pro", description: "Códigos QR con logo y colores.", icon: "QrCode" },
  { id: "palette", title: "Paleta", description: "Extrae colores dominantes de imágenes.", icon: "Palette" },
  { id: "text", title: "Texto", description: "Transforma, ordena y analiza texto.", icon: "Type" },
];

const toolComponents: Record<ToolId, React.ReactNode> = {
  threads: <ThreadGenerator />,
  video: <VideoConverter />,
  "image-gen": <ImageGenerator />,
  upscale: <ImageUpscaler />,
  "remove-bg": <RemoveBackground />,
  stem: <StemSplitter />,
  voice: <VoiceToText />,
  code: <CodeBeautifier />,
  image: <ImageConverter />,
  audio: <AudioCleaner />,
  ocr: <OCRExtractor />,
  qr: <QRGenerator />,
  palette: <ColorPaletteExtractor />,
  text: <TextUtils />,
};

const toolLabels: Record<ToolId, string> = {
  threads: "Generador de Hilos IA",
  video: "Video Converter Pro",
  "image-gen": "Generador de Imágenes IA",
  upscale: "Image Upscaler",
  "remove-bg": "Remove Background",
  stem: "Audio Stem Splitter",
  voice: "Voice to Text",
  code: "Code Snippet Beautifier",
  image: "Conversor de Imágenes",
  audio: "Limpiador de Audio",
  ocr: "Smart OCR",
  qr: "QR Generator Pro",
  palette: "Color Palette Generator",
  text: "Utilidades de Texto",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );
}

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToolChange = useCallback((tool: ToolId) => {
    setActiveTool(tool);
    setSidebarOpen(false);
  }, []);

  const handleBack = useCallback(() => {
    setActiveTool(null);
  }, []);

  // Neon accents per featured tool
  const featureAccent = (i: number): string => {
    if (i === 0) return "gradient-cyan-violet-text";
    if (i === 1) return "gradient-rose-cyan-text";
    if (i === 6) return "gradient-amber-violet-text";
    return "";
  };

  // Bento layout: column spans for featured hero tools
  const bentoSpan = (i: number): string => {
    if (i === 0) return "sm:col-span-2 sm:row-span-1";
    if (i === 1) return "sm:col-span-1 sm:row-span-2";
    if (i === 6) return "sm:col-span-2 sm:row-span-1";
    return "sm:col-span-1 sm:row-span-1";
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-white/[0.04]">
          <div className="flex items-center justify-between h-12 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg glass text-white/40 hover:text-white/70"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md gradient-cyan-violet">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Urban</span>
            </div>
            <div className="md:hidden" />
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl px-3 sm:px-6 py-4 sm:py-8">
          <AnimatePresence mode="wait">
            {activeTool ? (
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={handleBack}
                  className="group mb-5 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  <span className="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
                  Volver al dashboard
                </button>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-6 gradient-cyan-violet-text inline-block">
                  {toolLabels[activeTool]}
                </h2>
                <Suspense fallback={<LoadingFallback />}>
                  {toolComponents[activeTool]}
                </Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Suite <span className="gradient-rose-cyan-text">Creativa</span>
                  </h2>
                  <p className="text-sm text-white/35 max-w-lg mx-auto">
                    14 herramientas profesionales. Procesamiento en tu navegador.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {tools.map((tool, i) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className={bentoSpan(i)}
                    >
                      <ToolCard
                        id={tool.id}
                        title={tool.title}
                        description={tool.description}
                        onClick={() => setActiveTool(tool.id)}
                        featured={i === 0 || i === 1 || i === 6}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}
