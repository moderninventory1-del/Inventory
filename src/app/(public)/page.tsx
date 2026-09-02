// src/app/(public)/page.tsx
// Public inventory browse page — server-side initial data + client infinite scroll
<<<<<<< HEAD
// Uses streaming Suspense with instant skeleton fallback on filter changes
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import InventoryGrid from "@/components/public/InventoryGrid";
import SearchFilterBar from "@/components/shared/SearchFilterBar";
import ItemCardSkeleton from "@/components/public/ItemCardSkeleton";
import type { PaginatedResponse, PublicInventoryItem } from "@/types";
import type { Metadata } from "next";
<<<<<<< HEAD
import { MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Modern Electronics | TV Spare Parts Inventory",
  description:
    "Modern Electronics — 1590/1, sector 45B, Burail, Chandigarh. Browse our available TV spare parts and boards.",
=======
import { PackageOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse TV Inventory | Available Stock",
  description:
    "Browse our complete inventory of LED, LCD, OLED and Smart TVs available for repair and resale.",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
};

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

<<<<<<< HEAD
const LIMIT = 15;
=======
const LIMIT = 12;
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

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
<<<<<<< HEAD
            { id: { contains: search, mode: "insensitive" as const } },
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
            { brand: { name: { contains: search, mode: "insensitive" as const } } },
            { modelNumber: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

<<<<<<< HEAD
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
=======
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
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
}

export default async function PublicInventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const category = params.category ?? "";
  const brandId = params.brand ?? "";

<<<<<<< HEAD
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="page-container public-page-wrapper">
      {/* ── 1. Top of the page: Modern Electronics Brand & Contact ── */}
      <section className="brand-hero-header">
        <h1
          style={{
            fontSize: "clamp(26px, 6vw, 36px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: "var(--color-text-primary)",
            lineHeight: 1.15,
          }}
        >
          Modern Electronics
        </h1>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--color-text-muted)",
            lineHeight: 1.4,
            marginTop: "3px",
          }}
        >
          <MapPin size={13} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <span>1590/1, sector 45B, Burail, Chandigarh</span>
        </div>

        <div style={{ marginTop: "10px" }}>
          <a
            href="tel:9872016790"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 18px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 3px 12px rgba(0, 113, 227, 0.25)",
            }}
            title="Call 9872016790"
          >
            <Phone size={14} strokeWidth={2.4} />
            <span>Call: 9872016790</span>
          </a>
        </div>
      </section>

      {/* ── 2. Below: Search bar and Filters ── */}
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <Suspense fallback={null}>
          <SearchFilterBar brands={brands} categories={categories} />
        </Suspense>
      </div>

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
=======
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
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
    </div>
  );
}
