"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Users, CreditCard, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { user, tenant, loading } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usage, setUsage] = useState<{ conversions: number; ai_generations: number } | null>(null);

  useEffect(() => {
    if (tenant) setName(tenant.name);
    api.getCurrentUsage().then(setUsage).catch(() => {});
  }, [tenant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateTenant({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  const planLimits = {
    free: { conversions: 5, ai: 10 },
    pro: { conversions: 100, ai: 500 },
    enterprise: { conversions: -1, ai: -1 },
  };

  const limits = planLimits[tenant?.plan || "free"];

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-3xl mx-auto">
      <button onClick={() => router.push("/")}
        className="group mb-6 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 inline-block transition-transform group-hover:-translate-x-1" />
        Volver al dashboard
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">Configuración</h1>

      <div className="space-y-6">
        {/* ── Profile ─────────────────────────────────── */}
        <section className="rounded-2xl glass p-5 border border-white/[0.04]">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Perfil
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Email</label>
              <p className="text-sm text-white/80">{user?.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Rol</label>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-medium">
                {user?.role === "admin" ? "Admin" : "Miembro"}
              </span>
            </div>
          </div>
        </section>

        {/* ── Tenant ──────────────────────────────────── */}
        <section className="rounded-2xl glass p-5 border border-white/[0.04]">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            Espacio de trabajo
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="tenant-name" className="block text-xs font-medium text-white/50 mb-1">
                Nombre
              </label>
              <input
                id="tenant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl glass px-4 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Slug</label>
              <p className="text-sm text-white/80">{tenant?.slug}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Plan</label>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                tenant?.plan === "pro" ? "bg-amber-500/15 text-amber-300" :
                tenant?.plan === "enterprise" ? "bg-violet-500/15 text-violet-300" :
                "bg-white/5 text-white/40"
              }`}>
                {tenant?.plan === "pro" ? "Pro" : tenant?.plan === "enterprise" ? "Enterprise" : "Gratuito"}
              </span>
            </div>

            {user?.role === "admin" && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-xs font-semibold text-white transition-all"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saved ? "Guardado" : "Guardar cambios"}
              </motion.button>
            )}
          </div>
        </section>

        {/* ── Usage ───────────────────────────────────── */}
        <section className="rounded-2xl glass p-5 border border-white/[0.04]">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Uso del mes
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs text-white/40 mb-1">Conversiones</p>
              <p className="text-2xl font-bold text-white">{usage?.conversions ?? 0}</p>
              <p className="text-[10px] text-white/30 mt-1">
                {limits.conversions === -1 ? "Ilimitado" : `límite ${limits.conversions}/mes`}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs text-white/40 mb-1">Generaciones IA</p>
              <p className="text-2xl font-bold text-white">{usage?.ai_generations ?? 0}</p>
              <p className="text-[10px] text-white/30 mt-1">
                {limits.ai === -1 ? "Ilimitado" : `límite ${limits.ai}/mes`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
