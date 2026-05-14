"use client";

import { motion } from "framer-motion";
import { 
  ImagePlus, BarChart3, Clock, 
  ArrowUpRight, Sparkles, Zap
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

export default function DashboardPage() {
  const stats = [
    { label: "Imágenes Generadas", value: "24", icon: ImagePlus, color: "text-brand-terracota" },
    { label: "Créditos Usados", value: "85%", icon: BarChart3, color: "text-emerald-500" },
    { label: "Tiempo Ahorrado", value: "12h", icon: Clock, color: "text-blue-500" },
  ];

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar activeTool="dashboard" onToolChange={() => {}} />

      <main className="flex-1 flex flex-col md:ml-80">
        <div className="flex-1 max-w-6xl mx-auto w-full px-8 py-12 space-y-12">
          
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-brand-earth tracking-tighter">Bienvenido, <span className="text-brand-terracota italic font-serif">Mafer Clavijo</span></h1>
            <p className="text-brand-earth/40 font-medium">Aquí tienes el resumen de tu actividad creativa hoy.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] border-white/10 shadow-premium flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth/30">{stat.label}</p>
                  <p className="text-3xl font-black text-brand-earth">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-brand-sand dark:bg-stone-800 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-premium bg-brand-terracota/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-terracota/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-2xl bg-brand-terracota text-white flex items-center justify-center shadow-premium">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-terracota">Nuevo en Urban</p>
                      <h3 className="text-2xl font-black text-brand-earth">Generador de Imágenes v3.0</h3>
                    </div>
                  </div>
                  <p className="text-brand-earth/60 font-medium max-w-md">
                    Hemos actualizado el motor de visión artificial. Ahora tus prompts son 40% más precisos y el renderizado es casi instantáneo.
                  </p>
                  <button className="flex items-center gap-3 py-4 px-8 bg-brand-terracota text-white rounded-2xl font-black tracking-tight shadow-glow-terracota hover:scale-105 transition-transform">
                    Probar ahora <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Dash */}
            <div className="lg:col-span-4 space-y-8">
              <div className="glass-card p-8 rounded-[3rem] border-white/10 shadow-premium space-y-6">
                <h4 className="text-sm font-black text-brand-earth uppercase tracking-widest border-b border-brand-earth/5 pb-4">Uso de Créditos</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-brand-earth/40">Generaciones IA</span>
                    <span className="text-brand-earth">85/100</span>
                  </div>
                  <div className="w-full h-2 bg-brand-sand dark:bg-stone-900 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-terracota w-[85%]" />
                  </div>
                  <p className="text-[10px] text-brand-earth/30 font-medium italic">Tu cuota Pro se reinicia en 12 días.</p>
                </div>
                <button className="w-full py-4 bg-brand-sand dark:bg-stone-800 text-brand-earth/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-terracota/10 hover:text-brand-terracota transition-colors">
                  Mejorar Plan <Zap className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
