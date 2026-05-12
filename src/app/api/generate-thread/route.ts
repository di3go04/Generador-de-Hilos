import { NextResponse } from "next/server";

type Tone = "Profesional" | "Casual" | "Persuasivo" | "Educativo" | "Divertido";

interface RequestBody {
  topic: string;
  tone: Tone;
  numTweets: number;
  includeEmojis: boolean;
  includeHashtags: boolean;
}

function buildPrompt(body: RequestBody): string {
  const toneInstructions: Record<Tone, string> = {
    Profesional: "Usa un tono profesional, formal y autoritativo.",
    Casual: "Usa un tono casual, relajado y conversacional.",
    Persuasivo: "Usa un tono persuasivo y convincente.",
    Educativo: "Usa un tono educativo y didáctico.",
    Divertido: "Usa un tono divertido, ingenioso y entretenido.",
  };

  const toneInstr = toneInstructions[body.tone];
  const emojiInstr = body.includeEmojis
    ? "Incluye emojis relevantes. Máximo 2-3 por tweet."
    : "NO incluyas ningún emoji.";
  const hashtagInstr = body.includeHashtags
    ? "Al final del hilo, incluye una línea con 3-5 hashtags relevantes."
    : "NO incluyas hashtags.";

  return `Eres un ghostwriter experto en hilos virales de Twitter/X. Genera un hilo de EXACTAMENTE ${body.numTweets} posts sobre este tema: ${body.topic}

## REGLAS DE ESTILO OBLIGATORIAS:

### Longitud y formato (IMPORTANTE)
- El límite real en X/Twitter es de **280 caracteres por post** y debes APROVECHARLO al máximo.
- Cada post debe tener entre **250 y 280 caracteres**. Ser breve penaliza el engagement.
- No te limites a una frase. Usa 3-4 líneas por post con **saltos de línea** para dar ritmo visual.
- Usa listas con guiones (-) o bullet points (•) para estructurar la información.

### Narrativa (Problema → Agitación → Solución)
- No solo des información. Cuenta una historia o da consejos accionables.
- Plantea un problema real, agítalo emocionalmente y luego da la solución.

### Contenido rico y específico
- NO seas genérico. Si el tema es técnico (ej: React, marketing, finanzas), menciona conceptos reales, ejemplos concretos y datos precisos.
- Cada post debe aportar valor nuevo. No repitas lo mismo con otras palabras.

### Estructura del hilo
- POST 1 (GANCHO): Debe ser largo (+240 chars), plantear una tesis fuerte, provocadora o una pregunta poderosa que obligue a leer el siguiente.
- POSTS INTERMEDIOS: Desarrollo del tema con ejemplos, datos, anécdotas. Alterna ritmo: algunos posts más densos, otros más ligeros.
- POST FINAL (CIERRE): Call-to-action claro, reflexión final o invitación a comentar.

### Tono y voz
Tono: ${toneInstr}
${emojiInstr}
${hashtagInstr}

### Formato de respuesta
Responde ÚNICAMENTE con el contenido de los posts separados exactamente por "---" (sin espacios alrededor). No incluyas ningún otro texto, explicación, ni introducción antes o después.

Ejemplo:
Post 1 largo con gancho...
---
Post 2 con desarrollo...
---
Post 3 con cierre...`;
}

async function callAI(prompt: string): Promise<string[]> {
  const provider = process.env.NEXT_PUBLIC_AI_PROVIDER || "groq";

  if (provider === "openai") {
    return callOpenAI(prompt);
  }
  if (provider === "groq") {
    return callGroq(prompt);
  }
  if (provider === "ollama") {
    return callOllama(prompt);
  }
  throw new Error(`Proveedor no soportado: ${provider}`);
}

async function callOpenAI(prompt: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY no configurada");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return parseResponse(data.choices?.[0]?.message?.content || "");
}

async function callGroq(prompt: string): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurada");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return parseResponse(data.choices?.[0]?.message?.content || "");
}

async function callOllama(prompt: string): Promise<string[]> {
  const res = await fetch("http://localhost:11434/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return parseResponse(data.choices?.[0]?.message?.content || "");
}

function parseResponse(text: string): string[] {
  return text
    .split("---")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function generateDemo(numTweets: number, topic: string): string[] {
  // Split user's own text by newlines or into 280-char chunks
  const lines = topic.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length >= numTweets) return lines.slice(0, numTweets);

  const posts: string[] = [];
  for (const line of lines) {
    if (line.length <= 280) {
      posts.push(line);
    } else {
      for (let i = 0; i < line.length; i += 260) {
        posts.push(line.slice(i, i + 260));
      }
    }
  }
  return posts.slice(0, numTweets);
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.topic?.trim()) {
    return NextResponse.json({ error: "El tema es obligatorio" }, { status: 400 });
  }

  try {
    const prompt = buildPrompt(body);
    const thread = await callAI(prompt);

    if (thread.length === 0) {
      throw new Error("La IA no generó tweets válidos");
    }

    return NextResponse.json({
      thread: thread.slice(0, body.numTweets),
      provider: process.env.NEXT_PUBLIC_AI_PROVIDER || "groq",
      isDemo: false,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al generar el hilo";
    const provider = process.env.NEXT_PUBLIC_AI_PROVIDER || "groq";
    const noKey =
      (provider === "openai" && !process.env.OPENAI_API_KEY) ||
      (provider === "groq" && !process.env.GROQ_API_KEY);

    if (noKey) {
      const thread = generateDemo(body.numTweets, body.topic);
      return NextResponse.json({ thread, provider: "demo", isDemo: true });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
