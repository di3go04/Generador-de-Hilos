"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--bg-surface)",
                color: "var(--text-heading)",
                border: "1px solid var(--border-main)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: { iconTheme: { primary: "#10B981", secondary: "white" } },
              error: { iconTheme: { primary: "#EF4444", secondary: "white" } },
            }}
          />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
