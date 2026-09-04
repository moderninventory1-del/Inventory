// src/app/api/admin/inventory/route.ts
// Admin-only inventory API — cursor-based pagination, forward subsequence search, model-first ranking
// Protected: returns 401 if caller is not an authenticated admin

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchAdminInventory } from "@/lib/search";

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
    const box      = searchParams.get("box")?.trim()      ?? "";
    const status   = searchParams.get("status")?.trim()   ?? "active"; // active | deleted | all
    const sort     = searchParams.get("sort") === "oldest" ? "oldest" : "latest";
    const cursor   = searchParams.get("cursor")            ?? undefined;
    const limitRaw = parseInt(searchParams.get("limit")   ?? String(DEFAULT_LIMIT));
    const limit    = Math.min(Math.max(1, limitRaw), MAX_LIMIT);

    const response = await searchAdminInventory({
      search,
      category,
      brandId,
      box,
      status,
      sort,
      cursor,
      limit,
    });

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[/api/admin/inventory GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch admin inventory" },
      { status: 500 }
    );
  }
}
