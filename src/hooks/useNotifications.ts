"use client";

import { useState, useEffect } from "react";
import type { JobProgressEvent } from "@/types";

export function useNotifications(jobId: string | null) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // Conectar a la API de notificaciones del backend
    const eventSource = new EventSource(`http://localhost:4000/notifications/jobs?jobId=${jobId}`);

    eventSource.onmessage = (event) => {
      try {
        const data: JobProgressEvent = JSON.parse(event.data);
        
        if (data.jobId === jobId) {
          setProgress(data.progress);
          setStatus(data.status);
          
          if (data.status === "completed") {
            eventSource.close();
          }
        }
      } catch (err) {
        console.error("Error parsing notification:", err);
      }
    };

    eventSource.onerror = () => {
      setError("Error de conexión con el servidor de notificaciones");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return { progress, status, error };
}
