"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ImagePlus, Sparkles, Wand2, Download, 
  RefreshCw, Layers, Palette, Maximize2, 
  Loader2, CheckCircle2, Trash2, MagicWand,
  Monitor, Zap, Globe, Share2, Edit3
} from "lucide-react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("cinematic");

  const styles = [
    { id: "cinematic", label: "Cinematic", icon: Monitor, color: "border-violet-500/50 shadow-violet-500/20" },
    { id: "organic", label: "Orgánico", icon: Zap, color: "border-emerald-500/50 shadow-emerald-500/20" },
    { id: "3d", label: "Render 3D", icon: Layers, color: "border-cyan-500/50 shadow-cyan-500/20" }
  ];

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setResultImage(null);
    await new Promise(r => setTimeout(r, 3500));
    setResultImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop");
    setGenerating(false);
  };

  const magicPrompt = () => {
    setPrompt("Un paisaje surrealista de montañas de cristal bajo un cielo púrpura eléctrico, estilo cinemático de alta fidelidad, 8k, detalles intrincados.");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Dynamic Server Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-terracota/10 flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-brand-terracota" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-brand-earth tracking-tighter">AI Vision</h2>
            <p className="text-[10px] font-black text-brand-earth/30 uppercase tracking-widest italic">Stable Diffusion Engine v4.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border-brand-terracota/20 shadow-[0_0_20px_rgba(226,114,91,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-earth/40">SERVER: LOCAL-ENGINE-1</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        {/* Left: Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/10 shadow-premium h-full flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-terracota">Configuración de Estilo</label>
                <div className="grid grid-cols-1 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className={`
                        relative group flex items-center justify-between p-4 rounded-2xl border transition-all duration-500
                        ${selectedStyle === s.id 
                          ? `bg-brand-terracota/5 text-brand-earth ${s.color} border-2 shadow-lg` 
                          : "bg-white/40 dark:bg-black/20 border-brand-earth/5 text-brand-earth/40 hover:border-brand-terracota/20"}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${selectedStyle === s.id ? "bg-brand-terracota text-white" : "bg-brand-sand dark:bg-stone-800"}`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-black tracking-tight">{s.label}</span>
                      </div>
                      {selectedStyle === s.id && <CheckCircle2 className="w-5 h-5 text-brand-terracota" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-terracota">Creative Prompt</label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Escribe tu visión aquí..."
                    className="w-full h-48 p-6 rounded-[2rem] bg-stone-950 text-white/80 border border-white/5 outline-none 
                               focus:ring-4 ring-brand-terracota/10 focus:border-brand-terracota/30 transition-all resize-none text-base font-medium leading-relaxed"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                      onClick={magicPrompt}
                      className="p-2.5 rounded-xl bg-brand-terracota/10 text-brand-terracota hover:bg-brand-terracota hover:text-white transition-all border border-brand-terracota/20"
                      title="Magic Prompt"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPrompt("")}
                      className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!prompt || generating}
              className={`
                w-full py-6 rounded-2xl font-black tracking-tighter text-xl flex items-center justify-center gap-4
                bg-gradient-to-r from-brand-terracota to-orange-500 text-white shadow-[0_20px_40px_-10px_rgba(226,114,91,0.5)]
                ${(!prompt || generating) && "opacity-50 grayscale cursor-not-allowed"}
              `}
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>MATERIALIZANDO...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6" />
                  <span>CREAR ARTE IA</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Right: Canvas */}
        <div className="lg:col-span-7">
          <div className="relative group h-full glass-card rounded-[4rem] border-white/10 overflow-hidden shadow-2xl flex items-center justify-center bg-stone-950">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-brand-terracota/30 rounded-full blur-[80px] animate-pulse" />
                    <RefreshCw className="w-16 h-16 text-brand-terracota animate-spin-slow relative z-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-black text-white tracking-tighter uppercase italic">Esculpiendo Pixeles</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] animate-pulse">Neural Render Engine Active</p>
                  </div>
                </motion.div>
              ) : resultImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full relative"
                >
                  <img 
                    src={resultImage} 
                    alt="AI Generated" 
                    className="w-full h-full object-cover shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)]"
                  />
                  
                  {/* Result Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="absolute top-8 left-8 right-8 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-y-4 group-hover:translate-y-0">
                    <div className="glass-card px-4 py-2 rounded-xl border-white/10 text-white flex items-center gap-2 backdrop-blur-xl">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Publicado en el Feed</span>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                    <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-premium">
                      <Download className="w-5 h-5" />
                      Descargar
                    </button>
                    <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 text-white backdrop-blur-xl font-black text-sm border border-white/10 hover:bg-white/20 hover:scale-105 transition-all">
                      <Edit3 className="w-5 h-5" />
                      Variaciones
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-6 opacity-20 text-brand-earth">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-brand-earth/20 flex items-center justify-center">
                    <ImagePlus className="w-12 h-12" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.5em]">Lienzo Inactivo</p>
                </div>
              )}
            </AnimatePresence>

            {/* Canvas Physical Border */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
