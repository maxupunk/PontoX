import type { Config } from "drizzle-kit";

export default {
  schema: "./models/*.ts",
  out: "./migrate",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
} satisfies Config;