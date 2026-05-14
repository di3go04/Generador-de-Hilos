import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ToolsGrid } from "@/components/ToolsGrid";
import { CheckCircle2, Zap, ShieldCheck, History } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
              <Zap className="w-4 h-4 fill-current" />
              <span>Suscripción Activa</span>
            </div>
            <h1 className="text-4xl font-black text-foreground">
              Hola, <span className="text-primary">{session.user.name}</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Tienes acceso ilimitado a todas las herramientas de la plataforma.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Estado del Plan</p>
                <p className="text-sm font-bold text-foreground">Plan Profesional</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
          </div>
        </div>

        {/* Stats / Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Uso de Hoy</p>
                 <p className="text-lg font-black">Ilimitado</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                 <Zap className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Herramientas</p>
                 <p className="text-lg font-black">10 Activas</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                 <History className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Historial</p>
                 <p className="text-lg font-black">Ver registros</p>
              </div>
           </div>
        </div>

        {/* Tools Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight px-1">Tu Suite Digital</h2>
          <ToolsGrid isLoggedIn={true} />
        </div>
      </main>

      <footer className="py-10 text-center text-xs text-muted-foreground font-medium">
        HerramientasPro Dashboard &bull; Versión 1.0.0
      </footer>
    </div>
  );
}
