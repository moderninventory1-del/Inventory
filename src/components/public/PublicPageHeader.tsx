"use client";
// src/components/public/PublicPageHeader.tsx
// Premium storefront hero header + sticky search bar that smoothly slides to the top when clicked/focused

import { useState, useCallback, useRef } from "react";
import { MapPin, Phone, Tv } from "lucide-react";
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
      {/* ── 1. Top of the page: Premium Modern Electronics Storefront Hero Card ── */}
      <section
        className={`brand-hero-card ${isSearchActive ? "collapsed" : ""}`}
        aria-hidden={isSearchActive}
      >
        <div className="hero-card-inner">
          {/* Top Brand Line: Logo Badge + Title + Live Indicator */}
          <div className="hero-top-row">
            <div className="hero-brand-badge" aria-hidden="true">
              <Tv size={22} strokeWidth={2.4} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hero-title-group">
                <h1 className="hero-title">Modern Electronics</h1>
                <span className="hero-status-pill">
                  <span className="hero-status-dot" />
                  Live Stock
                </span>
              </div>

              <div className="hero-address">
                <MapPin size={13} className="hero-map-icon" />
                <span>1590/1, sector 45B, Burail, Chandigarh</span>
              </div>
            </div>
          </div>

          {/* Quick Call Action Button & Verified Store Info */}
          <div className="hero-action-row">
            <a
              href="tel:9872016790"
              className="hero-call-btn"
              title="Call Modern Electronics: 9872016790"
            >
              <Phone size={14} strokeWidth={2.4} />
              <span>Call: 9872016790</span>
            </a>
            <span className="hero-tagline">Genuine TV Spare Parts & Boards</span>
          </div>
        </div>
      </section>

      {/* ── 2. Sticky Search Bar and Filters (Differentiated Container) ── */}
      <div className={`sticky-search-container ${isSearchActive ? "search-docked" : ""}`}>
        <SearchFilterBar
          brands={brands}
          categories={categories}
          onSearchActiveChange={handleSearchActiveChange}
        />
      </div>

      <style>{`
        .brand-hero-card {
          max-height: 260px;
          opacity: 1;
          transform: translateY(0);
          overflow: hidden;
          transition: max-height 340ms cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 260ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 340ms cubic-bezier(0.16, 1, 0.3, 1),
                      margin-bottom 340ms cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 20px;
        }

        .brand-hero-card.collapsed {
          max-height: 0px !important;
          opacity: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          transform: translateY(-24px) !important;
          pointer-events: none !important;
        }

        .hero-card-inner {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(0, 113, 227, 0.12);
          border-radius: 20px;
          padding: 18px 20px;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05),
                      0 1px 4px rgba(0, 113, 227, 0.04);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hero-top-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .hero-brand-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0071e3 0%, #0051a8 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(0, 113, 227, 0.35);
        }

        .hero-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .hero-title {
          font-size: clamp(20px, 5.5vw, 27px);
          font-weight: 800;
          letter-spacing: -0.035em;
          color: #0f172a;
          line-height: 1.15;
          margin: 0;
        }

        .hero-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          color: #059669;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .hero-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .hero-address {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.4;
          margin-top: 4px;
        }

        .hero-map-icon {
          color: var(--color-accent);
          flex-shrink: 0;
        }

        .hero-action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px dashed rgba(0, 0, 0, 0.07);
        }

        .hero-call-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff !important;
          background: linear-gradient(180deg, #0077ed 0%, #0066cc 100%);
          text-decoration: none;
          box-shadow: 0 3px 12px rgba(0, 113, 227, 0.32);
          transition: transform 160ms ease, box-shadow 160ms ease;
          user-select: none;
        }

        .hero-call-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(0, 113, 227, 0.4);
        }

        .hero-call-btn:active {
          transform: scale(0.96);
        }

        .hero-tagline {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
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

        @media (max-width: 480px) {
          .hero-card-inner {
            padding: 14px 16px;
            gap: 12px;
          }
          .hero-brand-badge {
            width: 38px;
            height: 38px;
            border-radius: 10px;
          }
          .hero-top-row {
            gap: 10px;
          }
          .hero-action-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .hero-call-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
