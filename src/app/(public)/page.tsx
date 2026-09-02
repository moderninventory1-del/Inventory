// src/app/(public)/page.tsx
// Public inventory browse page — server-side initial data + client infinite scroll
// Uses streaming Suspense with instant skeleton fallback on filter changes

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import InventoryGrid from "@/components/public/InventoryGrid";
import ItemCardSkeleton from "@/components/public/ItemCardSkeleton";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import { ITEM_CATEGORIES, type PaginatedResponse, type PublicInventoryItem } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modern Electronics | TV Spare Parts Inventory",
  description:
    "Modern Electronics — 1590/1, sector 45B, Burail, Chandigarh. Browse our available TV spare parts and boards.",
};

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

const LIMIT = 15;

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
            { id: { contains: search, mode: "insensitive" as const } },
            { brand: { name: { contains: search, mode: "insensitive" as const } } },
            { modelNumber: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.inventoryItem.count({ where }),
    prisma.inventoryItem.findMany({
      where,
      take: LIMIT + 1,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        modelNumber: true,
        brandId: true,
        brand: { select: { id: true, name: true } },
        category: true,
        description: true,
        frontImage: true,
        backImage: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const hasMore = items.length > LIMIT;
  const returnedItems = hasMore ? items.slice(0, LIMIT) : items;
  const nextCursor = hasMore ? returnedItems[returnedItems.length - 1].id : null;

  return {
    items: returnedItems,
    nextCursor,
    total,
  };
}

async function PublicInventoryList({
  search,
  category,
  brandId,
}: {
  search: string;
  category: string;
  brandId: string;
}) {
  const initialData = await getInitialInventory(search, category, brandId);

  return (
    <InventoryGrid
      initialData={initialData}
      search={search}
      category={category}
      brandId={brandId}
    />
  );
}

function PublicInventorySkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "24px",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`skel-init-${i}`} className="animate-fade-in">
          <ItemCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export default async function PublicInventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const category = params.category ?? "";
  const brandId = params.brand ?? "";

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="page-container public-page-wrapper">
      {/* ── Top Header & Sliding Sticky Search Bar ── */}
      <Suspense fallback={null}>
        <PublicPageHeader brands={brands} categories={ITEM_CATEGORIES} />
      </Suspense>

      {/* ── 3. Inventory grid with instant streaming skeleton fallback ── */}
      <div className="inventory-grid-area">
        <Suspense
          key={`${search}-${category}-${brandId}`}
          fallback={<PublicInventorySkeleton />}
        >
          <PublicInventoryList
            search={search}
            category={category}
            brandId={brandId}
          />
        </Suspense>
      </div>

      <style>{`
        .public-page-wrapper {
          padding-top: 18px;
          padding-bottom: 60px;
        }
        .brand-hero-header {
          margin-bottom: 8px;
        }
        @media (min-width: 640px) {
          .public-page-wrapper {
            padding-top: 28px;
            padding-bottom: 60px;
          }
          .brand-hero-header {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}
