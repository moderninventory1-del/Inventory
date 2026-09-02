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
import { ArrowLeft } from "lucide-react";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { ITEM_CATEGORIES } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    select: { brand: { select: { name: true } }, modelNumber: true },
  });
  return { title: item ? `Edit — ${item.brand.name} ${item.modelNumber}` : "Edit Item" };
}

export const dynamic = "force-dynamic";

export default async function EditInventoryItemPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const { id } = await params;

  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { brand: true },
  });

  if (!item) notFound();

  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const categories = ITEM_CATEGORIES.map((c) => ({ id: c, name: c }));

  // Bind the id to the action
  const updateAction = updateInventoryItem.bind(null, id);

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
          Edit Item
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          {item.brand.name} — {item.modelNumber}
        </p>
      </div>

      <InventoryForm item={item} brands={brands} categories={categories} action={updateAction} />
    </div>
  );
}
