import type { OutputImageFormat } from "@/types";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export function convertImage(
  canvas: HTMLCanvasElement,
  format: OutputImageFormat,
  quality: number
): Promise<Blob> {
  const mimeType =
    format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Error al convertir la imagen"));
      },
      mimeType,
      quality
    );
  });
}

export async function convertImages(
  files: { canvas: HTMLCanvasElement; name: string }[],
  format: OutputImageFormat,
  quality: number,
  onProgress?: (progress: number) => void
): Promise<void> {
  if (files.length === 1) {
    const blob = await convertImage(files[0].canvas, format, quality);
    const ext = format === "jpeg" ? "jpg" : format;
    saveAs(blob, `${files[0].name.replace(/\.[^.]+$/, "")}.${ext}`);
    onProgress?.(100);
    return;
  }

  const zip = new JSZip();
  for (let i = 0; i < files.length; i++) {
    const blob = await convertImage(files[i].canvas, format, quality);
    const ext = format === "jpeg" ? "jpg" : format;
    zip.file(`${files[i].name.replace(/\.[^.]+$/, "")}.${ext}`, blob);
    onProgress?.(Math.round(((i + 1) / files.length) * 100));
  }
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "converted-images.zip");
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}
