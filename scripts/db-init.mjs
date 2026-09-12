import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function loadLocalEnv() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(here, "..", ".env"),
  ];
  const envPath = candidates.find((p) => fs.existsSync(p));
  if (!envPath) return;

  const text = fs.readFileSync(envPath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
       (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadLocalEnv();

export function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Create a file named .env in the project root and set DATABASE_URL to your full Supabase PostgreSQL connection string."
    );
  }
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    throw new Error(
      "DATABASE_URL is invalid. It must start with postgresql:// or postgres:// and contain the complete PostgreSQL connection string."
    );
  }
  return url;
}

import pg from "pg";
const { Client } = pg;

const databaseUrl = requireDatabaseUrl();
const schemaPath = path.resolve(process.cwd(), "database", "schema.sql");

if (!fs.existsSync(schemaPath)) {
  throw new Error(`database/schema.sql was not found. Run this command from the project root.`);
}

const sql = fs.readFileSync(schemaPath, "utf8");
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  console.log("Connecting to PostgreSQL...");
  await client.connect();
  await client.query(sql);
  console.log("Database schema initialized successfully.");
} catch (error) {
  console.error("Database initialization failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
