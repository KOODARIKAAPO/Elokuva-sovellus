import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const isTest = process.env.NODE_ENV === "test";

let poolConfig;
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  };
} else {
  // Build a config object from individual env vars with sensible defaults for tests
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : isTest ? 5433 : 5432;
  const user = process.env.DB_USER || (isTest ? "testuser" : "postgres");
  const password = process.env.DB_PASSWORD !== undefined
    ? String(process.env.DB_PASSWORD)
    : isTest
      ? "testpass"
      : undefined;
  const database = process.env.DB_NAME || (isTest ? "testdb" : "moviedb");
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port,
    user,
    password,
    database,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(poolConfig);

// search_pathin asetus ei ole tarpeen jos käytät public-schemaa
/*
pool.on("connect", (client) => {
  client.query("SET search_path TO libschema, public;").catch((err) => {
    console.error("Virhe search_pathin asettamisessa:", err);
  });
});
*/
export default pool;
