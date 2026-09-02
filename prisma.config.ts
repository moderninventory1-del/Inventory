import "dotenv/config";
<<<<<<< HEAD
import { defineConfig } from "prisma/config";
=======
import { defineConfig, env } from "prisma/config";
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Session mode pooler (port 5432 on pooler subdomain) — supports Prisma migrations
    // Transaction mode (port 6543) does NOT work with migrations
<<<<<<< HEAD
    url: process.env.SESSION_URL ?? "",
=======
    url: env("SESSION_URL"),
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
  },
});