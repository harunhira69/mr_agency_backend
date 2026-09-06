import { Pool, type QueryResultRow } from "pg";
import { config } from "../config";

export const pool = new Pool({
  connectionString: config.databaseUrl,

  max: 20,

  idleTimeoutMillis: 30_000,

  connectionTimeoutMillis: 10_000,

  ssl:
    config.nodeEnv === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL pool error:",
    error
  );
});

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) => {
  return pool.query<T>(text, params);
};

export const getClient = async () => {
  return pool.connect();
};