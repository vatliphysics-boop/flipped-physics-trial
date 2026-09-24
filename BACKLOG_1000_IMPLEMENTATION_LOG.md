# BACKLOG 1000 — Implementation Log

> Updated September 24, 2026. This log distinguishes the pre-existing working-tree state from changes made in this execution. No deploy command has been run.

## 001–050 — Baseline / forensic audit

| Area | Status | Evidence / relevant files |
| --- | --- | --- |
| Repository rules | Existing | `CLAUDE.md` delegates to `AGENTS.md`; Next.js 16 local-doc rule read. `PROJECT_CONTEXT.md` mandates Supabase SSR/RLS/Storage and no secret disclosure. |
| Git baseline | Partial | Pre-existing uncommitted changes across public/authenticated routes, teacher/student logic, physics scaffold, docs and PDF. Preserved; no reset/hard reset. |
| Route inventory | Partial | Public: `/`, `/login`, `/register`; authenticated lesson routes include `before-class`, `in-class`, `assessment`, and legacy `simulation`. |
| Physics inventory | Partial | `/src/components/physics` contained B21 components and shared primitives. B22–B25 keys existed but lacked real renderer components. |
| Material/progress | Partial | `lesson_materials`, `lesson_material_progress`, and `video_checkpoints` are used through Supabase. Existing audit records security gaps requiring later blocks. |
| Auth/RLS | Partial | SSR helper/proxy and SQL policies exist; no service-role client use observed in inspected code. Requires full mutation audit. |
| Migrations/FKs | Partial | Existing migrations define class/member/material/progress relations. No existing activity configuration schema confirmed. |
| CSS regression | Partial | No prohibited broad global selectors found in the inspected source search. Physics UI is scoped under `.physics-lab`. |
| Baseline validation | PASS | September 24, 2026: `npx tsc --noEmit`, `npm run lint`, `npm run build` passed locally before this block. No deployment executed. |

## 121–130 — Canonical Phase-2 catalog / activity-key normalization

- **Audit:** Existing `NUCLEAR_PHYSICS_ACTIVITY_CATALOG` held all 17 requested activity keys, but `FixedPhysicsActivityRenderer` duplicated key/title mappings and was truncated in the working tree at an incomplete JSX expression.
- **Implementation:** Added typed canonical catalog lookup and normalization in `/Users/vodoandangkhoi/Documents/flipped-physics/src/lib/curriculum.ts`; supports raw keys plus legacy `activity:` and `simulation:` prefixes. Unknown values return `null` rather than failing silently. Rebuilt `/Users/vodoandangkhoi/Documents/flipped-physics/src/components/physics/FixedPhysicsActivityRenderer.tsx` to consume that catalog.
- **Guard:** The renderer keeps the three existing B21 interactive components and shows an explicit unavailable state for the 14 catalog keys without a real component. It does not claim completion or create fake controls.
- **Validation:** PASS — `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `git diff --check` completed after the repair.
- **Status:** PASS for this block; broader Phase-2 implementation remains incomplete.

## Scope / limitations at this point

- This execution has not implemented the full 1000-item product backlog. Phase-1 authoring/runtime, DB-backed Phase-2 publication, B22–B25 interactive labs, Phase-3 authoring/runtime, and destructive-operation hardening remain pending unless separately marked below.
- No Vercel deployment was performed.
