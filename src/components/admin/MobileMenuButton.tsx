"use client";
// src/components/admin/MobileMenuButton.tsx
// Inline menu toggle for mobile page headers — only visible on mobile

import { Menu } from "lucide-react";
import { useMobileMenu } from "./MobileMenuContext";

export default function MobileMenuButton() {
  const { open } = useMobileMenu();
  return (
    <button
      onClick={open}
      className="admin-mobile-menu-btn"
      style={{
        display: "none", // CSS shows it on mobile only
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "8px",
        cursor: "pointer",
        color: "var(--color-text-primary)",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label="Open menu"
    >
      <Menu size={20} />
      <style>{`
        @media (max-width: 767px) {
          .admin-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </button>
  );
}
