"use client";

import { useState } from "react";
import { 
  Key, Plus, Trash2, Copy, 
  Check, Shield, AlertCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([
    { id: "1", name: "Producción", key: "sk_live_********************", createdAt: "10 May 2026", lastUsed: "Hoy" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleCreateKey = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const newKey = {
      id: Math.random().toString(),
      name: "Nueva Key",
      key: "sk_live_" + Math.random().toString(36).substring(7).padEnd(20, "*"),
      createdAt: "Hoy",
      lastUsed: "Nunca"
    };
    setKeys([...keys, newKey]);
    setLoading(false);
    toast.success("API Key generada con éxito");
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter">API Keys</h1>
            <p className="text-[var(--text-muted)] font-medium">Gestiona tus claves para acceder a la API pública.</p>
          </div>
          <button 
            onClick={handleCreateKey}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generar nueva Key
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card p-6 rounded-3xl border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-widest">Aviso de Seguridad</p>
              <p className="text-sm text-amber-800/70 dark:text-amber-200/60 leading-relaxed">
                Tus claves de API otorgan acceso completo a tu cuenta. Nunca las compartas ni las subas a repositorios públicos.
                Si crees que una clave ha sido comprometida, revócala inmediatamente.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] border-[var(--border-main)] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-[var(--border-main)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">API Key</th>
                  <th className="px-6 py-4">Creada</th>
                  <th className="px-6 py-4">Último uso</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[var(--text-heading)]">{k.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">{k.key}</td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{k.createdAt}</td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{k.lastUsed}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-indigo-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 glass-card rounded-[3rem] border-indigo-600/10 bg-indigo-600/5 space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-[var(--text-heading)]">Documentación API</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Nuestra API te permite integrar la generación de hilos directamente en tus aplicaciones o flujos de trabajo personalizados.
              Consulta la documentación completa para conocer los endpoints disponibles y límites por plan.
            </p>
            <a 
              href="/api/docs" 
              className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
            >
              Ver Documentación OpenAPI →
            </a>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
