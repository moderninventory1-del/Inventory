// src/app/(public)/page.tsx
// Public inventory browse page — server-side initial data + client infinite scroll
// Uses streaming Suspense with instant skeleton fallback on filter changes

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import InventoryGrid from "@/components/public/InventoryGrid";
import ItemCardSkeleton from "@/components/public/ItemCardSkeleton";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import { searchPublicInventory } from "@/lib/search";
import { ITEM_CATEGORIES, type PaginatedResponse, type PublicInventoryItem } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modern Electronics | TV Spare Parts Inventory",
  description:
    "Modern Electronics — 1590/1, sector 45B, Burail, Chandigarh. Browse our available TV spare parts and boards.",
};

// Force dynamic rendering so newly added/deleted items appear immediately
export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIMIT = 15;

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string; brand?: string; sort?: string }>;
}

async function getInitialInventory(
  search: string,
  category: string,
  brandId: string,
  sort: "latest" | "oldest" = "latest"
): Promise<PaginatedResponse<PublicInventoryItem>> {
  return searchPublicInventory({
    search,
    category,
    brandId,
    sort,
    limit: LIMIT,
  });
}

async function getBrands() {
  try {
    return await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch (err) {
    console.error("[PublicPage] Failed to fetch brands:", err);
    return [];
  }
}

async function PublicInventoryList({
  search,
  category,
  brandId,
  sort,
}: {
  search: string;
  category: string;
  brandId: string;
  sort: "latest" | "oldest";
}) {
  let initialData: PaginatedResponse<PublicInventoryItem>;
  try {
    initialData = await getInitialInventory(search, category, brandId, sort);
  } catch (err) {
    console.error("[PublicPage] Failed to fetch inventory:", err);
    initialData = { items: [], nextCursor: null };
  }

  return (
    <InventoryGrid
      initialData={initialData}
      search={search}
      category={category}
      brandId={brandId}
      sort={sort}
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
  const sort: "latest" | "oldest" = params.sort === "oldest" ? "oldest" : "latest";

  const brands = await getBrands();

  return (
    <div className="page-container public-page-wrapper">
      {/* ── Top Header & Sliding Sticky Search Bar ── */}
      <Suspense fallback={null}>
        <PublicPageHeader brands={brands} categories={ITEM_CATEGORIES} />
      </Suspense>

      {/* ── 3. Inventory grid with instant streaming skeleton fallback ── */}
      <div className="inventory-grid-area">
        <Suspense
          key={`${search}-${category}-${brandId}-${sort}`}
          fallback={<PublicInventorySkeleton />}
        >
          <PublicInventoryList
            search={search}
            category={category}
            brandId={brandId}
            sort={sort}
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
