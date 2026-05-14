import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { TOOLS } from "@/lib/tools-config";
import { canUserUseTool } from "@/lib/subscription";
import { AlertCircle, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ToolRenderer from "@/components/tools/ToolRenderer";

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tool = TOOLS.find((t) => t.slug === params.slug);
  if (!tool) notFound();

  const plan = (session.user as any).plan || "FREE";
  
  // Check Pro access
  if (tool.isPro && plan === "FREE") {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-10 h-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[var(--text-heading)]">Herramienta Pro</h2>
            <p className="text-[var(--text-muted)] max-w-sm">
              Esta herramienta es exclusiva para usuarios con un plan Pro o Empresarial.
            </p>
          </div>
          <Link href="/pricing" className="btn-primary px-8 py-3">
            Mejorar Plan
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // Check Daily Limit
  const allowed = await canUserUseTool(session.user.id!, plan);
  if (!allowed) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 p-8 bg-red-500/5 border border-red-500/10 rounded-3xl">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[var(--text-heading)]">Límite diario alcanzado</h2>
            <p className="text-[var(--text-muted)] max-w-md">
              Has agotado tus 3 usos diarios gratuitos. Suscríbete para obtener acceso ilimitado a todas nuestras herramientas.
            </p>
          </div>
          <div className="flex gap-4">
             <Link href="/dashboard" className="btn-secondary px-6">
                Volver al inicio
             </Link>
             <Link href="/pricing" className="btn-primary px-8">
                Ver planes Pro
             </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Volver a la suite
        </Link>

        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <tool.icon className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-[var(--text-heading)]">{tool.title}</h1>
              <p className="text-[var(--text-muted)]">{tool.description}</p>
           </div>
        </div>

        <div className="glass-card border border-[var(--border-main)] rounded-3xl p-8 min-h-[400px]">
           <ToolRenderer tool={tool} userId={session.user.id!} />
        </div>
      </div>
    </DashboardShell>
  );
}
