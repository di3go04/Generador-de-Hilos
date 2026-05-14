export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface ConversionOptions {
  output_format: string;
  resolution: string;
  quality: number;
  bitrate: string;
}

export interface ConversionJob {
  id: string;
  status: JobStatus;
  input_format: string;
  output_format: string;
  file_size: number;
  download_url?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface JobProgressEvent {
  job_id: string;
  status: JobStatus;
  progress: number;
  message?: string;
}
