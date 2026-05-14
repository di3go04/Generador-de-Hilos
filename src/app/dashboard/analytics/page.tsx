"use client";

import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { 
  TrendingUp, Users, FileText, Twitter, 
  Calendar, Download, ArrowUpRight, ArrowDownRight,
  Filter, Calendar as CalendarIcon
} from "lucide-react";

// Mock data for analytics
const threadHistory = [
  { month: "Ene", threads: 12, published: 8 },
  { month: "Feb", threads: 18, published: 12 },
  { month: "Mar", threads: 15, published: 10 },
  { month: "Abr", threads: 25, published: 20 },
  { month: "May", threads: 32, published: 28 },
  { month: "Jun", threads: 28, published: 22 },
];

const engagementData = [
  { day: "Lun", impressions: 1200, likes: 45, retweets: 12 },
  { day: "Mar", impressions: 1500, likes: 52, retweets: 15 },
  { day: "Mie", impressions: 1800, likes: 61, retweets: 18 },
  { day: "Jue", impressions: 2100, likes: 72, retweets: 22 },
  { day: "Vie", impressions: 2800, likes: 95, retweets: 31 },
  { day: "Sab", impressions: 3200, likes: 110, retweets: 42 },
  { day: "Dom", impressions: 2400, likes: 82, retweets: 25 },
];

const planUsage = [
  { name: "Hilos Usados", value: 45 },
  { name: "Hilos Restantes", value: 55 },
];

const COLORS = ["#6366f1", "#e2e8f0"];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">Métricas y Rendimiento</h1>
          <p className="text-sm text-[var(--text-muted)]">Analiza el impacto de tus hilos y el uso de tu cuenta.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[var(--border-main)] bg-white dark:bg-white/5 p-1">
            {["7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  dateRange === r 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                }`}
              >
                {r === "7d" ? "7 días" : r === "30d" ? "30 días" : "90 días"}
              </button>
            ))}
          </div>
          <button className="btn-ghost text-xs py-2 px-3 flex items-center gap-2 border border-[var(--border-main)]">
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Hilos", value: "142", change: "+12%", up: true, icon: FileText },
          { label: "Impresiones (X)", value: "24.5k", change: "+24%", up: true, icon: Twitter },
          { label: "Likes Promedio", value: "48", change: "-5%", up: false, icon: TrendingUp },
          { label: "Créditos Plan", value: "45/100", change: "45% usado", up: null, icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <stat.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              {stat.up !== null && (
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-[var(--text-heading)]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Thread Activity */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-heading)]">Actividad de Generación</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[var(--text-muted)]">Generados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-300" />
                <span className="text-[var(--text-muted)]">Publicados</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threadHistory}>
                <defs>
                  <linearGradient id="colorThreads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border-main)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="threads" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorThreads)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="published" 
                  stroke="#818cf8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={0} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Usage */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-[var(--text-heading)]">Uso del Plan Pro</h3>
            <p className="text-xs text-[var(--text-muted)]">Renovación el 12 de Jun, 2025</p>
          </div>
          
          <div className="h-[200px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[var(--text-heading)]">45%</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Usado</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text-muted)]">Hilos disponibles</span>
              <span className="text-[var(--text-heading)]">55 de 100</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[45%]" />
            </div>
            <button className="w-full btn-primary text-xs py-2.5">
              Mejorar plan
            </button>
          </div>
        </div>

        {/* Engagement Chart */}
        <div className="lg:col-span-12 glass-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[var(--text-heading)]">Engagement de Twitter/X</h3>
              <p className="text-xs text-[var(--text-muted)]">Basado en tus últimos 10 hilos publicados.</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-surface)', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border-main)',
                    borderRadius: '12px'
                  }} 
                />
                <Bar dataKey="impressions" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="likes" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
