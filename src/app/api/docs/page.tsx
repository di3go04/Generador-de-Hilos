"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Cargando documentación...</div>
});

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a la web
          </Link>
          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Documentación API v1.0</span>
        </div>
      </div>
      
      <div className="dark:invert dark:hue-rotate-180">
        <SwaggerUI url="/openapi.json" />
      </div>
    </div>
  );
}
