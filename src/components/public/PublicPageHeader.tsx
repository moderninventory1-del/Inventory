"use client";
// src/components/public/PublicPageHeader.tsx
// Brand hero header + sticky search bar that smoothly slides to the top when clicked/focused

import { useState, useCallback, useRef } from "react";
import { MapPin, Phone } from "lucide-react";
import SearchFilterBar from "@/components/shared/SearchFilterBar";

interface PublicPageHeaderProps {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[] | string[];
}

export default function PublicPageHeader({
  brands,
  categories,
}: PublicPageHeaderProps) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleSearchActiveChange = useCallback((active: boolean) => {
    setIsSearchActive(active);
    if (active && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div ref={headerRef} className="public-header-wrapper">
      {/* ── 1. Top of the page: Modern Electronics Brand & Contact ── */}
      <section
        className={`brand-hero-header ${isSearchActive ? "collapsed" : ""}`}
        aria-hidden={isSearchActive}
      >
        <h1
          style={{
            fontSize: "clamp(26px, 6vw, 36px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: "var(--color-text-primary)",
            lineHeight: 1.15,
          }}
        >
          Modern Electronics
        </h1>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--color-text-muted)",
            lineHeight: 1.4,
            marginTop: "3px",
          }}
        >
          <MapPin size={13} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <span>1590/1, sector 45B, Burail, Chandigarh</span>
        </div>

        <div style={{ marginTop: "10px" }}>
          <a
            href="tel:9872016790"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 18px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 3px 12px rgba(0, 113, 227, 0.25)",
            }}
            title="Call 9872016790"
          >
            <Phone size={14} strokeWidth={2.4} />
            <span>Call: 9872016790</span>
          </a>
        </div>
      </section>

      {/* ── 2. Sticky Search Bar and Filters ── */}
      <div className={`sticky-search-container ${isSearchActive ? "search-docked" : ""}`}>
        <SearchFilterBar
          brands={brands}
          categories={categories}
          onSearchActiveChange={handleSearchActiveChange}
        />
      </div>

      <style>{`
        .brand-hero-header {
          max-height: 220px;
          opacity: 1;
          transform: translateY(0);
          overflow: hidden;
          transition: max-height 320ms cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 240ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
                      margin-bottom 320ms cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 14px;
        }

        .brand-hero-header.collapsed {
          max-height: 0px !important;
          opacity: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          transform: translateY(-24px) !important;
          pointer-events: none !important;
        }

        .sticky-search-container {
          position: sticky;
          top: 0;
          z-index: 35;
          background: rgba(251, 251, 253, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding-top: 6px;
          padding-bottom: 12px;
          margin-bottom: 16px;
          transition: all 240ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sticky-search-container.search-docked {
          padding-top: 10px;
          padding-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
