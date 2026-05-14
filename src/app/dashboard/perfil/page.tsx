import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { db } from "@/lib/db";
import { User, Shield, CreditCard, Clock } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { subscriptions: true }
  });

  return (
    <DashboardShell>
      <div className="max-w-4xl space-y-10">
        <div>
           <h1 className="text-3xl font-black text-[var(--text-heading)]">Mi Cuenta</h1>
           <p className="text-[var(--text-muted)]">Gestiona tu perfil y detalles de suscripción.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Perfil */}
           <div className="glass-card border border-[var(--border-main)] rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 text-indigo-600 font-bold">
                 <User className="w-5 h-5" />
                 <span>Información Personal</span>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Nombre</label>
                    <p className="text-lg font-bold text-[var(--text-heading)]">{user?.name || "No definido"}</p>
                 </div>
                 <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Email</label>
                    <p className="text-lg font-bold text-[var(--text-heading)]">{user?.email}</p>
                 </div>
                 <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Rol</label>
                    <div className="flex mt-1">
                       <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-black uppercase tracking-wider border border-indigo-500/20">
                          {user?.role}
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Suscripción */}
           <div className="glass-card border border-[var(--border-main)] rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 text-amber-600 font-bold">
                 <CreditCard className="w-5 h-5" />
                 <span>Plan Actual</span>
              </div>
              <div className="space-y-6">
                 <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <h3 className="text-2xl font-black text-amber-600 uppercase tracking-tight">{user?.plan}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                       {user?.plan === "FREE" ? "Plan básico con límites diarios." : "Acceso total a todas las herramientas."}
                    </p>
                 </div>
                 
                 <div className="flex items-center gap-3 text-sm font-medium text-[var(--text-muted)]">
                    <Clock className="w-4 h-4" />
                    <span>Miembro desde {user?.createdAt.toLocaleDateString()}</span>
                 </div>

                 <button className="w-full py-4 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-2xl font-bold hover:opacity-90 transition-opacity">
                    {user?.plan === "FREE" ? "Mejorar Suscripción" : "Gestionar Pagos"}
                 </button>
              </div>
           </div>
        </div>

        {/* Seguridad (Placeholder) */}
        <div className="glass-card border border-[var(--border-main)] rounded-3xl p-8">
            <div className="flex items-center gap-3 text-red-600 font-bold mb-6">
                 <Shield className="w-5 h-5" />
                 <span>Seguridad</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">
               ¿Quieres cambiar tu contraseña o activar la autenticación de dos factores?
            </p>
            <button className="px-6 py-3 border border-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-500/5 transition-colors">
               Cambiar Contraseña
            </button>
        </div>
      </div>
    </DashboardShell>
  );
}
