"use client";

import { useState, useEffect } from "react";

export function useUsageLimit() {
  const [usage, setUsage] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const LIMIT = 3;

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const key = `urban_usage_${today}`;
    
    const storedUsage = localStorage.getItem(key);
    if (storedUsage) {
      const count = parseInt(storedUsage);
      setUsage(count);
      setHasReachedLimit(count >= LIMIT);
    } else {
      // Limpiar claves antiguas de días anteriores para ahorrar espacio
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("urban_usage_") && k !== key) {
          localStorage.removeItem(k);
        }
      });
      localStorage.setItem(key, "0");
    }
  }, []);

  const incrementUsage = () => {
    const today = new Date().toISOString().split("T")[0];
    const key = `urban_usage_${today}`;
    const newCount = usage + 1;
    
    localStorage.setItem(key, newCount.toString());
    setUsage(newCount);
    if (newCount >= LIMIT) {
      setHasReachedLimit(true);
    }
  };

  return { usage, hasReachedLimit, incrementUsage, limit: LIMIT };
}
