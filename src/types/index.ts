// src/types/index.ts
// Shared TypeScript types for the TV Inventory Platform

<<<<<<< HEAD
export type ItemCategory = string;

export const DEFAULT_CATEGORIES: string[] = [
=======
export type ItemCategory = "CARD" | "SUPPLY" | "INVERTER";

export const ITEM_CATEGORIES: ItemCategory[] = [
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
  "CARD",
  "SUPPLY",
  "INVERTER",
];

<<<<<<< HEAD
// Kept for backward compatibility
export const ITEM_CATEGORIES = DEFAULT_CATEGORIES;

export interface Category {
  id: string;
  name: string;
  createdAt?: Date;
}

=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
export interface InventoryItem {
  id: string;
  modelNumber: string;
  brandId: string;
  brand: {
    id: string;
    name: string;
  };
<<<<<<< HEAD
  category: string;
=======
  category: ItemCategory;
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
