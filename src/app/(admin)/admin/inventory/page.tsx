// src/app/(admin)/admin/inventory/page.tsx
// Admin inventory list — initial batch of 15, infinite scroll via AdminInventoryGrid
// Uses streaming Suspense with instant skeleton fallback on filter changes

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminInventoryGrid from "@/components/admin/AdminInventoryGrid";
import AdminItemCardSkeleton from "@/components/admin/AdminItemCardSkeleton";
import SearchFilterBar from "@/components/shared/SearchFilterBar";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";
import { searchAdminInventory } from "@/lib/search";
import { ITEM_CATEGORIES, type InventoryItem, type PaginatedResponse } from "@/types";
import MobileMenuButton from "@/components/admin/MobileMenuButton";

export const metadata: Metadata = {
  title: "Inventory Management",
};

export const dynamic = "force-dynamic";

const LIMIT = 15;

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; category?: string; brand?: string; sort?: string }>;
}

async function getInitialAdminInventory(
  status: string,
  search: string,
  category: string,
  brandId: string,
  sort: "latest" | "oldest" = "latest"
): Promise<PaginatedResponse<InventoryItem>> {
  return searchAdminInventory({
    status,
    search,
    category,
    brandId,
    sort,
    limit: LIMIT,
  });
}

// Separate streaming server component so Suspense instantly shows skeleton fallback on filter changes
async function AdminInventoryList({
  status,
  search,
  category,
  brandId,
  sort,
}: {
  status: string;
  search: string;
  category: string;
  brandId: string;
  sort: "latest" | "oldest";
}) {
  const initialData = await getInitialAdminInventory(status, search, category, brandId, sort);
  const showDeleted = status === "deleted" || status === "all";

  return (
    <AdminInventoryGrid
      initialData={initialData}
      search={search}
      category={category}
      brandId={brandId}
      status={status}
      sort={sort}
      showDeleted={showDeleted}
    />
  );
}

function AdminInventorySkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "24px",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`skel-admin-init-${i}`} className="animate-fade-in">
          <AdminItemCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const params   = await searchParams;
  const status   = params.status   ?? "active";
  const search   = params.search   ?? "";
  const category = params.category ?? "";
  const brandId  = params.brand    ?? "";
  const sort: "latest" | "oldest" = params.sort === "oldest" ? "oldest" : "latest";

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

  const [totalCount, brands] = await Promise.all([
    prisma.inventoryItem.count({ where: countWhere }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const categories = ITEM_CATEGORIES;

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
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/admin/inventory/new" className="btn-primary" style={{ fontSize: "13px" }}>
            <PlusCircle size={15} />
            Add Item
          </Link>
        </div>
      </div>

      <div className="filter-grid-container">
        {/* Search and Filters */}
        <div style={{ marginBottom: "20px" }}>
          <Suspense fallback={null}>
            <SearchFilterBar
              brands={brands}
              categories={categories}
              showStatusFilter={true}
              placeholder="Search by model, brand, ID…"
            />
          </Suspense>
        </div>

        {/* Infinite-scroll grid with instant streaming skeleton fallback */}
        <div className="inventory-grid-area">
          <Suspense
            key={`${status}-${search}-${category}-${brandId}-${sort}`}
            fallback={<AdminInventorySkeleton />}
          >
            <AdminInventoryList
              status={status}
              search={search}
              category={category}
              brandId={brandId}
              sort={sort}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
