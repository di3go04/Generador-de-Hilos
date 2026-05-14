"use client";

import { useEffect, useState } from "react";
import { JobProgressEvent } from "@/types/shared";

export function useJobNotifications(jobId: string | null) {
  const [lastEvent, setLastEvent] = useState<JobProgressEvent | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const eventSource = new EventSource(`${apiHost}/notifications/subscribe`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.job_id === jobId) {
          setLastEvent(data);
        }
      } catch (err) {
        console.error("Error parsing SSE message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return lastEvent;
}
