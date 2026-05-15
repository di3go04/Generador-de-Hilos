"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Settings, LogOut, ChevronRight,
  Menu, X, Crown, Sun, Moon,
  Terminal, ShieldCheck, UserCircle, Tag
} from "lucide-react";
import { useTheme } from "next-themes";

const navItems = [
  { href: "/dashboard", label: "Suite de Herramientas", icon: LayoutDashboard },
  { href: "/dashboard/categories", label: "Categorías", icon: Tag },
  { href: "/dashboard/usage", label: "Mi Consumo", icon: Terminal },
  { href: "/dashboard/perfil", label: "Perfil & Suscripción", icon: UserCircle },
  { href: "/dashboard/admin", label: "Administración", icon: ShieldCheck, adminOnly: true },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const plan = (session?.user as any)?.plan ?? "FREE";
  const role = (session?.user as any)?.role ?? "USER";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-main)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-[var(--text-heading)] leading-none text-base">Urban</p>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">SaaS Suite</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          if (item.adminOnly && role !== "ADMIN") return null;
          
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item text-sm py-3 ${isActive ? "nav-item-active" : ""}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-main)] space-y-4">
        {/* Upgrade banner */}
        {plan === "FREE" && (
          <Link href="/pricing"
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl -mr-8 -mt-8" />
            <Crown className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[var(--text-heading)]">Pasar a Pro</p>
              <p className="text-[10px] text-[var(--text-muted)]">Herramientas ilimitadas</p>
            </div>
            <ChevronRight className="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0 border border-indigo-500/20">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-heading)] truncate leading-tight">{session?.user?.name}</p>
            <div className="flex items-center gap-1.5">
               <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                 plan === "PRO" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
               }`}>
                 {plan}
               </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-[var(--text-muted)]" />
                : <Moon className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>
            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="w-8 h-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 left-0 glass-card border-r border-[var(--border-main)] z-30 shadow-xl shadow-black/5">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 glass-card z-50 lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-4 glass-card border-b border-[var(--border-main)]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-6 h-6 text-indigo-600" />
          </button>
          <span className="font-bold text-[var(--text-heading)]">Urban Suite</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
