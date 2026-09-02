// src/app/(admin)/admin/inventory/new/page.tsx
// Add new inventory item

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import InventoryForm from "@/components/admin/InventoryForm";
import { createInventoryItem } from "@/app/actions/inventory";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { ITEM_CATEGORIES } from "@/types";

export const metadata: Metadata = {
  title: "Add New Item",
};

export default async function NewInventoryItemPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const categories = ITEM_CATEGORIES.map((c) => ({ id: c, name: c }));

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <MobileMenuButton />
          <Link
            href="/admin/inventory"
            className="btn-secondary"
            style={{ display: "inline-flex", fontSize: "13px" }}
          >
            <ArrowLeft size={14} />
            Back to inventory
          </Link>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em" }}>
          Add New Item
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Fill in the details below to add a new TV to the inventory.
        </p>
      </div>

      <InventoryForm action={createInventoryItem} brands={brands} categories={categories} />
    </div>
  );
}
