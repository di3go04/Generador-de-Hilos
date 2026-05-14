"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimerState = "idle" | "running" | "paused";
type TimerMode = "work" | "break";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroTimer({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [mode, setMode] = useState<TimerMode>("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerState === "running" && timeLeft === 0) {
      // Timer finished
      new Audio("https://cdn.freesound.org/previews/320/320181_527080-lq.mp3").play().catch(() => {});
      
      if (mode === "work") {
        setSessionsCompleted(s => s + 1);
        setMode("break");
        setTimeLeft(BREAK_TIME);
        setTimerState("idle");
      } else {
        setMode("work");
        setTimeLeft(WORK_TIME);
        setTimerState("idle");
      }
    }

    return () => clearInterval(interval);
  }, [timerState, timeLeft, mode]);

  const toggleTimer = async () => {
    if (timerState === "idle" && !tracked) {
      await onAction(async () => true).catch(() => {});
      setTracked(true);
    }
    
    setTimerState(prev => prev === "running" ? "paused" : "running");
  };

  const resetTimer = () => {
    setTimerState("idle");
    setTimeLeft(mode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimerState("idle");
    setTimeLeft(newMode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = mode === "work" 
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="space-y-8 w-full max-w-md mx-auto p-8 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Pomodoro</h2>
        <p className="text-slate-400">Mejora tu productividad con bloques de tiempo.</p>
      </div>

      <div className="flex justify-center gap-4 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
        <button
          onClick={() => switchMode("work")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "work" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-4 h-4" /> Trabajo
        </button>
        <button
          onClick={() => switchMode("break")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "break" ? "bg-green-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Coffee className="w-4 h-4" /> Descanso
        </button>
      </div>

      <div className="relative flex justify-center py-8">
        {/* Progress circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              className="stroke-slate-800"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              className={`transition-all duration-1000 ease-linear ${mode === "work" ? "stroke-blue-500" : "stroke-green-500"}`}
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-48">
          <span className="text-7xl font-bold tracking-tighter text-white tabular-nums drop-shadow-lg">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm font-medium text-slate-400 mt-2">
            {mode === "work" ? "Enfoque" : "Relajación"}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            timerState === "running" ? "bg-slate-700 hover:bg-slate-600" : mode === "work" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {timerState === "running" ? <Pause className="w-6 h-6 ml-0" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>
        <Button 
          onClick={resetTimer}
          variant="outline"
          className="w-16 h-16 rounded-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <div className="text-center pt-4 border-t border-slate-800">
        <p className="text-sm text-slate-500">
          Sesiones completadas hoy: <span className="text-slate-300 font-bold">{sessionsCompleted}</span>
        </p>
      </div>
    </div>
  );
}
