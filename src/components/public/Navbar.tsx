// src/components/public/Navbar.tsx
// Public navigation bar — Modern Electronics business header

"use client";

import { MapPin, Phone, ChevronUp } from "lucide-react";

export default function Navbar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10, 10, 15, 0.88)",
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
          minHeight: "64px",
        }}
      >
        {/* ── Business Identity ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            minWidth: 0,
          }}
        >
          {/* Company name */}
          <span
            style={{
              fontWeight: 700,
              fontSize: "clamp(14px, 3.5vw, 17px)",
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
            }}
          >
            Modern Electronics
          </span>

          {/* Address + phones row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "6px 14px",
              rowGap: "2px",
            }}
          >
            {/* Address */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "var(--color-text-muted)",
                lineHeight: 1.4,
                minWidth: 0,
              }}
            >
              <MapPin
                size={10}
                style={{ color: "var(--color-accent-text)", flexShrink: 0 }}
              />
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                SCO 1590/1, Burail, Sector 45B, Chandigarh
              </span>
            </span>

            {/* Phones */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <Phone
                size={10}
                style={{ color: "var(--color-accent-text)", flexShrink: 0 }}
              />
              <a
                href="tel:9872016790"
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-text-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-text-muted)")
                }
              >
                9872016790
              </a>
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--color-border-hover)",
                }}
              >
                /
              </span>
              <a
                href="tel:7652851408"
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-text-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-text-muted)")
                }
              >
                7652851408
              </a>
            </span>
          </div>
        </div>

        {/* ── Scroll-to-Top Button ── */}
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            flexShrink: 0,
            borderRadius: "var(--radius-sm)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            transition:
              "background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(99, 102, 241, 0.12)";
            btn.style.borderColor = "rgba(99, 102, 241, 0.35)";
            btn.style.color = "var(--color-accent-text)";
            btn.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(255,255,255,0.05)";
            btn.style.borderColor = "var(--color-border)";
            btn.style.color = "var(--color-text-muted)";
            btn.style.transform = "translateY(0)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0) scale(0.95)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-1px)";
          }}
        >
          <ChevronUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
