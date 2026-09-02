// src/lib/prisma.ts
// Prisma client singleton with connection pooling via @prisma/adapter-pg
// Uses DATABASE_URL (Supabase transaction pooler, port 6543) for runtime queries

import { PrismaClient } from "@/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5, // Limit concurrent pool connections per process
    idleTimeoutMillis: 10000, // Close idle connections after 10s
    connectionTimeoutMillis: 5000, // Fail fast if unreachable
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
