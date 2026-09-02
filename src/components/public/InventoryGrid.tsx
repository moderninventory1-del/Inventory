"use client";
// src/components/public/InventoryGrid.tsx
<<<<<<< HEAD
// Infinite-scroll inventory grid — preloads next 15 items when scrolling to 10th item
=======
// Infinite-scroll inventory grid — client component
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

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
<<<<<<< HEAD

  // Trigger index: at 10 items (index 9 in a 15-item batch, or items.length - 6)
  const triggerIndex = Math.max(0, items.length - 6);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
=======
  const sentinelRef = useRef<HTMLDivElement | null>(null);
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

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
<<<<<<< HEAD
      params.set("limit", "15");
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

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

<<<<<<< HEAD
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
=======
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
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

  if (items.length === 0) {
    return (
      <div
<<<<<<< HEAD
        className="card"
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 16px",
          gap: "16px",
          color: "var(--color-text-muted)",
<<<<<<< HEAD
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
        <div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            No items found
          </p>
          <p style={{ fontSize: "14px", marginTop: "4px", color: "var(--color-text-muted)" }}>
=======
        }}
      >
        <PackageSearch size={48} strokeWidth={1} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            No items found
          </p>
          <p style={{ fontSize: "14px", marginTop: "4px" }}>
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
<<<<<<< HEAD
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
=======
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
          gap: "24px",
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
<<<<<<< HEAD
            ref={i === triggerIndex ? triggerRef : undefined}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i % 15, 6) * 40}ms` }}
=======
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i % 12, 6) * 50}ms` }}
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
          >
            <ItemCard item={item} />
          </div>
        ))}
<<<<<<< HEAD

        {/* Skeleton cards shown seamlessly inside the grid while next 15 are loading */}
        {isLoadingMore && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-more-${i}`} className="animate-fade-in">
                <ItemCardSkeleton />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Fallback sentinel */}
      <div ref={bottomSentinelRef} style={{ height: "1px" }} />

      {/* Subtle bottom indicator while loading next batch */}
=======
      </div>

      {/* Sentinel + Loading */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
      {isLoadingMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
<<<<<<< HEAD
            alignItems: "center",
            padding: "24px 16px 8px",
            color: "var(--color-text-muted)",
            gap: "8px",
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
            Failed to load more — tap to retry
=======
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
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
          </button>
        </div>
      )}

<<<<<<< HEAD
      {/* End of list */}
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
      {!cursor && items.length > 0 && (
        <p
          style={{
            textAlign: "center",
<<<<<<< HEAD
            padding: "36px 16px",
            color: "var(--color-text-muted)",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          You have viewed all {items.length} items
=======
            padding: "24px",
            color: "var(--color-text-muted)",
            fontSize: "13px",
          }}
        >
          All {items.length} items loaded
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
        </p>
      )}
    </div>
  );
}
