import type { QROptions, QRContentType } from "@/types";

export function generateQRData(options: QROptions): string {
  const { type, content } = options;
  switch (type) {
    case "url":
      return content.startsWith("http") ? content : `https://${content}`;
    case "wifi": {
      const parts = content.split(",");
      const ssid = parts[0]?.trim() || "";
      const password = parts[1]?.trim() || "";
      const encryption = parts[2]?.trim() || "WPA";
      return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
    }
    case "vcard": {
      const parts = content.split("\n");
      const name = parts[0]?.trim() || "";
      const tel = parts[1]?.trim() || "";
      const email = parts[2]?.trim() || "";
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${tel}\nEMAIL:${email}\nEND:VCARD`;
    }
    case "email":
      return content.includes("@") ? `mailto:${content}` : content;
    default:
      return content;
  }
}

export function downloadQRAsPNG(canvas: HTMLCanvasElement, filename = "qrcode") {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function downloadQRAsSVG(svgElement: SVGElement, filename = "qrcode") {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getQRContentLabel(type: QRContentType): string {
  const labels: Record<QRContentType, string> = {
    url: "URL del sitio web",
    text: "Texto libre",
    wifi: "SSID,Contraseña,Encriptación (WPA/WEP)",
    vcard: "Nombre\nTeléfono\nEmail",
    email: "Dirección de email",
  };
  return labels[type];
}

export function getQRContentPlaceholder(type: QRContentType): string {
  const placeholders: Record<QRContentType, string> = {
    url: "https://ejemplo.com",
    text: "Escribe tu texto aquí...",
    wifi: "MiRed,miContraseña,WPA",
    vcard: "Juan Pérez\n+521234567890\njuan@ejemplo.com",
    email: "usuario@ejemplo.com",
  };
  return placeholders[type];
}
