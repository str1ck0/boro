import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> };

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL!, {
    // Neon's pooler (PgBouncer, transaction mode) doesn't support prepared statements.
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 5 : 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export { schema };
