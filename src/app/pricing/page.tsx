"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const plans = [
  {
    name: "Gratuito",
    slug: "free",
    price: "€0",
    description: "Para probar las herramientas",
    features: [
      "5 conversiones de video/mes",
      "10 generaciones IA/mes",
      "Formatos básicos",
      "Procesamiento en navegador",
    ],
    cta: "Comenzar gratis",
    popular: false,
  },
  {
    name: "Pro",
    slug: "pro",
    price: "€12",
    period: "/mes",
    description: "Para uso profesional",
    features: [
      "100 conversiones de video/mes",
      "500 generaciones IA/mes",
      "Todos los formatos",
      "Procesamiento server-side",
      "Mayor velocidad",
      "Soporte prioritario",
    ],
    cta: "Suscribirse",
    popular: true,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    price: "€49",
    period: "/mes",
    description: "Para equipos y empresas",
    features: [
      "Conversiones ilimitadas",
      "Generaciones IA ilimitadas",
      "Miembros del equipo",
      "SLA garantizado",
      "API dedicada",
      "Onboarding personalizado",
    ],
    cta: "Contactar",
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.push("/")}
          className="group mb-6 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 inline-block transition-transform group-hover:-translate-x-1" />
          Volver al dashboard
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Planes <span className="gradient-cyan-violet-text">Urban</span>
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Todos incluyen las 14 herramientas de la suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => {
            const isCurrentPlan = tenant?.plan === plan.slug;

            return (
              <motion.div
                key={plan.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border ${
                  plan.popular
                    ? "border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent"
                    : "border-white/[0.06] glass"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-[10px] font-bold text-white uppercase tracking-wider">
                    Más popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-white/40 mb-3">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-sm text-white/40">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isCurrentPlan || checkoutLoading !== null}
                  onClick={async () => {
                    if (!user) {
                      router.push("/register");
                      return;
                    }
                    if (plan.slug === "enterprise") {
                      window.location.href = "mailto:sales@urban.app";
                      return;
                    }
                    if (plan.slug === "free") {
                      router.push("/");
                      return;
                    }
                    setCheckoutLoading(plan.slug);
                    try {
                      const { url } = await api.createCheckoutSession(plan.slug as "pro");
                      window.location.href = url;
                    } catch (err: any) {
                      alert(err.message || "Error al iniciar checkout");
                    } finally {
                      setCheckoutLoading(null);
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isCurrentPlan
                      ? "bg-white/5 text-white/30 cursor-default"
                      : plan.popular
                        ? "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-lg"
                        : "glass text-white/70 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {checkoutLoading === plan.slug ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirigiendo…</>
                  ) : isCurrentPlan ? "Plan actual" : plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
