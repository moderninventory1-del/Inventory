// src/types/index.ts
// Shared TypeScript types for the TV Inventory Platform

export type ItemCategory = "CARD" | "SUPPLY" | "INVERTER";

export const ITEM_CATEGORIES: ItemCategory[] = [
  "CARD",
  "SUPPLY",
  "INVERTER",
];

export interface InventoryItem {
  id: string;
  modelNumber: string;
  brandId: string;
  brand: {
    id: string;
    name: string;
  };
  category: ItemCategory;
  boxLocation: string | null;
  description: string | null;
  frontImage: string;
  backImage: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Public-facing item (no boxLocation)
export type PublicInventoryItem = Omit<InventoryItem, "boxLocation" | "isDeleted" | "deletedAt">;

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  cursor?: string;
  limit?: number;
}

export interface AdminStats {
  total: number;
  active: number;
  deleted: number;
  recentCount: number; // added in last 7 days
}
