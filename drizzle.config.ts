import type { Config } from "drizzle-kit";

export default {
  schema: "./models/*.ts",
  out: "./migrate",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./sqlite.db",
  },
} satisfies Config;