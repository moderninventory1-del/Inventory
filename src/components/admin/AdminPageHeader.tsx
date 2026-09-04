"use client";
// src/components/admin/AdminPageHeader.tsx
// Interactive admin inventory header with slide-up collapse and sticky docked search bar

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import SearchFilterBar from "@/components/shared/SearchFilterBar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";

interface AdminPageHeaderProps {
  totalCount: number;
  statusLabel: string;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[] | string[];
  boxes?: { key: string; name: string }[];
}

export default function AdminPageHeader({
  totalCount,
  statusLabel,
  brands,
  categories,
  boxes,
}: AdminPageHeaderProps) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleSearchActiveChange = useCallback((active: boolean) => {
    setIsSearchActive(active);
    if (active && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div ref={headerRef} className="admin-header-wrapper">
      {/* ── 1. Top Admin Inventory Title & Add Item Action (collapses on search) ── */}
      <section
        className={`admin-hero-header ${isSearchActive ? "collapsed" : ""}`}
        aria-hidden={isSearchActive}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <MobileMenuButton />
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  color: "var(--color-text-primary)",
                  lineHeight: 1.2,
                }}
              >
                Inventory
              </h1>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--color-text-muted)",
                  marginTop: "3px",
                }}
              >
                <strong style={{ color: "var(--color-text-secondary)", fontWeight: 700 }} className="tabular-nums">
                  {totalCount}
                </strong>{" "}
                {statusLabel}item{totalCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/admin/inventory/new"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "13.5px",
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: "100px",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0, 113, 227, 0.25)",
              }}
            >
              <PlusCircle size={15} strokeWidth={2.4} />
              <span>Add Item</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Sticky Docked Search & Filters (Slides to top on search) ── */}
      <div className={`sticky-search-container ${isSearchActive ? "search-docked" : ""}`}>
        <SearchFilterBar
          brands={brands}
          categories={categories}
          showStatusFilter={true}
          showBoxFilter={true}
          initialBoxes={boxes}
          placeholder="Search by model, brand, ID…"
          onSearchActiveChange={handleSearchActiveChange}
        />
      </div>

      <style>{`
        .admin-hero-header {
          max-height: 120px;
          opacity: 1;
          transform: translateY(0);
          overflow: hidden;
          transition: max-height 320ms cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 240ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
                      margin-bottom 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .admin-hero-header.collapsed {
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
