// src/app/api/inventory/route.ts
// Public inventory API — cursor-based pagination, search, filter
// NEVER exposes boxLocation, isDeleted, or deleted items

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PaginatedResponse, PublicInventoryItem } from "@/types";

export const dynamic = "force-dynamic";

<<<<<<< HEAD
const DEFAULT_LIMIT = 15;
=======
const DEFAULT_LIMIT = 12;
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
const MAX_LIMIT = 48;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = req.nextUrl;

    const search = searchParams.get("search")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const brandId = searchParams.get("brand")?.trim() ?? "";
    const cursor = searchParams.get("cursor") ?? undefined;
    const limitRaw = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
    const limit = Math.min(Math.max(1, limitRaw), MAX_LIMIT);

    // Build where clause — only active (non-deleted) items
    const where = {
      isDeleted: false,
      ...(category ? { category: category as any } : {}),
      ...(brandId ? { brandId } : {}),
      ...(search
        ? {
            OR: [
              { brand: { name: { contains: search, mode: "insensitive" as const } } },
              { modelNumber: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    // Fetch limit+1 to determine if there's a next page
    const rawItems = await prisma.inventoryItem.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        modelNumber: true,
        brand: { select: { id: true, name: true } },
        category: true,
        description: true,
        frontImage: true,
        backImage: true,
        createdAt: true,
        updatedAt: true,
        // boxLocation INTENTIONALLY excluded
        // isDeleted INTENTIONALLY excluded
        // deletedAt INTENTIONALLY excluded
      },
    });

    const hasMore = rawItems.length > limit;
    const items = hasMore ? rawItems.slice(0, limit) : rawItems;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const response: PaginatedResponse<PublicInventoryItem> = {
      items: items as PublicInventoryItem[],
      nextCursor,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[/api/inventory GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
