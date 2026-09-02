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
