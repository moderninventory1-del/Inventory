// src/app/(admin)/admin/inventory/page.tsx
<<<<<<< HEAD
// Admin inventory list — initial batch of 15, infinite scroll via AdminInventoryGrid
// Uses streaming Suspense with instant skeleton fallback on filter changes
=======
// Admin inventory list — initial batch of 20, infinite scroll via AdminInventoryGrid
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminInventoryGrid from "@/components/admin/AdminInventoryGrid";
<<<<<<< HEAD
import AdminItemCardSkeleton from "@/components/admin/AdminItemCardSkeleton";
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
import SearchFilterBar from "@/components/shared/SearchFilterBar";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";
import type { InventoryItem, PaginatedResponse } from "@/types";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
<<<<<<< HEAD
import AddCategoryButton from "@/components/admin/AddCategoryButton";
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

export const metadata: Metadata = {
  title: "Inventory Management",
};

export const dynamic = "force-dynamic";

<<<<<<< HEAD
const LIMIT = 15;
=======
const LIMIT = 20;
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

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

<<<<<<< HEAD
// Separate streaming server component so Suspense instantly shows skeleton fallback on filter changes
async function AdminInventoryList({
  status,
  search,
  category,
  brandId,
}: {
  status: string;
  search: string;
  category: string;
  brandId: string;
}) {
  const initialData = await getInitialAdminInventory(status, search, category, brandId);
  const showDeleted = status === "deleted" || status === "all";

  return (
    <AdminInventoryGrid
      initialData={initialData}
      search={search}
      category={category}
      brandId={brandId}
      status={status}
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

=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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

<<<<<<< HEAD
  const [totalCount, brands, categories] = await Promise.all([
    prisma.inventoryItem.count({ where: countWhere }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

=======
  // Run initial batch + total count in parallel — count is a lightweight aggregation
  const [initialData, totalCount, brands] = await Promise.all([
    getInitialAdminInventory(status, search, category, brandId),
    prisma.inventoryItem.count({ where: countWhere }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const showDeleted = status === "deleted" || status === "all";
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
<<<<<<< HEAD
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <AddCategoryButton initialCategories={categories} />
=======
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
          <Link href="/admin/inventory/new" className="btn-primary" style={{ fontSize: "13px" }}>
            <PlusCircle size={15} />
            Add Item
          </Link>
        </div>
      </div>

<<<<<<< HEAD
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
            key={`${status}-${search}-${category}-${brandId}`}
            fallback={<AdminInventorySkeleton />}
          >
            <AdminInventoryList
              status={status}
              search={search}
              category={category}
              brandId={brandId}
            />
          </Suspense>
        </div>
      </div>
=======
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
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
    </div>
  );
}
