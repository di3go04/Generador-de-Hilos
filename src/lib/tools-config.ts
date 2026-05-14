import { 
  Twitter, 
  Link, 
  Lock, 
  FileText, 
  Image as ImageIcon, 
  Type, 
  Hash, 
  QrCode, 
  Palette, 
  Zap,
  LucideIcon
} from "lucide-react";

export type ToolCategory = "Social" | "Utility" | "Text" | "Image" | "Security";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  isPro?: boolean;
}

export const TOOLS: Tool[] = [
  {
    slug: "generador-de-hilos",
    title: "Generador de Hilos IA",
    description: "Crea hilos virales para Twitter/X a partir de un tema o idea.",
    icon: Twitter,
    category: "Social",
  },
  {
    slug: "acortador-urls",
    title: "Acortador de URLs",
    description: "Simplifica tus enlaces largos y obtén estadísticas de clics.",
    icon: Link,
    category: "Utility",
  },
  {
    slug: "generador-password",
    title: "Generador de Passwords",
    description: "Crea contraseñas seguras y aleatorias al instante.",
    icon: Lock,
    category: "Security",
    isPro: false,
  },
  {
    slug: "markdown-editor",
    title: "Editor Markdown",
    description: "Escribe y previsualiza contenido en formato Markdown.",
    icon: FileText,
    category: "Text",
  },
  {
    slug: "conversor-mayusculas",
    title: "Conversor de Texto",
    description: "Cambia entre mayúsculas, minúsculas y formato título.",
    icon: Type,
    category: "Text",
  },
  {
    slug: "contador-palabras",
    title: "Contador de Palabras",
    description: "Analiza la longitud y estructura de tus textos.",
    icon: Hash,
    category: "Text",
  },
  {
    slug: "generador-qr",
    title: "Generador de QR",
    description: "Convierte cualquier texto o URL en un código QR descargable.",
    icon: QrCode,
    category: "Utility",
    isPro: true,
  },
  {
    slug: "paleta-colores",
    title: "Paleta de Colores",
    description: "Genera combinaciones cromáticas profesionales para tus proyectos.",
    icon: Palette,
    category: "Image",
    isPro: true,
  },
  {
    slug: "optimizador-imagen",
    title: "Optimizador de Imagen",
    description: "Reduce el peso de tus imágenes sin perder calidad.",
    icon: ImageIcon,
    category: "Image",
    isPro: true,
  },
  {
    slug: "lorem-ipsum",
    title: "Generador de Lorem Ipsum",
    description: "Crea textos de relleno para tus maquetas y diseños.",
    icon: Zap,
    category: "Text",
  },
];
