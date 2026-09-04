// src/app/(admin)/admin/page.tsx
// Admin dashboard — stats overview

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { Package, PackageX, TrendingUp, PlusCircle, Tv2 } from "lucide-react";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import AdminNotSureModal from "@/components/admin/AdminNotSureModal";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const revalidate = 15; // Cache dashboard for 15s to absorb rapid tab switching

async function getStats() {
  try {
    const rows = await prisma.$queryRaw<
      { total: bigint | number; deleted: bigint | number; recent: bigint | number }[]
    >`
      SELECT
        COUNT(*) FILTER (WHERE "isDeleted" = false) as total,
        COUNT(*) FILTER (WHERE "isDeleted" = true) as deleted,
        COUNT(*) FILTER (WHERE "isDeleted" = false AND "createdAt" >= NOW() - INTERVAL '7 days') as recent
      FROM "InventoryItem";
    `;

    if (rows && rows.length > 0) {
      return {
        total: Number(rows[0].total || 0),
        deleted: Number(rows[0].deleted || 0),
        recentCount: Number(rows[0].recent || 0),
      };
    }
  } catch (error) {
    console.error("[Dashboard] Failed to fetch stats:", error);
  }

  // Graceful fallback if database connection is momentarily congested
  return { total: 0, deleted: 0, recentCount: 0 };
}

async function getRecentItems() {
  try {
    return await prisma.inventoryItem.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        brand: { select: { id: true, name: true } },
        modelNumber: true,
        category: true,
        frontImage: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("[Dashboard] Failed to fetch recent items:", error);
    return [];
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const [stats, recentItems] = await Promise.all([getStats(), getRecentItems()]);

  const statCards = [
    {
      label: "Active Items",
      value: stats.total,
      icon: Package,
      color: "var(--color-accent-text)",
      bg: "var(--color-accent-glow)",
      border: "rgba(0, 113, 227, 0.12)",
    },
    {
      label: "Deleted Items",
      value: stats.deleted,
      icon: PackageX,
      color: "#ff3b30",
      bg: "var(--color-danger-dim)",
      border: "rgba(255, 59, 48, 0.12)",
    },
    {
      label: "Added This Week",
      value: stats.recentCount,
      icon: TrendingUp,
      color: "#34c759",
      bg: "rgba(52, 199, 89, 0.06)",
      border: "rgba(52, 199, 89, 0.12)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MobileMenuButton />
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.035em" }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-muted)", marginTop: "3px" }}>
              Welcome back, Admin
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AdminNotSureModal />
          <Link href="/admin/inventory/new" className="btn-primary">
            <PlusCircle size={16} />
            Add Item
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="card"
            style={{ padding: "20px" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
                  {label}
                </p>
                <p style={{ fontSize: "36px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>
                  {value}
                </p>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-sm)",
                  background: bg,
                  border: `1px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent items */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 750, letterSpacing: "-0.02em" }}>Recent Items</h2>
          <Link
            href="/admin/inventory"
            style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-accent-text)", textDecoration: "none" }}
          >
            View all →
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--color-text-muted)",
            }}
          >
            <Tv2 size={40} strokeWidth={1} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px" }}>No items yet. Add your first TV to get started.</p>
            <Link href="/admin/inventory/new" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
              <PlusCircle size={15} />
              Add First Item
            </Link>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            {recentItems.map((item, i) => (
              <Link
                key={item.id}
                href={`/admin/inventory/${item.id}/edit`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  textDecoration: "none",
                  borderBottom: i < recentItems.length - 1 ? "1px solid var(--color-border)" : "none",
                  transition: "background var(--transition-fast)",
                }}
                className="recent-item-row"
              >
                <div
                  style={{
                    width: "48px",
                    height: "36px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "var(--color-bg-surface)",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.frontImage}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--color-text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.brand.name}
                  </span>
                  <p
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "-0.01em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.modelNumber}
                  </p>
                </div>
                <span className="badge badge-accent">{item.category}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .recent-item-row:hover { background: var(--color-bg-surface) !important; }
      `}</style>
    </div>
  );
}
