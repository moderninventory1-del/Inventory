"use client";
// src/components/admin/AdminInventoryGrid.tsx
// Admin inventory grid — infinite scroll, mirrors public InventoryGrid pattern

import { useEffect, useRef, useState, useCallback } from "react";
import AdminItemCard from "./AdminItemCard";
import AdminItemCardSkeleton from "./AdminItemCardSkeleton";
import type { InventoryItem, PaginatedResponse } from "@/types";
import { Loader2, PackageSearch } from "lucide-react";

interface AdminInventoryGridProps {
  initialData: PaginatedResponse<InventoryItem>;
  search: string;
  category: string;
  brandId: string;
  status: string;
  showDeleted: boolean;
}

export default function AdminInventoryGrid({
  initialData,
  search,
  category,
  brandId,
  status,
  showDeleted,
}: AdminInventoryGridProps) {
  const [items, setItems]               = useState<InventoryItem[]>(initialData.items);
  const [cursor, setCursor]             = useState<string | null>(initialData.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError]         = useState(false);
  const sentinelRef                     = useRef<HTMLDivElement | null>(null);

  // Reset when filters change (new initialData from server)
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
      if (search)   params.set("search",   search);
      if (category) params.set("category", category);
      if (brandId)  params.set("brand",    brandId);
      if (status)   params.set("status",   status);
      if (cursor)   params.set("cursor",   cursor);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data: PaginatedResponse<InventoryItem> = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, search, category, brandId, status]);

  // IntersectionObserver — trigger load 200px before sentinel enters viewport
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
        className="card"
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
            {showDeleted ? "No deleted items found" : "No items found"}
          </p>
          <p style={{ fontSize: "14px", marginTop: "4px" }}>
            Try adjusting your search or filter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Card grid */}
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
            style={{ animationDelay: `${Math.min(i % 20, 8) * 40}ms` }}
          >
            <AdminItemCard item={item} showDeleted={showDeleted} />
          </div>
        ))}
      </div>

      {/* Invisible sentinel — IntersectionObserver target */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {/* Loading skeletons while fetching next batch */}
      {isLoadingMore && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminItemCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Spinner label while loading */}
      {isLoadingMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "24px 32px 8px",
            color: "var(--color-text-muted)",
            gap: "8px",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          <Loader2 size={16} className="animate-spin" />
          Loading more…
        </div>
      )}

      {/* Error retry */}
      {hasError && (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <button onClick={loadMore} className="btn-secondary">
            Failed to load — retry
          </button>
        </div>
      )}

      {/* End of list indicator */}
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
