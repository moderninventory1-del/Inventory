// src/app/(admin)/admin/inventory/page.tsx
// Admin inventory list — initial batch of 15, infinite scroll via AdminInventoryGrid
// Uses streaming Suspense with instant skeleton fallback on filter changes

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminInventoryGrid from "@/components/admin/AdminInventoryGrid";
import AdminItemCardSkeleton from "@/components/admin/AdminItemCardSkeleton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Suspense } from "react";
import type { Metadata } from "next";
import { searchAdminInventory } from "@/lib/search";
import { ITEM_CATEGORIES, type InventoryItem, type PaginatedResponse } from "@/types";
import MobileMenuButton from "@/components/admin/MobileMenuButton";

export const metadata: Metadata = {
  title: "Inventory Management",
};

export const dynamic = "force-dynamic";

const LIMIT = 15;

import { getBoxesForBrand } from "@/lib/boxes";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    category?: string;
    brand?: string;
    box?: string;
    sort?: string;
  }>;
}

async function getInitialAdminInventory(
  status: string,
  search: string,
  category: string,
  brandId: string,
  box: string = "",
  sort: "latest" | "oldest" = "latest"
): Promise<PaginatedResponse<InventoryItem>> {
  return searchAdminInventory({
    status,
    search,
    category,
    brandId,
    box,
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
  box,
  sort,
}: {
  status: string;
  search: string;
  category: string;
  brandId: string;
  box?: string;
  sort: "latest" | "oldest";
}) {
  const initialData = await getInitialAdminInventory(status, search, category, brandId, box, sort);
  const showDeleted = status === "deleted" || status === "all";

  return (
    <AdminInventoryGrid
      initialData={initialData}
      search={search}
      category={category}
      brandId={brandId}
      box={box}
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
  const box      = params.box      ?? "";
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

  const [totalCount, brands, boxes] = await Promise.all([
    prisma.inventoryItem.count({ where: countWhere }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    brandId ? getBoxesForBrand(brandId) : Promise.resolve([]),
  ]);
  const categories = ITEM_CATEGORIES;

  const statusLabel =
    status === "deleted" ? "deleted "
    : status === "active" ? "active "
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── Top Header & Sliding Sticky Search Bar ── */}
      <Suspense fallback={null}>
        <AdminPageHeader
          totalCount={totalCount}
          statusLabel={statusLabel}
          brands={brands}
          categories={categories}
          boxes={boxes}
        />
      </Suspense>

      <div className="filter-grid-container">
        {/* Infinite-scroll grid with instant streaming skeleton fallback */}
        <div className="inventory-grid-area">
          <Suspense
            key={`${status}-${search}-${category}-${brandId}-${box}-${sort}`}
            fallback={<AdminInventorySkeleton />}
          >
            <AdminInventoryList
              status={status}
              search={search}
              category={category}
              brandId={brandId}
              box={box}
              sort={sort}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
