// src/app/api/admin/boxes/route.ts
// Returns grouped, canonical box names for a selected brand

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBoxesForBrand } from "@/lib/boxes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const brandId = searchParams.get("brandId")?.trim() || "";

  if (!brandId) {
    return NextResponse.json({ boxes: [] });
  }

  const boxes = await getBoxesForBrand(brandId);
  return NextResponse.json({ boxes });
}
