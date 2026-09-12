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
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
const { Client } = pg;

const databaseUrl = requireDatabaseUrl();
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function tableExists(name) {
  const r = await client.query(
    `select exists (
       select 1 from information_schema.tables
       where table_schema='public' and table_name=$1
     ) as exists`,
    [name]
  );
  return r.rows[0].exists;
}

async function columns(name) {
  const r = await client.query(
    `select column_name from information_schema.columns
     where table_schema='public' and table_name=$1
     order by ordinal_position`,
    [name]
  );
  return new Set(r.rows.map((x) => x.column_name));
}

async function insertByAvailableColumns(table, values) {
  if (!(await tableExists(table))) return false;
  const cols = await columns(table);
  const entries = Object.entries(values).filter(([k, v]) => cols.has(k) && v !== undefined);
  if (!entries.length) return false;
  const names = entries.map(([k]) => `"${k}"`).join(", ");
  const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");
  await client.query(
    `insert into "${table}" (${names}) values (${placeholders})
     on conflict do nothing`,
    entries.map(([, v]) => v)
  );
  return true;
}

try {
  await client.connect();

  if (!(await tableExists("users"))) {
    throw new Error("The database has no public.users table. Run npm run db:init first.");
  }

  const password = "FZ247@Admin123";
  const passwordHash = await bcrypt.hash(password, 12);
  const adminId = crypto.randomUUID();

  const userColumns = await columns("users");
  const userValues = {
    id: adminId,
    email: "admin@fz247.local",
    password_hash: passwordHash,
    passwordHash: passwordHash,
    name: "FZ247 Admin",
    full_name: "FZ247 Admin",
    role: "ADMIN",
    status: "ACTIVE",
  };

  const userEntries = Object.entries(userValues).filter(([k]) => userColumns.has(k));
  if (!userEntries.some(([k]) => k === "email")) {
    throw new Error("public.users does not contain an email column; the seed cannot create the admin account safely.");
  }

  const names = userEntries.map(([k]) => `"${k}"`).join(", ");
  const placeholders = userEntries.map((_, i) => `$${i + 1}`).join(", ");
  await client.query(
    `insert into "users" (${names}) values (${placeholders})
     on conflict do nothing`,
    userEntries.map(([, v]) => v)
  );

  // Optional demo records are inserted only when the expected tables/columns exist.
  // This makes seeding safe against small schema variations.
  const clientId = crypto.randomUUID();
  const projectId = crypto.randomUUID();

  await insertByAvailableColumns("clients", {
    id: clientId,
    name: "FZ247 Demo Client",
    company_name: "FZ247 Demo Client",
    email: "demo@fz247.local",
    status: "ACTIVE",
  });

  await insertByAvailableColumns("projects", {
    id: projectId,
    client_id: clientId,
    name: "FZ247 Demo Project",
    slug: "fz247-demo-project",
    framework: "Next.js",
    hosting: "Vercel",
    repo_url: null,
    repo_branch: "main",
    status: "ACTIVE",
  });

  console.log("");
  console.log("Database seed completed successfully.");
  console.log("Admin login:");
  console.log("  Email:    admin@fz247.local");
  console.log("  Password: FZ247@Admin123");
  console.log("");
  console.log("Change the admin password before production use.");
} catch (error) {
  console.error("Database seed failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
