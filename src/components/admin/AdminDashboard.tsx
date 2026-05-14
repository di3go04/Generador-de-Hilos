"use client";

import { useState } from "react";
import { Users, FileText, TrendingUp, Shield, Ban, Crown } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  stats: { totalUsers: number; totalThreads: number };
  recentUsers: Array<{
    id: string; name: string | null; email: string; plan: string;
    createdAt: Date; banned: boolean; _count: { threads: number };
  }>;
  planCounts: Array<{ plan: string; _count: number }>;
}

const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600 dark:bg-gray-800",
  PRO: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  ENTERPRISE: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

export default function AdminDashboard({ stats, recentUsers, planCounts }: Props) {
  const [users, setUsers] = useState(recentUsers);
  const [loading, setLoading] = useState<string | null>(null);

  async function action(userId: string, act: string, value?: string) {
    setLoading(userId + act);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: act, value }),
      });
      if (!res.ok) throw new Error();
      toast.success("Acción aplicada");
      // Update local state
      setUsers((prev) => prev.map((u) =>
        u.id === userId
          ? { ...u, banned: act === "ban" ? true : act === "unban" ? false : u.banned, plan: act === "setPlan" ? value! : u.plan }
          : u
      ));
    } catch { toast.error("Error al aplicar acción"); }
    finally { setLoading(null); }
  }

  const freeCount = planCounts.find((p) => p.plan === "FREE")?._count ?? 0;
  const proCount = planCounts.find((p) => p.plan === "PRO")?._count ?? 0;
  const entCount = planCounts.find((p) => p.plan === "ENTERPRISE")?._count ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">Panel de Administración</h1>
          <p className="text-sm text-[var(--text-muted)]">Gestiona usuarios, planes y estadísticas globales</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Usuarios", value: stats.totalUsers, icon: Users, color: "indigo" },
          { label: "Total Hilos", value: stats.totalThreads, icon: FileText, color: "emerald" },
          { label: "Plan Free", value: freeCount, icon: TrendingUp, color: "gray" },
          { label: "Plan Pro", value: proCount + entCount, icon: Crown, color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-[var(--text-heading)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border-main)]">
          <h2 className="font-semibold text-[var(--text-heading)]">Usuarios recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-main)]">
                {["Usuario", "Email", "Plan", "Hilos", "Registro", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {users.map((u) => (
                <tr key={u.id} className={u.banned ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--text-heading)] truncate max-w-[120px]">
                      {u.name ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] truncate max-w-[160px]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${PLAN_BADGE[u.plan]}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{u._count.threads}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                    {new Date(u.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => action(u.id, u.banned ? "unban" : "ban")}
                        disabled={loading === u.id + (u.banned ? "unban" : "ban")}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          u.banned
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <Ban className="w-3 h-3 inline mr-1" />
                        {u.banned ? "Desban" : "Banear"}
                      </button>
                      <select
                        onChange={(e) => { if (e.target.value) action(u.id, "setPlan", e.target.value); }}
                        className="px-2 py-1 rounded-lg text-xs border border-[var(--border-main)] bg-white dark:bg-gray-800 focus:outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>Plan...</option>
                        <option value="FREE">Free</option>
                        <option value="PRO">Pro</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
