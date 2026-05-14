"use client";

import { useState, useEffect } from "react";
import { ArrowRightLeft, DollarSign } from "lucide-react";

// Static exchange rates (base EUR) for demonstration purposes
const EXCHANGE_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  JPY: 163.5,
  MXN: 18.2,
  COP: 4200.5,
  ARS: 850.2,
  BRL: 5.4,
};

const CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "Dólar Estadounidense" },
  { code: "GBP", name: "Libra Esterlina" },
  { code: "JPY", name: "Yen Japonés" },
  { code: "MXN", name: "Peso Mexicano" },
  { code: "COP", name: "Peso Colombiano" },
  { code: "ARS", name: "Peso Argentino" },
  { code: "BRL", name: "Real Brasileño" },
];

export default function CurrencyConverter({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [amount, setAmount] = useState<number | string>(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number>(0);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // Calculate conversion: (amount / fromRate) * toRate
    const fromRate = EXCHANGE_RATES[from];
    const toRate = EXCHANGE_RATES[to];
    const numericAmount = Number(amount) || 0;
    
    if (fromRate && toRate) {
      const converted = (numericAmount / fromRate) * toRate;
      setResult(converted);
      
      if (!tracked && numericAmount > 0) {
        onAction(async () => true).catch(() => {});
        setTracked(true);
      }
    }
  }, [amount, from, to, tracked, onAction]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-8 w-full max-w-xl mx-auto p-8 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mb-4">
          <DollarSign className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Conversor de Divisas</h2>
        <p className="text-slate-400">Tasas de cambio de referencia (simuladas).</p>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Cantidad</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-2xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-300">De</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={swapCurrencies}
            className="mt-6 p-3 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 transition-all shrink-0"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-300">A</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-slate-400 text-sm mb-2">{amount} {from} equivale a</p>
        <p className="text-4xl font-bold text-white tracking-tight">
          {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-2xl text-blue-400">{to}</span>
        </p>
      </div>
    </div>
  );
}
