import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { db } from "@/lib/db";
import { BarChart, Activity, Clock, Zap } from "lucide-react";

export default async function UsagePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const usageRecords = await db.usageRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const totalUsage = await db.usageRecord.count({
    where: { userId: session.user.id }
  });

  const plan = (session.user as any).plan || "FREE";

  return (
    <DashboardShell>
      <div className="space-y-10">
        <div>
           <h1 className="text-3xl font-black text-[var(--text-heading)]">Mi Consumo</h1>
           <p className="text-[var(--text-muted)]">Historial de uso de herramientas y límites del plan.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-6 rounded-3xl border border-[var(--border-main)]">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Activity className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Total histórico</span>
              </div>
              <p className="text-3xl font-black text-[var(--text-heading)]">{totalUsage} <span className="text-sm font-medium text-gray-400">usos</span></p>
           </div>

           <div className="glass-card p-6 rounded-3xl border border-[var(--border-main)]">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                    <Zap className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Límite Diario</span>
              </div>
              <p className="text-3xl font-black text-[var(--text-heading)]">
                 {plan === "FREE" ? "3" : "∞"} <span className="text-sm font-medium text-gray-400">por día</span>
              </p>
           </div>

           <div className="glass-card p-6 rounded-3xl border border-[var(--border-main)]">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <BarChart className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Plan</span>
              </div>
              <p className="text-3xl font-black text-amber-600">{plan}</p>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card border border-[var(--border-main)] rounded-3xl overflow-hidden">
           <div className="p-6 border-b border-[var(--border-main)] bg-gray-50/50 dark:bg-white/5">
              <h3 className="font-bold text-[var(--text-heading)] flex items-center gap-2">
                 <Clock className="w-4 h-4" /> Actividad Reciente
              </h3>
           </div>
           <div className="divide-y divide-[var(--border-main)]">
              {usageRecords.length > 0 ? usageRecords.map((record) => (
                <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="font-bold text-sm text-[var(--text-heading)] capitalize">{record.toolSlug.replace(/-/g, " ")}</span>
                   </div>
                   <span className="text-xs text-[var(--text-muted)]">
                      {new Date(record.createdAt).toLocaleString()}
                   </span>
                </div>
              )) : (
                <div className="p-10 text-center text-[var(--text-muted)] text-sm">
                   Aún no has usado ninguna herramienta.
                </div>
              )}
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
