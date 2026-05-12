import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Urban - Suite de Herramientas Creativas",
  description: "Suite profesional de herramientas digitales: generador de hilos IA, conversor de video, OCR, diseño y más.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(!t&&p))document.documentElement.classList.add('dark')}catch(e){}})();`,
        }} />
      </head>
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-cyan-500/20">
        <Toaster position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              background: "rgba(15, 15, 30, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 242, 255, 0.1)",
              color: "#e2e8f0",
            },
          }} />
        {children}
      </body>
    </html>
  );
}
