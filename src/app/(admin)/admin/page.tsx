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

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

async function getStats() {
  const [total, deleted, recentCount] = await Promise.all([
    prisma.inventoryItem.count({ where: { isDeleted: false } }),
    prisma.inventoryItem.count({ where: { isDeleted: true } }),
    prisma.inventoryItem.count({
      where: {
        isDeleted: false,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return { total, deleted, recentCount };
}

async function getRecentItems() {
  return prisma.inventoryItem.findMany({
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
            <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Welcome back, Admin
            </p>
          </div>
        </div>
        <Link href="/admin/inventory/new" className="btn-primary">
          <PlusCircle size={16} />
          Add Item
        </Link>
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
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                  {label}
                </p>
                <p style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
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
          <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Recent Items</h2>
          <Link
            href="/admin/inventory"
            style={{ fontSize: "13px", color: "var(--color-accent-text)", textDecoration: "none" }}
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
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.brand.name} {item.modelNumber}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {item.category}
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
