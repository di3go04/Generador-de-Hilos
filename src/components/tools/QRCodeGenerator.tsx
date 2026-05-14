"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QRCodeGenerator({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [text, setText] = useState("");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#0f172a"); // slate-900
  const svgRef = useRef<SVGSVGElement>(null);

  const generateAndTrack = async () => {
    if (!text) return;
    
    await onAction(async () => {
      // Just track the usage, the QR is generated real-time by the component
      return true;
    });
  };

  const downloadQR = () => {
    if (!svgRef.current) return;
    
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Add padding
      const padding = 20;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "qrcode.png";
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Generador de QR</h2>
        <p className="text-slate-400">Crea códigos QR personalizados para tus enlaces o textos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Contenido (URL o Texto)
            </label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (e.target.value.length === 1) generateAndTrack(); // Track first type
              }}
              placeholder="https://mi-sitio-web.com..."
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Color QR</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={fgColor} 
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-xs text-slate-300 uppercase">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Color Fondo</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-xs text-slate-300 uppercase">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6 bg-slate-800/30 p-6 rounded-xl border border-slate-800">
          {text ? (
            <div className="p-4 bg-white rounded-xl shadow-lg transition-all">
              <QRCodeSVG 
                value={text} 
                size={200} 
                fgColor={fgColor} 
                bgColor={bgColor} 
                level="H"
                includeMargin={false}
                ref={svgRef}
              />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
              <QrCode className="w-12 h-12 opacity-50" />
            </div>
          )}

          <Button 
            onClick={downloadQR} 
            disabled={!text}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" /> Descargar PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
