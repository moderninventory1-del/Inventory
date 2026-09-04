// src/lib/utils.ts
// Shared utility functions

import { type ClassValue, clsx } from "clsx";

/**
 * Merge Tailwind classes safely (requires clsx).
 * Falls back to simple join if clsx not installed.
 */
export function cn(...inputs: ClassValue[]): string {
  try {
    return clsx(inputs);
  } catch {
    return inputs.filter(Boolean).join(" ");
  }
}

/**
 * Format a date to a readable string.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format date & time to a readable string (e.g., "04 Sep 2026, 04:20 PM").
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * Extract Cloudinary public_id from a secure URL.
 */
export function getCloudinaryPublicId(url: string): string {
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/folder/filename.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : url;
}

/**
 * Sleep for a given number of milliseconds (for testing loading states).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extracts an inventory item ID from a pasted URL or query string.
 * Supports:
 * - https://moderninventory.shop/item/cm7v8y123...
 * - http://localhost:3000/item/cm7v8y123...
 * - /item/cm7v8y123... or item/cm7v8y123...
 * - https://.../admin/inventory/cm7v8y123...
 * - Direct CUID ID (e.g. clx..., cm..., 20-32 chars)
 */
export function extractItemIdFromQuery(query: string): string | null {
  if (!query) return null;
  const trimmed = query.trim();

  // Match URL containing /item/<id> or /inventory/<id>
  const urlMatch = trimmed.match(/(?:item|inventory)\/([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].split("?")[0].split("#")[0].replace(/\/+$/, "");
  }

  // Match direct CUID ID format
  if (/^c[a-z0-9]{20,32}$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}
