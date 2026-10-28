// src/app/(public)/layout.tsx
// Public layout — no auth required

import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import ScrollToTopProgress from "@/components/public/ScrollToTopProgress";

export const metadata: Metadata = {
  title: "Modern Electronics | Browse Available Spare Parts",
  description: "Modern Electronics — 1590/1, sector 45B, Burail, Chandigarh. Browse our available TV spare parts inventory.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />
      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>
        {children}
      </main>
      <ScrollToTopProgress />
      <footer
        style={{
          textAlign: "center",
          padding: "24px 16px",
          color: "var(--color-text-muted)",
          fontSize: "13px",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        © {new Date().getFullYear()} Modern Electronics, Chandigarh. All rights reserved.
      </footer>
    </div>
  );
}
