// src/lib/search.ts
// Forward subsequence search logic:
// 1. Matches alphanumeric characters strictly in forward order (e.g. "3212" matches "32pq-lq12", "1232" rejects)
// 2. Prioritizes matching models on top of results, followed by matching descriptions

import { prisma } from "@/lib/prisma";
import type { PaginatedResponse, PublicInventoryItem, InventoryItem } from "@/types";

/**
 * Builds a forward subsequence regular expression pattern.
 * E.g., "3q-12" -> "3.*q.*1.*2"
 * Ignores spaces, hyphens, and non-alphanumeric punctuation.
 */
export function buildForwardSubsequenceRegex(query: string): string | null {
  const clean = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!clean) return null;
  return clean
    .split("")
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
}

export interface SearchOptions {
  search?: string;
  category?: string;
  brandId?: string;
  sort?: "latest" | "oldest";
  cursor?: string;
  limit?: number;
}

export interface AdminSearchOptions extends SearchOptions {
  status?: string; // "active" | "deleted" | "all"
}

/**
 * Public Inventory Search with Forward Subsequence & Model-First Ranking
 */
export async function searchPublicInventory({
  search = "",
  category = "",
  brandId = "",
  sort = "latest",
  cursor,
  limit = 15,
}: SearchOptions): Promise<PaginatedResponse<PublicInventoryItem>> {
  const cleanSearch = search.trim();
  const regex = buildForwardSubsequenceRegex(cleanSearch);
  const sortDirection = sort === "oldest" ? "asc" : "desc";

  // If no search query, use standard optimized Prisma query
  if (!cleanSearch || !regex) {
    const where = {
      isDeleted: false,
      ...(category ? { category: category as any } : {}),
      ...(brandId ? { brandId } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: sortDirection },
        select: {
          id: true,
          modelNumber: true,
          brandId: true,
          brand: { select: { id: true, name: true } },
          category: true,
          description: true,
          frontImage: true,
          backImage: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const hasMore = items.length > limit;
    const returnedItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? returnedItems[returnedItems.length - 1].id : null;

    return {
      items: returnedItems as PublicInventoryItem[],
      nextCursor,
      total,
    };
  }

  // Forward subsequence search with Model Matches FIRST, then Description matches
  const offset = cursor ? parseInt(cursor, 10) || 0 : 0;
  const conditions = ['i."isDeleted" = false'];
  const params: any[] = [];
  let paramIdx = 1;

  if (category) {
    conditions.push(`i.category = $${paramIdx++}::"ItemCategory"`);
    params.push(category);
  }

  if (brandId) {
    conditions.push(`i."brandId" = $${paramIdx++}`);
    params.push(brandId);
  }

  const rawPattern = `%${cleanSearch}%`;
  const pSearch = paramIdx++;
  const pRegex = paramIdx++;
  params.push(rawPattern, regex);

  conditions.push(`(
    i."modelNumber" ~* $${pRegex}
    OR i.description ~* $${pRegex}
    OR b.name ~* $${pRegex}
  )`);

  const sql = `
    SELECT
      i.id,
      i."modelNumber",
      i."brandId",
      i.category,
      i.description,
      i."frontImage",
      i."backImage",
      i."createdAt",
      i."updatedAt",
      json_build_object('id', b.id, 'name', b.name) as brand,
      CASE
        WHEN i."modelNumber" ILIKE $${pSearch} THEN 1
        WHEN i."modelNumber" ~* $${pRegex} THEN 2
        WHEN b.name ILIKE $${pSearch} THEN 3
        WHEN i.description ILIKE $${pSearch} THEN 4
        WHEN i.description ~* $${pRegex} THEN 5
        ELSE 6
      END as rank
    FROM "InventoryItem" i
    LEFT JOIN "Brand" b ON i."brandId" = b.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY rank ASC, i."createdAt" ${sort === "oldest" ? "ASC" : "DESC"}
    LIMIT ${limit + 1} OFFSET ${offset};
  `;

  const rawRows = (await prisma.$queryRawUnsafe(sql, ...params)) as any[];
  const hasMore = rawRows.length > limit;
  const items = hasMore ? rawRows.slice(0, limit) : rawRows;
  const nextCursor = hasMore ? String(offset + limit) : null;

  return {
    items: items as PublicInventoryItem[],
    nextCursor,
    total: items.length,
  };
}

/**
 * Admin Inventory Search with Forward Subsequence & Model-First Ranking
 */
export async function searchAdminInventory({
  search = "",
  category = "",
  brandId = "",
  status = "active",
  sort = "latest",
  cursor,
  limit = 15,
}: AdminSearchOptions): Promise<PaginatedResponse<InventoryItem>> {
  const cleanSearch = search.trim();
  const regex = buildForwardSubsequenceRegex(cleanSearch);
  const sortDirection = sort === "oldest" ? "asc" : "desc";

  // If no search query, use standard Prisma query
  if (!cleanSearch || !regex) {
    const where = {
      isDeleted:
        status === "deleted" ? true : status === "active" ? false : undefined,
      ...(category ? { category: category as any } : {}),
      ...(brandId ? { brandId } : {}),
    };

    const rawItems = await prisma.inventoryItem.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: sortDirection },
      include: { brand: true },
    });

    const hasMore = rawItems.length > limit;
    const items = hasMore ? rawItems.slice(0, limit) : rawItems;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items: items as unknown as InventoryItem[], nextCursor };
  }

  // Forward subsequence search for admin
  const offset = cursor ? parseInt(cursor, 10) || 0 : 0;
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (status === "deleted") {
    conditions.push('i."isDeleted" = true');
  } else if (status === "active") {
    conditions.push('i."isDeleted" = false');
  }

  if (category) {
    conditions.push(`i.category = $${paramIdx++}::"ItemCategory"`);
    params.push(category);
  }

  if (brandId) {
    conditions.push(`i."brandId" = $${paramIdx++}`);
    params.push(brandId);
  }

  const rawPattern = `%${cleanSearch}%`;
  const pSearch = paramIdx++;
  const pRegex = paramIdx++;
  params.push(rawPattern, regex);

  conditions.push(`(
    i."modelNumber" ~* $${pRegex}
    OR i.description ~* $${pRegex}
    OR b.name ~* $${pRegex}
    OR i."boxLocation" ~* $${pRegex}
  )`);

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT
      i.id,
      i."modelNumber",
      i."brandId",
      i.category,
      i.description,
      i."frontImage",
      i."backImage",
      i."boxLocation",
      i."isDeleted",
      i."deletedAt",
      i."createdAt",
      i."updatedAt",
      json_build_object('id', b.id, 'name', b.name) as brand,
      CASE
        WHEN i."modelNumber" ILIKE $${pSearch} THEN 1
        WHEN i."modelNumber" ~* $${pRegex} THEN 2
        WHEN b.name ILIKE $${pSearch} THEN 3
        WHEN i.description ILIKE $${pSearch} THEN 4
        WHEN i.description ~* $${pRegex} THEN 5
        ELSE 6
      END as rank
    FROM "InventoryItem" i
    LEFT JOIN "Brand" b ON i."brandId" = b.id
    ${whereClause}
    ORDER BY rank ASC, i."createdAt" ${sort === "oldest" ? "ASC" : "DESC"}
    LIMIT ${limit + 1} OFFSET ${offset};
  `;

  const rawRows = (await prisma.$queryRawUnsafe(sql, ...params)) as any[];
  const hasMore = rawRows.length > limit;
  const items = hasMore ? rawRows.slice(0, limit) : rawRows;
  const nextCursor = hasMore ? String(offset + limit) : null;

  return { items: items as unknown as InventoryItem[], nextCursor };
}
