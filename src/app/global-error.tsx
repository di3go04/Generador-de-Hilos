"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body className="flex items-center justify-center min-h-screen bg-[#06080f] text-white">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold gradient-cyan-violet-text">Algo salió mal</h1>
          <p className="text-white/50 text-sm max-w-md">{error.message}</p>
          <button onClick={reset} className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors">
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}