"use client";

import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Upload, Download, Film, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoConverter({ onAction }: { onAction: (action: () => Promise<any>) => Promise<any> }) {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [outputBlob, setOutputBlob] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<"webm" | "mp4">("webm");
  
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(progress * 100);
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      setLoaded(true);
    } catch (e) {
      console.error("Failed to load FFmpeg", e);
    } finally {
      setIsLoading(false);
    }
  };

  const processVideo = async () => {
    if (!file) return;

    await onAction(async () => {
      if (!loaded) await load();
      
      const ffmpeg = ffmpegRef.current;
      const inputName = `input.${file.name.split('.').pop()}`;
      const outputName = `output.${targetFormat}`;
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      setProgress(1); // Start indicator
      
      // Run the FFmpeg command
      await ffmpeg.exec(['-i', inputName, outputName]);
      
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: `video/${targetFormat}` }));
      
      setOutputBlob(url);
      setProgress(100);
    });
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Conversor de Video</h2>
        <p className="text-slate-400">Convierte videos entre formatos localmente con WebAssembly.</p>
      </div>

      {!loaded && !isLoading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
          <Film className="mx-auto w-8 h-8 text-blue-400 mb-2" />
          <p className="text-sm text-slate-300 mb-4">Esta herramienta descarga ~30MB de librerías para procesar offline.</p>
          <Button onClick={load} className="bg-blue-600 hover:bg-blue-700">Cargar Motor de Video</Button>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-slate-400">Cargando motor FFmpeg...</p>
        </div>
      )}

      {loaded && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block p-8 border-2 border-dashed border-slate-700 rounded-xl text-center hover:bg-slate-800/50 hover:border-blue-500 cursor-pointer transition-all">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="video/mp4,video/webm,video/quicktime" 
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setFile(e.target.files[0]);
                      setOutputBlob(null);
                      setProgress(0);
                    }
                  }} 
                />
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-300 block">
                  {file ? file.name : "Selecciona un video corto"}
                </span>
                {file && <span className="text-xs text-blue-400 mt-1 block">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
              </label>
            </div>

            <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Formato de salida</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200"
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as any)}
                >
                  <option value="webm">WebM</option>
                  <option value="mp4">MP4</option>
                </select>
              </div>
              
              <Button 
                onClick={processVideo} 
                disabled={!file || (progress > 0 && progress < 100)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {progress > 0 && progress < 100 ? "Procesando..." : "Convertir Video"}
              </Button>

              {progress > 0 && progress < 100 && (
                <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden border border-slate-700">
                  <div className="bg-blue-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>
          </div>

          {outputBlob && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center justify-between">
              <span className="text-sm text-green-400 font-medium">¡Video convertido con éxito!</span>
              <a 
                href={outputBlob} 
                download={`converted_video.${targetFormat}`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" /> Descargar
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
