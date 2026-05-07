import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Session mode pooler (port 5432 on pooler subdomain) — supports Prisma migrations
    // Transaction mode (port 6543) does NOT work with migrations
    url: env("SESSION_URL"),
  },
});