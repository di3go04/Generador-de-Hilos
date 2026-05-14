"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { 
  ChevronRight, Twitter, Clock, 
  Calendar as CalendarIcon, MapPin 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ScheduledPost {
  id: string;
  scheduledAt: Date;
  thread: { title: string };
}

export default function ScheduledCalendar({ posts }: { posts: ScheduledPost[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const postsOnSelectedDate = posts.filter(post => 
    format(new Date(post.scheduledAt), "yyyy-MM-dd") === format(selectedDate || new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="glass-card rounded-[2.5rem] border-[var(--border-main)] overflow-hidden flex flex-col lg:flex-row">
      <div className="p-6 border-b lg:border-b-0 lg:border-r border-[var(--border-main)]">
        <h3 className="font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-600" />
          Calendario de Publicación
        </h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-xl border border-[var(--border-main)] bg-white dark:bg-white/5"
          locale={es}
          modifiers={{
            scheduled: (date) => posts.some(p => format(new Date(p.scheduledAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
          }}
          modifiersStyles={{
            scheduled: { fontWeight: 'bold', color: '#6366f1', textDecoration: 'underline' }
          }}
        />
      </div>
      
      <div className="flex-1 p-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
          Programados para el {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : "hoy"}
        </h4>
        
        {postsOnSelectedDate.length > 0 ? (
          <div className="space-y-3">
            {postsOnSelectedDate.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-[var(--border-main)] group hover:border-indigo-600/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-heading)] truncate">{post.thread.title}</p>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {format(new Date(post.scheduledAt), "HH:mm 'hs'")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-30">
            <CalendarIcon className="w-10 h-10 mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Sin publicaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
