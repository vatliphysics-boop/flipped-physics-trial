// Apply every migration in supabase/migrations to a fresh isolated PGlite database and report per-file status.
// Usage: PGLITE_DIR=/tmp/pg-harness node scripts/verify/apply-migrations.mjs
import { createDb } from "./pg-harness.mjs";
const { results } = await createDb();
for (const r of results) console.log(`${r.ok ? "OK  " : "FAIL"} ${r.file}${r.ok ? "" : `\n     -> ${r.error}`}`);
process.exitCode = results.every(r => r.ok) ? 0 : 1;
