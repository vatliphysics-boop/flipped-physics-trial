begin;

-- ============================================================
-- Migration 017: Secure Phase Gates
-- Fixes confirmed in mã hiện tại (2026-09-27):
--   A) video_checkpoints base table readable with correct_option via 008 policy
--   B) lesson_material_progress insert/update from 012 allows is_complete=true for video
--   C) phase_final_questions readable by student (all, not filtered by class) via 015 policy
--   D) phase_assessment_questions readable with correctAnswer via 015 policy
--   E) student_phase_progress / student_lesson_progress writable directly via 015 policy
-- ============================================================

-- ============================================================
-- A. Block direct reads of video_checkpoints (exposes correct_option)
-- ============================================================
drop policy if exists "video_checkpoints_student_select_published" on public.video_checkpoints;
-- Teachers retain their own separate select policy from migration 008.
-- Students access checkpoints only through the student_video_checkpoints VIEW (migration 013).

-- ============================================================
-- B. Restrict lesson_material_progress writes: block is_complete override for video
--    Keep insert/update for colab/worksheet (saveActivityProgressAction server action needs this).
--    Drop the old broad policies from 012 and replace with video-safe ones.
-- ============================================================
drop policy if exists "lesson_material_progress_student_insert" on public.lesson_material_progress;
drop policy if exists "lesson_material_progress_student_update" on public.lesson_material_progress;

-- Re-create narrower policies: only non-video materials can be directly marked complete.
-- Video completion is handled exclusively by record_video_progress RPC (migration 013).
create policy "lesson_material_progress_student_insert_nonvideo" on public.lesson_material_progress
for insert to authenticated with check (
  student_id = auth.uid()
  and not public.is_teacher()
  and exists (
    select 1 from public.lesson_materials m
    join public.lessons l on l.id = m.lesson_id
    where m.id = material_id
      and m.material_type != 'video'
      and m.is_published
      and l.status = 'published'
      and public.is_class_member(l.class_id)
  )
);

create policy "lesson_material_progress_student_update_nonvideo" on public.lesson_material_progress
for update to authenticated using (student_id = auth.uid()) with check (
  student_id = auth.uid()
  and not public.is_teacher()
  and exists (
    select 1 from public.lesson_materials m
    join public.lessons l on l.id = m.lesson_id
    where m.id = material_id
      and m.material_type != 'video'
      and m.is_published
      and l.status = 'published'
      and public.is_class_member(l.class_id)
  )
);

-- ============================================================
-- C & D. Drop overly broad policies on question tables (from 015)
-- ============================================================
drop policy if exists "student_manage_phase_progress" on public.student_phase_progress;
drop policy if exists "student_manage_lesson_progress" on public.student_lesson_progress;
drop policy if exists "student_read_final_questions" on public.phase_final_questions;
drop policy if exists "student_read_assessment" on public.phase_assessment_questions;

-- Students can read their own progress (SELECT only)
create policy "student_read_phase_progress" on public.student_phase_progress
  for select to authenticated using (student_id = auth.uid());

create policy "student_read_lesson_progress" on public.student_lesson_progress
  for select to authenticated using (student_id = auth.uid());

-- ============================================================
-- E. Add durable columns for simulation state and assessment answers
-- ============================================================
alter table public.student_phase_progress
  add column if not exists simulation_completed boolean not null default false,
  add column if not exists assessment_answers jsonb;

-- ============================================================
-- 3. Safe question-fetch RPCs (strip answers)
-- ============================================================
create or replace function public.get_student_final_questions(p_lesson_id uuid, p_phase text)
returns table (id uuid, question_text text, sort_order integer)
language sql
security definer set search_path = public
as $$
  select q.id, q.question_text, q.sort_order
  from phase_final_questions q
  join lessons l on l.id = q.lesson_id
  join class_members cm on cm.class_id = l.class_id
  where q.lesson_id = p_lesson_id
    and q.phase = p_phase
    and l.status = 'published'
    and cm.student_id = auth.uid()
  order by q.sort_order;
$$;
revoke all on function public.get_student_final_questions(uuid, text) from public;
grant execute on function public.get_student_final_questions(uuid, text) to authenticated;

create or replace function public.get_student_assessment_questions(p_lesson_id uuid)
returns table (id uuid, question_type text, difficulty text, content jsonb, sort_order integer)
language sql
security definer set search_path = public
as $$
  select
    q.id, q.question_type, q.difficulty,
    (q.content - 'correctAnswer' - 'correct_answer') as content,
    q.sort_order
  from phase_assessment_questions q
  join lessons l on l.id = q.lesson_id
  join class_members cm on cm.class_id = l.class_id
  where q.lesson_id = p_lesson_id
    and q.is_published = true
    and l.status = 'published'
    and cm.student_id = auth.uid()
  order by q.sort_order;
$$;
revoke all on function public.get_student_assessment_questions(uuid) from public;
grant execute on function public.get_student_assessment_questions(uuid) to authenticated;

-- ============================================================
-- 4. RPC for declaring simulation completed (durable, class-checked)
-- ============================================================
create or replace function public.declare_simulation_completed(p_lesson_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_class_id uuid;
  v_lesson_status text;
begin
  v_student_id := auth.uid();
  if v_student_id is null then return false; end if;

  select class_id, status into v_class_id, v_lesson_status
  from lessons where id = p_lesson_id;

  if v_lesson_status != 'published' then return false; end if;
  if not exists (select 1 from class_members where class_id = v_class_id and student_id = v_student_id) then
    return false;
  end if;

  insert into student_phase_progress (lesson_id, student_id, phase, simulation_completed)
  values (p_lesson_id, v_student_id, 'in_class', true)
  on conflict (lesson_id, student_id, phase)
  do update set simulation_completed = true;

  return true;
end;
$$;
revoke all on function public.declare_simulation_completed(uuid) from public;
grant execute on function public.declare_simulation_completed(uuid) to authenticated;

-- ============================================================
-- 5. Secure RPC: Submit phase final questions (Phase 1 & 2)
--    Checks: membership, published, phase ordering, materials done, 2 questions, correct answers
-- ============================================================
create or replace function public.submit_phase_final_questions(
  p_lesson_id uuid,
  p_phase text,
  p_answers jsonb
) returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_class_id uuid;
  v_lesson_status text;
  v_q record;
  v_count int := 0;
  v_provided_answer text;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    return jsonb_build_object('success', false, 'error', 'Yêu cầu đăng nhập.');
  end if;

  if p_phase not in ('before_class', 'in_class') then
    return jsonb_build_object('success', false, 'error', 'Pha không hợp lệ.');
  end if;

  select class_id, status into v_class_id, v_lesson_status
  from lessons where id = p_lesson_id;

  if not found or v_lesson_status != 'published' then
    return jsonb_build_object('success', false, 'error', 'Bài học không khả dụng.');
  end if;

  if not exists (select 1 from class_members where class_id = v_class_id and student_id = v_student_id) then
    return jsonb_build_object('success', false, 'error', 'Không có quyền truy cập.');
  end if;

  -- Phase ordering constraint
  if p_phase = 'in_class' then
    if not exists (
      select 1 from student_phase_progress
      where lesson_id = p_lesson_id and student_id = v_student_id
        and phase = 'before_class' and is_completed = true
    ) then
      return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành phần Trước giờ học.');
    end if;
    -- Simulation must be declared complete
    if not exists (
      select 1 from student_phase_progress
      where lesson_id = p_lesson_id and student_id = v_student_id
        and phase = 'in_class' and simulation_completed = true
    ) then
      return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành mô phỏng trước.');
    end if;
  end if;

  -- All published materials for this phase must be completed
  if exists (
    select 1 from lesson_materials m
    left join lesson_material_progress lmp on lmp.material_id = m.id and lmp.student_id = v_student_id
    where m.lesson_id = p_lesson_id
      and m.phase = p_phase
      and m.is_published = true
      and (lmp.is_complete is null or lmp.is_complete = false)
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành tất cả học liệu trước.');
  end if;

  -- Verify answers (server-side compare, never returns correct_answer to client)
  for v_q in (
    select id, correct_answer
    from phase_final_questions
    where lesson_id = p_lesson_id and phase = p_phase
    order by sort_order
  ) loop
    v_count := v_count + 1;
    v_provided_answer := p_answers->>v_q.id::text;

    if v_provided_answer is null or trim(v_provided_answer) = '' then
      return jsonb_build_object('success', false, 'error', 'Câu trả lời không được để trống.');
    end if;

    if trim(lower(v_provided_answer)) != trim(lower(v_q.correct_answer)) then
      return jsonb_build_object('success', false, 'error', 'Có câu trả lời chưa đúng. Em hãy xem lại bài nhé.');
    end if;
  end loop;

  if v_count != 2 then
    return jsonb_build_object('success', false, 'error', 'Không đủ 2 câu hỏi chốt cho pha này.');
  end if;

  -- Mark phase completed (idempotent – never un-complete)
  insert into student_phase_progress (lesson_id, student_id, phase, is_completed, completed_at)
  values (p_lesson_id, v_student_id, p_phase, true, now())
  on conflict (lesson_id, student_id, phase)
  do update set
    is_completed = true,
    completed_at = coalesce(student_phase_progress.completed_at, now());

  return jsonb_build_object('success', true, 'message', 'Hoàn thành pha học tập!');
end;
$$;
revoke all on function public.submit_phase_final_questions(uuid, text, jsonb) from public;
grant execute on function public.submit_phase_final_questions(uuid, text, jsonb) to authenticated;

-- ============================================================
-- 6. Secure RPC: Submit phase assessment (Phase 3 / after_class)
--    Checks: membership, published, in_class completed, all questions answered,
--            no fake IDs, saves answers, marks lesson done atomically.
-- ============================================================
create or replace function public.submit_phase_assessment(
  p_lesson_id uuid,
  p_answers jsonb
) returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_class_id uuid;
  v_lesson_status text;
  v_required_questions int;
  v_submitted_questions int;
  v_answer_key text;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    return jsonb_build_object('success', false, 'error', 'Yêu cầu đăng nhập.');
  end if;

  select class_id, status into v_class_id, v_lesson_status
  from lessons where id = p_lesson_id;

  if not found or v_lesson_status != 'published' then
    return jsonb_build_object('success', false, 'error', 'Bài học không khả dụng.');
  end if;

  if not exists (select 1 from class_members where class_id = v_class_id and student_id = v_student_id) then
    return jsonb_build_object('success', false, 'error', 'Không có quyền truy cập.');
  end if;

  -- Must have completed in_class phase
  if not exists (
    select 1 from student_phase_progress
    where lesson_id = p_lesson_id and student_id = v_student_id
      and phase = 'in_class' and is_completed = true
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành phần Trong giờ học.');
  end if;

  -- Count published questions
  select count(*) into v_required_questions
  from phase_assessment_questions
  where lesson_id = p_lesson_id and is_published = true;

  if v_required_questions = 0 then
    return jsonb_build_object('success', false, 'error', 'Bài học chưa có câu hỏi đánh giá.');
  end if;

  -- Count submitted answers
  select count(key) into v_submitted_questions from jsonb_each(p_answers);

  if v_submitted_questions < v_required_questions then
    return jsonb_build_object('success', false, 'error', 'Vui lòng làm đầy đủ các câu hỏi.');
  end if;

  -- Reject fake/unknown question IDs
  for v_answer_key in select key from jsonb_object_keys(p_answers) as k(key) loop
    if not exists (
      select 1 from phase_assessment_questions
      where id::text = v_answer_key
        and lesson_id = p_lesson_id
        and is_published = true
    ) then
      return jsonb_build_object('success', false, 'error', 'Có câu trả lời không hợp lệ.');
    end if;
  end loop;

  -- Reject blank answers
  for v_answer_key in select key from jsonb_object_keys(p_answers) as k(key) loop
    if trim(p_answers->>v_answer_key) = '' then
      return jsonb_build_object('success', false, 'error', 'Câu trả lời không được để trống.');
    end if;
  end loop;

  -- Save answers and mark phase complete atomically
  insert into student_phase_progress (lesson_id, student_id, phase, is_completed, completed_at, assessment_answers)
  values (p_lesson_id, v_student_id, 'after_class', true, now(), p_answers)
  on conflict (lesson_id, student_id, phase)
  do update set
    is_completed = true,
    completed_at = coalesce(student_phase_progress.completed_at, now()),
    assessment_answers = p_answers;

  -- Mark lesson complete
  insert into student_lesson_progress (lesson_id, student_id, is_completed, completed_at)
  values (p_lesson_id, v_student_id, true, now())
  on conflict (lesson_id, student_id)
  do update set
    is_completed = true,
    completed_at = coalesce(student_lesson_progress.completed_at, now());

  return jsonb_build_object('success', true, 'message', 'Chúc mừng em đã hoàn thành bài học!');
end;
$$;
revoke all on function public.submit_phase_assessment(uuid, jsonb) from public;
grant execute on function public.submit_phase_assessment(uuid, jsonb) to authenticated;

commit;
