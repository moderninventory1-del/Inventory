// src/app/api/admin/not-sure/route.ts
// Protected API returning all items currently marked as "Not Sure"

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        isNotSure: true,
        isDeleted: false,
      },
      orderBy: {
        notSureAt: "desc",
      },
      select: {
        id: true,
        modelNumber: true,
        category: true,
        boxLocation: true,
        description: true,
        frontImage: true,
        notSureAt: true,
        notSureRemarks: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[/api/admin/not-sure GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch not-sure items" },
      { status: 500 }
    );
  }
}
