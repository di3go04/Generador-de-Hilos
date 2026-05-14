export interface GenerateThreadOptions {
  topic: string;
  tone: "professional" | "casual" | "educational" | "viral" | "storytelling";
  language: "es" | "en";
  tweetCount: number;
  includeEmojis: boolean;
  includeHashtags: boolean;
}

export interface GeneratedThread {
  title: string;
  tweets: string[];
}

const SYSTEM_PROMPT = `Eres un experto en crear hilos virales para Twitter/X. 
Tu objetivo es generar hilos atractivos, concisos y que generen engagement.
Cada tweet debe tener máximo 280 caracteres.
El primer tweet debe ser un gancho irresistible.
Sigue una narrativa coherente y progresiva.`;

function buildPrompt(options: GenerateThreadOptions): string {
  const toneDescriptions = {
    professional: "profesional y autoritativo",
    casual: "conversacional y cercano",
    educational: "educativo y explicativo",
    viral: "provocador y llamativo, diseñado para volverse viral",
    storytelling: "narrativo, como si contaras una historia",
  };

  const langInstruction = options.language === "es"
    ? "Escribe en español."
    : "Write in English.";

  return `${langInstruction}
Genera un hilo de ${options.tweetCount} tweets sobre: "${options.topic}"
Tono: ${toneDescriptions[options.tone]}
${options.includeEmojis ? "Incluye emojis relevantes para mayor engagement." : "Sin emojis."}
${options.includeHashtags ? "Añade 2-3 hashtags relevantes al final del último tweet." : "Sin hashtags."}

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "title": "Título descriptivo del hilo",
  "tweets": ["tweet 1", "tweet 2", ...]
}

Cada tweet debe tener máximo 280 caracteres. El primer tweet es el gancho principal.`;
}

export async function generateThread(options: GenerateThreadOptions): Promise<GeneratedThread> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return mock data if no API key configured
    return getMockThread(options);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(options) },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error("No content from OpenAI");

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON from AI");

    const result = JSON.parse(jsonMatch[0]) as GeneratedThread;

    // Validate tweet lengths
    result.tweets = result.tweets.map((tweet) =>
      tweet.length > 280 ? tweet.substring(0, 277) + "..." : tweet
    );

    return result;
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback to mock if API fails
    return getMockThread(options);
  }
}

function getMockThread(options: GenerateThreadOptions): GeneratedThread {
  const lang = options.language === "es";
  return {
    title: lang
      ? `Hilo sobre: ${options.topic}`
      : `Thread about: ${options.topic}`,
    tweets: Array.from({ length: options.tweetCount }, (_, i) => {
      if (i === 0) return lang
        ? `🧵 Hilo: Lo que nadie te cuenta sobre "${options.topic}" (${options.tweetCount} puntos clave)`
        : `🧵 Thread: What nobody tells you about "${options.topic}" (${options.tweetCount} key points)`;
      return lang
        ? `${i}/${options.tweetCount - 1} Punto clave #${i} sobre ${options.topic}: Este es un tweet de ejemplo generado para demostración. Añade tu API key de OpenAI para generar contenido real.`
        : `${i}/${options.tweetCount - 1} Key point #${i} about ${options.topic}: This is a sample tweet for demo. Add your OpenAI API key to generate real content.`;
    }),
  };
}
