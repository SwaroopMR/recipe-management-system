"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FavoritesProvider } from "@/context/favorites-context";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes cache
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#0F172A",
              border: "1px solid rgba(37, 99, 235, 0.1)",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-outfit), sans-serif",
            },
            className: "shadow-lg border",
          }}
        />
      </FavoritesProvider>
    </QueryClientProvider>
  );
}
