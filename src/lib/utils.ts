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

<<<<<<< HEAD
export interface CloudinaryOptimizeOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  crop?: string;
  format?: string;
}

/**
 * Transforms a Cloudinary image URL to request a dynamically resized,
 * modern-format (AVIF/WebP), and compressed thumbnail directly from Cloudinary CDN edge.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: CloudinaryOptimizeOptions = {}
): string {
  if (!url || typeof url !== "string") return "";

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const {
    width = 500,
    height,
    quality = "auto:good",
    crop = "limit",
    format = "auto",
  } = options;

  const transforms: string[] = [];
  if (crop) transforms.push(`c_${crop}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);

  const transformString = transforms.join(",");

  // Matches /image/upload/ followed by any existing transformations (e.g. c_limit,w_500,...)
  const transformRegex = /\/image\/upload\/(?:(?:[a-z]{1,2}_[a-zA-Z0-9:_-]+,?)+\/)?/;
  return url.replace(transformRegex, `/image/upload/${transformString}/`);
}

=======
>>>>>>> 34a91b3ca934d6332eda3f205721535ec4faf943
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
