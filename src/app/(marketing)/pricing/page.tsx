"use client";

import { Check, Zap, Crown, Rocket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Gratis",
    price: "0",
    description: "Para uso personal ocasional.",
    features: [
      "3 usos diarios",
      "Acceso a herramientas básicas",
      "Soporte por comunidad",
      "Anuncios discretos",
    ],
    icon: Zap,
    button: "Plan actual",
    current: true,
  },
  {
    name: "Pro",
    price: "19",
    description: "Para profesionales y creadores.",
    features: [
      "Usos ilimitados",
      "Todas las herramientas Pro",
      "Sin anuncios",
      "Soporte prioritario",
      "Acceso anticipado a funciones",
    ],
    icon: Crown,
    button: "Mejorar a Pro",
    popular: true,
  },
  {
    name: "Empresarial",
    price: "49",
    description: "Para equipos y agencias.",
    features: [
      "Todo lo de Pro",
      "Cuentas para 5 miembros",
      "API de alta velocidad",
      "SLA garantizado",
      "Gerente de cuenta dedicado",
    ],
    icon: Rocket,
    button: "Contactar Ventas",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-5xl font-black text-[var(--text-heading)] tracking-tight">
          Planes que crecen contigo
        </h1>
        <p className="text-[var(--text-muted)] text-xl max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades. Sin compromisos, cancela cuando quieras.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 pt-8">
           <span className={`text-sm font-bold ${!isAnnual ? "text-indigo-600" : "text-gray-400"}`}>Mensual</span>
           <button 
             onClick={() => setIsAnnual(!isAnnual)}
             className="w-14 h-7 bg-gray-200 dark:bg-white/10 rounded-full relative p-1 transition-colors"
           >
              <div className={`w-5 h-5 bg-indigo-600 rounded-full transition-transform ${isAnnual ? "translate-x-7" : "translate-x-0"}`} />
           </button>
           <span className={`text-sm font-bold ${isAnnual ? "text-indigo-600" : "text-gray-400"}`}>Anual <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">-20%</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all ${
              plan.popular 
                ? "border-indigo-600 shadow-2xl shadow-indigo-500/10 scale-105 z-10 bg-white dark:bg-white/5" 
                : "border-[var(--border-main)] bg-white/50 dark:bg-white/5 hover:border-indigo-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                Más Popular
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
               <div className={`p-2 rounded-xl ${plan.popular ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10"}`}>
                  <plan.icon className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-[var(--text-heading)]">{plan.name}</h3>
            </div>

            <div className="mb-8">
               <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[var(--text-heading)]">${isAnnual ? (parseInt(plan.price) * 0.8).toFixed(0) : plan.price}</span>
                  <span className="text-[var(--text-muted)] font-medium">/mes</span>
               </div>
               <p className="text-sm text-[var(--text-muted)] mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
               {plan.features.map((feature) => (
                 <li key={feature} className="flex items-start gap-3 text-sm text-[var(--text-muted)] font-medium">
                    <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    {feature}
                 </li>
               ))}
            </ul>

            <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
              plan.popular 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30" 
                : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-[var(--text-heading)]"
            }`}>
               {plan.button}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 text-center">
         <Link href="/dashboard" className="text-indigo-600 font-bold hover:underline">
            Volver al Dashboard
         </Link>
      </div>
    </div>
  );
}
