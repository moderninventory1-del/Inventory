// src/app/(admin)/admin/inventory/page.tsx
// Admin inventory list — shows all items including deleted

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminInventoryGrid from "@/components/admin/AdminInventoryGrid";
import SearchFilterBar from "@/components/shared/SearchFilterBar";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";
import type { InventoryItem } from "@/types";
import MobileMenuButton from "@/components/admin/MobileMenuButton";

export const metadata: Metadata = {
  title: "Inventory Management",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; category?: string; brand?: string }>;
}

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const params = await searchParams;
  const status = params.status ?? "active";
  const search = params.search ?? "";
  const category = params.category ?? "";
  const brandId = params.brand ?? "";

  const where = {
    isDeleted: status === "deleted" ? true : status === "active" ? false : undefined,
    ...(category ? { category: category as any } : {}),
    ...(brandId ? { brandId } : {}),
    ...(search
      ? {
          OR: [
            { brand: { name: { contains: search, mode: "insensitive" as const } } },
            { modelNumber: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, brands] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      include: { brand: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MobileMenuButton />
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Inventory
            </h1>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "3px" }}>
              {items.length} {status === "deleted" ? "deleted " : status === "active" ? "active " : ""}item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/admin/inventory/new" className="btn-primary" style={{ fontSize: "13px" }}>
            <PlusCircle size={15} />
            Add Item
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Suspense fallback={null}>
        <SearchFilterBar brands={brands} showStatusFilter={true} />
      </Suspense>

      {/* Grid */}
      <AdminInventoryGrid items={items as InventoryItem[]} showDeleted={status === "deleted" || status === "all"} />
    </div>
  );
}
