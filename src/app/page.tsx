"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeft, Sparkles, ArrowRight, Loader2, Zap } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ToolCard from "@/components/dashboard/ToolCard";
import Footer from "@/components/layout/Footer";
import type { ToolId, ToolConfig } from "@/types";

const LoadingFallback = () => (
  <div className="h-96 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
  </div>
);

// Lazy loading optimizado con next/dynamic
const ThreadGenerator = dynamic(() => import("@/components/thread-generator/ThreadGenerator"), { loading: LoadingFallback });
const VideoConverter   = dynamic(() => import("@/components/video-converter/VideoConverter"), { loading: LoadingFallback });
const ImageGenerator   = dynamic(() => import("@/components/image-gen/ImageGenerator"), { loading: LoadingFallback });
const VoiceToText      = dynamic(() => import("@/components/voice/VoiceToText"), { loading: LoadingFallback });

const tools: ToolConfig[] = [
  { id: "threads",   title: "Hilos IA",    description: "Narrativas virales diseñadas para conectar de forma orgánica.",  icon: "Sparkles"  },
  { id: "video",     title: "Video Pro",   description: "Procesamiento inteligente para videos de alta fidelidad.",                  icon: "Video"     },
  { id: "image-gen", title: "Imagen IA",   description: "Crea visuales sorprendentes desde conceptos abstractos.",                          icon: "ImagePlus" },
  { id: "voice",     title: "Voz a Texto", description: "Transcripción impecable con detección de entonación.",                             icon: "Mic"       },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTool = searchParams.get("tool") as ToolId | null;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToolChange = (tool: ToolId | null) => {
    if (tool) {
      router.push(`/?tool=${tool}`);
    } else {
      router.push(`/`);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 md:ml-80 transition-all duration-700">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 px-8 py-5 flex items-center justify-between
                           bg-main/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
          {/* Hamburger — mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden glass-card p-2.5 rounded-xl text-text-heading/50 hover:text-text-heading"
            aria-label="Abrir menú"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          {/* Status badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full
                          bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5
                          text-[10px] font-black uppercase tracking-widest opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistemas: Online</span>
          </div>
        </header>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="flex-1 max-w-[1200px] mx-auto w-full px-8 pb-12">
          <AnimatePresence mode="wait">

            {/* ── Active tool view ─────────────────────────────── */}
            {activeTool ? (
              <motion.div
                key="tool-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-8 pt-10"
              >
                <div className="flex items-center">
                  <button
                    onClick={() => handleToolChange(null)}
                    className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center group-hover:bg-brand-accent/10 group-hover:border-brand-accent/20 transition-all">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </div>
                    Volver al Dashboard
                  </button>
                </div>

                <div className="glass-card p-10 sm:p-14 rounded-3xl min-h-[600px]">
                  {activeTool === "threads"   && <ThreadGenerator />}
                  {activeTool === "video"     && <VideoConverter />}
                  {activeTool === "image-gen" && <ImageGenerator />}
                  {activeTool === "voice"     && <VoiceToText />}
                </div>
              </motion.div>

            ) : (
              /* ── Dashboard hero ────────────────────────────── */
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-16"
              >
                {/* Hero section */}
                <div className="space-y-6 pt-16 max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-[10px] font-black uppercase tracking-widest"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Urban Studio v3.5</span>
                  </motion.div>

                  <h1 className="text-5xl sm:text-7xl font-bold leading-[1.1]">
                    IA con calidez <br />
                    <span className="text-brand-accent italic font-serif tracking-tight">humana.</span>
                  </h1>

                  <p className="text-lg leading-relaxed opacity-60">
                    Herramientas inteligentes diseñadas para potenciar tu flujo de trabajo creativo sin sacrificar la esencia personal.
                  </p>
                </div>

                {/* Tool cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {tools.map((tool, i) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ToolCard
                        {...tool}
                        onClick={() => handleToolChange(tool.id)}
                        featured={i === 0}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-main">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
