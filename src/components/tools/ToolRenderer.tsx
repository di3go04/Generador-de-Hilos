"use client";

import { Tool } from "@/app/herramientas/toolsData";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Terminal } from "lucide-react";

// Existing Tools
import ImageConverter from "./ImageConverter";
import VideoConverter from "./VideoConverter";
import PdfConverter from "./PdfConverter";
import UrlShortener from "./UrlShortener";
import QRCodeGenerator from "./QRCodeGenerator";
import WordCounter from "./WordCounter";
import CurrencyConverter from "./CurrencyConverter";
import PasswordGenerator from "./PasswordGenerator";
import PomodoroTimer from "./PomodoroTimer";
import FileCompressor from "./FileCompressor";

// New Tools (Placeholders for now, will be created)
import DocumentConverter from "./DocumentConverter";
import AudioConverter from "./AudioConverter";
import UnitConverter from "./UnitConverter";
import JsonFormatter from "./JsonFormatter";
import DiffChecker from "./DiffChecker";
import SlugGenerator from "./SlugGenerator";
import LoremIpsum from "./LoremIpsum";
import Base64Tool from "./Base64Tool";
import HashGenerator from "./HashGenerator";
import AesEncryptor from "./AesEncryptor";
import UuidGenerator from "./UuidGenerator";
import MinifierTool from "./MinifierTool";
import PrettierTool from "./PrettierTool";
import RegexTester from "./RegexTester";
import ColorConverter from "./ColorConverter";
import DateCalculator from "./DateCalculator";
import MetadataExtractor from "./MetadataExtractor";
import ScreenshotTool from "./ScreenshotTool";
import SvgEditor from "./SvgEditor";
import TodoList from "./TodoList";

export default function ToolRenderer({ tool, userId, customAction }: { tool: Tool, userId: string, customAction?: (action: () => Promise<any>) => Promise<any> }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToolAction = async (action: () => Promise<any>) => {
    if (customAction) return customAction(action);
    setIsProcessing(true);
    try {
      const result = await action();
      await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: tool.slug }),
      }).catch(() => {});
      return result;
    } catch (error) {
      toast.error("Error al procesar la herramienta");
      console.error(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  switch (tool.slug) {
    case "conversor-imagenes": return <ImageConverter onAction={handleToolAction} />;
    case "conversor-video": return <VideoConverter onAction={handleToolAction} />;
    case "conversor-pdf": return <PdfConverter onAction={handleToolAction} />;
    case "conversor-documentos": return <DocumentConverter onAction={handleToolAction} />;
    case "conversor-audio": return <AudioConverter onAction={handleToolAction} />;
    case "conversor-unidades": return <UnitConverter onAction={handleToolAction} />;
    case "conversor-divisas": return <CurrencyConverter onAction={handleToolAction} />;
    case "contador-palabras": return <WordCounter onAction={handleToolAction} />;
    case "formateador-json": return <JsonFormatter onAction={handleToolAction} />;
    case "comparador-textos": return <DiffChecker onAction={handleToolAction} />;
    case "generador-slugs": return <SlugGenerator onAction={handleToolAction} />;
    case "lorem-ipsum": return <LoremIpsum onAction={handleToolAction} />;
    case "base64": return <Base64Tool onAction={handleToolAction} />;
    case "generador-contrasenas": return <PasswordGenerator onAction={handleToolAction} />;
    case "generador-hash": return <HashGenerator onAction={handleToolAction} />;
    case "cifrado-aes": return <AesEncryptor onAction={handleToolAction} />;
    case "generador-qr": return <QRCodeGenerator onAction={handleToolAction} />;
    case "generador-uuid": return <UuidGenerator onAction={handleToolAction} />;
    case "minificador-codigo": return <MinifierTool onAction={handleToolAction} />;
    case "prettier-online": return <PrettierTool onAction={handleToolAction} />;
    case "regex-tester": return <RegexTester onAction={handleToolAction} />;
    case "conversor-colores": return <ColorConverter onAction={handleToolAction} />;
    case "calculadora-fechas": return <DateCalculator onAction={handleToolAction} />;
    case "compresor-imagenes-lote": return <FileCompressor onAction={handleToolAction} />; // Reusing FileCompressor for now
    case "extractor-metadatos": return <MetadataExtractor onAction={handleToolAction} />;
    case "captura-url": return <ScreenshotTool onAction={handleToolAction} />;
    case "editor-svg": return <SvgEditor onAction={handleToolAction} />;
    case "pomodoro": return <PomodoroTimer onAction={handleToolAction} />;
    case "acortador-url": return <UrlShortener onAction={handleToolAction} />;
    case "todo-list": return <TodoList onAction={handleToolAction} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <Terminal className="w-12 h-12 text-slate-500" />
           <p className="text-slate-400 font-medium">Esta herramienta está siendo configurada...</p>
           <p className="text-xs text-slate-500 max-w-xs text-center">
             Estamos integrando la lógica para {tool.name}. Estará disponible pronto.
           </p>
        </div>
      );
  }
}
