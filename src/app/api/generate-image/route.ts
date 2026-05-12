import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "El prompt es obligatorio" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const text = prompt.slice(0, 100);
      const demoUrl = `https://placehold.co/512x512/1e1b4b/a5b4fc?text=${encodeURIComponent(text)}`;
      return NextResponse.json({ url: demoUrl, isDemo: true });
    }

    const provider = process.env.NEXT_PUBLIC_AI_PROVIDER;
    if (provider !== "openai") {
      const text = prompt.slice(0, 100);
      const demoUrl = `https://placehold.co/512x512/1e1b4b/a5b4fc?text=${encodeURIComponent(text)}`;
      return NextResponse.json({ url: demoUrl, isDemo: true });
    }

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`DALL-E error: ${err}`);
    }

    const data = await res.json();
    return NextResponse.json({ url: data.data[0].url, isDemo: false });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al generar imagen";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
