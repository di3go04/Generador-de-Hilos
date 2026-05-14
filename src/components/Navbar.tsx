"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { Hammer, User, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="bg-primary p-1.5 rounded-lg">
            <Hammer className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Herramientas<span className="text-primary">Pro</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="h-4 w-px bg-border mx-1" />

          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-secondary border">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline">
                  {session.user?.name}
                </span>
              </div>
              <button 
                onClick={() => signOut()}
                className="p-2 hover:text-destructive transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-outline border-none hover:bg-transparent hover:text-primary font-semibold">
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-primary font-bold shadow-sm">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
