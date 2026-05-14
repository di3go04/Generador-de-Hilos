import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Urban Studio | Suite Creativa IA",
  description: "Herramientas de IA diseñadas con un toque humano y profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden`}>
        {/* Background Mesh */}
        <div className="mesh-bg">
          <div className="mesh-blob w-[800px] h-[800px] -top-96 -left-48 bg-brand-accent/15" />
          <div className="mesh-blob w-[600px] h-[600px] bottom-0 -right-24 bg-brand-accent/10" />
          <div className="mesh-blob w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-success/5" />
        </div>

        <Providers>
          <div className="relative z-0 min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
