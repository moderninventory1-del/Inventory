"use client";
// src/components/public/InventoryGrid.tsx
// Infinite-scroll inventory grid — preloads next 15 items when scrolling to 10th item
// Preserves loaded items and scroll position across back-navigation

import { useEffect, useRef, useState, useCallback } from "react";
import ItemCard from "./ItemCard";
import ItemCardSkeleton from "./ItemCardSkeleton";
import type { PublicInventoryItem, PaginatedResponse } from "@/types";
import { Loader2, PackageSearch } from "lucide-react";
import { getScrollCache, saveScrollCache } from "@/lib/scroll-cache";

interface InventoryGridProps {
  initialData: PaginatedResponse<PublicInventoryItem>;
  search: string;
  category: string;
  brandId: string;
  sort?: string;
}

const STORAGE_KEY = "user_inventory_scroll_cache";

export default function InventoryGrid({
  initialData,
  search,
  category,
  brandId,
  sort,
}: InventoryGridProps) {
  const cacheKey = `${search}|${category}|${brandId}|${sort || ""}`;

  // Initialize from cache if navigating back, otherwise use server initialData
  const [items, setItems] = useState<PublicInventoryItem[]>(() => {
    const cached = getScrollCache<PublicInventoryItem>(STORAGE_KEY, cacheKey);
    if (cached && cached.items.length > 0) {
      if (
        initialData.items.length > 0 &&
        cached.items[0]?.id !== initialData.items[0]?.id
      ) {
        return initialData.items;
      }
      return cached.items;
    }
    return initialData.items;
  });

  const [cursor, setCursor] = useState<string | null>(() => {
    const cached = getScrollCache<PublicInventoryItem>(STORAGE_KEY, cacheKey);
    if (cached && cached.items.length > 0) {
      if (
        initialData.items.length > 0 &&
        cached.items[0]?.id !== initialData.items[0]?.id
      ) {
        return initialData.nextCursor;
      }
      return cached.cursor;
    }
    return initialData.nextCursor;
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Trigger index: at 10 items (index 9 in a 15-item batch, or items.length - 6)
  const triggerIndex = Math.max(0, items.length - 6);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  const isRestoredRef = useRef(false);
  const prevKeyRef = useRef(cacheKey);

  // Restore scroll position when returning back
  useEffect(() => {
    const cached = getScrollCache<PublicInventoryItem>(STORAGE_KEY, cacheKey);
    const isFresh =
      initialData.items.length === 0 ||
      (cached && cached.items[0]?.id === initialData.items[0]?.id);

    if (cached && cached.scrollY > 0 && !isRestoredRef.current && isFresh) {
      isRestoredRef.current = true;
      const targetY = cached.scrollY;

      // Multi-step instant scroll to override any default browser or Next.js scroll-to-top actions
      const timers = [0, 20, 60, 140, 300].map((delay) =>
        setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: "instant" });
        }, delay)
      );

      return () => timers.forEach(clearTimeout);
    }
  }, [cacheKey, initialData]);

  // When filters change explicitly, reset to initialData; also sync if initialData has new items
  useEffect(() => {
    if (prevKeyRef.current !== cacheKey) {
      prevKeyRef.current = cacheKey;
      isRestoredRef.current = false;
      setItems(initialData.items);
      setCursor(initialData.nextCursor);
      setHasError(false);
      saveScrollCache(STORAGE_KEY, cacheKey, initialData.items, initialData.nextCursor, 0);
    } else if (
      initialData.items.length > 0 &&
      items.length > 0 &&
      initialData.items[0]?.id !== items[0]?.id
    ) {
      setItems(initialData.items);
      setCursor(initialData.nextCursor);
      saveScrollCache(STORAGE_KEY, cacheKey, initialData.items, initialData.nextCursor, 0);
    }
  }, [initialData, cacheKey, items]);

  // Debounced scroll listener to continuously save position
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      if (window.scrollY === 0 && isRestoredRef.current) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        saveScrollCache(STORAGE_KEY, cacheKey, items, cursor, window.scrollY);
      }, 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [cacheKey, items, cursor]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setHasError(false);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (brandId) params.set("brand", brandId);
      if (sort) params.set("sort", sort);
      if (cursor) params.set("cursor", cursor);
      params.set("limit", "15");

      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data: PaginatedResponse<PublicInventoryItem> = await res.json();
      setItems((prev) => {
        const nextItems = [...prev, ...data.items];
        saveScrollCache(STORAGE_KEY, cacheKey, nextItems, data.nextCursor, window.scrollY);
        return nextItems;
      });
      setCursor(data.nextCursor);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, search, category, brandId, sort, cacheKey]);

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
        <div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            No items found
          </p>
          <p style={{ fontSize: "14px", marginTop: "4px", color: "var(--color-text-muted)" }}>
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
            <ItemCard item={item} />
          </div>
        ))}

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
      {isLoadingMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
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
          </button>
        </div>
      )}

      {/* End of list */}
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
          You have viewed all {items.length} items
        </p>
      )}
    </div>
  );
}
