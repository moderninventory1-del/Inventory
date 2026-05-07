"use client";
// src/components/public/InventoryGrid.tsx
// Infinite-scroll inventory grid — client component

import { useEffect, useRef, useState, useCallback } from "react";
import ItemCard from "./ItemCard";
import ItemCardSkeleton from "./ItemCardSkeleton";
import type { PublicInventoryItem, PaginatedResponse } from "@/types";
import { Loader2, PackageSearch } from "lucide-react";

interface InventoryGridProps {
  initialData: PaginatedResponse<PublicInventoryItem>;
  search: string;
  category: string;
  brandId: string;
}

export default function InventoryGrid({
  initialData,
  search,
  category,
  brandId,
}: InventoryGridProps) {
  const [items, setItems] = useState<PublicInventoryItem[]>(initialData.items);
  const [cursor, setCursor] = useState<string | null>(initialData.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset when filters change
  useEffect(() => {
    setItems(initialData.items);
    setCursor(initialData.nextCursor);
    setHasError(false);
  }, [initialData]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setHasError(false);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (brandId) params.set("brand", brandId);
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data: PaginatedResponse<PublicInventoryItem> = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, search, category, brandId]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, isLoadingMore, loadMore]);

  if (items.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 16px",
          gap: "16px",
          color: "var(--color-text-muted)",
        }}
      >
        <PackageSearch size={48} strokeWidth={1} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            No items found
          </p>
          <p style={{ fontSize: "14px", marginTop: "4px" }}>
            {search || category || brandId
              ? "Try adjusting your search or filter"
              : "No inventory items yet"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "24px",
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i % 12, 6) * 50}ms` }}
          >
            <ItemCard item={item} />
          </div>
        ))}
      </div>

      {/* Sentinel + Loading */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {isLoadingMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "32px",
            color: "var(--color-text-muted)",
            gap: "8px",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          <Loader2 size={18} className="animate-spin" />
          Loading more…
        </div>
      )}

      {hasError && (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <button
            onClick={loadMore}
            className="btn-secondary"
          >
            Failed to load — retry
          </button>
        </div>
      )}

      {!cursor && items.length > 0 && (
        <p
          style={{
            textAlign: "center",
            padding: "24px",
            color: "var(--color-text-muted)",
            fontSize: "13px",
          }}
        >
          All {items.length} items loaded
        </p>
      )}
    </div>
  );
}
