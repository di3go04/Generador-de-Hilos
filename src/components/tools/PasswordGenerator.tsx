"use client";

import { useState } from "react";
import { Copy, RefreshCw, Check, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function PasswordGenerator({ onAction }: { onAction?: (action: () => Promise<any>) => Promise<any> }) {
  const [password, setPassword] = useState("");
  const [length, setPasswordLength] = useState(16);
  const [copied, setCopied] = useState(false);
  
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generate = async () => {
    const action = async () => {
      let charset = "abcdefghijklmnopqrstuvwxyz";
      if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (includeNumbers) charset += "0123456789";
      if (includeSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
      
      let retVal = "";
      for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      setPassword(retVal);
      return retVal;
    };
    
    if (onAction) {
      await onAction(action);
    } else {
      await action();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Generador de Contraseñas</h2>
        <p className="text-slate-400">Crea contraseñas robustas y seguras al instante.</p>
      </div>

      <div className="relative group">
        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-2xl md:text-3xl font-mono text-center break-all min-h-[120px] flex items-center justify-center text-slate-200">
          {password || <span className="text-slate-600 text-lg">Haz clic para generar</span>}
        </div>
        {password && (
          <button 
            onClick={copyToClipboard}
            className="absolute top-4 right-4 p-2 bg-slate-900 rounded-lg shadow-sm border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-blue-400" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/30 p-6 rounded-xl border border-slate-800">
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-300 flex justify-between">
            <span>Longitud</span>
            <span className="text-blue-400 font-bold">{length}</span>
          </label>
          <input 
            type="range" min="8" max="64" value={length} 
            onChange={(e) => setPasswordLength(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeUppercase} 
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" 
            />
            <span className="text-sm text-slate-300">Mayúsculas (A-Z)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeNumbers} 
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" 
            />
            <span className="text-sm text-slate-300">Números (0-9)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeSymbols} 
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" 
            />
            <span className="text-sm text-slate-300">Símbolos (!@#$)</span>
          </label>
        </div>
      </div>

      <Button 
        onClick={generate}
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 text-lg"
      >
        <RefreshCw className="w-5 h-5" />
        Generar Contraseña
      </Button>
      
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-green-500/70" />
        Generación local segura. Ningún dato sale de tu navegador.
      </div>
    </div>
  );
}
