const { Pool } = require("pg");
require("dotenv").config();

async function run() {
  const connectionString = process.env.SESSION_URL || process.env.DATABASE_URL;
  console.log("Connecting to PostgreSQL...");
  const pool = new Pool({ connectionString });

  try {
    console.log("1. Creating Category table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
      );
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
    `);

    console.log("2. Changing InventoryItem.category to TEXT...");
    await pool.query(`
      ALTER TABLE "InventoryItem" ALTER COLUMN "category" TYPE TEXT;
    `);

    console.log("3. Seeding default categories (CARD, SUPPLY, INVERTER)...");
    await pool.query(`
      INSERT INTO "Category" ("id", "name", "createdAt")
      VALUES
        ('c_card', 'CARD', CURRENT_TIMESTAMP),
        ('c_supply', 'SUPPLY', CURRENT_TIMESTAMP),
        ('c_inverter', 'INVERTER', CURRENT_TIMESTAMP)
      ON CONFLICT ("name") DO NOTHING;
    `);

    console.log("4. Syncing any existing categories from InventoryItem...");
    await pool.query(`
      INSERT INTO "Category" ("id", "name", "createdAt")
      SELECT 'c_' || md5(random()::text || clock_timestamp()::text), UPPER(category), CURRENT_TIMESTAMP
      FROM "InventoryItem"
      WHERE category IS NOT NULL AND category != ''
      ON CONFLICT ("name") DO NOTHING;
    `);

    const categoriesRes = await pool.query(`SELECT * FROM "Category" ORDER BY name ASC;`);
    console.log("Current Categories in DB:", categoriesRes.rows);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();

