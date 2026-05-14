"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({ email, password, name });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-cyan-violet">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Urban</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
          <p className="text-sm text-white/40">Comienza con tu espacio de trabajo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className="w-full rounded-xl glass px-4 py-2.5 pr-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta…</>
            ) : (
              "Crear cuenta"
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
