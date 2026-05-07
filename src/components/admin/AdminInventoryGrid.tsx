"use client";
// src/components/admin/AdminInventoryGrid.tsx
// Admin inventory grid replacing the cramped table

import AdminItemCard from "./AdminItemCard";
import type { InventoryItem } from "@/types";
import { PackageSearch } from "lucide-react";

interface AdminInventoryGridProps {
  items: InventoryItem[];
  showDeleted?: boolean;
}

export default function AdminInventoryGrid({ items, showDeleted = false }: AdminInventoryGridProps) {
  if (items.length === 0) {
    return (
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 16px",
          gap: "16px",
          color: "var(--color-text-muted)",
        }}
      >
        <PackageSearch size={48} strokeWidth={1} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            {showDeleted ? "No deleted items found" : "No items found"}
          </p>
          <p style={{ fontSize: "14px", marginTop: "4px" }}>
            Try adjusting your search or filter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "24px",
      }}
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(i % 12, 6) * 50}ms` }}
        >
          <AdminItemCard item={item} showDeleted={showDeleted} />
        </div>
      ))}
    </div>
  );
}
