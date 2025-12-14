import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

let sql: NeonQueryFunction<false, false>;
let db: NeonHttpDatabase<typeof schema>;

if (connectionString) {
  sql = neon(connectionString);
  db = drizzle(sql, { schema });
} else {
  // This will only happen during build time if DATABASE_URL is not set
  console.warn("DATABASE_URL is not set. Database operations will fail.");
  sql = (() => {
    throw new Error("Database not configured");
  }) as unknown as NeonQueryFunction<false, false>;
  db = {} as NeonHttpDatabase<typeof schema>;
}

export { db };
