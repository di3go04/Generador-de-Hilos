export interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isPro?: boolean;
}

export const tools: Tool[] = [
  // 1. CONVERSIÓN DE ARCHIVOS (7)
  { slug: "conversor-imagenes", name: "Conversor de Imágenes", description: "PNG ↔ JPG ↔ WebP", icon: "🖼️", category: "Conversión de Archivos" },
  { slug: "conversor-video", name: "Conversor de Video", description: "MP4 ↔ WebM (Simulado)", icon: "🎬", category: "Conversión de Archivos", isPro: true },
  { slug: "conversor-pdf", name: "Conversor de PDF", description: "PDF a texto y simulaciones", icon: "📄", category: "Conversión de Archivos" },
  { slug: "conversor-documentos", name: "Conversor de Documentos", description: "TXT a PDF, MD a HTML", icon: "📝", category: "Conversión de Archivos" },
  { slug: "conversor-audio", name: "Conversor de Audio", description: "MP3 ↔ WAV (Simulado)", icon: "🎵", category: "Conversión de Archivos" },
  { slug: "conversor-unidades", name: "Conversor de Unidades", description: "Longitud, masa, temp, etc.", icon: "📏", category: "Conversión de Archivos" },
  { slug: "conversor-divisas", name: "Conversor de Divisas", description: "Tasas de cambio", icon: "💱", category: "Conversión de Archivos" },

  // 2. UTILIDADES DE TEXTO Y CÓDIGO (6)
  { slug: "contador-palabras", name: "Contador de Palabras", description: "Palabras, caracteres, lectura", icon: "📊", category: "Texto y Código" },
  { slug: "formateador-json", name: "Formateador JSON", description: "Pretty print y validación", icon: "{}", category: "Texto y Código" },
  { slug: "comparador-textos", name: "Comparador de Textos", description: "Diff checker visual", icon: "🔍", category: "Texto y Código" },
  { slug: "generador-slugs", name: "Generador de Slugs", description: "Texto a URL amigable", icon: "🔗", category: "Texto y Código" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum", description: "Generador de texto de prueba", icon: "📜", category: "Texto y Código" },
  { slug: "base64", name: "Base64 Encoder/Decoder", description: "Codifica y decodifica Base64", icon: "🔄", category: "Texto y Código" },

  // 3. SEGURIDAD Y CIFRADO (5)
  { slug: "generador-contrasenas", name: "Generador de Contraseñas", description: "Crea contraseñas seguras", icon: "🔐", category: "Seguridad y Cifrado" },
  { slug: "generador-hash", name: "Generador de Hash", description: "MD5, SHA-1, SHA-256", icon: "🛡️", category: "Seguridad y Cifrado" },
  { slug: "cifrado-aes", name: "Cifrado AES", description: "Encriptador con frase secreta", icon: "🔒", category: "Seguridad y Cifrado" },
  { slug: "generador-qr", name: "Generador de QR", description: "Texto o URL a QR PNG", icon: "📱", category: "Seguridad y Cifrado" },
  { slug: "generador-uuid", name: "Generador UUID/GUID", description: "Versión 1 y 4", icon: "🆔", category: "Seguridad y Cifrado" },

  // 4. HERRAMIENTAS PARA DESARROLLO (5)
  { slug: "minificador-codigo", name: "Minificador CSS/JS", description: "Comprime código fuente", icon: "🗜️", category: "Desarrollo" },
  { slug: "prettier-online", name: "Formateador Prettier", description: "Da formato a tu código", icon: "✨", category: "Desarrollo" },
  { slug: "regex-tester", name: "Regex Tester", description: "Prueba expresiones regulares", icon: "🎯", category: "Desarrollo" },
  { slug: "conversor-colores", name: "Conversor de Colores", description: "HEX ↔ RGB ↔ HSL", icon: "🎨", category: "Desarrollo" },
  { slug: "calculadora-fechas", name: "Diferencia de Fechas", description: "Días, meses y años", icon: "📅", category: "Desarrollo" },

  // 5. IMAGEN Y MULTIMEDIA (4)
  { slug: "compresor-imagenes-lote", name: "Imágenes por Lotes", description: "Redimensiona y descarga ZIP", icon: "📸", category: "Multimedia" },
  { slug: "extractor-metadatos", name: "Extractor de Metadatos", description: "Lee EXIF y datos ocultos", icon: "ℹ️", category: "Multimedia" },
  { slug: "captura-url", name: "Captura de URL", description: "Screenshot simulado", icon: "🌐", category: "Multimedia" },
  { slug: "editor-svg", name: "Visor y Editor SVG", description: "Renderiza y edita XML", icon: "✒️", category: "Multimedia" },

  // 6. PRODUCTIVIDAD Y VARIOS (3)
  { slug: "pomodoro", name: "Pomodoro Timer", description: "Técnica de concentración", icon: "⏱️", category: "Productividad" },
  { slug: "acortador-url", name: "Acortador de URLs", description: "Crea links cortos", icon: "✂️", category: "Productividad" },
  { slug: "todo-list", name: "Lista de Tareas", description: "Gestor local con filtros", icon: "✅", category: "Productividad" },
];
