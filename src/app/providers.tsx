"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <MotionConfig transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
        {children}
      </MotionConfig>
    </ThemeProvider>
  );
}
