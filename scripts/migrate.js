const { Pool } = require("pg");
require("dotenv").config();

async function run() {
  const pool = new Pool({ connectionString: process.env.SESSION_URL });

  try {
    console.log("Starting database migration...");

    // 1. Create Enum and Brand table
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "ItemCategory" AS ENUM ('CARD', 'SUPPLY', 'INVERTER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Brand" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Brand_name_key" ON "Brand"("name");
    `);

    // 2. Add brandId to InventoryItem (nullable for now)
    await pool.query(`
      ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "brandId" TEXT;
    `);

    // 3. Migrate Brand data
    console.log("Migrating brands...");
    const items = await pool.query(`SELECT id, brand FROM "InventoryItem" WHERE "brandId" IS NULL`);
    
    for (const row of items.rows) {
      if (!row.brand) continue;
      const brandName = row.brand.trim();
      
      // Get or create brand
      let brandRes = await pool.query(`SELECT id FROM "Brand" WHERE name = $1`, [brandName]);
      let brandId;
      if (brandRes.rows.length === 0) {
        // Generate a random cuid-like ID (simple random string for script)
        brandId = 'c' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        await pool.query(`INSERT INTO "Brand" (id, name) VALUES ($1, $2)`, [brandId, brandName]);
      } else {
        brandId = brandRes.rows[0].id;
      }
      
      // Update item
      await pool.query(`UPDATE "InventoryItem" SET "brandId" = $1 WHERE id = $2`, [brandId, row.id]);
    }

    // 4. Update Categories
    console.log("Migrating categories...");
    // Map existing categories to CARD as default if they don't match exactly
    await pool.query(`
      UPDATE "InventoryItem" 
      SET category = 'CARD' 
      WHERE category NOT IN ('CARD', 'SUPPLY', 'INVERTER');
    `);

    // Cast the category column to the new Enum
    await pool.query(`
      ALTER TABLE "InventoryItem" 
      ALTER COLUMN "category" TYPE "ItemCategory" 
      USING category::text::"ItemCategory";
    `);

    // 5. Finalize constraints
    console.log("Applying final constraints...");
    
    // Drop old brand column
    await pool.query(`
      ALTER TABLE "InventoryItem" DROP COLUMN IF EXISTS "brand";
    `);
    
    // Make brandId required
    await pool.query(`
      ALTER TABLE "InventoryItem" ALTER COLUMN "brandId" SET NOT NULL;
    `);
    
    // Add foreign key
    await pool.query(`
      ALTER TABLE "InventoryItem" 
      DROP CONSTRAINT IF EXISTS "InventoryItem_brandId_fkey";
    `);
    await pool.query(`
      ALTER TABLE "InventoryItem" 
      ADD CONSTRAINT "InventoryItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `);

    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

run();
