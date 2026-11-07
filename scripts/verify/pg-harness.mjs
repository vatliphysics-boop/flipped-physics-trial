// Isolated, in-process Postgres (PGlite/WASM) harness for verifying migrations, RLS and RPCs.
// Nothing here connects to Supabase. The database lives in memory and is discarded on exit.
//
// PGlite is NOT a project dependency. Install it outside the repo and point PGLITE_DIR at it:
//   mkdir -p /tmp/pg-harness && (cd /tmp/pg-harness && npm init -y && npm i @electric-sql/pglite@0.3)
//   PGLITE_DIR=/tmp/pg-harness node scripts/verify/b23-flow.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(import.meta.dirname, "../..");
export const MIGRATIONS_DIR = join(ROOT, "supabase/migrations");

async function loadPGlite() {
  const dir = process.env.PGLITE_DIR;
  if (!dir) throw new Error("Set PGLITE_DIR to a folder where @electric-sql/pglite@0.3 is installed (see header).");
  const base = join(resolve(dir), "node_modules/@electric-sql/pglite/dist");
  const { PGlite } = await import(pathToFileURL(join(base, "index.js")).href);
  const { pgcrypto } = await import(pathToFileURL(join(base, "contrib/pgcrypto.js")).href);
  return { PGlite, pgcrypto };
}

export function migrationFiles() {
  return readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith(".sql")).sort();
}

export async function createDb({ upTo, only } = {}) {
  const { PGlite, pgcrypto } = await loadPGlite();
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(readFileSync(join(ROOT, "scripts/verify/supabase-platform-stub.sql"), "utf8"));
  const results = [];
  for (const file of migrationFiles()) {
    if (only && !only.includes(file)) continue;
    if (upTo && file > upTo) break;
    try {
      await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
      results.push({ file, ok: true });
    } catch (error) {
      try { await db.exec("rollback"); } catch {}
      results.push({ file, ok: false, error: error.message });
    }
  }
  return { db, results };
}

/** Run `fn` as a Supabase `authenticated` user (what PostgREST does for a signed-in session). */
export async function asUser(db, userId, fn) {
  return db.transaction(async tx => {
    await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: userId, role: userId ? "authenticated" : "anon" })]);
    await tx.exec(userId ? "set local role authenticated" : "set local role anon");
    return fn(tx);
  });
}

/** Like asUser but returns {error} instead of throwing, so permission failures can be asserted. */
export async function tryAsUser(db, userId, fn) {
  try { return { data: await asUser(db, userId, fn) }; } catch (error) { return { error: error.message }; }
}
