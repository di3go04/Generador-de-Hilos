import type { ThreadOptions, GenerationResult } from "@/types";

export async function generateThread(options: ThreadOptions): Promise<GenerationResult> {
  const res = await fetch("/api/generate-thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
    signal: AbortSignal.timeout(60000),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al generar el hilo");
  }

  return {
    tweets: data.thread.map((content: string, i: number) => ({
      id: i + 1,
      content,
    })),
    provider: data.provider,
    isDemo: data.isDemo,
  };
}
