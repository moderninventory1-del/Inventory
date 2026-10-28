-- Run this SQL in your Supabase SQL Editor:
-- Dashboard -> Select Project (qkmojmtkzvzfkfqdaflx) -> SQL Editor -> New query -> Paste & Run

-- 1. Create Schema
CREATE SCHEMA IF NOT EXISTS "public";

-- 2. Create Enum for item categories
DO $$ BEGIN
    CREATE TYPE "ItemCategory" AS ENUM ('CARD', 'SUPPLY', 'INVERTER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Brand Table
CREATE TABLE IF NOT EXISTS "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- 4. Create InventoryItem Table
CREATE TABLE IF NOT EXISTS "InventoryItem" (
    "id" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "boxLocation" TEXT,
    "description" TEXT,
    "frontImage" TEXT NOT NULL,
    "backImage" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- 5. Create Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Brand_name_key" ON "Brand"("name");
CREATE INDEX IF NOT EXISTS "InventoryItem_isDeleted_idx" ON "InventoryItem"("isDeleted");
CREATE INDEX IF NOT EXISTS "InventoryItem_category_idx" ON "InventoryItem"("category");
CREATE INDEX IF NOT EXISTS "InventoryItem_brandId_idx" ON "InventoryItem"("brandId");
CREATE INDEX IF NOT EXISTS "InventoryItem_createdAt_idx" ON "InventoryItem"("createdAt" DESC);

-- 6. Create Foreign Key
DO $$ BEGIN
    ALTER TABLE "InventoryItem" 
    ADD CONSTRAINT "InventoryItem_brandId_fkey" 
    FOREIGN KEY ("brandId") REFERENCES "Brand"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
