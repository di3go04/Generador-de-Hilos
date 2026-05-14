"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Sparkles, Loader2, Mail, Lock } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenciales incorrectas");
      } else {
        toast.success("¡Bienvenido de nuevo!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver al inicio
      </Link>
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 mt-12 md:mt-0">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bienvenido</h1>
          <p className="text-gray-500 font-medium">Inicia sesión para acceder a tu suite Urban.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                name="email" type="email" required placeholder="tu@email.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
               <label className="text-xs font-black uppercase tracking-widest text-gray-400">Contraseña</label>
               <Link href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">¿Olvidaste la clave?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                name="password" type="password" required placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar a mi Suite"}
          </button>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 font-medium">O continúa con</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleSignInButton text="Iniciar sesión con Google" />
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 font-medium">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-indigo-600 font-black hover:underline">Regístrate ahora</Link>
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6">
           <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 text-center">Acceso rápido de prueba</p>
              <p className="text-[11px] text-amber-600 text-center">
                 Email: <span className="font-bold">admin@urban.com</span> <br />
                 Pass: <span className="font-bold">password123</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
