import { execSync, type ExecSyncOptions } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export interface FfmpegOptions {
  inputFormat: string;
  outputFormat: string;
  resolution: "original" | "2160p" | "1080p" | "720p" | "480p";
  quality: number;
  bitrate: "auto" | "500k" | "1M" | "2M" | "4M" | "8M";
}

const RESOLUTION_MAP: Record<string, string> = {
  "2160p": "3840:2160",
  "1080p": "1920:1080",
  "720p": "1280:720",
  "480p": "854:480",
};

/**
 * Process a video file with FFmpeg.
 * Returns the output buffer.
 */
export async function processVideo(
  inputBuffer: Buffer,
  inputExt: string,
  options: FfmpegOptions,
): Promise<Buffer> {
  const tmpDir = await mkdtemp(join(tmpdir(), "urban-ffmpeg-"));
  const inputName = `input.${inputExt}`;
  const outputName = `output.${options.outputFormat}`;

  try {
    // Write input to temp
    await writeFile(join(tmpDir, inputName), inputBuffer);

    // Build FFmpeg args (mirroring the existing client-side logic)
    const args = buildFfmpegArgs({
      inputName,
      outputFormat: options.outputFormat,
      resolution: options.resolution,
      quality: options.quality,
      bitrate: options.bitrate,
    });

    const cmd = `ffmpeg ${args.join(" ")}`;

    const execOpts: ExecSyncOptions = {
      cwd: tmpDir,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 600_000, // 10 minutes max
    };

    execSync(cmd, execOpts);

    // Read output
    const outputBuffer = await readFile(join(tmpDir, outputName));
    return outputBuffer;
  } finally {
    // Cleanup temp directory
    rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

function buildFfmpegArgs(params: {
  inputName: string;
  outputFormat: string;
  resolution: string;
  quality: number;
  bitrate: string;
}): string[] {
  const { inputName, outputFormat, resolution, quality, bitrate } = params;
  const args: string[] = ["-y", "-i", inputName];
  let outputName = `output.${outputFormat}`;
  const crf = String(Math.round((1 - quality) * 51));
  const resStr = resolution !== "original" ? RESOLUTION_MAP[resolution] : null;

  let vfFilter = "";
  if (outputFormat === "gif") {
    vfFilter = "fps=10";
    if (resStr) {
      vfFilter += `,scale=${resStr}:force_original_aspect_ratio=decrease:flags=lanczos`;
    } else {
      vfFilter += ",scale=480:-1:flags=lanczos";
    }
  } else if (resStr) {
    vfFilter = `scale=${resStr}:force_original_aspect_ratio=decrease`;
  }
  if (vfFilter) args.push("-vf", vfFilter);

  switch (outputFormat) {
    case "mp4":  args.push("-c:v", "libx264", "-crf", crf); break;
    case "webm": args.push("-c:v", "libvpx", "-crf", crf); break;
    case "gif":  break;
    case "mp3":  args.push("-vn", "-acodec", "libmp3lame"); outputName = "output.mp3"; break;
    case "mov":  args.push("-c:v", "libx264", "-crf", crf, "-pix_fmt", "yuv420p"); break;
    case "avi":  args.push("-c:v", "libxvid", "-q:v", String(Math.round((1 - quality) * 10))); break;
    case "mkv":  args.push("-c:v", "libx264", "-crf", crf); break;
    case "flv":  args.push("-c:v", "libx264", "-crf", crf, "-f", "flv"); break;
    case "wmv":  args.push("-c:v", "wmv2", "-b:v", "2M"); break;
    case "wav":  args.push("-vn", "-acodec", "pcm_s16le"); outputName = "output.wav"; break;
  }

  if (bitrate !== "auto" && !["gif", "mp3", "wav"].includes(outputFormat)) {
    args.push("-b:v", bitrate);
  }

  args.push(outputName);
  return args;
}
