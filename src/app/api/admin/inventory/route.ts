// src/app/api/admin/inventory/route.ts
// Admin-only inventory API — cursor-based pagination, full fields including boxLocation
// Protected: returns 401 if caller is not an authenticated admin

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PaginatedResponse, InventoryItem } from "@/types";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 48;

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth guard — admin only
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;

    const search   = searchParams.get("search")?.trim()   ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const brandId  = searchParams.get("brand")?.trim()    ?? "";
    const status   = searchParams.get("status")?.trim()   ?? "active"; // active | deleted | all
    const cursor   = searchParams.get("cursor")            ?? undefined;
    const limitRaw = parseInt(searchParams.get("limit")   ?? String(DEFAULT_LIMIT));
    const limit    = Math.min(Math.max(1, limitRaw), MAX_LIMIT);

    // Build where clause
    const where = {
      isDeleted:
        status === "deleted" ? true
        : status === "active" ? false
        : undefined,
      ...(category ? { category: category as any } : {}),
      ...(brandId  ? { brandId }                  : {}),
      ...(search
        ? {
            OR: [
              { id:          { contains: search, mode: "insensitive" as const } },
              { brand:       { name:        { contains: search, mode: "insensitive" as const } } },
              { modelNumber: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    // Fetch limit+1 to detect next page
    const rawItems = await prisma.inventoryItem.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: { brand: true },
    });

    const hasMore    = rawItems.length > limit;
    const items      = hasMore ? rawItems.slice(0, limit) : rawItems;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const response: PaginatedResponse<InventoryItem> = {
      items: items as unknown as InventoryItem[],
      nextCursor,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[/api/admin/inventory GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch admin inventory" },
      { status: 500 }
    );
  }
}
