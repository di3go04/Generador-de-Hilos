import { Navbar } from "@/components/Navbar";
import { ToolsGrid } from "@/components/ToolsGrid";
import { auth } from "@/auth";
import { Sparkles, ArrowRight, ShieldCheck, Zap, ServerOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>La Suite Digital Definitiva</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              10 herramientas pro <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                directo en tu navegador.
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Convierte videos, extrae PDFs, acorta URLs y más. Sin subir tus archivos a servidores oscuros. 
              Todo ocurre localmente para máxima velocidad y privacidad.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="#tools" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group">
                Explorar herramientas
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!session && (
                <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Crear cuenta gratis
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">¿Por qué elegir HerramientasPro?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Diseñadas pensando en la eficiencia, seguridad y experiencia de usuario.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ServerOff className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Procesado Local</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tus archivos nunca tocan nuestros servidores. El procesado de imágenes y video se hace directamente usando los recursos de tu ordenador.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">100% Privado</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sin riesgo de filtraciones. Puedes procesar documentos confidenciales y fotos personales con total tranquilidad.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Velocidad Extrema</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Al no depender de tiempos de subida y bajada, las conversiones ocurren en fracciones de segundo. WebAssembly a tu servicio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Nuestro Catálogo</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Haz clic en cualquier herramienta para usarla al instante.</p>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Sistemas Operativos</span>
              </div>
            </div>

            <ToolsGrid isLoggedIn={!!session} />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 bg-slate-900 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes Simples y Claros</h2>
              <p className="text-slate-400 text-lg">Pruébalo gratis hoy. Sube a Pro cuando necesites más poder.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700">
                <h3 className="text-2xl font-bold mb-2">Plan Invitado</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-slate-400">/ siempre</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> 3 usos diarios en total
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Compresión estándar
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Sin registro
                  </li>
                </ul>
                <Link href="#tools" className="block w-full py-4 text-center rounded-xl bg-slate-700 hover:bg-slate-600 font-bold transition-colors">
                  Probar ahora
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl p-8 border border-blue-500 shadow-2xl shadow-blue-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-400 text-blue-950 text-xs font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                  Recomendado
                </div>
                <h3 className="text-2xl font-bold mb-2">Plan Pro</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black">$9.99</span>
                  <span className="text-blue-200">/ mes</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> Accesos ilimitados
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> Herramientas Premium (Video Pro)
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> Soporte prioritario
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> Sin anuncios
                  </li>
                </ul>
                {!session ? (
                  <Link href="/register" className="block w-full py-4 text-center rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold transition-colors shadow-xl">
                    Crear cuenta
                  </Link>
                ) : (
                  <button className="block w-full py-4 text-center rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold transition-colors shadow-xl">
                    Mejorar a Pro
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Urban<span className="text-blue-500">Suite</span></span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              La colección definitiva de herramientas digitales impulsadas por WebAssembly para profesionales modernos.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/privacy" className="hover:text-blue-500">Política de Privacidad</Link></li>
              <li><Link href="/terms" className="hover:text-blue-500">Términos de Servicio</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Empresa</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/contact" className="hover:text-blue-500">Contacto</Link></li>
              <li><Link href="/about" className="hover:text-blue-500">Sobre nosotros</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            © 2026 HerramientasPro. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold tracking-widest uppercase">
            <span>Hecho con</span>
            <span className="text-red-500">♥</span>
            <span>para el mundo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
