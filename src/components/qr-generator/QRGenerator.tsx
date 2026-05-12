"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Download, QrCode, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { generateQRData, downloadQRAsPNG, getQRContentLabel, getQRContentPlaceholder } from "@/lib/qr-utils";
import type { QRContentType } from "@/types";

export default function QRGenerator() {
  const [content, setContent] = useState("");
  const [type, setType] = useState<QRContentType>("url");
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [size] = useState(300);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrDataURL, setQrDataURL] = useState<string>("");
  const [logo, setLogo] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(() => {
    if (!content.trim()) {
      toast.error("Ingresa el contenido para el QR");
      return;
    }

    const qrData = generateQRData({ content, type, foreground, background, size, errorCorrection, logo });

    // Use qrcode-generator library
    interface QRCodeLib {
      (typeNumber: number, errorCorrectionLevel: string): {
        addData: (data: string) => void;
        make: () => void;
        isDark: (row: number, col: number) => boolean;
        getModuleCount: () => number;
      };
    }
    const qrLib = (window as unknown as { QRCode: QRCodeLib }).QRCode;
    if (qrLib) {
      const typeNumber = errorCorrection === "L" ? 1 : errorCorrection === "M" ? 2 : errorCorrection === "Q" ? 3 : 4;
      const qr = qrLib(typeNumber, errorCorrection);
      qr.addData(qrData);
      qr.make();

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size, size);

      const moduleCount = qr.getModuleCount();
      const moduleSize = size / moduleCount;

      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillStyle = foreground;
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
          }
        }
      }

      if (logo) {
        const logoSize = size * 0.2;
        const img = new Image();
        img.onload = () => {
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          ctx.fillStyle = background;
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
          ctx.drawImage(img, x, y, logoSize, logoSize);
        };
        img.src = logo;
      }

      setQrDataURL(canvas.toDataURL());
    }
  }, [content, type, foreground, background, size, errorCorrection, logo]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) downloadQRAsPNG(canvasRef.current);
  };

  const handleDownloadSVG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><foreignObject width="100%" height="100%"><img src="${canvas.toDataURL()}"/></foreignObject></svg>`;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (qrDataURL) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foreground, background, size]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de contenido</label>
            <select value={type} onChange={(e) => setType(e.target.value as QRContentType)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm">
              <option value="url">URL</option>
              <option value="text">Texto</option>
              <option value="wifi">WiFi</option>
              <option value="vcard">vCard</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{getQRContentLabel(type)}</label>
            {type === "vcard" ? (
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={getQRContentPlaceholder(type)} rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm" />
            ) : (
              <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={getQRContentPlaceholder(type)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color frente</label>
              <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color fondo</label>
              <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Corrección de errores: {errorCorrection}</label>
            <select value={errorCorrection} onChange={(e) => setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm">
              <option value="L">Baja (L)</option>
              <option value="M">Media (M)</option>
              <option value="Q">Alta (Q)</option>
              <option value="H">Máxima (H)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Logo (opcional)</label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">{logo ? "Cambiar logo" : "Subir logo"}</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 mt-1">Quitar logo</button>}
          </div>
          <button onClick={generate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg transition-all">
            <QrCode className="w-4 h-4" /> Generar QR
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          {qrDataURL ? (
            <>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white">
                <img src={qrDataURL} alt="QR Code" style={{ width: size, height: size }} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleDownloadPNG} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <Download className="w-4 h-4" /> PNG
                </button>
                <button onClick={handleDownloadSVG} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <Download className="w-4 h-4" /> SVG
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-72 h-72 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 text-sm text-center p-4">
              Genera un QR para ver la vista previa
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
