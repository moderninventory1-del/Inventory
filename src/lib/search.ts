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

import { extractItemIdFromQuery } from "@/lib/utils";
export { extractItemIdFromQuery };

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
  box?: string; // Normalized box key, e.g. "lgcardbox1"
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
  const extractedId = extractItemIdFromQuery(cleanSearch);

  // If query is or contains a direct Item ID / URL, resolve directly
  if (extractedId) {
    const directItem = await prisma.inventoryItem.findFirst({
      where: {
        id: extractedId,
        isDeleted: false,
        ...(category ? { category: category as any } : {}),
        ...(brandId ? { brandId } : {}),
      },
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
    });

    if (directItem) {
      return {
        items: [directItem as PublicInventoryItem],
        nextCursor: null,
        total: 1,
      };
    }
  }

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
 * Admin Inventory Search with Forward Subsequence & Model-First Ranking & Box Location Filtering
 */
export async function searchAdminInventory({
  search = "",
  category = "",
  brandId = "",
  box = "",
  status = "active",
  sort = "latest",
  cursor,
  limit = 15,
}: AdminSearchOptions): Promise<PaginatedResponse<InventoryItem>> {
  const cleanSearch = search.trim();
  const extractedId = extractItemIdFromQuery(cleanSearch);

  // If query is or contains a direct Item ID or URL from user/admin panel, resolve immediately!
  if (extractedId) {
    const directItem = await prisma.inventoryItem.findFirst({
      where: {
        id: extractedId,
        isDeleted:
          status === "deleted" ? true : status === "active" ? false : undefined,
        ...(category ? { category: category as any } : {}),
        ...(brandId ? { brandId } : {}),
      },
      include: { brand: true },
    });

    if (directItem) {
      return {
        items: [directItem as unknown as InventoryItem],
        nextCursor: null,
      };
    }
  }

  const effectiveSearch = extractedId || cleanSearch;
  const regex = buildForwardSubsequenceRegex(effectiveSearch);
  const cleanBox = box ? box.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const sortDirection: "asc" | "desc" = sort === "oldest" ? "asc" : "desc";

  // If no search query and no box filter, use standard Prisma query
  if (!effectiveSearch && !cleanBox) {
    const where = {
      isDeleted:
        status === "deleted" ? true : status === "active" ? false : undefined,
      ...(category ? { category: category as any } : {}),
      ...(brandId ? { brandId } : {}),
    };

    const orderBy =
      status === "deleted"
        ? [
            { deletedAt: sortDirection },
            { updatedAt: sortDirection },
            { createdAt: sortDirection },
          ]
        : [{ createdAt: sortDirection }];

    const rawItems = await prisma.inventoryItem.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy,
      include: { brand: true },
    });

    const hasMore = rawItems.length > limit;
    const items = hasMore ? rawItems.slice(0, limit) : rawItems;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items: items as unknown as InventoryItem[], nextCursor };
  }

  // Raw query when forward-subsequence search OR box filter is active
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

  // Box filter matching normalized alphanumeric characters (ignores case, spaces, symbols)
  if (cleanBox) {
    conditions.push(
      `regexp_replace(lower(COALESCE(i."boxLocation", '')), '[^a-z0-9]', '', 'g') = $${paramIdx++}`
    );
    params.push(cleanBox);
  }

  const hasSearch = Boolean(effectiveSearch && regex);
  let rankSelect = "1 as rank";

  if (hasSearch) {
    const rawPattern = `%${effectiveSearch}%`;
    const pSearch = paramIdx++;
    const pRegex = paramIdx++;
    params.push(rawPattern, regex);

    conditions.push(`(
      i."modelNumber" ~* $${pRegex}
      OR i.description ~* $${pRegex}
      OR b.name ~* $${pRegex}
      OR i."boxLocation" ~* $${pRegex}
      OR i.id ILIKE $${pSearch}
    )`);

    rankSelect = `
      CASE
        WHEN i."modelNumber" ILIKE $${pSearch} THEN 1
        WHEN i."modelNumber" ~* $${pRegex} THEN 2
        WHEN i.id ILIKE $${pSearch} THEN 3
        WHEN b.name ILIKE $${pSearch} THEN 4
        WHEN i.description ILIKE $${pSearch} THEN 5
        WHEN i.description ~* $${pRegex} THEN 6
        WHEN i."boxLocation" ~* $${pRegex} THEN 7
        ELSE 8
      END as rank
    `;
  }

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
      i."isNotSure",
      i."notSureAt",
      i."createdAt",
      i."updatedAt",
      json_build_object('id', b.id, 'name', b.name) as brand,
      ${rankSelect}
    FROM "InventoryItem" i
    LEFT JOIN "Brand" b ON i."brandId" = b.id
    ${whereClause}
    ORDER BY ${hasSearch ? "rank ASC," : ""} ${
      status === "deleted"
        ? `COALESCE(i."deletedAt", i."updatedAt", i."createdAt") ${sort === "oldest" ? "ASC" : "DESC"}`
        : `i."createdAt" ${sort === "oldest" ? "ASC" : "DESC"}`
    }
    LIMIT ${limit + 1} OFFSET ${offset};
  `;

  const rawRows = (await prisma.$queryRawUnsafe(sql, ...params)) as any[];
  const hasMore = rawRows.length > limit;
  const items = hasMore ? rawRows.slice(0, limit) : rawRows;
  const nextCursor = hasMore ? String(offset + limit) : null;

  return { items: items as unknown as InventoryItem[], nextCursor };
}
