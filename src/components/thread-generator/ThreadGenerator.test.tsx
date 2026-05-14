import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ThreadGenerator from "./ThreadGenerator";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────

// Mock de react-hot-toast para evitar dependencias de DOM
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock de framer-motion para evitar animaciones en tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...rest }: any) => (
      <div className={className} {...rest}>{children}</div>
    ),
    a: ({ children, className, href, download, ...rest }: any) => (
      <a className={className} href={href} download={download} {...rest}>{children}</a>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock base de ffmpeg (carga exitosa)
const mockFFmpegInstance = {
  load: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  exec: vi.fn().mockResolvedValue(0),
  readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  terminate: vi.fn(),
};

vi.mock("@ffmpeg/ffmpeg", () => ({
  FFmpeg: vi.fn(() => mockFFmpegInstance),
}));

vi.mock("@ffmpeg/util", () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array()),
  toBlobURL: vi.fn().mockResolvedValue("blob:mock-url"),
}));

// ── Tests ──────────────────────────────────────────────────────

describe("ThreadGenerator – Renderizado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restaurar mock de carga exitosa por defecto
    mockFFmpegInstance.load.mockResolvedValue(undefined);
  });

  it("renderiza el título del componente correctamente", async () => {
    render(<ThreadGenerator />);
    expect(screen.getByText(/Generador de/i)).toBeInTheDocument();
  });

  it("muestra el prompt de subida cuando no hay archivo seleccionado", async () => {
    render(<ThreadGenerator />);
    expect(screen.getByText(/Sube tu archivo .mp4/i)).toBeInTheDocument();
  });

  it("muestra estado 'Iniciando Motor...' mientras ffmpeg carga", () => {
    render(<ThreadGenerator />);
    // El botón debe mostrar 'Iniciando Motor...' antes de que ffmpeg resuelva
    expect(screen.getByText(/Iniciando Motor/i)).toBeInTheDocument();
  });

  it("el botón de convertir está deshabilitado sin archivo", () => {
    render(<ThreadGenerator />);
    const buttons = screen.getAllByRole("button");
    // El botón principal de conversión debe estar deshabilitado
    const convertBtn = buttons.find(
      (b) => b.getAttribute("id") === "btn-convert" || b.textContent?.includes("Motor") || b.textContent?.includes("Convertir")
    );
    expect(convertBtn).toBeDisabled();
  });

  it("no muestra el botón de descarga al inicio", () => {
    render(<ThreadGenerator />);
    expect(screen.queryByText(/Descargar MKV/i)).not.toBeInTheDocument();
  });
});

describe("ThreadGenerator – Fallback de error", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra la UI de error cuando ffmpeg falla al cargar", async () => {
    // Simular error de carga
    mockFFmpegInstance.load.mockRejectedValueOnce(
      new Error("SharedArrayBuffer no disponible – COEP bloqueado")
    );

    render(<ThreadGenerator />);

    await waitFor(() => {
      expect(screen.getByText(/Motor Local No Disponible/i)).toBeInTheDocument();
    });
  });

  it("muestra el botón de 'USAR CLOUD ENGINE' en estado de error", async () => {
    mockFFmpegInstance.load.mockRejectedValueOnce(new Error("Wasm failed"));

    render(<ThreadGenerator />);

    await waitFor(() => {
      expect(screen.getByText(/USAR CLOUD ENGINE/i)).toBeInTheDocument();
    });
  });

  it("muestra el detalle del error en modo debug", async () => {
    const errorMessage = "Test error message for debug";
    mockFFmpegInstance.load.mockRejectedValueOnce(new Error(errorMessage));

    render(<ThreadGenerator />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
    });
  });
});

describe("ThreadGenerator – Flujo de conversión", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFFmpegInstance.load.mockResolvedValue(undefined);
    // Mock global URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:fake-download-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("muestra el botón de descarga tras conversión exitosa", async () => {
    // Simular que ffmpeg carga y procesa correctamente
    mockFFmpegInstance.readFile.mockResolvedValueOnce(
      new Uint8Array([0, 1, 2, 3])
    );

    render(<ThreadGenerator />);

    // Esperar a que ffmpeg cargue
    await waitFor(() => {
      expect(mockFFmpegInstance.load).toHaveBeenCalled();
    });

    // Simular selección de archivo
    const input = screen.getByLabelText(/Seleccionar video mp4/i);
    const mockFile = new File(["video content"], "test-video.mp4", { type: "video/mp4" });
    fireEvent.change(input, { target: { files: [mockFile] } });

    // Hacer click en convertir
    const convertBtn = screen.getByRole("button", { name: /Convertir a .mkv/i });
    fireEvent.click(convertBtn);

    // Esperar botón de descarga
    await waitFor(() => {
      expect(screen.getByText(/Descargar MKV/i)).toBeInTheDocument();
    });
  });
});
