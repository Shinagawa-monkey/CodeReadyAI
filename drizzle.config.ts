import { defineConfig } from "drizzle-kit";
import { env } from "./src/data/env/server";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
