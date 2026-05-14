"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import { tools } from "@/app/herramientas/toolsData";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import ToolRenderer from "@/components/tools/ToolRenderer";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export default function PublicToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const { usage, hasReachedLimit, incrementUsage, limit } = useUsageLimit();
  const tool = tools.find((t) => t.slug === resolvedParams.slug);

  if (!tool) notFound();

  const isLoggedIn = status === "authenticated";
  
  const handleAction = async (action: () => Promise<any>) => {
    if (!isLoggedIn && hasReachedLimit) {
      return;
    }
    
    const result = await action();
    
    if (!isLoggedIn) {
      incrementUsage();
    } else {
      await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: tool.slug }),
      });
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 flex flex-col">
      <Toaster />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12 space-y-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </Link>

        {/* Tool Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="text-5xl w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm flex items-center justify-center">
                {tool.icon}
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl font-black text-foreground tracking-tight">{tool.name}</h1>
                  {isLoggedIn && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </div>
                <p className="text-muted-foreground font-medium text-lg">{tool.description}</p>
            </div>
          </div>

          {isLoggedIn ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-2xl flex items-center gap-3">
               <ShieldCheck className="w-5 h-5" />
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Modo</p>
                  <p className="text-sm font-bold">Acceso Ilimitado</p>
               </div>
            </div>
          ) : (
             <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-2xl flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Uso Gratis</p>
                  <p className="text-sm font-bold">{usage} / {limit} hoy</p>
               </div>
            </div>
          )}
        </div>

        {/* Tool Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-2xl shadow-slate-200/50 dark:shadow-black/20 p-8 md:p-16 min-h-[500px] relative overflow-hidden">
          {(!isLoggedIn && hasReachedLimit) ? (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-8">
               <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
               </div>
               <h2 className="text-3xl font-black text-foreground mb-3">Límite gratuito alcanzado</h2>
               <p className="text-muted-foreground max-w-sm mb-10 text-lg font-medium">
                 Has usado tus {limit} intentos de hoy. Crea una cuenta gratuita para disfrutar de acceso ilimitado.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                  <Link href="/register" className="btn-primary py-5 text-lg font-bold flex-1">Crear Cuenta Gratis</Link>
                  <Link href="/login" className="btn-outline py-5 text-lg font-bold flex-1">Iniciar Sesión</Link>
               </div>
            </div>
          ) : (
            <div className="relative z-0">
               <ToolRenderer tool={tool as any} userId={session?.user?.id || "anonymous"} customAction={handleAction} />
            </div>
          )}
        </div>

        {!isLoggedIn && (
           <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                ¿Sabías que si te registras puedes usar todas las herramientas sin límites?
              </p>
              <Link href="/register" className="text-primary font-bold text-sm hover:underline">Registrarse ahora</Link>
           </div>
        )}
      </main>

      <footer className="py-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
        HerramientasPro &bull; Producto de Software Profesional &bull; 2026
      </footer>
    </div>
  );
}
