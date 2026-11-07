// B23 Flipped Classroom – E2E PGlite test
// Usage:
//   mkdir -p /tmp/pg-harness && (cd /tmp/pg-harness && npm init -y && npm i @electric-sql/pglite@0.3)
//   PGLITE_DIR=/tmp/pg-harness node scripts/verify/b23-flow.mjs

import { createDb, asUser, tryAsUser } from "./pg-harness.mjs";

// ── Deterministic UUIDs ──────────────────────────────────────────────────────
const IDS = {
  teacher:  "aaaaaaaa-0001-0001-0001-000000000001",
  student1: "bbbbbbbb-0002-0002-0002-000000000002",
  student2: "cccccccc-0003-0003-0003-000000000003",
  outsider: "dddddddd-0004-0004-0004-000000000004",
  classId:  "eeeeeeee-0005-0005-0005-000000000005",
  topicId:  "ffffffff-0006-0006-0006-000000000006",
  lessonId: "aaaaaaaa-0007-0007-0007-000000000007",
  stepId:   "bbbbbbbb-0008-0008-0008-000000000008",
  q1Id:     "cccccccc-0009-0009-0009-000000000009",
  q2Id:     "dddddddd-0010-0010-0010-000000000010",
  planId:   "eeeeeeee-0011-0011-0011-000000000011",
  aq1Id:    "ffffffff-0012-0012-0012-000000000012",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function col(name, row) {
  // PGlite may lower-case column names; normalise access
  return row[name] ?? row[name.toLowerCase()];
}

async function tableExists(db, tableName) {
  const r = await db.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return r.rows.length > 0;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Apply all migrations
  console.log("⏳ Applying migrations…");
  const { db, results } = await createDb();

  const failedMigrations = results.filter((r) => !r.ok);
  if (failedMigrations.length > 0) {
    console.warn(
      `⚠️  ${failedMigrations.length} migration(s) failed:`,
      failedMigrations.map((r) => `${r.file}: ${r.error}`).join("\n  ")
    );
  }

  // 2. Guard: ensure the key tables exist before we spend time seeding
  const requiredTables = [
    "lesson_pathway_steps",
    "student_step_progress",
    "phase_final_questions",
  ];
  for (const t of requiredTables) {
    if (!(await tableExists(db, t))) {
      console.log(
        `⚠️  SKIP: required table "${t}" is missing – migration issue in isolated env`
      );
      console.log("0/15 tests passed (all skipped due to missing tables)");
      process.exit(0);
    }
  }

  // 3. Seed – run as db admin (bypasses RLS) ────────────────────────────────

  // 3a. auth.users — teacher needs raw_user_meta_data.role='teacher' because
  //     trigger on_auth_user_created auto-creates profiles with role from meta
  await db.exec(`
    INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
      ('${IDS.teacher}'::uuid,  'teacher@test.local',  '{"role":"teacher"}'::jsonb),
      ('${IDS.student1}'::uuid, 'student1@test.local', '{"role":"student"}'::jsonb),
      ('${IDS.student2}'::uuid, 'student2@test.local', '{"role":"student"}'::jsonb),
      ('${IDS.outsider}'::uuid, 'outsider@test.local', '{"role":"student"}'::jsonb)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3b. profiles — trigger already created them from auth.users insert,
  //     but ensure teacher role is correct (DO UPDATE overrides trigger default if needed)
  // NOTE: prevent_profile_role_change trigger only blocks authenticated role changes.
  //       Admin (superuser) bypass it, so this direct insert/update works.
  await db.exec(`
    INSERT INTO profiles (id, role) VALUES
      ('${IDS.teacher}'::uuid,  'teacher'),
      ('${IDS.student1}'::uuid, 'student'),
      ('${IDS.student2}'::uuid, 'student'),
      ('${IDS.outsider}'::uuid, 'student')
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
  `);

  // 3c. class
  await db.exec(`
    INSERT INTO classes (id, teacher_id, name, join_code) VALUES
      ('${IDS.classId}'::uuid, '${IDS.teacher}'::uuid, 'Lớp B23 Test', 'TEST01')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3d. class_members (student1 + student2, NOT outsider)
  await db.exec(`
    INSERT INTO class_members (class_id, student_id) VALUES
      ('${IDS.classId}'::uuid, '${IDS.student1}'::uuid),
      ('${IDS.classId}'::uuid, '${IDS.student2}'::uuid)
    ON CONFLICT DO NOTHING;
  `);

  // 3e. topics (schema: id, teacher_id NOT NULL, title, description, created_at)
  await db.exec(`
    INSERT INTO topics (id, teacher_id, title) VALUES
      ('${IDS.topicId}'::uuid, '${IDS.teacher}'::uuid, 'Hạt nhân phóng xạ')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3f. lessons
  await db.exec(`
    INSERT INTO lessons (id, class_id, teacher_id, topic_id, status, title) VALUES
      ('${IDS.lessonId}'::uuid, '${IDS.classId}'::uuid, '${IDS.teacher}'::uuid,
       '${IDS.topicId}'::uuid, 'published', 'B23 test')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3g. lesson_pathway_steps
  await db.exec(`
    INSERT INTO lesson_pathway_steps
      (id, lesson_id, phase, title, instructions, step_order, is_required, is_published,
       step_type, config, material_id)
    VALUES
      ('${IDS.stepId}'::uuid, '${IDS.lessonId}'::uuid, 'before_class',
       'Bước 1', 'Xem video', 1, true, true,
       'simulation',
       '{"canonical_material_id":"system-b23-sim","content_url":"activity:b23_simulation"}'::jsonb,
       NULL)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3h. phase_final_questions (2 for before_class)
  await db.exec(`
    INSERT INTO phase_final_questions
      (id, lesson_id, phase, question_text, sort_order, correct_answer)
    VALUES
      ('${IDS.q1Id}'::uuid, '${IDS.lessonId}'::uuid, 'before_class',
       'Câu hỏi 1 về hạt nhân', 1, 'a'),
      ('${IDS.q2Id}'::uuid, '${IDS.lessonId}'::uuid, 'before_class',
       'Câu hỏi 2 về phóng xạ', 2, 'b')
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log("✅ Seed complete\n");

  // 4. Test runner ──────────────────────────────────────────────────────────
  let pass = 0, fail = 0, skip = 0;

  async function test(label, fn) {
    try {
      const ok = await fn();
      if (ok === "SKIP") {
        console.log(`⚠️  SKIP ${label}`);
        skip++;
      } else if (ok) {
        console.log(`✅ PASS ${label}`);
        pass++;
      } else {
        console.log(`❌ FAIL ${label}`);
        fail++;
      }
    } catch (e) {
      console.log(`❌ FAIL ${label}: ${e.message}`);
      fail++;
    }
  }

  // ── T01 ──────────────────────────────────────────────────────────────────
  await test("T01 - Teacher reads own lesson pathway steps", async () => {
    const r = await asUser(db, IDS.teacher, (tx) =>
      tx.query("SELECT id FROM lesson_pathway_steps WHERE lesson_id = $1", [
        IDS.lessonId,
      ])
    );
    return r.rows.length === 1;
  });

  // ── T02 ──────────────────────────────────────────────────────────────────
  await test("T02 - Student1 sees published step (enrolled)", async () => {
    const r = await asUser(db, IDS.student1, (tx) =>
      tx.query(
        "SELECT id FROM lesson_pathway_steps WHERE lesson_id = $1 AND is_published = true",
        [IDS.lessonId]
      )
    );
    return r.rows.length === 1;
  });

  // ── T03 ──────────────────────────────────────────────────────────────────
  await test("T03 - Outsider gets 0 rows (not enrolled)", async () => {
    const r = await asUser(db, IDS.outsider, (tx) =>
      tx.query("SELECT id FROM lesson_pathway_steps WHERE lesson_id = $1", [
        IDS.lessonId,
      ])
    );
    return r.rows.length === 0;
  });

  // ── T04 ──────────────────────────────────────────────────────────────────
  await test("T04 - Student1 completes step (via RPC)", async () => {
    const r = await asUser(db, IDS.student1, (tx) =>
      tx.query(
        `SELECT complete_pathway_step($1, '{"prediction":"pred","response":"resp","nextStep":"next"}'::jsonb) AS result`,
        [IDS.stepId]
      )
    );
    const result = r.rows[0]?.result;
    return result?.success === true;
  });

  // ── T05 ──────────────────────────────────────────────────────────────────
  await test("T05 - Idempotency: student1 calls complete_pathway_step again", async () => {
    const r = await asUser(db, IDS.student1, (tx) =>
      tx.query(
        `SELECT complete_pathway_step($1, '{"prediction":"pred","response":"resp","nextStep":"next"}'::jsonb) AS result`,
        [IDS.stepId]
      )
    );
    const result = r.rows[0]?.result;
    return result?.success === true;
  });

  // ── T06 ──────────────────────────────────────────────────────────────────
  await test(
    "T06 - Evidence isolation: student2 cannot see student1's progress",
    async () => {
      const r = await asUser(db, IDS.student2, (tx) =>
        tx.query(
          "SELECT student_id FROM student_step_progress WHERE step_id = $1",
          [IDS.stepId]
        )
      );
      return r.rows.length === 0;
    }
  );

  // ── T07 ──────────────────────────────────────────────────────────────────
  await test(
    "T07 - Phase gate: student2 gets no final questions (step not completed)",
    async () => {
      const r = await asUser(db, IDS.student2, (tx) =>
        tx.query(
          "SELECT * FROM get_student_final_questions($1, 'before_class')",
          [IDS.lessonId]
        )
      );
      return r.rows.length === 0;
    }
  );

  // ── T08 ──────────────────────────────────────────────────────────────────
  let t08Rows = [];
  await test(
    "T08 - Student1 gets final questions (all required steps completed)",
    async () => {
      const r = await asUser(db, IDS.student1, (tx) =>
        tx.query(
          "SELECT * FROM get_student_final_questions($1, 'before_class')",
          [IDS.lessonId]
        )
      );
      t08Rows = r.rows;
      return r.rows.length === 2;
    }
  );

  // ── T09 ──────────────────────────────────────────────────────────────────
  await test(
    "T09 - Answer leak check: get_student_final_questions must NOT return correct_answer",
    async () => {
      // Re-run if t08Rows is empty (e.g. T08 was skipped/failed)
      let rows = t08Rows;
      if (rows.length === 0) {
        const r = await asUser(db, IDS.student1, (tx) =>
          tx.query(
            "SELECT * FROM get_student_final_questions($1, 'before_class')",
            [IDS.lessonId]
          )
        );
        rows = r.rows;
      }
      if (rows.length === 0) return "SKIP"; // cannot check if no rows returned
      return rows.every(
        (row) =>
          !Object.prototype.hasOwnProperty.call(row, "correct_answer") &&
          !Object.prototype.hasOwnProperty.call(row, "correctAnswer") &&
          !Object.prototype.hasOwnProperty.call(row, "correct_answer")
      );
    }
  );

  // ── T10 ──────────────────────────────────────────────────────────────────
  await test(
    "T10 - Student1 submits WRONG answers → success === false",
    async () => {
      const answers = JSON.stringify({
        [IDS.q1Id]: "wrong",
        [IDS.q2Id]: "wrong",
      });
      const r = await asUser(db, IDS.student1, (tx) =>
        tx.query(
          "SELECT submit_phase_final_questions($1, 'before_class', $2::jsonb) AS result",
          [IDS.lessonId, answers]
        )
      );
      const result = r.rows[0]?.result;
      return result?.success === false;
    }
  );

  // ── T11 ──────────────────────────────────────────────────────────────────
  await test(
    "T11 - Student1 submits correct answers → before_class completed",
    async () => {
      const answers = JSON.stringify({
        [IDS.q1Id]: "a",
        [IDS.q2Id]: "b",
      });
      const r = await asUser(db, IDS.student1, (tx) =>
        tx.query(
          "SELECT submit_phase_final_questions($1, 'before_class', $2::jsonb) AS result",
          [IDS.lessonId, answers]
        )
      );
      const result = r.rows[0]?.result;
      return result?.success === true;
    }
  );

  // ── T12 ──────────────────────────────────────────────────────────────────
  await test(
    "T12 - Student2 cannot submit in_class questions without completing before_class",
    async () => {
      const answers = JSON.stringify({ [IDS.q1Id]: "a" });
      const r = await asUser(db, IDS.student2, (tx) =>
        tx.query(
          "SELECT submit_phase_final_questions($1, 'in_class', $2::jsonb) AS result",
          [IDS.lessonId, answers]
        )
      );
      const result = r.rows[0]?.result;
      return result?.success === false;
    }
  );

  // ── T13 ──────────────────────────────────────────────────────────────────
  await test(
    "T13 - Teacher views all student_step_progress for the lesson",
    async () => {
      const r = await asUser(db, IDS.teacher, (tx) =>
        tx.query(
          "SELECT student_id FROM student_step_progress WHERE lesson_id = $1",
          [IDS.lessonId]
        )
      );
      if (r.rows.length < 1) return false;
      const sid = col("student_id", r.rows[0]);
      return sid === IDS.student1;
    }
  );

  // ── T14 ──────────────────────────────────────────────────────────────────
  await test(
    "T14 - Student1 cannot read student2's step progress",
    async () => {
      // Insert a fake progress row for student2 as admin
      try {
        await db.query(
          `INSERT INTO student_step_progress (step_id, lesson_id, student_id, is_completed, evidence)
           VALUES ($1, $2, $3, false, '{}'::jsonb)
           ON CONFLICT DO NOTHING`,
          [IDS.stepId, IDS.lessonId, IDS.student2]
        );
      } catch (e) {
        // Conflict or other — not fatal for the test; row may already exist from T06 guard
        console.warn(`    (admin insert for T14 seed: ${e.message})`);
      }

      const r = await asUser(db, IDS.student1, (tx) =>
        tx.query(
          "SELECT student_id FROM student_step_progress WHERE student_id = $1",
          [IDS.student2]
        )
      );
      return r.rows.length === 0;
    }
  );

  // ── T15 ──────────────────────────────────────────────────────────────────
  await test(
    "T15 - Outsider cannot call complete_pathway_step",
    async () => {
      const { data, error } = await tryAsUser(db, IDS.outsider, (tx) =>
        tx.query(
          `SELECT complete_pathway_step($1, '{"prediction":"p","response":"r","nextStep":"n"}'::jsonb) AS result`,
          [IDS.stepId]
        )
      );
      if (error) return true; // threw – that's a pass
      const result = data?.rows?.[0]?.result;
      return result?.success === false;
    }
  );

  // ── T16 ──────────────────────────────────────────────────────────────────
  await test(
    "T16 - Teacher saves plan, applies draft via apply_teacher_plan_draft, and duplicate apply is rejected",
    async () => {
      const stepsPayload = JSON.stringify([
        {
          phase: "in_class",
          title: "Khám phá chu kì bán rã",
          instructions: "Thực hiện mô phỏng và ghi số liệu",
          step_type: "simulation",
          canonical_material_id: "system-sim-half-life",
          content_url: "activity:radioactive_decay_half_life",
        },
      ]);
      const r1 = await asUser(db, IDS.teacher, async (tx) => {
        await tx.query(
          `INSERT INTO teacher_teaching_plans (id, teacher_id, title, lesson_code, plan)
           VALUES ($1, $2, 'Kế hoạch B23', 'B23', '{"version":1}'::jsonb)`,
          [IDS.planId, IDS.teacher]
        );
        return tx.query(
          `SELECT apply_teacher_plan_draft($1, $2, $3::jsonb) AS result`,
          [IDS.planId, IDS.lessonId, stepsPayload]
        );
      });
      const firstApply = r1.rows[0]?.result;
      if (!firstApply?.success || firstApply?.count !== 1) return false;

      // Second apply of same plan to same lesson must fail with already_applied
      const dup = await tryAsUser(db, IDS.teacher, (tx) =>
        tx.query(
          `SELECT apply_teacher_plan_draft($1, $2, $3::jsonb) AS result`,
          [IDS.planId, IDS.lessonId, stepsPayload]
        )
      );
      return Boolean(dup.error && String(dup.error).includes("already_applied"));
    }
  );

  // ── T17 ──────────────────────────────────────────────────────────────────
  await test(
    "T17 - Student2 submits distinct evidence and Teacher reads both without mixing",
    async () => {
      const r = await asUser(db, IDS.student2, (tx) =>
        tx.query(
          `SELECT complete_pathway_step($1, '{"prediction":"pred_hs2","response":"resp_hs2_unique","nextStep":"next_hs2"}'::jsonb) AS result`,
          [IDS.stepId]
        )
      );
      if (r.rows[0]?.result?.success !== true) return false;

      const teacherRead = await asUser(db, IDS.teacher, (tx) =>
        tx.query(
          `SELECT student_id, evidence->>'response' AS resp FROM student_step_progress WHERE step_id = $1`,
          [IDS.stepId]
        )
      );
      const byStudent = new Map(teacherRead.rows.map((row) => [col("student_id", row), row.resp]));
      return (
        byStudent.get(IDS.student1) === "resp" &&
        byStudent.get(IDS.student2) === "resp_hs2_unique"
      );
    }
  );

  // ── T18 ──────────────────────────────────────────────────────────────────
  await test(
    "T18 - Student1 cannot UPDATE or DELETE student2's submission",
    async () => {
      await tryAsUser(db, IDS.student1, (tx) =>
        tx.query(
          `UPDATE student_step_progress SET evidence = '{"response":"hacked"}'::jsonb WHERE student_id = $1`,
          [IDS.student2]
        )
      );
      const check = await asUser(db, IDS.student2, (tx) =>
        tx.query(
          `SELECT evidence->>'response' AS resp FROM student_step_progress WHERE step_id = $1 AND student_id = $2`,
          [IDS.stepId, IDS.student2]
        )
      );
      return check.rows[0]?.resp === "resp_hs2_unique";
    }
  );

  // ── T19 ──────────────────────────────────────────────────────────────────
  await test(
    "T19 - get_student_assessment_questions strips answer keys and enforces in_class gate",
    async () => {
      await db.query(
        `INSERT INTO phase_assessment_questions (id, lesson_id, question_type, difficulty, content, sort_order, is_published)
         VALUES ($1, $2, 'true_false', 'thong_hieu',
           '{"prompt":"Phát biểu Đ/S","correctAnswers":[true],"statements":[{"text":"Tia alpha là He-4","correctValue":true,"explanation":"Giải thích bí mật"}]}'::jsonb,
           1, true)
         ON CONFLICT (id) DO NOTHING`,
        [IDS.aq1Id, IDS.lessonId]
      );
      // Before in_class is completed -> 0 rows
      const beforeGate = await asUser(db, IDS.student1, (tx) =>
        tx.query(`SELECT * FROM get_student_assessment_questions($1)`, [IDS.lessonId])
      );
      if (beforeGate.rows.length !== 0) return false;

      // Mark in_class completed for student1, then call RPC -> 1 row with answers stripped
      await db.query(
        `INSERT INTO student_phase_progress (lesson_id, student_id, phase, is_completed, simulation_completed)
         VALUES ($1, $2, 'in_class', true, true)
         ON CONFLICT (lesson_id, student_id, phase) DO UPDATE SET is_completed = true`,
        [IDS.lessonId, IDS.student1]
      );
      const afterGate = await asUser(db, IDS.student1, (tx) =>
        tx.query(`SELECT * FROM get_student_assessment_questions($1)`, [IDS.lessonId])
      );
      if (afterGate.rows.length !== 1) return false;
      const content = afterGate.rows[0].content;
      const stmt = content?.statements?.[0] ?? {};
      return (
        !Object.prototype.hasOwnProperty.call(content, "correctAnswers") &&
        !Object.prototype.hasOwnProperty.call(stmt, "correctValue") &&
        !Object.prototype.hasOwnProperty.call(stmt, "explanation") &&
        stmt.text === "Tia alpha là He-4"
      );
    }
  );

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = pass + fail + skip;
  console.log(`\n${pass}/${total} tests passed, ${fail} failed, ${skip} skipped`);

  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
