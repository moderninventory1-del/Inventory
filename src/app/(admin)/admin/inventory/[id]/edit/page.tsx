// src/app/(admin)/admin/inventory/[id]/edit/page.tsx
// Edit existing inventory item

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InventoryForm from "@/components/admin/InventoryForm";
import { updateInventoryItem } from "@/app/actions/inventory";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, RotateCcw } from "lucide-react";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { ITEM_CATEGORIES } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ restore?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      select: { brand: { select: { name: true } }, modelNumber: true },
    });
    return { title: item ? `Edit — ${item.brand.name} ${item.modelNumber}` : "Edit Item" };
  } catch (e) {
    return { title: "Edit Item | Admin" };
  }
}

export const dynamic = "force-dynamic";

export default async function EditInventoryItemPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const { id } = await params;
  const { restore } = (await searchParams) ?? {};

  let item = null;
  let brands: { id: string; name: string }[] = [];
  let dbCategories: { id: string; name: string }[] = [];
  try {
    const [fetchedItem, fetchedBrands, fetchedCategories] = await Promise.all([
      prisma.inventoryItem.findUnique({
        where: { id },
        include: { brand: true },
      }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    item = fetchedItem;
    brands = fetchedBrands;
    dbCategories = fetchedCategories;
  } catch (err) {
    console.error(`[EditInventoryItemPage] Error fetching item ${id}:`, err);
  }

  // Resilient retry in case of momentary connection or replication lag (e.g. right after restoring)
  if (!item) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: { brand: true },
      });
      if (brands.length === 0) {
        brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
      }
      if (dbCategories.length === 0) {
        dbCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
      }
    } catch (retryErr) {
      console.error(`[EditInventoryItemPage] Retry error fetching item ${id}:`, retryErr);
    }
  }

  if (!item) notFound();

  if (item.isDeleted && restore !== "true") {
    redirect(`/admin/inventory/${id}/edit?restore=true`);
  }

  const categories =
    dbCategories.length > 0
      ? dbCategories
      : ITEM_CATEGORIES.map((c) => ({ id: c, name: c }));

  // Bind the id to the action
  const updateAction = updateInventoryItem.bind(null, id);

  const isRestoring = Boolean(item.isDeleted || restore === "true");

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
          {isRestoring ? "Edit & Restore Item" : "Edit Item"}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          {item.brand.name} — {item.modelNumber} {isRestoring ? "• (Deleted Item)" : ""}
        </p>
      </div>

      {isRestoring && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.28)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <RotateCcw size={18} color="#16a34a" />
          </div>
          <div>
            <p style={{ fontSize: "14.5px", fontWeight: 700, color: "#15803d", margin: 0 }}>
              Restoring Deleted Item
            </p>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "3px 0 0", lineHeight: 1.4 }}>
              Review or edit details (e.g. Box Location or Description). Click <strong>Save & Restore to Inventory</strong> below to reactivate this item.
            </p>
          </div>
        </div>
      )}

      <InventoryForm
        item={item}
        brands={brands}
        categories={categories}
        action={updateAction}
        isRestoring={isRestoring}
      />
    </div>
  );
}
