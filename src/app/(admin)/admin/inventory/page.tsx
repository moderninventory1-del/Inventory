// src/app/(admin)/admin/inventory/page.tsx
// Admin inventory list — initial batch of 20, infinite scroll via AdminInventoryGrid

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
import type { InventoryItem, PaginatedResponse } from "@/types";
import MobileMenuButton from "@/components/admin/MobileMenuButton";

export const metadata: Metadata = {
  title: "Inventory Management",
};

export const dynamic = "force-dynamic";

const LIMIT = 20;

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; category?: string; brand?: string }>;
}

async function getInitialAdminInventory(
  status: string,
  search: string,
  category: string,
  brandId: string
): Promise<PaginatedResponse<InventoryItem>> {
  const where = {
    isDeleted:
      status === "deleted" ? true
      : status === "active" ? false
      : undefined,
    ...(category ? { category: category as any } : {}),
    ...(brandId  ? { brandId }                  : {}),
    ...(search
      ? {
          OR: [
            { id:          { contains: search, mode: "insensitive" as const } },
            { brand:       { name:        { contains: search, mode: "insensitive" as const } } },
            { modelNumber: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const rawItems = await prisma.inventoryItem.findMany({
    where,
    take: LIMIT + 1,
    orderBy: { createdAt: "desc" },
    include: { brand: true },
  });

  const hasMore    = rawItems.length > LIMIT;
  const items      = hasMore ? rawItems.slice(0, LIMIT) : rawItems;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items: items as unknown as InventoryItem[], nextCursor };
}

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const params   = await searchParams;
  const status   = params.status   ?? "active";
  const search   = params.search   ?? "";
  const category = params.category ?? "";
  const brandId  = params.brand    ?? "";

  // Build shared where for count query
  const countWhere = {
    isDeleted:
      status === "deleted" ? true
      : status === "active" ? false
      : undefined,
    ...(category ? { category: category as any } : {}),
    ...(brandId  ? { brandId }                  : {}),
    ...(search
      ? {
          OR: [
            { id:          { contains: search, mode: "insensitive" as const } },
            { brand:       { name:        { contains: search, mode: "insensitive" as const } } },
            { modelNumber: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Run initial batch + total count in parallel — count is a lightweight aggregation
  const [initialData, totalCount, brands] = await Promise.all([
    getInitialAdminInventory(status, search, category, brandId),
    prisma.inventoryItem.count({ where: countWhere }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const showDeleted = status === "deleted" || status === "all";
  const statusLabel =
    status === "deleted" ? "deleted "
    : status === "active" ? "active "
    : "";

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
              {totalCount} {statusLabel}item{totalCount !== 1 ? "s" : ""}
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
        <SearchFilterBar brands={brands} showStatusFilter={true} placeholder="Search by model, brand, ID…" />
      </Suspense>

      {/* Infinite-scroll grid */}
      <AdminInventoryGrid
        initialData={initialData}
        search={search}
        category={category}
        brandId={brandId}
        status={status}
        showDeleted={showDeleted}
      />
    </div>
  );
}
