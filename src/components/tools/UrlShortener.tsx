"use client";

import { useState, useEffect } from "react";
import { Link, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShortenedLink {
  original: string;
  short: string;
  clicks: number;
}

export default function UrlShortener({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("urban_shortened_links");
    if (saved) {
      try {
        setLinks(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const shortenUrl = async () => {
    if (!url || !url.startsWith("http")) return;

    await onAction(async () => {
      // Generate a random 6-character hash
      const hash = Math.random().toString(36).substring(2, 8);
      const shortUrl = `urban.do/${hash}`;
      
      const newLink = { original: url, short: shortUrl, clicks: 0 };
      const updatedLinks = [newLink, ...links].slice(0, 5); // Keep last 5
      
      setLinks(updatedLinks);
      localStorage.setItem("urban_shortened_links", JSON.stringify(updatedLinks));
      setUrl("");
      
      return true;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Acortador de URLs</h2>
        <p className="text-slate-400">Acorta tus enlaces largos para compartirlos fácilmente.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="url"
            placeholder="https://tu-enlace-muy-largo.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <Button 
          onClick={shortenUrl} 
          disabled={!url || !url.startsWith("http")}
          className="bg-blue-600 hover:bg-blue-700 py-6 px-6"
        >
          Acortar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {links.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Tus enlaces recientes</h3>
          {links.map((link, i) => (
            <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="overflow-hidden">
                <p className="text-blue-400 font-medium text-lg">{link.short}</p>
                <p className="text-xs text-slate-500 truncate mt-1" title={link.original}>{link.original}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(link.short)}
                className="shrink-0 bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                {copied === link.short ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> Copiado</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copiar</>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
