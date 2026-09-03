// src/lib/scroll-cache.ts
// Session-based scroll and pagination progress cache for seamless back-navigation restoration

export interface InventoryScrollCache<T> {
  cacheKey: string;
  items: T[];
  cursor: string | null;
  scrollY: number;
}

export function getScrollCache<T>(
  storageKey: string,
  currentKey: string
): InventoryScrollCache<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const data: InventoryScrollCache<T> = JSON.parse(raw);
    if (
      data &&
      data.cacheKey === currentKey &&
      Array.isArray(data.items) &&
      data.items.length > 0
    ) {
      return data;
    }
  } catch {
    // If parsing fails or storage restricted
  }
  return null;
}

export function saveScrollCache<T>(
  storageKey: string,
  cacheKey: string,
  items: T[],
  cursor: string | null,
  scrollY: number
) {
  if (typeof window === "undefined") return;
  try {
    const data: InventoryScrollCache<T> = {
      cacheKey,
      items,
      cursor,
      scrollY: Math.max(0, Math.round(scrollY)),
    };
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    // Silently ignore quota exceeded errors
  }
}

export function clearScrollCache(storageKey: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey);
  } catch {}
}
