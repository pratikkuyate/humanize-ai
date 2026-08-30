import { neon } from "@neondatabase/serverless";

/**
 * Neon Postgres client.
 *
 * Uses the HTTP driver rather than a pooled TCP connection because this runs on
 * serverless functions: every invocation is a fresh isolate, so a connection
 * pool would be built and thrown away on each request. The HTTP driver issues
 * one stateless round trip per query and needs no pooling at all.
 *
 * Server-only. Never import from a client component — DATABASE_URL contains the
 * password and would be inlined into the browser bundle.
 *
 * Usage is a tagged template, and the interpolations are real bound parameters,
 * not string concatenation:
 *
 *   const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
 *
 * Because of that, `${}` here is safe against injection. What it cannot
 * parameterise is an identifier — a table or column name has to be a literal in
 * the query text.
 */

const connectionString = process.env.DATABASE_URL ?? "";

/** True when a database is configured. Lets auth degrade instead of crashing. */
export const DB_READY = connectionString.length > 0;

const client = DB_READY ? neon(connectionString) : null;

/**
 * @type {(strings: TemplateStringsArray, ...values: unknown[]) => Promise<any[]>}
 */
export const sql = (strings, ...values) => {
  if (!client) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local — see .env.example."
    );
  }
  return client(strings, ...values);
};

/** First row of a query, or null. The shape almost every lookup here wants. */
export async function one(promise) {
  const rows = await promise;
  return rows[0] ?? null;
}
