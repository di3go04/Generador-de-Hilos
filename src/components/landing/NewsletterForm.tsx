"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("¡Gracias por suscribirte!");
        setEmail("");
      } else {
        toast.error("Hubo un error. Inténtalo de nuevo.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input 
        type="email" 
        required 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com" 
        className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/50 transition-all"
      />
      <button 
        type="submit" 
        disabled={loading}
        className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Suscribirse"}
      </button>
    </form>
  );
}
