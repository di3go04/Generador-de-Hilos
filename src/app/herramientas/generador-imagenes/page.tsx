"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ImagePlus, Sparkles, Wand2, Download, 
  History, CreditCard, Layers, Palette, 
  Monitor, Zap, LayoutGrid, Layout, Square, 
  RectangleHorizontal, RefreshCw, Maximize2, Trash2
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

const phrases = [
  "Dando vida a tu visión...",
  "Esculpiendo cada píxel...",
  "Mezclando colores y sueños...",
  "Invocando la creatividad...",
  "Pintando con redes neuronales..."
];

export default function ImageGeneratorPro() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [ratio, setRatio] = useState("1:1");
  const [generating, setGenerating] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
  const [usage, setUsage] = useState({ used: 0, limit: 5, remaining: 5 });
  const [history, setHistory] = useState<any[]>([]);
  const [activeImg, setActiveImg] = useState<string | null>(null);

  // Polling de créditos cada 30s
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/ai/usage-status");
        const data = await res.json();
        setUsage(data);
      } catch (e) {}
    };
    fetchUsage();
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    
    // Cambiar frase cada 1.5s
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 1500);

    try {
      const response = await fetch("http://localhost:4000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant-Id": "tenant_001" },
        body: JSON.stringify({ prompt, style, aspect_ratio: ratio })
      });

      if (response.status === 402) {
        alert("Límite diario alcanzado. ¡Mejora tu plan!");
        return;
      }

      const data = await response.json();
      setHistory([{ id: Date.now(), url: `http://localhost:4000${data.url}`, prompt }, ...history]);
      setUsage(prev => ({ ...prev, remaining: data.remaining }));
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      clearInterval(phraseInterval);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFF8F0]">
      <Sidebar activeTool="image-gen" onToolChange={() => {}} mobileOpen={false} onMobileClose={() => {}} />

      <main className="flex-1 flex flex-col md:ml-80">
        <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-12 space-y-12">
          
          {/* Header & Quota Bar */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-brand-terracota/10 text-brand-terracota text-[10px] font-black uppercase tracking-widest rounded-full">Vision Engine SD3</span>
              </div>
              <h1 className="text-6xl font-black text-[#3D2C2A] tracking-tighter">Estudio de <span className="text-brand-terracota italic font-serif">Arte IA</span></h1>
            </div>
            
            <div className="glass-card px-8 py-5 rounded-[2rem] border-brand-terracota/20 min-w-[280px] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#7A6A63]">Uso Diario</span>
                <span className="text-xs font-bold text-[#3D2C2A]">{usage.used} / {usage.limit}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F2E9E4] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(usage.used/usage.limit)*100}%` }}
                  className="h-full bg-brand-terracota" 
                />
              </div>
              <p className="text-[9px] text-[#7A6A63] font-medium">Te quedan {usage.remaining} generaciones hoy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Control Panel */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass-card p-10 rounded-[3.5rem] border-white/40 shadow-premium space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-terracota">Tu Visión Creativa</label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ej: Un palacio de cristal flotando en un mar de nubes rosadas, iluminación volumétrica, 8k..."
                      className="w-full h-44 p-7 rounded-[2.5rem] bg-[#FFF8F0]/50 border border-[#F2E9E4] outline-none focus:ring-4 ring-brand-terracota/10 transition-all resize-none text-base font-medium"
                    />
                    <button onClick={() => setPrompt("")} className="absolute bottom-6 right-6 p-2 text-[#7A6A63] hover:text-brand-terracota transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6A63]">Estilo</label>
                    <select 
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white border border-[#F2E9E4] text-xs font-bold appearance-none outline-none focus:border-brand-terracota"
                    >
                      <option value="realistic">Fotorealista</option>
                      <option value="illustration">Ilustración</option>
                      <option value="pixel">Pixel Art</option>
                      <option value="3d">Render 3D</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6A63]">Formato</label>
                    <div className="flex gap-2">
                      {["1:1", "16:9", "9:16"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRatio(r)}
                          className={`flex-1 py-3 rounded-xl border text-[10px] font-black transition-all
                            ${ratio === r ? "bg-brand-terracota text-white border-brand-terracota shadow-md" : "bg-white border-[#F2E9E4] text-[#7A6A63]"}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!prompt || generating}
                  className="w-full py-6 bg-brand-terracota text-white rounded-[2.5rem] font-black tracking-tight shadow-[0_20px_40px_-10px_rgba(226,114,91,0.4)] flex items-center justify-center gap-4 relative overflow-hidden group"
                >
                  <AnimatePresence mode="wait">
                    {generating ? (
                      <motion.div key="loading" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span className="italic">{currentPhrase}</span>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ y: -20 }} animate={{ y: 0 }} className="flex items-center gap-3">
                        <Wand2 className="w-6 h-6" />
                        <span>MATERIALIZAR OBRA</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Ripple Effect Background */}
                  <div className="absolute inset-0 bg-white/20 scale-x-0 group-active:scale-x-100 transition-transform origin-left duration-700" />
                </motion.button>
              </div>
            </div>

            {/* Gallery Panel */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-black text-[#3D2C2A] flex items-center gap-3">
                  <History className="w-5 h-5 text-brand-terracota" />
                  Creaciones Recientes
                </h3>
              </div>

              <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                <AnimatePresence initial={false}>
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="group relative glass-card rounded-[2.5rem] overflow-hidden cursor-zoom-in border-white/40 shadow-premium"
                      onClick={() => setActiveImg(item.url)}
                    >
                      <img src={item.url} alt={item.prompt} className="w-full h-auto transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3D2C2A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all p-8 flex flex-col justify-end">
                        <p className="text-white text-xs font-medium line-clamp-2 italic mb-4">"{item.prompt}"</p>
                        <div className="flex gap-3">
                          <button className="flex-1 py-3 bg-white text-[#3D2C2A] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-terracota hover:text-white transition-colors">
                            Descargar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {history.length === 0 && !generating && (
                  <div className="h-[500px] w-full flex flex-col items-center justify-center text-center opacity-20 border-4 border-dashed border-[#F2E9E4] rounded-[4rem]">
                    <ImagePlus className="w-20 h-20 mb-6" />
                    <p className="text-sm font-black uppercase tracking-[0.4em]">El lienzo está vacío</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImg(null)}
            className="fixed inset-0 z-[100] bg-[#3D2C2A]/90 backdrop-blur-2xl flex items-center justify-center p-8 sm:p-24"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="relative glass-card p-3 rounded-[4rem] border-white/20 overflow-hidden max-w-6xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <img src={activeImg} alt="Preview" className="w-full h-auto rounded-[3.8rem]" />
              <div className="absolute top-10 right-10 flex gap-4">
                <button onClick={() => setActiveImg(null)} className="w-14 h-14 rounded-full bg-white text-[#3D2C2A] flex items-center justify-center hover:bg-brand-terracota hover:text-white transition-all shadow-xl">
                  <Maximize2 className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
