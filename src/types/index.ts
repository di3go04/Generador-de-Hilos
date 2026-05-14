export type ToolId = 
  | "threads" 
  | "video" 
  | "image-gen" 
  | "voice" 
  | "upscale" 
  | "remove-bg" 
  | "palette" 
  | "image" 
  | "stem" 
  | "audio";

export interface ToolConfig {
  id: ToolId;
  title: string;
  description: string;
  icon: string;
  featured?: boolean;
}

export type ConversionMode = "auto" | "browser" | "cloud";

export interface JobProgressEvent {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  downloadUrl?: string;
}

export interface ConversionJob {
  id: string;
  status: string;
  progress: number;
  createdAt: string;
}

export interface PaletteColor {
  hex: string;
  name: string;
  type: string;
  rgb?: { r: number; g: number; b: number };
  hsl?: { h: number; s: number; l: number };
}

export type OutputImageFormat = "png" | "jpg" | "jpeg" | "webp";

export type QRContentType = "url" | "text" | "wifi" | "vcard" | "email";

export interface QROptions {
  content: string;
  type: QRContentType;
  size?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
}

export type Tone = "professional" | "casual" | "educational" | "viral" | "storytelling";
