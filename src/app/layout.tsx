// src/app/layout.tsx
// Root layout — applies to all routes

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: {
    default: "Modern Electronics Inventory | TV Repair & Spare Parts",
    template: "%s | Modern Electronics Inventory",
  },
  description:
    "Browse the online TV spare parts inventory of Modern Electronics, a professional electronics repair business located in Chandigarh. Find high-quality motherboard and repair components.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProviderWrapper>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-bg-card)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
<<<<<<< HEAD
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
              },
              success: {
                iconTheme: {
                  primary: "var(--color-success)",
                  secondary: "var(--color-bg-card)",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--color-danger)",
                  secondary: "var(--color-bg-card)",
                },
              },
            }}
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
