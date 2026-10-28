// src/components/public/Navbar.tsx
// Public navigation bar — clean, mobile-aligned, Apple-style business header & upper CTA

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";

export default function Navbar() {
  const pathname = usePathname();

  // On the homepage, the page itself renders the sticky search & filter bar in the top CTA area
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="public-navbar-header">
      <div className="page-container public-navbar-inner">
        {/* ── Top Row: Brand Identity & Call CTA ── */}
        <div className="navbar-main-row">
          {/* Brand Logo & Name */}
          <div className="navbar-brand-group">
            <Link
              href="/"
              className="navbar-brand-badge"
              title="Modern Electronics — Home & Catalog"
            >
              <BrandLogo size={22} color="#ffffff" />
            </Link>

            <div className="navbar-brand-info">
              <div className="navbar-title-row">
                <Link href="/" className="navbar-brand-title">
                  Modern Electronics
                </Link>
                <span className="navbar-live-pill" title="Live Stock Inventory Available">
                  <span className="navbar-live-dot" />
                  Live Stock
                </span>
              </div>

              {/* Desktop-only secondary address line inside brand info */}
              <div className="navbar-desktop-address-row">
                <a
                  href="https://maps.app.goo.gl/WFVLkreNKd58rPsV8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar-address-link"
                  title="Open Store Location in Google Maps"
                >
                  <MapPin size={11} className="navbar-map-icon" />
                  <span>1590/1, Sector 45B, Burail, Chandigarh</span>
                  <ExternalLink size={10} style={{ opacity: 0.6 }} />
                </a>
                <span className="navbar-divider">•</span>
                <span className="navbar-tagline">Genuine TV Spare Parts & Boards</span>
              </div>
            </div>
          </div>

          {/* Quick Call Action Button */}
          <a
            href="tel:9872016790"
            className="navbar-call-btn"
            title="Call Modern Electronics: 9872016790"
          >
            <Phone size={13} strokeWidth={2.4} />
            <span className="navbar-call-label">Call: 9872016790</span>
          </a>
        </div>

        {/* ── Mobile-Only Address & Verification Bar (Never Truncated!) ── */}
        <div className="navbar-mobile-address-row">
          <a
            href="https://maps.app.goo.gl/WFVLkreNKd58rPsV8"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-mobile-address-link"
            title="Open Store Location in Google Maps"
          >
            <div className="navbar-mobile-address-content">
              <MapPin size={11} className="navbar-map-icon" />
              <span className="navbar-mobile-address-text">
                1590/1, Sector 45B, Burail, Chandigarh
              </span>
            </div>
            <span className="navbar-directions-tag">
              Maps ↗
            </span>
          </a>
        </div>
      </div>

      <style>{`
        .public-navbar-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--color-border);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }

        .public-navbar-inner {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 8px;
          padding-bottom: 8px;
        }

        .navbar-main-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
        }

        .navbar-brand-group {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }

        .navbar-brand-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0071e3 0%, #0051a8 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
          text-decoration: none;
          transition: transform 140ms ease;
        }

        .navbar-brand-badge:hover {
          transform: scale(1.04);
        }

        .navbar-brand-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .navbar-title-row {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .navbar-brand-title {
          font-size: 15.5px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--color-text-primary);
          line-height: 1.2;
          text-decoration: none;
          white-space: nowrap;
        }

        .navbar-brand-title:hover {
          color: var(--color-accent);
        }

        .navbar-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 1.5px 6.5px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 750;
          color: #059669;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.22);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          line-height: 1.3;
        }

        .navbar-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 5px #10b981;
          display: inline-block;
        }

        .navbar-desktop-address-row {
          display: none;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--color-text-secondary);
        }

        .navbar-address-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color 140ms ease;
        }

        .navbar-address-link:hover {
          color: var(--color-accent);
        }

        .navbar-map-icon {
          color: var(--color-accent);
          flex-shrink: 0;
        }

        .navbar-divider {
          color: var(--color-border-hover);
          font-size: 10px;
        }

        .navbar-tagline {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--color-text-muted);
        }

        .navbar-call-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 100px;
          font-size: 12.5px;
          font-weight: 700;
          color: #ffffff !important;
          background: linear-gradient(180deg, #0077ed 0%, #0066cc 100%);
          text-decoration: none;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 113, 227, 0.28);
          transition: transform 140ms ease, box-shadow 140ms ease;
          user-select: none;
        }

        .navbar-call-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.38);
        }

        .navbar-call-btn:active {
          transform: translateY(0);
        }

        .navbar-mobile-address-row {
          display: flex;
          align-items: center;
          width: 100%;
          padding-top: 4px;
          border-top: 1px dashed rgba(0, 0, 0, 0.06);
        }

        .navbar-mobile-address-link {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: var(--color-text-secondary);
          text-decoration: none;
          gap: 6px;
        }

        .navbar-mobile-address-content {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }

        .navbar-mobile-address-text {
          white-space: normal;
          line-height: 1.35;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .navbar-directions-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-accent);
          background: rgba(0, 113, 227, 0.08);
          border: 1px solid rgba(0, 113, 227, 0.16);
          padding: 1.5px 6px;
          border-radius: 4px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        @media (min-width: 680px) {
          .public-navbar-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            min-height: 58px;
            padding-top: 9px;
            padding-bottom: 9px;
          }

          .navbar-desktop-address-row {
            display: inline-flex;
          }

          .navbar-mobile-address-row {
            display: none !important;
          }

          .navbar-brand-badge {
            width: 40px;
            height: 40px;
            border-radius: 11px;
          }

          .navbar-brand-title {
            font-size: 16.5px;
          }
        }
      `}</style>
    </header>
  );
}
