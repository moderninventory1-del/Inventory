// src/app/api/inventory/route.ts
// Public inventory API — cursor-based pagination, forward subsequence search, model-first ranking
// NEVER exposes boxLocation, isDeleted, or deleted items

import { NextRequest, NextResponse } from "next/server";
import { searchPublicInventory } from "@/lib/search";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 48;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = req.nextUrl;

    const search = searchParams.get("search")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const brandId = searchParams.get("brand")?.trim() ?? "";
    const sort = searchParams.get("sort") === "oldest" ? "oldest" : "latest";
    const cursor = searchParams.get("cursor") ?? undefined;
    const limitRaw = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
    const limit = Math.min(Math.max(1, limitRaw), MAX_LIMIT);

    const response = await searchPublicInventory({
      search,
      category,
      brandId,
      sort,
      cursor,
      limit,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[/api/inventory GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
