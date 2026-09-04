"use client";
// src/components/admin/AdminSidebar.tsx
// Admin navigation sidebar — reads mobile open state from MobileMenuContext

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PackageSearch,
  PlusCircle,
  Tv2,
  LogOut,
} from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory", label: "Inventory", icon: PackageSearch, exact: false },
  { href: "/admin/inventory/new", label: "Add Item", icon: PlusCircle, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href) && (exact || pathname !== "/admin");
  }

  const sidebarContent = (
    <aside
      style={{
        width: "240px",
        height: "100%",
        maxHeight: "100dvh",
        background: "var(--color-bg-secondary)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "var(--radius-sm)",
            background: "var(--gradient-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BrandLogo size={20} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: "13.5px", fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-primary)" }}>
            TV Inventory
          </p>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)" }}>Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? 700 : 500,
                color: active ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                background: active ? "var(--color-accent-glow)" : "transparent",
                border: active ? "1px solid rgba(0, 113, 227, 0.15)" : "1px solid transparent",
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--color-border)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "flex-start", gap: "10px", fontSize: "13px", fontWeight: 600 }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — visible on screens 768px and wider */}
      <div style={{ display: "none" }} className="admin-sidebar-desktop">
        {sidebarContent}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar-desktop {
            display: block !important;
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
            height: 100dvh !important;
            align-self: flex-start !important;
            flex-shrink: 0 !important;
            z-index: 40 !important;
          }
        }
      `}</style>
    </>
  );
}
