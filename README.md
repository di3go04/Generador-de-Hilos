# Urban - Herramientas Creativas para Mentes Digitales

Suite de herramientas creativas que funcionan 100% en el navegador. Genera hilos con IA, convierte imágenes y videos, crea códigos QR, extrae paletas de colores y transforma texto.

## Herramientas (14)

- **Generador de Hilos IA** - Crea hilos virales para Twitter/X usando OpenAI, Groq u Ollama
- **Generador de Imágenes IA** - Crea imágenes desde texto con DALL-E
- **Video Converter Pro** - Convierte videos usando ffmpeg.wasm (100% en el navegador)
- **Image Upscaler** - Mejora la resolución de tus imágenes
- **Remove Background** - Elimina fondos de imágenes al instante
- **Audio Stem Splitter** - Separa voz e instrumentos del audio
- **Voice to Text** - Transcribe notas de voz a texto
- **Conversor de Imágenes** - Convierte entre PNG, JPEG y WebP con control de calidad
- **Limpiador de Audio** - Filtra y mejora archivos de audio
- **Smart OCR** - Extrae texto de capturas de pantalla
- **Code Snippet Beautifier** - Formatea y comparte código con estilo
- **QR Generator Pro** - Códigos QR con logo y colores personalizados
- **Color Palette Generator** - Extrae colores dominantes de cualquier imagen
- **Utilidades de Texto** - Cuenta palabras, transforma mayúsculas/minúsculas, ordena líneas y más

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
git clone <tu-repo>/urban.git
cd urban
npm install
```

## Configuración

```bash
cp .env.example .env.local
```

### Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_AI_PROVIDER` | Proveedor de IA: `openai`, `groq`, `ollama` | `groq` |
| `OPENAI_API_KEY` | API Key de OpenAI | - |
| `GROQ_API_KEY` | API Key de Groq | - |

### Cómo obtener API Keys

- **Groq**: [console.groq.com/keys](https://console.groq.com/keys) - Gratuito
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Ollama**: Local. `ollama pull llama3` y configura `NEXT_PUBLIC_AI_PROVIDER=ollama`

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Producción

```bash
npm run build
npm start
```

## Despliegue en Vercel

```bash
npm i -g vercel
vercel
```

Configura las variables de entorno en el panel de Vercel.

## Tecnologías

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Framer Motion (animaciones)
- ffmpeg.wasm (conversión de video en el navegador)
- Canvas API (conversión de imágenes)
- Tesseract.js (OCR)
- qrcode-generator
- react-dropzone
- JSZip + file-saver
- Lucide React (iconos)
- React Hot Toast (notificaciones)
- react-textarea-autosize

## Notas

- El conversor de video requiere que el navegador soporte `SharedArrayBuffer` y las cabeceras `Cross-Origin-Opener-Policy` y `Cross-Origin-Embedder-Policy` están configuradas en `next.config.ts`.
- Sin API key de IA, el generador de hilos funciona en modo demo. La generación de imágenes también cae a placeholder demo si no hay `OPENAI_API_KEY`.
- Sin API key de Groq/OpenAI, las herramientas que dependen de IA (hilos, imágenes) mostrarán resultados de demostración.
