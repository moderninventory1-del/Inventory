// src/lib/boxes.ts
// Intelligent box grouping & canonical name extraction for admin inventory

import { prisma } from "@/lib/prisma";

export interface BoxFilterOption {
  key: string; // Normalized lowercase alphanumeric key: "lgcardbox1"
  name: string; // Canonical display name with spaces in capital: "LG CARD BOX 1"
  count?: number;
}

/**
 * Normalizes a string by ignoring spaces, hyphens, and all non-alphanumeric characters.
 * E.g. "LG-Card BOX 1" -> "lgcardbox1"
 */
export function normalizeBoxKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Extracts alphanumeric words separated by a single space and uppercased.
 * E.g. "samsung card & box 1" -> "SAMSUNG CARD BOX 1"
 */
export function cleanBoxCandidate(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, " ").trim().replace(/\s+/g, " ").toUpperCase();
}

/**
 * Groups raw boxLocation strings by alphanumeric characters and chooses the candidate
 * with the most spaces as the canonical uppercase name.
 */
export function groupAndFormatBoxes(rawLocations: string[]): BoxFilterOption[] {
  const groups = new Map<string, string[]>();

  for (const raw of rawLocations) {
    if (!raw || !raw.trim()) continue;
    const key = normalizeBoxKey(raw);
    if (!key) continue;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(raw);
  }

  const result: BoxFilterOption[] = [];

  for (const [key, variants] of groups.entries()) {
    let bestName = "";
    let maxSpaces = -1;

    for (const v of variants) {
      const cleaned = cleanBoxCandidate(v);
      const spaceCount = (cleaned.match(/ /g) || []).length;
      if (
        spaceCount > maxSpaces ||
        (spaceCount === maxSpaces && cleaned.length > bestName.length)
      ) {
        maxSpaces = spaceCount;
        bestName = cleaned;
      }
    }

    result.push({
      key,
      name: bestName || key.toUpperCase(),
      count: variants.length,
    });
  }

  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

/**
 * Fetches all distinct box locations for a given brand and groups them intelligently.
 */
export async function getBoxesForBrand(brandId: string): Promise<BoxFilterOption[]> {
  if (!brandId) return [];

  try {
    const rawItems = await prisma.inventoryItem.findMany({
      where: {
        brandId,
        boxLocation: {
          not: null,
        },
      },
      select: {
        boxLocation: true,
      },
      distinct: ["boxLocation"],
    });

    const rawLocations = rawItems
      .map((item) => item.boxLocation)
      .filter((b): b is string => Boolean(b && b.trim()));

    return groupAndFormatBoxes(rawLocations);
  } catch (error) {
    console.error("[getBoxesForBrand] Error:", error);
    return [];
  }
}
