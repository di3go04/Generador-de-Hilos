"use client";

import { Sparkles, Heart, Globe, Github, Share2, X } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto px-6 py-12 relative overflow-hidden">
      {/* Premium Gradient Divider */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-terracota/20 to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-terracota flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-brand-earth tracking-tighter">Urban</span>
          </div>
          <p className="text-xs text-brand-earth/40 font-medium max-w-xs text-center md:text-left">
            La suite creativa definitiva que combina potencia IA con una estética humana y orgánica.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 text-brand-earth/40 hover:text-brand-terracota transition-colors">
              <X className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-brand-earth/40 hover:text-brand-terracota transition-colors">
              <Share2 className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-brand-earth/40 hover:text-brand-terracota transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
          
          <div className="h-8 w-[1px] bg-brand-earth/5 hidden md:block" />

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-earth/30">
            Hecho con <Heart className="w-3 h-3 text-brand-terracota fill-brand-terracota" /> por Urban Team
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 flex flex-wrap justify-center md:justify-between items-center gap-4 text-[10px] font-bold text-brand-earth/20 uppercase tracking-widest">
        <div className="flex gap-6">
          <a href="#" className="hover:text-brand-terracota transition-colors">Términos</a>
          <a href="#" className="hover:text-brand-terracota transition-colors">Privacidad</a>
          <a href="#" className="hover:text-brand-terracota transition-colors">API</a>
        </div>
        <p>© 2026 Urban. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
