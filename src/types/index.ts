export type AIProvider = "openai" | "groq" | "ollama";
export type Tone = "Profesional" | "Casual" | "Persuasivo" | "Educativo" | "Divertido";
export type ToolId = "threads" | "image" | "video" | "qr" | "palette" | "text" | "image-gen" | "ocr" | "audio" | "upscale" | "stem" | "code" | "remove-bg" | "voice";

export interface ThreadOptions {
  topic: string;
  tone: Tone;
  numTweets: number;
  includeEmojis: boolean;
  includeHashtags: boolean;
}

export interface Tweet {
  id: number;
  content: string;
}

export interface GenerationResult {
  tweets: Tweet[];
  provider: string;
  isDemo: boolean;
}

export interface ImageFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  format: string;
}

export type OutputImageFormat = "png" | "jpeg" | "webp";

export interface ImageConversionOptions {
  quality: number;
  format: OutputImageFormat;
}

export interface VideoFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export type OutputVideoFormat = "mp4" | "webm" | "gif" | "mp3" | "mov" | "avi" | "mkv" | "flv" | "wmv" | "wav";
export type VideoResolution = "original" | "2160p" | "1080p" | "720p" | "480p";
export type VideoBitrate = "auto" | "500k" | "1M" | "2M" | "4M" | "8M";

export interface VideoConversionOptions {
  format: OutputVideoFormat;
  resolution: VideoResolution;
  quality: number;
  bitrate: VideoBitrate;
}

export type QRContentType = "url" | "text" | "wifi" | "vcard" | "email";

export interface QROptions {
  content: string;
  type: QRContentType;
  foreground: string;
  background: string;
  size: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  logo?: string | null;
}

export interface PaletteColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export interface ToolConfig {
  id: ToolId;
  title: string;
  description: string;
  icon: string;
}
