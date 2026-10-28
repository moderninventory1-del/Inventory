// scratch/migrate_not_sure.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  await client.query(`
    ALTER TABLE "InventoryItem" 
    ADD COLUMN IF NOT EXISTS "isNotSure" BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS "notSureAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "notSureRemarks" TEXT;
  `);
  console.log('Added isNotSure, notSureAt, and notSureRemarks columns.');

  await client.query(`
    CREATE INDEX IF NOT EXISTS "InventoryItem_isNotSure_idx" 
    ON "InventoryItem"("isNotSure");
  `);
  console.log('Created index on isNotSure.');

  const res = await client.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'InventoryItem' AND column_name IN ('isNotSure', 'notSureAt', 'notSureRemarks');
  `);
  console.log('Verified columns in DB:', res.rows);

  await client.end();
  console.log('Migration complete.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
