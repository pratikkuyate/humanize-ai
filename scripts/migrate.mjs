/**
 * Apply db/schema.sql to the database in DATABASE_URL.
 *
 * The schema is written to be idempotent, so this is safe to re-run after every
 * change — there is no migration history to keep in step, which is the right
 * trade for a schema this small.
 *
 *   npm run db:migrate
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load .env.local without a dependency. Next injects it at runtime, but this
// script runs under plain node, where nothing has read it yet.
try {
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const value = (match[2] ?? "").trim().replace(/^["']|["']$/g, "");
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
} catch {
  // No .env.local — fall back to the ambient environment (CI, Vercel).
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(join(root, "db", "schema.sql"), "utf8");

// Split on statement-ending semicolons, then strip comment lines. The schema
// deliberately contains no functions or DO blocks, so there are no inner
// semicolons to confuse this.
const statements = schema
  .split(";")
  .map((chunk) => chunk.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);

let applied = 0;

for (const body of statements) {
  try {
    await sql.query(body);
    applied += 1;
  } catch (error) {
    console.error(`\nFailed on:\n${body.slice(0, 200)}\n\n${error.message}`);
    process.exit(1);
  }
}

console.log(`Schema applied — ${applied} statements OK.`);
