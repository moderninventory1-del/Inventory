// src/app/layout.tsx
// Root layout — applies to all routes

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import PreventZoom from "@/components/shared/PreventZoom";
import ServiceWorkerRegister from "@/components/shared/ServiceWorkerRegister";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: {
    default: "Modern Electronics Inventory | TV Repair & Spare Parts",
    template: "%s | Modern Electronics Inventory",
  },
  description:
    "Browse the online TV spare parts inventory of Modern Electronics, a professional electronics repair business located in Chandigarh. Find high-quality motherboard and repair components.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Modern Electronics",
  },
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
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <PreventZoom />
        <ServiceWorkerRegister />
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
