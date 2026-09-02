"use client";
// src/components/admin/AdminInventoryGrid.tsx
// Admin inventory grid — preloads next 15 items when scrolling to 10th item

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
  box?: string;
  status: string;
  showDeleted: boolean;
  sort?: string;
}

export default function AdminInventoryGrid({
  initialData,
  search,
  category,
  brandId,
  box,
  status,
  showDeleted,
  sort,
}: AdminInventoryGridProps) {
  const [items, setItems]               = useState<InventoryItem[]>(initialData.items);
  const [cursor, setCursor]             = useState<string | null>(initialData.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError]         = useState(false);

  // Trigger index: at 10 items (index 9 in a 15-item batch, or items.length - 6)
  const triggerIndex = Math.max(0, items.length - 6);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

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
      if (box)      params.set("box",      box);
      if (status)   params.set("status",   status);
      if (sort)     params.set("sort",     sort);
      if (cursor)   params.set("cursor",   cursor);
      params.set("limit", "15");

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
  }, [cursor, isLoadingMore, search, category, brandId, status, sort]);

  // IntersectionObserver: triggers loadMore when 10th item or bottom sentinel comes into view
  useEffect(() => {
    const triggerEl = triggerRef.current;
    const bottomEl = bottomSentinelRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const isTriggered = entries.some((e) => e.isIntersecting);
        if (isTriggered && cursor && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "250px" }
    );

    if (triggerEl) observer.observe(triggerEl);
    if (bottomEl) observer.observe(bottomEl);

    return () => observer.disconnect();
  }, [cursor, isLoadingMore, loadMore, items.length]);

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
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--color-bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PackageSearch size={28} strokeWidth={1.5} color="var(--color-text-secondary)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {showDeleted ? "No deleted items found" : "No items found"}
          </p>
          <p style={{ fontSize: "14px", marginTop: "4px", color: "var(--color-text-muted)" }}>
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
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            ref={i === triggerIndex ? triggerRef : undefined}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i % 15, 6) * 40}ms` }}
          >
            <AdminItemCard item={item} showDeleted={showDeleted} />
          </div>
        ))}

        {/* Loading skeletons directly inside the grid while fetching next 15 */}
        {isLoadingMore && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-admin-${i}`} className="animate-fade-in">
                <AdminItemCardSkeleton />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Invisible sentinel — IntersectionObserver target */}
      <div ref={bottomSentinelRef} style={{ height: "1px" }} />

      {/* Spinner label while loading */}
      {isLoadingMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "24px 16px 8px",
            color: "var(--color-text-muted)",
            gap: "8px",
            alignItems: "center",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <Loader2 size={15} className="animate-spin" style={{ color: "var(--color-accent)" }} />
          <span>Loading more items…</span>
        </div>
      )}

      {/* Error retry */}
      {hasError && (
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <button
            onClick={loadMore}
            className="btn-secondary"
            style={{ borderRadius: "100px", padding: "8px 20px" }}
          >
            Failed to load — retry
          </button>
        </div>
      )}

      {/* End of list indicator */}
      {!cursor && items.length > 0 && (
        <p
          style={{
            textAlign: "center",
            padding: "36px 16px",
            color: "var(--color-text-muted)",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          All {items.length} items loaded
        </p>
      )}
    </div>
  );
}
