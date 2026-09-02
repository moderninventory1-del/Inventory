// src/app/actions/inventory.ts
// Server Actions for admin inventory management
// All actions verify admin session before mutating data

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ItemCategory, ITEM_CATEGORIES } from "@/types";

// ─── Auth Guard ─────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── Validation ──────────────────────────────────────────────────────────────

interface ItemFormData {
  modelNumber: string;
  brandId: string;
  category: string;
  boxLocation: string;
  description: string;
  frontImageDataUri?: string;
  backImageDataUri?: string;
  existingFrontImage?: string;
  existingBackImage?: string;
}

function validateItemData(data: ItemFormData): string | null {
  if (!data.modelNumber.trim()) return "Model number is required";
  if (!data.brandId.trim()) return "Brand is required";
  if (!data.category.trim()) return "Category is required";
  return null;
}

// ─── Create Item ─────────────────────────────────────────────────────────────

export type ActionResult = { success: true } | { success: false; error: string };

export async function createInventoryItem(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const data: ItemFormData = {
      modelNumber: (formData.get("modelNumber") as string) ?? "",
      brandId: (formData.get("brandId") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      boxLocation: (formData.get("boxLocation") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      frontImageDataUri: (formData.get("frontImageDataUri") as string) || undefined,
      backImageDataUri: (formData.get("backImageDataUri") as string) || undefined,
    };

    const error = validateItemData(data);
    if (error) return { success: false, error };

    if (!data.frontImageDataUri) {
      return { success: false, error: "Front image is required" };
    }

    // Upload images to Cloudinary
    const frontUpload = await uploadImage(data.frontImageDataUri, "tv-inventory");
    let backUrl: string | undefined;

    if (data.backImageDataUri) {
      const backUpload = await uploadImage(data.backImageDataUri, "tv-inventory");
      backUrl = backUpload.secure_url;
    }

    await prisma.inventoryItem.create({
      data: {
        modelNumber: data.modelNumber.trim(),
        brandId: data.brandId.trim(),
        category: data.category.trim().toUpperCase() as ItemCategory,
        boxLocation: data.boxLocation.trim() || null,
        description: data.description.trim() || null,
        frontImage: frontUpload.secure_url,
        backImage: backUrl ?? null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
  } catch (err) {
    console.error("[createInventoryItem]", err);
    const message = err instanceof Error ? err.message : "Failed to create item";
    if (message === "Unauthorized") return { success: false, error: "Unauthorized" };
    return { success: false, error: message };
  }

  redirect("/admin/inventory");
}

// ─── Update Item ─────────────────────────────────────────────────────────────

export async function updateInventoryItem(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id, isDeleted: false },
      select: { frontImage: true, backImage: true },
    });

    if (!existingItem) return { success: false, error: "Item not found" };

    const data: ItemFormData = {
      modelNumber: (formData.get("modelNumber") as string) ?? "",
      brandId: (formData.get("brandId") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      boxLocation: (formData.get("boxLocation") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      frontImageDataUri: (formData.get("frontImageDataUri") as string) || undefined,
      backImageDataUri: (formData.get("backImageDataUri") as string) || undefined,
    };

    const error = validateItemData(data);
    if (error) return { success: false, error };

    // Upload new images if provided, else keep existing
    let frontUrl = existingItem.frontImage;
    let backUrl: string | null = existingItem.backImage ?? null;

    if (data.frontImageDataUri) {
      const upload = await uploadImage(data.frontImageDataUri, "tv-inventory");
      frontUrl = upload.secure_url;
    }

    if (data.backImageDataUri) {
      const upload = await uploadImage(data.backImageDataUri, "tv-inventory");
      backUrl = upload.secure_url;
    }

    // Clear back image if user removed it
    const clearBack = formData.get("clearBackImage") === "true";
    if (clearBack) backUrl = null;

    await prisma.inventoryItem.update({
      where: { id },
      data: {
        modelNumber: data.modelNumber.trim(),
        brandId: data.brandId.trim(),
        category: data.category.trim().toUpperCase() as ItemCategory,
        boxLocation: data.boxLocation.trim() || null,
        description: data.description.trim() || null,
        frontImage: frontUrl,
        backImage: backUrl,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/inventory");
    revalidatePath(`/item/${id}`);
    revalidatePath("/admin");
  } catch (err) {
    console.error("[updateInventoryItem]", err);
    const message = err instanceof Error ? err.message : "Failed to update item";
    if (message === "Unauthorized") return { success: false, error: "Unauthorized" };
    return { success: false, error: message };
  }

  redirect("/admin/inventory");
}

// ─── Soft Delete ─────────────────────────────────────────────────────────────

export async function deleteInventoryItem(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.inventoryItem.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("[deleteInventoryItem]", err);
    const message = err instanceof Error ? err.message : "Failed to delete item";
    return { success: false, error: message };
  }
}

// ─── Restore ─────────────────────────────────────────────────────────────────

export async function restoreInventoryItem(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.inventoryItem.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("[restoreInventoryItem]", err);
    const message = err instanceof Error ? err.message : "Failed to restore item";
    return { success: false, error: message };
  }
}

// ─── Create Brand ────────────────────────────────────────────────────────────

export type BrandActionResult = { success: true; brand: { id: string; name: string } } | { success: false; error: string };

export async function createBrand(name: string): Promise<BrandActionResult> {
  try {
    await requireAdmin();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: "Brand name is required" };
    }

    // Check for duplicate
    const existing = await prisma.brand.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return { success: false, error: "A brand with this name already exists" };
    }

    const brand = await prisma.brand.create({
      data: {
        name: trimmedName,
      },
    });

    revalidatePath("/admin/inventory/new");
    revalidatePath("/admin/inventory/[id]/edit", "page");

    return { success: true, brand };
  } catch (err) {
    console.error("[createBrand]", err);
    return { success: false, error: "Failed to create brand" };
  }
}

// ─── Create Category ─────────────────────────────────────────────────────────

export type CategoryActionResult =
  | { success: true; category: { id: string; name: string } }
  | { success: false; error: string };

export async function createCategory(name: string): Promise<CategoryActionResult> {
  return { success: false, error: "Categories are managed by system enum" };
}
