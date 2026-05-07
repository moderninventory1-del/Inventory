// src/app/(public)/page.tsx
// Public inventory browse page — server-side initial data + client infinite scroll

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import InventoryGrid from "@/components/public/InventoryGrid";
import SearchFilterBar from "@/components/shared/SearchFilterBar";
import ItemCardSkeleton from "@/components/public/ItemCardSkeleton";
import type { PaginatedResponse, PublicInventoryItem } from "@/types";
import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse TV Inventory | Available Stock",
  description:
    "Browse our complete inventory of LED, LCD, OLED and Smart TVs available for repair and resale.",
};

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

const LIMIT = 12;

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string; brand?: string }>;
}

async function getInitialInventory(
  search: string,
  category: string,
  brandId: string
): Promise<PaginatedResponse<PublicInventoryItem>> {
  const where = {
    isDeleted: false,
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

  const rawItems = await prisma.inventoryItem.findMany({
    where,
    take: LIMIT + 1,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      modelNumber: true,
      brand: { select: { id: true, name: true } },
      category: true,
      description: true,
      frontImage: true,
      backImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const hasMore = rawItems.length > LIMIT;
  const items = hasMore ? rawItems.slice(0, LIMIT) : rawItems;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items: items as PublicInventoryItem[], nextCursor };
}

export default async function PublicInventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const category = params.category ?? "";
  const brandId = params.brand ?? "";

  const [initialData, brands] = await Promise.all([
    getInitialInventory(search, category, brandId),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="page-container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Hero header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-accent)",
            }}
          >
            <PackageOpen size={22} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #f1f1f5 0%, #a0a0b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TV Inventory
          </h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", maxWidth: "520px" }}>
          Browse our available stock of televisions. Contact us for pricing and availability.
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <Suspense fallback={null}>
          <SearchFilterBar brands={brands} />
        </Suspense>
      </div>

      {/* Results count */}
      {(search || category || brandId) && (
        <p style={{ marginBottom: "20px", fontSize: "13px", color: "var(--color-text-muted)" }}>
          {initialData.items.length === 0
            ? "No results"
            : `Showing results${search ? ` for "${search}"` : ""}${
                brands.find((b) => b.id === brandId)?.name ? ` for brand ${brands.find((b) => b.id === brandId)?.name}` : ""
              }${category ? ` in ${category}` : ""}`}
        </p>
      )}

      {/* Inventory grid */}
      <Suspense
        fallback={
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <InventoryGrid
          initialData={initialData}
          search={search}
          category={category}
          brandId={brandId}
        />
      </Suspense>
    </div>
  );
}
