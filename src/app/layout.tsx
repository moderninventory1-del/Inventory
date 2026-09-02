// src/app/layout.tsx
// Root layout — applies to all routes

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import PreventZoom from "@/components/shared/PreventZoom";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

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
        <PreventZoom />
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
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
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
