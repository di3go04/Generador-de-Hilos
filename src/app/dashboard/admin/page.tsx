import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { db } from "@/lib/db";
import { Users, CreditCard, Tool, BarChart3, TrendingUp } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const stats = {
    totalUsers: await db.user.count(),
    totalPro: await db.user.count({ where: { plan: "PRO" } }),
    totalUsage: await db.usageRecord.count(),
    recentUsers: await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    })
  };

  return (
    <DashboardShell>
      <div className="space-y-10">
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-black text-[var(--text-heading)]">Panel de Administración</h1>
              <p className="text-[var(--text-muted)]">Estadísticas globales de Urban Suite.</p>
           </div>
           <div className="px-4 py-2 bg-red-500/10 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-500/20">
              Acceso Restringido
           </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: "Usuarios", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
             { label: "Suscripciones Pro", value: stats.totalPro, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-500/10" },
             { label: "Ejecuciones Totales", value: stats.totalUsage, icon: BarChart3, color: "text-purple-600", bg: "bg-purple-500/10" },
             { label: "Conversión", value: `${((stats.totalPro / stats.totalUsers) * 100).toFixed(1)}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-500/10" },
           ].map((stat) => (
             <div key={stat.label} className="glass-card p-6 rounded-3xl border border-[var(--border-main)]">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                   <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-[var(--text-heading)]">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Recent Users */}
           <div className="glass-card border border-[var(--border-main)] rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-[var(--border-main)] bg-gray-50/50 dark:bg-white/5">
                 <h3 className="font-bold text-[var(--text-heading)]">Usuarios Recientes</h3>
              </div>
              <div className="divide-y divide-[var(--border-main)]">
                 {stats.recentUsers.map((u) => (
                   <div key={u.id} className="p-4 flex items-center justify-between">
                      <div>
                         <p className="text-sm font-bold text-[var(--text-heading)]">{u.name || "Sin nombre"}</p>
                         <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase ${u.plan === "PRO" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                         {u.plan}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="space-y-6">
              <div className="glass-card p-8 rounded-3xl border border-[var(--border-main)] bg-indigo-600 text-white">
                 <h3 className="text-xl font-bold mb-2">Acciones de Emergencia</h3>
                 <p className="text-indigo-100 text-sm mb-6">Herramientas globales para el mantenimiento de la plataforma.</p>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-sm transition-colors">Limpiar Caché</button>
                    <button className="bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-sm transition-colors">Enviar Newsletter</button>
                    <button className="bg-red-500 hover:bg-red-600 py-3 rounded-xl font-bold text-sm transition-colors col-span-2">Mantenimiento Global</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
