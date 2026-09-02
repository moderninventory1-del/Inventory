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

// Reuse connection pool across serverless invocations to prevent connection exhaustion
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2, // Keep connection count conservative per serverless lambda (transaction pooler mode)
    idleTimeoutMillis: 5000, // Close idle connections promptly
    connectionTimeoutMillis: 5000, // Fail fast if unreachable
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// CRITICAL: Always attach to globalThis in ALL environments (including production on Vercel)
// This prevents serverless functions from opening a new pool on every request
globalForPrisma.prisma = prisma;
globalForPrisma.pool = pool;
