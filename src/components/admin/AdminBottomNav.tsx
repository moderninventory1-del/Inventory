"use client";
// src/components/admin/AdminBottomNav.tsx
// Premium Apple-style mobile bottom navigation bar for admin panel

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  PlusCircle,
  LogOut,
} from "lucide-react";
import SlideToSignOutModal from "./SlideToSignOutModal";

export default function AdminBottomNav() {
  const pathname = usePathname();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  function isDashboardActive() {
    return pathname === "/admin";
  }

  function isInventoryActive() {
    return (
      pathname.startsWith("/admin/inventory") &&
      pathname !== "/admin/inventory/new"
    );
  }

  function isNewItemActive() {
    return pathname === "/admin/inventory/new";
  }

  // Hide bottom navigation bar on item view page (e.g. /admin/inventory/[id])
  const isItemView =
    pathname.startsWith("/admin/inventory/") &&
    pathname !== "/admin/inventory/new" &&
    !pathname.endsWith("/edit");

  if (isItemView) {
    return null;
  }

  return (
    <>
      <nav
        className="admin-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.04)",
          paddingTop: "6px",
          paddingBottom: "calc(6px + env(safe-area-inset-bottom, 8px))",
          paddingLeft: "12px",
          paddingRight: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
        aria-label="Admin mobile navigation"
      >
        {/* 1. Dashboard Tab */}
        <Link
          href="/admin"
          className="admin-bottom-nav-item"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            flex: 1,
            padding: "6px 4px",
            textDecoration: "none",
            borderRadius: "12px",
            color: isDashboardActive()
              ? "var(--color-accent)"
              : "var(--color-text-muted)",
            background: isDashboardActive()
              ? "rgba(0, 113, 227, 0.07)"
              : "transparent",
            transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            userSelect: "none",
          }}
        >
          <LayoutDashboard size={20} strokeWidth={isDashboardActive() ? 2.3 : 1.8} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: isDashboardActive() ? 700 : 500,
              letterSpacing: "-0.01em",
            }}
          >
            Dashboard
          </span>
        </Link>

        {/* 2. Inventory Tab */}
        <Link
          href="/admin/inventory"
          className="admin-bottom-nav-item"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            flex: 1,
            padding: "6px 4px",
            textDecoration: "none",
            borderRadius: "12px",
            color: isInventoryActive()
              ? "var(--color-accent)"
              : "var(--color-text-muted)",
            background: isInventoryActive()
              ? "rgba(0, 113, 227, 0.07)"
              : "transparent",
            transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            userSelect: "none",
          }}
        >
          <PackageSearch size={20} strokeWidth={isInventoryActive() ? 2.3 : 1.8} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: isInventoryActive() ? 700 : 500,
              letterSpacing: "-0.01em",
            }}
          >
            Inventory
          </span>
        </Link>

        {/* 3. Add Item Tab */}
        <Link
          href="/admin/inventory/new"
          className="admin-bottom-nav-item"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            flex: 1,
            padding: "6px 4px",
            textDecoration: "none",
            borderRadius: "12px",
            color: isNewItemActive()
              ? "var(--color-accent)"
              : "var(--color-text-muted)",
            background: isNewItemActive()
              ? "rgba(0, 113, 227, 0.07)"
              : "transparent",
            transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            userSelect: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: isNewItemActive()
                ? "var(--gradient-accent)"
                : "rgba(0, 113, 227, 0.1)",
              color: isNewItemActive() ? "#ffffff" : "var(--color-accent)",
              transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <PlusCircle size={18} strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: isNewItemActive() ? 700 : 600,
              letterSpacing: "-0.01em",
              color: isNewItemActive()
                ? "var(--color-accent)"
                : "var(--color-text-muted)",
            }}
          >
            Add Item
          </span>
        </Link>

        {/* 4. Sign Out Tab with Slide-to-Sign-Out Modal */}
        <button
          type="button"
          onClick={() => setShowSignOutModal(true)}
          className="admin-bottom-nav-item"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            flex: 1,
            padding: "6px 4px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            borderRadius: "12px",
            color: "var(--color-text-muted)",
            transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            userSelect: "none",
          }}
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Sign Out
          </span>
        </button>

        <style>{`
          /* Hide bottom nav on desktop (768px and up) */
          @media (min-width: 768px) {
            .admin-bottom-nav {
              display: none !important;
            }
          }

          /* Tactile spring touch for mobile tabs */
          .admin-bottom-nav-item:active {
            transform: scale(0.92);
          }
        `}</style>
      </nav>

      {/* Slide to Sign Out Modal for Mobile */}
      <SlideToSignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
      />
    </>
  );
}
