"use client";

import { useState } from "react";
import { 
  Twitter, CheckCircle2, AlertCircle, 
  RefreshCw, Settings, ExternalLink,
  ShieldCheck, Loader2, XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function TwitterIntegrationPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    // Simular el inicio de OAuth
    await new Promise(r => setTimeout(r, 1500));
    window.location.href = "/api/twitter/connect";
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter">Conexión con X</h1>
            <p className="text-[var(--text-muted)] font-medium">Publica y programa tus hilos directamente desde la plataforma.</p>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest ${
            connected ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-[var(--text-muted)] border-[var(--border-main)]"
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            {connected ? "Conectado" : "Desconectado"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Card */}
          <div className="md:col-span-7 space-y-6">
            <div className="glass-card p-10 rounded-[3rem] border-[var(--border-main)] text-center space-y-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 flex items-center justify-center shadow-2xl relative z-10">
                  <Twitter className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-sky-500/20 blur-[40px] rounded-full animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--text-heading)] tracking-tight">
                  {connected ? "@di3go04_dev" : "Vincula tu cuenta de X"}
                </h2>
                <p className="text-[var(--text-muted)] leading-relaxed text-sm">
                  {connected 
                    ? "Tu cuenta está vinculada y lista para publicar. Podrás programar hilos y ver estadísticas de engagement." 
                    : "Necesitamos permiso para publicar hilos en tu nombre. No leeremos tus DMs ni publicaremos nada sin tu consentimiento."
                  }
                </p>
              </div>

              {connected ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 btn-ghost py-4 flex items-center justify-center gap-2 border border-red-500/20 text-red-500 hover:bg-red-50">
                    <XCircle className="w-4 h-4" />
                    Desconectar
                  </button>
                  <button className="flex-1 btn-primary py-4 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refrescar Token
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-black tracking-tighter shadow-xl shadow-indigo-500/20"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Twitter className="w-6 h-6" />}
                  CONECTAR CON X
                </button>
              )}
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-[var(--border-main)] flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[var(--text-heading)]">Seguridad de Datos</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Usamos OAuth 2.0 y encriptación AES-256 para proteger tus tokens de acceso. Tus datos están seguros y puedes revocar el acceso en cualquier momento desde aquí o desde la configuración de tu cuenta en X.
                </p>
              </div>
            </div>
          </div>

          {/* Features / Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-[var(--border-main)] space-y-6">
              <h3 className="font-black text-[var(--text-heading)] uppercase tracking-widest text-xs">Beneficios de Conexión</h3>
              <ul className="space-y-4">
                {[
                  { icon: CheckCircle2, text: "Publicación con un solo clic" },
                  { icon: CheckCircle2, text: "Programación ilimitada" },
                  { icon: CheckCircle2, text: "Analíticas de engagement" },
                  { icon: CheckCircle2, text: "Auto-retweet opcional" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-muted)] font-medium">
                    <item.icon className="w-4 h-4 text-emerald-500" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-amber-500/10 bg-amber-500/5 space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Atención</span>
              </div>
              <p className="text-xs text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                Asegúrate de que tu cuenta de X no tenga activada la protección de tweets si deseas que tus hilos sean públicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
