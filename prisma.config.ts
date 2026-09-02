import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Session mode pooler (port 5432 on pooler subdomain) — supports Prisma migrations
    // Transaction mode (port 6543) does NOT work with migrations
    url: process.env.SESSION_URL ?? "",
  },
});