// NOTE: do not add `import "server-only"` here.
// `@better-auth/cli generate` resolves this file with jiti and crashes on
// the server-only marker. The file is already gated by the dynamic `pg`
// import and is only ever pulled in via Next.js server-only routes
// (/api/auth/[...all], /api/proxy/[...path], etc.), so the marker would be
// belt-and-suspenders rather than load-bearing.
import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Local Better-Auth instance backed by Postgres.
 *
 * Replaces the previous external `NEXT_PUBLIC_AUTH_URL` setup. Designed to be
 * easy to extract into a standalone auth service later — the four-rule
 * discipline:
 *
 *   1. `betterAuth({...})` lives in this file only. The Next.js route handler
 *      and the JWT proxy import the resulting `auth` instance.
 *   2. The pg adapter talks to Postgres directly; no custom DB queries here.
 *   3. No Ribbler business logic. Membership lookups happen in core-module.
 *   4. Better-Auth's default cookie behaviour is used (no custom `domain`).
 *
 * Schema placement: Better-Auth 1.5.5 does not expose a `schema` option for
 * its built-in pg/kysely adapter. To keep the auth tables in the `auth.*`
 * Postgres schema (so they don't sit alongside core-module's `core.*` tables
 * in `public`), we set `search_path = auth, public` on every connection that
 * the Pool hands out. CREATE TABLE / SELECT / INSERT statements without an
 * explicit schema therefore resolve to `auth.*`.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loud at import time — if DATABASE_URL is missing, every request
  // would otherwise blow up later with a confusing pg error.
  throw new Error(
    "DATABASE_URL is required for Better-Auth (control-panel/src/lib/auth/server.ts)",
  );
}

const pool = new Pool({ connectionString });

pool.on("connect", (client) => {
  // Force every checkout to resolve unqualified table names to the auth schema
  // first. `public` stays on the path as a fallback for anything Better-Auth
  // might query that lives there (none today).
  client.query("SET search_path TO auth, public").catch((err) => {
    // Don't crash the pool on a bad SET — the next query will surface it.
    console.error("[auth] failed to set search_path on new pg client", err);
  });
});

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});

export type Auth = typeof auth;
