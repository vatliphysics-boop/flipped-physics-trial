-- Migration 018: Material Bank & Flipped Classroom Learning Pathway
-- Depends on migration 017 (secure phase gates). Apply 017 first.
-- NOT automatically applied to remote — review and run in Supabase Dashboard SQL Editor.

begin;

-- ============================================================
-- 1. Material Bank (Kho học liệu số dùng chung)
-- ============================================================
create table if not exists public.material_bank (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  material_type text not null check (
    material_type in (
      'image',           -- Ảnh tĩnh / sơ đồ / infographic
      'animation',       -- Ảnh động / GIF / loop simulation
      'real_video',      -- Video thực tế / thí nghiệm quay thật
      'lecture_video',   -- Video bài giảng / screencast lý thuyết
      'simulation',      -- Mô phỏng tương tác (React / PhET / Web)
      'document',        -- PDF / Phiếu học tập / Tài liệu đọc
      'colab'            -- Google Colab notebook / Jupyter
    )
  ),
  category text not null default 'nuclear_physics' check (
    category in ('nuclear_physics', 'thermal_physics', 'ideal_gas', 'magnetic_field', 'general')
  ),
  lesson_tag text,       -- e.g. 'B21', 'B22', 'B23', 'B24', 'B25'
  content_url text not null,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.material_bank enable row level security;

-- Teachers manage their own non-system materials.
create policy "material_bank_teacher_manage" on public.material_bank
for all to authenticated
using (
  teacher_id = auth.uid()
  and public.is_teacher()
  and not is_system
)
with check (
  teacher_id = auth.uid()
  and public.is_teacher()
  and not is_system
);

-- ============================================================
-- 2. Lesson Pathway Steps
-- ============================================================
create table if not exists public.lesson_pathway_steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  phase text not null check (phase in ('before_class', 'in_class', 'after_class')),
  material_id uuid references public.material_bank(id) on delete set null,
  title text not null,
  instructions text default '',
  step_order integer not null default 0,
  is_required boolean not null default true,
  is_published boolean not null default false,  -- ← mới: trạng thái nháp/xuất bản
  step_type text not null check (
    step_type in ('image', 'animation', 'real_video', 'lecture_video', 'simulation',
                  'document', 'colab', 'checkpoint', 'exercise', 'reflection')
  ),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_pathway_steps enable row level security;

-- Students can read ONLY:
--   a) system materials (is_system = true), OR
--   b) published materials that are referenced by a PUBLISHED step in a PUBLISHED lesson
--      in a class the student belongs to.
-- This prevents students from browsing the teacher's entire material library.
create policy "material_bank_student_read" on public.material_bank
for select to authenticated
using (
  is_system = true
  or teacher_id = auth.uid()
  or (
    is_published = true
    and exists (
      select 1
      from public.lesson_pathway_steps s
      join public.lessons l on l.id = s.lesson_id
      join public.class_members cm on cm.class_id = l.class_id
      where s.material_id = material_bank.id
        and s.is_published = true
        and l.status = 'published'
        and cm.student_id = auth.uid()
    )
  )
);


-- Teachers manage steps for their own lessons.
create policy "steps_teacher_manage" on public.lesson_pathway_steps
for all to authenticated
using (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.teacher_id = auth.uid() and public.is_teacher()
  )
)
with check (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.teacher_id = auth.uid() and public.is_teacher()
  )
);

-- Students can read ONLY published steps of published lessons they are enrolled in,
-- AND only for phases that are unlocked (either before_class always, or prior phase completed).
create policy "steps_student_read" on public.lesson_pathway_steps
for select to authenticated
using (
  is_published = true
  and exists (
    select 1 from public.lessons l
    join public.class_members cm on cm.class_id = l.class_id
    where l.id = lesson_id
      and l.status = 'published'
      and cm.student_id = auth.uid()
  )
  and (
    -- before_class is always accessible
    phase = 'before_class'
    -- in_class requires before_class completed
    or (phase = 'in_class' and exists (
      select 1 from public.student_phase_progress
      where lesson_id = lesson_pathway_steps.lesson_id
        and student_id = auth.uid()
        and phase = 'before_class'
        and is_completed = true
    ))
    -- after_class requires in_class completed
    or (phase = 'after_class' and exists (
      select 1 from public.student_phase_progress
      where lesson_id = lesson_pathway_steps.lesson_id
        and student_id = auth.uid()
        and phase = 'in_class'
        and is_completed = true
    ))
  )
);

-- ============================================================
-- 3. Lesson Pathway Versions
--    TÍNH NĂNG PHIÊN BẢN HÓA CHƯA HOÀN THÀNH:
--    Bảng tạo sẵn schema nhưng chưa có logic khóa/so sánh/rollback.
--    snapshot chứa metadata reference, KHÔNG chứa nội dung bước.
-- ============================================================
create table if not exists public.lesson_pathway_versions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  version_number integer not null default 1,
  is_locked boolean not null default false,
  published_at timestamptz,
  -- snapshot chỉ chứa step IDs + metadata, KHÔNG chứa correct_answer hay nội dung nhạy cảm.
  snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(lesson_id, version_number)
);

alter table public.lesson_pathway_versions enable row level security;

-- Teachers manage versions for their own lessons.
create policy "versions_teacher_manage" on public.lesson_pathway_versions
for all to authenticated
using (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.teacher_id = auth.uid() and public.is_teacher()
  )
);

-- Students can read ONLY locked (published) versions of published lessons.
-- Unlocked/draft versions are not visible to students.
create policy "versions_student_read" on public.lesson_pathway_versions
for select to authenticated
using (
  is_locked = true
  and exists (
    select 1 from public.lessons l
    join public.class_members cm on cm.class_id = l.class_id
    where l.id = lesson_id
      and l.status = 'published'
      and cm.student_id = auth.uid()
  )
);

-- ============================================================
-- 4. Student Step Progress
-- ============================================================
create table if not exists public.student_step_progress (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.lesson_pathway_steps(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  is_completed boolean not null default false,
  evidence jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(step_id, student_id),
  -- Ràng buộc: lesson_id phải khớp với step.lesson_id
  constraint fk_step_lesson_match check (true)
  -- Sẽ được enforce bằng trigger vì cross-table check constraint không khả dụng.
);

alter table public.student_step_progress enable row level security;

-- Trigger: đảm bảo lesson_id luôn = step.lesson_id
create or replace function public.enforce_step_lesson_match()
returns trigger
language plpgsql
as $$
declare
  v_step_lesson_id uuid;
begin
  select lesson_id into v_step_lesson_id
  from public.lesson_pathway_steps
  where id = new.step_id;
  if v_step_lesson_id is null or v_step_lesson_id != new.lesson_id then
    raise exception 'lesson_id does not match step lesson_id';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_step_lesson_match on public.student_step_progress;
create trigger trg_enforce_step_lesson_match
  before insert or update on public.student_step_progress
  for each row execute function public.enforce_step_lesson_match();

-- Students can read their own progress; teachers can read progress for their lessons.
create policy "student_step_progress_select" on public.student_step_progress
for select to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.teacher_id = auth.uid()
  )
);

-- NO direct INSERT policy for students.
-- NO direct UPDATE policy for students.
-- All completion is handled exclusively via RPC complete_pathway_step (SECURITY DEFINER).
-- Teacher cannot delete student progress directly either.

-- Teacher can only SELECT, not DELETE/UPDATE student progress.
-- (If teacher needs to reset, a separate admin RPC should be created.)

-- ============================================================
-- 5. RPC: Record step completion (secure, DB-level gate)
-- ============================================================
create or replace function public.complete_pathway_step(
  p_step_id uuid,
  p_evidence jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_lesson_id uuid;
  v_class_id uuid;
  v_lesson_status text;
  v_phase text;
  v_step_order int;
  v_is_required boolean;
  v_step_published boolean;
  v_step_type text;
  v_material_id uuid;
  v_material_published boolean;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    return jsonb_build_object('success', false, 'error', 'Yêu cầu đăng nhập.');
  end if;

  -- Fetch step details with lesson info
  select s.lesson_id, l.class_id, l.status, s.phase, s.step_order,
         s.is_required, s.is_published, s.step_type, s.material_id
  into v_lesson_id, v_class_id, v_lesson_status, v_phase, v_step_order,
       v_is_required, v_step_published, v_step_type, v_material_id
  from lesson_pathway_steps s
  join lessons l on l.id = s.lesson_id
  where s.id = p_step_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Bước học không tồn tại.');
  end if;

  -- Lesson must be published
  if v_lesson_status != 'published' then
    return jsonb_build_object('success', false, 'error', 'Bài học chưa sẵn sàng, em hãy báo giáo viên.');
  end if;

  -- Step must be published
  if not v_step_published then
    return jsonb_build_object('success', false, 'error', 'Bước học chưa được mở, em hãy báo giáo viên.');
  end if;

  -- Student must be class member
  if not exists (select 1 from class_members where class_id = v_class_id and student_id = v_student_id) then
    return jsonb_build_object('success', false, 'error', 'Không có quyền truy cập.');
  end if;

  -- Phase ordering: check prior phases
  if v_phase = 'in_class' then
    if not exists (
      select 1 from student_phase_progress
      where lesson_id = v_lesson_id and student_id = v_student_id
        and phase = 'before_class' and is_completed = true
    ) then
      return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành phần Trước giờ học.');
    end if;
  elsif v_phase = 'after_class' then
    if not exists (
      select 1 from student_phase_progress
      where lesson_id = v_lesson_id and student_id = v_student_id
        and phase = 'in_class' and is_completed = true
    ) then
      return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành phần Trong giờ học.');
    end if;
  end if;

  -- If step references a material, it must be published
  if v_material_id is not null then
    select is_published into v_material_published
    from material_bank where id = v_material_id;
    if not found or not v_material_published then
      return jsonb_build_object('success', false, 'error', 'Học liệu chưa sẵn sàng, em hãy báo giáo viên.');
    end if;
  end if;

  -- Enforce sequential: all PRIOR required published steps in same phase must be completed
  if exists (
    select 1 from lesson_pathway_steps prev
    left join student_step_progress ssp on ssp.step_id = prev.id and ssp.student_id = v_student_id
    where prev.lesson_id = v_lesson_id
      and prev.phase = v_phase
      and prev.is_required = true
      and prev.is_published = true
      and prev.step_order < v_step_order
      and (ssp.is_completed is null or ssp.is_completed = false)
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành các bước trước đó.');
  end if;

  -- Validate evidence: must not be empty JSON for required steps
  if v_is_required and (p_evidence is null or p_evidence = '{}'::jsonb) then
    return jsonb_build_object('success', false, 'error', 'Cần bằng chứng hoàn thành bước học.');
  end if;

  -- Idempotent upsert: no duplicate records, preserves original completed_at
  insert into student_step_progress (step_id, lesson_id, student_id, is_completed, evidence, completed_at, updated_at)
  values (p_step_id, v_lesson_id, v_student_id, true, p_evidence, now(), now())
  on conflict (step_id, student_id)
  do update set
    is_completed = true,
    evidence = p_evidence,
    completed_at = coalesce(student_step_progress.completed_at, now()),
    updated_at = now();

  return jsonb_build_object('success', true, 'message', 'Đã ghi nhận hoàn thành bước học.');
end;
$$;
revoke all on function public.complete_pathway_step(uuid, jsonb) from public;
grant execute on function public.complete_pathway_step(uuid, jsonb) to authenticated;

-- ============================================================
-- 6. Storage Security
--    Bucket lesson-materials is private. Remove SVG from allowed MIME types
--    (SVG can contain inline scripts, no sanitization step exists).
--    Existing storage policies (migration 016) use path structure:
--      Teacher upload: {teacher_id}/{lesson_id}/... or videos/{teacher_id}/{lesson_id}/...
--      PDF upload:     pdfs/{teacher_id}/{lesson_id}/...
--    Student read policy (016) checks segment[2] = lesson.id.
--    This works for teacher-prefixed paths but NOT for "videos/" or "pdfs/" prefixed paths.
--    We fix the student read policy to handle all path patterns.
-- ============================================================
update storage.buckets
set public = false,
    allowed_mime_types = array[
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'image/png', 'image/jpeg', 'image/webp', 'image/gif'
      -- SVG removed: no server-side sanitization available
    ]::text[]
where id = 'lesson-materials';

-- Replace the old student read policy with one that handles multiple path patterns.
-- Old policy from 016 checks (storage.foldername(name))[2] = lesson.id::text
-- which only works for paths like {teacher_id}/{lesson_id}/file
-- but not for videos/{teacher_id}/{lesson_id}/file or pdfs/{teacher_id}/{lesson_id}/file
drop policy if exists "lesson_materials_student_select_member_lesson" on storage.objects;

create policy "lesson_materials_student_select_member_lesson"
on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-materials'
  and (
    -- Pattern 1: {teacher_id}/{lesson_id}/file (original)
    exists (
      select 1 from public.lessons l
      where l.id::text = (storage.foldername(name))[2]
        and l.status = 'published'
        and l.class_id is not null
        and public.is_class_member(l.class_id)
    )
    or
    -- Pattern 2: videos/{teacher_id}/{lesson_id}/file or pdfs/{teacher_id}/{lesson_id}/file
    (
      (storage.foldername(name))[1] in ('videos', 'pdfs')
      and exists (
        select 1 from public.lessons l
        where l.id::text = (storage.foldername(name))[3]
          and l.status = 'published'
          and l.class_id is not null
          and public.is_class_member(l.class_id)
      )
    )
  )
);

-- ============================================================
-- 7. Block direct student reads from question tables (defense in depth)
-- ============================================================
drop policy if exists "student_read_final_questions" on public.phase_final_questions;
drop policy if exists "student_read_assessment" on public.phase_assessment_questions;

-- ============================================================
-- 8. RPC: Phase-gated get_student_final_questions
-- ============================================================
create or replace function public.get_student_final_questions(p_lesson_id uuid, p_phase text)
returns table (id uuid, question_text text, sort_order integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_class_id uuid;
  v_lesson_status text;
begin
  v_student_id := auth.uid();
  if v_student_id is null then return; end if;

  select class_id, status into v_class_id, v_lesson_status
  from lessons where id = p_lesson_id;

  if not found or v_lesson_status != 'published' then return; end if;
  if not exists (select 1 from class_members where class_id = v_class_id and student_id = v_student_id) then
    return;
  end if;

  -- Phase ordering: in_class requires before_class completed
  if p_phase = 'in_class' then
    if not exists (
      select 1 from student_phase_progress
      where lesson_id = p_lesson_id and student_id = v_student_id
        and phase = 'before_class' and is_completed = true
    ) then
      return;
    end if;
  end if;

  -- All published materials for this phase must be completed
  if exists (
    select 1 from lesson_materials m
    left join lesson_material_progress lmp on lmp.material_id = m.id and lmp.student_id = v_student_id
    where m.lesson_id = p_lesson_id
      and m.phase = p_phase
      and m.is_published = true
      -- Exclude PDF/worksheet: student has "Mở PDF" button only, no completion tracking.
      -- Requiring completion of document materials with no tracking mechanism
      -- would permanently lock students out.
      and m.material_type not in ('worksheet', 'pdf')
      and (lmp.is_complete is null or lmp.is_complete = false)
  ) then
    return;
  end if;

  -- All required PUBLISHED pathway steps for this phase must be completed
  if exists (
    select 1 from lesson_pathway_steps s
    left join student_step_progress ssp on ssp.step_id = s.id and ssp.student_id = v_student_id
    where s.lesson_id = p_lesson_id
      and s.phase = p_phase
      and s.is_required = true
      and s.is_published = true
      and (ssp.is_completed is null or ssp.is_completed = false)
  ) then
    return;
  end if;

  return query
    select q.id, q.question_text, q.sort_order
    from phase_final_questions q
    where q.lesson_id = p_lesson_id
      and q.phase = p_phase
    order by q.sort_order;
end;
$$;
revoke all on function public.get_student_final_questions(uuid, text) from public;
grant execute on function public.get_student_final_questions(uuid, text) to authenticated;

-- ============================================================
-- 9. RPC: Phase-gated get_student_assessment_questions (whitelist-only)
-- ============================================================
create or replace function public.get_student_assessment_questions(p_lesson_id uuid)
returns table (id uuid, question_type text, difficulty text, content jsonb, sort_order integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_class_id uuid;
  v_lesson_status text;
  v_q record;
  v_safe_content jsonb;
  v_safe_statements jsonb;
  v_stmt jsonb;
  v_safe_stmt jsonb;
begin
  v_student_id := auth.uid();
  if v_student_id is null then return; end if;

  select l.class_id, l.status into v_class_id, v_lesson_status
  from lessons l where l.id = p_lesson_id;

  if not found or v_lesson_status != 'published' then return; end if;
  if not exists (select 1 from class_members where class_id = v_class_id and student_id = v_student_id) then
    return;
  end if;

  -- Must have completed in_class phase
  if not exists (
    select 1 from student_phase_progress
    where lesson_id = p_lesson_id and student_id = v_student_id
      and phase = 'in_class' and is_completed = true
  ) then
    return;
  end if;

  for v_q in (
    select q.id, q.question_type, q.difficulty, q.content, q.sort_order
    from phase_assessment_questions q
    where q.lesson_id = p_lesson_id
      and q.is_published = true
    order by q.sort_order
  ) loop
    if v_q.question_type = 'single_choice' then
      v_safe_content := jsonb_build_object(
        'prompt', v_q.content->'prompt',
        'options', v_q.content->'options'
      );

    elsif v_q.question_type = 'true_false' then
      -- Build statements with text only; also build parts array for client compatibility
      v_safe_statements := '[]'::jsonb;
      if v_q.content ? 'statements' and jsonb_typeof(v_q.content->'statements') = 'array' then
        for v_stmt in select * from jsonb_array_elements(v_q.content->'statements') loop
          v_safe_stmt := jsonb_build_object('text', v_stmt->'text');
          v_safe_statements := v_safe_statements || jsonb_build_array(v_safe_stmt);
        end loop;
      end if;
      v_safe_content := jsonb_build_object(
        'prompt', v_q.content->'prompt',
        'statements', v_safe_statements,
        'statementCount', jsonb_array_length(v_safe_statements)
      );

    elsif v_q.question_type = 'short_answer' then
      v_safe_content := jsonb_build_object(
        'prompt', v_q.content->'prompt'
      );

    else
      v_safe_content := jsonb_build_object(
        'prompt', v_q.content->'prompt'
      );
    end if;

    id := v_q.id;
    question_type := v_q.question_type;
    difficulty := v_q.difficulty;
    content := v_safe_content;
    sort_order := v_q.sort_order;
    return next;
  end loop;
end;
$$;
revoke all on function public.get_student_assessment_questions(uuid) from public;
grant execute on function public.get_student_assessment_questions(uuid) to authenticated;

-- ============================================================
-- 10. Upgrade declare_simulation_completed: require before_class completed
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

  if not exists (
    select 1 from student_phase_progress
    where lesson_id = p_lesson_id and student_id = v_student_id
      and phase = 'before_class' and is_completed = true
  ) then
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
-- 11. Upgrade submit_phase_final_questions: add pathway steps gate
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

  -- Phase ordering
  if p_phase = 'in_class' then
    if not exists (
      select 1 from student_phase_progress
      where lesson_id = p_lesson_id and student_id = v_student_id
        and phase = 'before_class' and is_completed = true
    ) then
      return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành phần Trước giờ học.');
    end if;
    if not exists (
      select 1 from student_phase_progress
      where lesson_id = p_lesson_id and student_id = v_student_id
        and phase = 'in_class' and simulation_completed = true
    ) then
      return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành mô phỏng trước.');
    end if;
  end if;

  -- Materials completed (exclude PDF/worksheet)
  if exists (
    select 1 from lesson_materials m
    left join lesson_material_progress lmp on lmp.material_id = m.id and lmp.student_id = v_student_id
    where m.lesson_id = p_lesson_id
      and m.phase = p_phase
      and m.is_published = true
      and m.material_type not in ('worksheet', 'pdf')
      and (lmp.is_complete is null or lmp.is_complete = false)
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành tất cả học liệu trước.');
  end if;

  -- Required published pathway steps completed
  if exists (
    select 1 from lesson_pathway_steps s
    left join student_step_progress ssp on ssp.step_id = s.id and ssp.student_id = v_student_id
    where s.lesson_id = p_lesson_id
      and s.phase = p_phase
      and s.is_required = true
      and s.is_published = true
      and (ssp.is_completed is null or ssp.is_completed = false)
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành tất cả bước học liệu bắt buộc trước.');
  end if;

  -- Verify answers
  for v_q in (
    select fq.id, fq.correct_answer
    from phase_final_questions fq
    where fq.lesson_id = p_lesson_id and fq.phase = p_phase
    order by fq.sort_order
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
-- 12. Upgrade submit_phase_assessment
--     - Pathway steps + materials gate
--     - Reject null, empty object, blank string answers
--     - For true_false: require all statements answered (count = statementCount)
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
  v_answer_value jsonb;
  v_question_type text;
  v_statement_count int;
  v_tf_key text;
  v_tf_val text;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    return jsonb_build_object('success', false, 'error', 'Yêu cầu đăng nhập.');
  end if;

  -- Reject null input
  if p_answers is null or jsonb_typeof(p_answers) != 'object' then
    return jsonb_build_object('success', false, 'error', 'Dữ liệu trả lời không hợp lệ.');
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

  -- Required published pathway steps for after_class
  if exists (
    select 1 from lesson_pathway_steps s
    left join student_step_progress ssp on ssp.step_id = s.id and ssp.student_id = v_student_id
    where s.lesson_id = p_lesson_id
      and s.phase = 'after_class'
      and s.is_required = true
      and s.is_published = true
      and (ssp.is_completed is null or ssp.is_completed = false)
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành tất cả bước học liệu bắt buộc Sau giờ học.');
  end if;

  -- Published after_class materials (exclude PDF/worksheet)
  if exists (
    select 1 from lesson_materials m
    left join lesson_material_progress lmp on lmp.material_id = m.id and lmp.student_id = v_student_id
    where m.lesson_id = p_lesson_id
      and m.phase = 'after_class'
      and m.is_published = true
      and m.material_type not in ('worksheet', 'pdf')
      and (lmp.is_complete is null or lmp.is_complete = false)
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành tất cả học liệu Sau giờ học trước.');
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

  -- Validate each answer
  for v_answer_key in select key from jsonb_each(p_answers) loop
    -- Check question exists
    select question_type into v_question_type
    from phase_assessment_questions
    where id::text = v_answer_key
      and lesson_id = p_lesson_id
      and is_published = true;

    if not found then
      return jsonb_build_object('success', false, 'error', 'Có câu trả lời không hợp lệ.');
    end if;

    v_answer_value := p_answers->v_answer_key;

    -- Reject null values
    if v_answer_value is null or jsonb_typeof(v_answer_value) = 'null' then
      return jsonb_build_object('success', false, 'error', 'Câu trả lời không được để trống.');
    end if;

    if v_question_type = 'single_choice' then
      -- Must be a non-empty string
      if jsonb_typeof(v_answer_value) != 'string' or trim(v_answer_value #>> '{}') = '' then
        return jsonb_build_object('success', false, 'error', 'Câu trả lời trắc nghiệm không được để trống.');
      end if;

    elsif v_question_type = 'true_false' then
      -- Must be an object with all statement indices answered
      if jsonb_typeof(v_answer_value) != 'object' then
        return jsonb_build_object('success', false, 'error', 'Câu trả lời Đúng/Sai không hợp lệ.');
      end if;
      -- Count required statements from the question content
      select jsonb_array_length(coalesce(content->'statements', '[]'::jsonb))
      into v_statement_count
      from phase_assessment_questions
      where id::text = v_answer_key;
      -- Check that all statements have been answered
      if (select count(key) from jsonb_each_text(v_answer_value)) < v_statement_count then
        return jsonb_build_object('success', false, 'error', 'Vui lòng trả lời đầy đủ tất cả các ý của câu Đúng/Sai.');
      end if;
      -- Check each sub-answer is "true" or "false"
      for v_tf_key in select key from jsonb_each_text(v_answer_value) loop
        v_tf_val := v_answer_value->>v_tf_key;
        if v_tf_val not in ('true', 'false') then
          return jsonb_build_object('success', false, 'error', 'Câu trả lời Đúng/Sai phải là "Đúng" hoặc "Sai".');
        end if;
      end loop;

    elsif v_question_type = 'short_answer' then
      if jsonb_typeof(v_answer_value) != 'string' or trim(v_answer_value #>> '{}') = '' then
        return jsonb_build_object('success', false, 'error', 'Câu trả lời tự luận không được để trống.');
      end if;

    else
      -- Unknown type: just require non-null
      if jsonb_typeof(v_answer_value) = 'null' then
        return jsonb_build_object('success', false, 'error', 'Câu trả lời không được để trống.');
      end if;
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
