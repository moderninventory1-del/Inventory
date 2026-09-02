// src/components/public/Navbar.tsx
// Public navigation bar — clean, mobile-aligned, Apple-style business header

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, ArrowLeft } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // On the homepage, the page itself renders the sticky search & filter bar in the top CTA area
  if (pathname === "/") {
    return null;
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        className="page-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingTop: "10px",
          paddingBottom: "10px",
          minHeight: "56px",
        }}
      >
        {/* ── Business Info / Back button ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: 0,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              textDecoration: "none",
              flexShrink: 0,
            }}
            title="Back to inventory"
          >
            <ArrowLeft size={16} />
          </Link>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <Link
              href="/"
              style={{
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "-0.025em",
                color: "var(--color-text-primary)",
                lineHeight: 1.2,
                textDecoration: "none",
              }}
            >
              Modern Electronics
            </Link>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "var(--color-text-muted)",
              }}
            >
              <MapPin size={10} color="var(--color-accent)" style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                1590/1, sector 45B, Burail, Chandigarh
              </span>
            </span>
          </div>
        </div>

        {/* ── Call Button ── */}
        <a
          href="tel:9872016790"
          className="btn-primary"
          style={{
            padding: "7px 14px",
            borderRadius: "100px",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(0, 113, 227, 0.2)",
          }}
          title="Call 9872016790"
        >
          <Phone size={13} strokeWidth={2.2} />
          <span>Call: 9872016790</span>
        </a>
      </div>
    </header>
  );
}
