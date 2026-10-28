// src/lib/prisma.ts
// Prisma client singleton with connection pooling via @prisma/adapter-pg
// Enforces Supabase transaction pooler (port 6543) for serverless environments

import { PrismaClient } from "@/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getSanitizedConnectionString(): string {
  let url = process.env.DATABASE_URL || "";
  if (!url) return url;

  // CRITICAL FIX: If Vercel has DATABASE_URL set to port 5432 (Session Mode),
  // automatically redirect to port 6543 (Transaction Mode).
  // Session Mode has a hard limit of 15 clients (EMAXCONNSESSION).
  // Transaction Mode handles unlimited concurrent requests for serverless web apps.
  if (url.includes("pooler.supabase.com:5432")) {
    url = url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }

  // Ensure pgbouncer parameter is present for transaction pooler
  if (url.includes(":6543") && !url.includes("pgbouncer=true")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}pgbouncer=true`;
  }

  return url;
}

// Single pooled connection per lambda instance
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: getSanitizedConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: 10, // Allow concurrent queries so Promise.all (page + metadata + session) execute in parallel without queue starvation
    idleTimeoutMillis: 30000, // Keep connection warm for 30s to reuse TLS connections instead of 3000ms re-handshakes on every click
    connectionTimeoutMillis: 15000, // 15s timeout to absorb geographic cross-continent latency without false timeouts
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Always attach to globalThis across all environments to prevent multiple pools
globalForPrisma.prisma = prisma;
globalForPrisma.pool = pool;
