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
