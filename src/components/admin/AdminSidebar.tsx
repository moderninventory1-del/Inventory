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
<<<<<<< HEAD
} from "lucide-react";
=======
  X,
} from "lucide-react";
import { useMobileMenu } from "./MobileMenuContext";
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory", label: "Inventory", icon: PackageSearch, exact: false },
  { href: "/admin/inventory/new", label: "Add Item", icon: PlusCircle, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
<<<<<<< HEAD
=======
  const { isOpen, close } = useMobileMenu();
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href) && (exact || pathname !== "/admin");
  }

  const sidebarContent = (
    <aside
      style={{
        width: "240px",
        background: "var(--color-bg-secondary)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        flexShrink: 0,
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
          <Tv2 size={18} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)" }}>
            TV Inventory
          </p>
          <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Admin Panel</p>
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
<<<<<<< HEAD
=======
              onClick={close}
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                background: active ? "var(--color-accent-glow)" : "transparent",
<<<<<<< HEAD
                border: active ? "1px solid rgba(0, 113, 227, 0.15)" : "1px solid transparent",
=======
                border: active ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid transparent",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon size={16} />
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
          style={{ width: "100%", justifyContent: "flex-start", gap: "10px", fontSize: "13px" }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
<<<<<<< HEAD
      {/* Desktop sidebar — visible on screens 768px and wider */}
=======
      {/* Desktop sidebar — always visible on md+ */}
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
      <div style={{ display: "none" }} className="admin-sidebar-desktop">
        {sidebarContent}
      </div>

<<<<<<< HEAD
=======
      {/* Mobile overlay — only rendered when open */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={close}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
          />
          {/* Sidebar panel */}
          <div style={{ position: "relative", zIndex: 201 }}>
            {sidebarContent}
            <button
              onClick={close}
              style={{
                position: "absolute",
                top: "16px",
                right: "-44px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "50%",
                padding: "6px",
                cursor: "pointer",
                color: "var(--color-text-primary)",
                display: "flex",
              }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
}
