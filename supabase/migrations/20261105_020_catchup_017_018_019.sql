-- Migration 020: Idempotent catch-up for migrations 017 (partial), 018, and 019.
-- Safe to run on a live DB where any subset of these may already be applied.
-- All DDL uses IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS guards.
-- Apply in Supabase Dashboard → SQL Editor, or via `supabase db push` after linking.
--
-- VERIFY BEFORE RUNNING:
--   The probe in scripts/verify/probe-remote-schema.mjs confirmed (2026-11-05):
--     • student_phase_progress EXISTS but columns simulation_completed / assessment_answers MISSING
--     • material_bank, lesson_pathway_steps, student_step_progress, lesson_pathway_versions MISSING
--     • teacher_teaching_plans, teacher_plan_applications MISSING
--     • RPCs: complete_pathway_step, get_student_final_questions, get_student_assessment_questions,
--             declare_simulation_completed (upgraded), submit_phase_final_questions (upgraded),
--             submit_phase_assessment, apply_teacher_plan_draft ALL MISSING

begin;

-- ============================================================
-- PART A: Missing prerequisites from 007, 012, 013, and full 017
-- (Confirmed via live DB inspection: 007, 012, 013, 017 were not applied on live)
-- ============================================================

-- A1. lesson_materials.checkpoint_questions + lesson_material_progress (007 + 012 + 017)
alter table public.lesson_materials
  add column if not exists checkpoint_questions jsonb not null default '[]'::jsonb;

create table if not exists public.lesson_material_progress (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.lesson_materials(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  watched_seconds numeric not null default 0,
  completion_percent numeric not null default 0,
  answered_checkpoints jsonb not null default '[]'::jsonb,
  response jsonb not null default '{}'::jsonb,
  is_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(material_id, student_id),
  constraint lesson_material_progress_percent check (completion_percent >= 0 and completion_percent <= 100)
);

alter table public.lesson_material_progress
  add column if not exists response jsonb not null default '{}'::jsonb;

create index if not exists lesson_material_progress_student_idx on public.lesson_material_progress(student_id);
alter table public.lesson_material_progress enable row level security;

drop policy if exists "lesson_material_progress_student_manage" on public.lesson_material_progress;
drop policy if exists "lesson_material_progress_student_insert" on public.lesson_material_progress;
drop policy if exists "lesson_material_progress_student_update" on public.lesson_material_progress;
drop policy if exists "lesson_material_progress_student_select" on public.lesson_material_progress;
drop policy if exists "lesson_material_progress_teacher_select" on public.lesson_material_progress;
drop policy if exists "lesson_material_progress_student_insert_nonvideo" on public.lesson_material_progress;
drop policy if exists "lesson_material_progress_student_update_nonvideo" on public.lesson_material_progress;

create policy "lesson_material_progress_student_select" on public.lesson_material_progress
for select to authenticated using (student_id = auth.uid());

create policy "lesson_material_progress_teacher_select"
on public.lesson_material_progress for select to authenticated
using (exists (
  select 1 from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = lesson_material_progress.material_id and l.teacher_id = auth.uid()
));

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

-- A2. lesson_reflections (012)
create table if not exists public.lesson_reflections (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  learned text not null check (char_length(learned) between 1 and 10000),
  difficult text not null default '' check (char_length(difficult) <= 10000),
  next_step text not null check (char_length(next_step) between 1 and 10000),
  confidence integer not null check (confidence between 1 and 5),
  homework_response text not null default '' check (char_length(homework_response) <= 10000),
  updated_at timestamptz not null default now(),
  primary key (lesson_id, student_id)
);
create index if not exists lesson_reflections_student_idx on public.lesson_reflections(student_id);
alter table public.lesson_reflections enable row level security;

drop policy if exists "lesson_reflections_student_select" on public.lesson_reflections;
drop policy if exists "lesson_reflections_student_insert" on public.lesson_reflections;
drop policy if exists "lesson_reflections_student_update" on public.lesson_reflections;
drop policy if exists "lesson_reflections_teacher_select" on public.lesson_reflections;

create policy "lesson_reflections_student_select" on public.lesson_reflections
for select to authenticated using (student_id = auth.uid());
create policy "lesson_reflections_student_insert" on public.lesson_reflections
for insert to authenticated with check (
  student_id = auth.uid() and not public.is_teacher()
  and exists (select 1 from public.lessons l where l.id = lesson_id and l.status = 'published' and public.is_class_member(l.class_id))
);
create policy "lesson_reflections_student_update" on public.lesson_reflections
for update to authenticated using (student_id = auth.uid()) with check (
  student_id = auth.uid() and not public.is_teacher()
  and exists (select 1 from public.lessons l where l.id = lesson_id and l.status = 'published' and public.is_class_member(l.class_id))
);
create policy "lesson_reflections_teacher_select" on public.lesson_reflections
for select to authenticated using (
  exists (select 1 from public.lessons l where l.id = lesson_id and l.teacher_id = auth.uid())
);

-- A3. Secure video learning objects (013 + 017)
drop policy if exists "video_checkpoints_student_select_published" on public.video_checkpoints;
drop policy if exists "student_read_published_video_checkpoints" on public.video_checkpoints;

create or replace view public.student_video_checkpoints
with (security_invoker = true) as
select id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d, sort_order
from public.video_checkpoints;
grant select on public.student_video_checkpoints to authenticated;

create table if not exists public.video_checkpoint_attempts (
  id uuid primary key default gen_random_uuid(),
  checkpoint_id uuid not null references public.video_checkpoints(id) on delete cascade,
  material_id uuid not null references public.lesson_materials(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);
create index if not exists video_checkpoint_attempts_student_checkpoint_idx
  on public.video_checkpoint_attempts(student_id, checkpoint_id, attempted_at desc);
alter table public.video_checkpoint_attempts enable row level security;
drop policy if exists "video_checkpoint_attempts_student_select" on public.video_checkpoint_attempts;
create policy "video_checkpoint_attempts_student_select" on public.video_checkpoint_attempts
for select to authenticated using (student_id = auth.uid());

create or replace function public.record_video_progress(p_material_id uuid, p_watched_seconds numeric)
returns table (watched_seconds numeric, completion_percent numeric, is_complete boolean, answered_checkpoint_ids jsonb)
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_duration numeric; v_checkpoint_total integer; v_answered jsonb; v_complete boolean;
begin
  if v_user is null or p_watched_seconds is null or p_watched_seconds < 0 or p_watched_seconds > 86400 then raise exception 'invalid progress payload'; end if;
  select m.duration_minutes * 60 into v_duration from lesson_materials m join lessons l on l.id=m.lesson_id
    where m.id=p_material_id and m.material_type='video' and m.phase='before_class' and m.is_published and l.status='published'
      and exists (select 1 from class_members cm where cm.class_id=l.class_id and cm.student_id=v_user);
  if not found then raise exception 'material unavailable'; end if;
  select count(*) into v_checkpoint_total from video_checkpoints where material_id=p_material_id;
  select coalesce(jsonb_agg(distinct a.checkpoint_id), '[]'::jsonb) into v_answered from video_checkpoint_attempts a
    where a.material_id=p_material_id and a.student_id=v_user and a.is_correct;
  v_complete := p_watched_seconds >= greatest(coalesce(v_duration, 0) * .9, 1)
    and (v_checkpoint_total = 0 or jsonb_array_length(v_answered) >= v_checkpoint_total);
  insert into lesson_material_progress(material_id, student_id, watched_seconds, completion_percent, answered_checkpoints, is_complete, updated_at)
  values (p_material_id, v_user, least(p_watched_seconds, coalesce(v_duration, p_watched_seconds)),
    case when coalesce(v_duration,0)>0 then least(100, round(least(p_watched_seconds,v_duration)/v_duration*100,2)) else 0 end,
    v_answered, v_complete, now())
  on conflict (material_id, student_id) do update set watched_seconds=greatest(lesson_material_progress.watched_seconds, excluded.watched_seconds),
    completion_percent=greatest(lesson_material_progress.completion_percent, excluded.completion_percent), answered_checkpoints=excluded.answered_checkpoints,
    is_complete=lesson_material_progress.is_complete or excluded.is_complete, updated_at=now()
  returning lesson_material_progress.watched_seconds, lesson_material_progress.completion_percent, lesson_material_progress.is_complete, lesson_material_progress.answered_checkpoints
  into watched_seconds, completion_percent, is_complete, answered_checkpoint_ids;
  return next;
end; $$;

create or replace function public.submit_video_checkpoint(p_material_id uuid, p_checkpoint_id uuid, p_selected_option text)
returns table (is_correct boolean, attempt_count integer)
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_answer text; v_count integer;
begin
  if v_user is null or p_selected_option not in ('A','B','C','D') then raise exception 'invalid checkpoint payload'; end if;
  select c.correct_option into v_answer from video_checkpoints c join lesson_materials m on m.id=c.material_id join lessons l on l.id=m.lesson_id
    where c.id=p_checkpoint_id and c.material_id=p_material_id and m.is_published and l.status='published'
      and exists (select 1 from class_members cm where cm.class_id=l.class_id and cm.student_id=v_user);
  if not found then raise exception 'checkpoint unavailable'; end if;
  is_correct := p_selected_option = v_answer;
  insert into video_checkpoint_attempts(checkpoint_id, material_id, student_id, selected_option, is_correct)
    values(p_checkpoint_id, p_material_id, v_user, p_selected_option, is_correct);
  select count(*) into v_count from video_checkpoint_attempts where checkpoint_id=p_checkpoint_id and student_id=v_user;
  attempt_count := v_count; return next;
end; $$;

revoke all on function public.record_video_progress(uuid, numeric) from public, anon;
revoke all on function public.submit_video_checkpoint(uuid, uuid, text) from public, anon;
grant execute on function public.record_video_progress(uuid, numeric) to authenticated;
grant execute on function public.submit_video_checkpoint(uuid, uuid, text) to authenticated;

-- A4. Migration 017 — replace permissive progress policies & add columns on student_phase_progress
-- Also allow students to read topics linked to published lessons in their joined classes
drop policy if exists "topics_student_select" on public.topics;
create policy "topics_student_select" on public.topics for select to authenticated
  using (exists (
    select 1 from public.lessons l
    where l.topic_id = public.topics.id
      and l.status = 'published'
      and l.class_id is not null
      and public.is_class_member(l.class_id)
  ));

drop policy if exists "student_manage_phase_progress" on public.student_phase_progress;
drop policy if exists "student_manage_lesson_progress" on public.student_lesson_progress;
drop policy if exists "student_read_phase_progress" on public.student_phase_progress;
drop policy if exists "student_read_lesson_progress" on public.student_lesson_progress;

create policy "student_read_phase_progress" on public.student_phase_progress
  for select to authenticated using (student_id = auth.uid());

create policy "student_read_lesson_progress" on public.student_lesson_progress
  for select to authenticated using (student_id = auth.uid());

alter table public.student_phase_progress
  add column if not exists simulation_completed boolean not null default false,
  add column if not exists assessment_answers jsonb;

-- ============================================================
-- PART B: Migration 018 — Material Bank & Flipped Classroom Learning Pathway
-- ============================================================

-- B1. Material Bank
create table if not exists public.material_bank (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  material_type text not null check (
    material_type in (
      'image', 'animation', 'real_video', 'lecture_video',
      'simulation', 'document', 'colab', 'assessment'
    )
  ),
  category text not null default 'nuclear_physics' check (
    category in ('nuclear_physics', 'thermal_physics', 'ideal_gas', 'magnetic_field', 'general')
  ),
  lesson_tag text,
  content_url text not null,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.material_bank enable row level security;

drop policy if exists "material_bank_teacher_manage" on public.material_bank;
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

-- B2. Lesson Pathway Steps
create table if not exists public.lesson_pathway_steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  phase text not null check (phase in ('before_class', 'in_class', 'after_class')),
  material_id uuid references public.material_bank(id) on delete set null,
  title text not null,
  instructions text default '',
  step_order integer not null default 0,
  is_required boolean not null default true,
  is_published boolean not null default false,
  step_type text not null check (
    step_type in ('image', 'animation', 'real_video', 'lecture_video', 'simulation',
                  'document', 'colab', 'checkpoint', 'exercise', 'reflection', 'assessment')
  ),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_pathway_steps enable row level security;

-- material_bank_student_read policy (depends on lesson_pathway_steps existing)
drop policy if exists "material_bank_student_read" on public.material_bank;
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

drop policy if exists "steps_teacher_manage" on public.lesson_pathway_steps;
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

drop policy if exists "steps_student_read" on public.lesson_pathway_steps;
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
    phase = 'before_class'
    or (phase = 'in_class' and exists (
      select 1 from public.student_phase_progress
      where lesson_id = lesson_pathway_steps.lesson_id
        and student_id = auth.uid()
        and phase = 'before_class'
        and is_completed = true
    ))
    or (phase = 'after_class' and exists (
      select 1 from public.student_phase_progress
      where lesson_id = lesson_pathway_steps.lesson_id
        and student_id = auth.uid()
        and phase = 'in_class'
        and is_completed = true
    ))
  )
);

-- B3. Lesson Pathway Versions
create table if not exists public.lesson_pathway_versions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  version_number integer not null default 1,
  is_locked boolean not null default false,
  published_at timestamptz,
  snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(lesson_id, version_number)
);

alter table public.lesson_pathway_versions enable row level security;

drop policy if exists "versions_teacher_manage" on public.lesson_pathway_versions;
create policy "versions_teacher_manage" on public.lesson_pathway_versions
for all to authenticated
using (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.teacher_id = auth.uid() and public.is_teacher()
  )
);

drop policy if exists "versions_student_read" on public.lesson_pathway_versions;
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

-- B4. Student Step Progress
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
  constraint fk_step_lesson_match check (true)
);

alter table public.student_step_progress enable row level security;

-- Trigger: enforce lesson_id = step.lesson_id
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

drop policy if exists "student_step_progress_select" on public.student_step_progress;
create policy "student_step_progress_select" on public.student_step_progress
for select to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.teacher_id = auth.uid()
  )
);

-- B5. RPC: complete_pathway_step
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

  if v_lesson_status != 'published' then
    return jsonb_build_object('success', false, 'error', 'Bài học chưa sẵn sàng, em hãy báo giáo viên.');
  end if;

  if not v_step_published then
    return jsonb_build_object('success', false, 'error', 'Bước học chưa được mở, em hãy báo giáo viên.');
  end if;

  if not exists (select 1 from class_members where class_id = v_class_id and student_id = v_student_id) then
    return jsonb_build_object('success', false, 'error', 'Không có quyền truy cập.');
  end if;

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

  if v_material_id is not null then
    select is_published into v_material_published
    from material_bank where id = v_material_id;
    if not found or not v_material_published then
      return jsonb_build_object('success', false, 'error', 'Học liệu chưa sẵn sàng, em hãy báo giáo viên.');
    end if;
  end if;

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

  if v_is_required and (p_evidence is null or p_evidence = '{}'::jsonb) then
    return jsonb_build_object('success', false, 'error', 'Cần bằng chứng hoàn thành bước học.');
  end if;

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
revoke all on function public.complete_pathway_step(uuid, jsonb) from public, anon;
grant execute on function public.complete_pathway_step(uuid, jsonb) to authenticated;

-- B6. Storage Security — fix student read policy for multiple path patterns
update storage.buckets
set public = false,
    allowed_mime_types = array[
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'image/png', 'image/jpeg', 'image/webp', 'image/gif'
    ]::text[]
where id = 'lesson-materials';

drop policy if exists "lesson_materials_student_select_member_lesson" on storage.objects;
create policy "lesson_materials_student_select_member_lesson"
on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-materials'
  and (
    exists (
      select 1 from public.lessons l
      where l.id::text = (storage.foldername(name))[2]
        and l.status = 'published'
        and l.class_id is not null
        and public.is_class_member(l.class_id)
    )
    or
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

-- B7. Block direct student reads from question tables
drop policy if exists "student_read_final_questions" on public.phase_final_questions;
drop policy if exists "student_read_assessment" on public.phase_assessment_questions;

-- B8. RPC: get_student_final_questions (phase-gated, no correct_answer)
-- OUT params renamed with out_ prefix to avoid PGlite/PG16 plpgsql ambiguity with table columns.
create or replace function public.get_student_final_questions(p_lesson_id uuid, p_phase text)
returns table (id uuid, question_text text, sort_order integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_class_id uuid;
  v_lesson_status text;
  v_q record;
begin
  v_student_id := auth.uid();
  if v_student_id is null then return; end if;

  select l.class_id, l.status into v_class_id, v_lesson_status
  from lessons l where l.id = p_lesson_id;

  if not found or v_lesson_status != 'published' then return; end if;
  if not exists (select 1 from class_members cm where cm.class_id = v_class_id and cm.student_id = v_student_id) then
    return;
  end if;

  if p_phase = 'in_class' then
    if not exists (
      select 1 from student_phase_progress spp
      where spp.lesson_id = p_lesson_id and spp.student_id = v_student_id
        and spp.phase = 'before_class' and spp.is_completed = true
    ) then
      return;
    end if;
  end if;

  -- All published materials for this phase must be completed (exclude PDF/worksheet)
  if exists (
    select 1 from lesson_materials m
    left join lesson_material_progress lmp on lmp.material_id = m.id and lmp.student_id = v_student_id
    where m.lesson_id = p_lesson_id
      and m.phase = p_phase
      and m.is_published = true
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

  -- Use explicit loop assignment to avoid OUT-param ambiguity in some PG versions
  for v_q in
    select q.id, q.question_text, q.sort_order
    from phase_final_questions q
    where q.lesson_id = p_lesson_id
      and q.phase = p_phase
    order by q.sort_order
  loop
    id := v_q.id;
    question_text := v_q.question_text;
    sort_order := v_q.sort_order;
    return next;
  end loop;
end;
$$;
revoke all on function public.get_student_final_questions(uuid, text) from public, anon;
grant execute on function public.get_student_final_questions(uuid, text) to authenticated;

-- B9. RPC: get_student_assessment_questions (whitelist, no correct_answer)
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
      v_safe_content := jsonb_build_object('prompt', v_q.content->'prompt');
    else
      v_safe_content := jsonb_build_object('prompt', v_q.content->'prompt');
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
revoke all on function public.get_student_assessment_questions(uuid) from public, anon;
grant execute on function public.get_student_assessment_questions(uuid) to authenticated;

-- B10. Upgrade declare_simulation_completed: require before_class completed
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
revoke all on function public.declare_simulation_completed(uuid) from public, anon;
grant execute on function public.declare_simulation_completed(uuid) to authenticated;

-- B11. Upgrade submit_phase_final_questions: add pathway steps gate
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
revoke all on function public.submit_phase_final_questions(uuid, text, jsonb) from public, anon;
grant execute on function public.submit_phase_final_questions(uuid, text, jsonb) to authenticated;

-- B12. Upgrade submit_phase_assessment
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

  if not exists (
    select 1 from student_phase_progress
    where lesson_id = p_lesson_id and student_id = v_student_id
      and phase = 'in_class' and is_completed = true
  ) then
    return jsonb_build_object('success', false, 'error', 'Em cần hoàn thành phần Trong giờ học.');
  end if;

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

  select count(*) into v_required_questions
  from phase_assessment_questions
  where lesson_id = p_lesson_id and is_published = true;

  if v_required_questions = 0 then
    return jsonb_build_object('success', false, 'error', 'Bài học chưa có câu hỏi đánh giá.');
  end if;

  select count(key) into v_submitted_questions from jsonb_each(p_answers);

  if v_submitted_questions < v_required_questions then
    return jsonb_build_object('success', false, 'error', 'Vui lòng làm đầy đủ các câu hỏi.');
  end if;

  for v_answer_key in select key from jsonb_each(p_answers) loop
    select question_type into v_question_type
    from phase_assessment_questions
    where id::text = v_answer_key
      and lesson_id = p_lesson_id
      and is_published = true;

    if not found then
      return jsonb_build_object('success', false, 'error', 'Có câu trả lời không hợp lệ.');
    end if;

    v_answer_value := p_answers->v_answer_key;

    if v_answer_value is null or jsonb_typeof(v_answer_value) = 'null' then
      return jsonb_build_object('success', false, 'error', 'Câu trả lời không được để trống.');
    end if;

    if v_question_type = 'single_choice' then
      if jsonb_typeof(v_answer_value) != 'string' or trim(v_answer_value #>> '{}') = '' then
        return jsonb_build_object('success', false, 'error', 'Câu trả lời trắc nghiệm không được để trống.');
      end if;
    elsif v_question_type = 'true_false' then
      if jsonb_typeof(v_answer_value) != 'object' then
        return jsonb_build_object('success', false, 'error', 'Câu trả lời Đúng/Sai không hợp lệ.');
      end if;
      select jsonb_array_length(coalesce(content->'statements', '[]'::jsonb))
      into v_statement_count
      from phase_assessment_questions
      where id::text = v_answer_key;
      if (select count(key) from jsonb_each_text(v_answer_value)) < v_statement_count then
        return jsonb_build_object('success', false, 'error', 'Vui lòng trả lời đầy đủ tất cả các ý của câu Đúng/Sai.');
      end if;
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
      if jsonb_typeof(v_answer_value) = 'null' then
        return jsonb_build_object('success', false, 'error', 'Câu trả lời không được để trống.');
      end if;
    end if;
  end loop;

  insert into student_phase_progress (lesson_id, student_id, phase, is_completed, completed_at, assessment_answers)
  values (p_lesson_id, v_student_id, 'after_class', true, now(), p_answers)
  on conflict (lesson_id, student_id, phase)
  do update set
    is_completed = true,
    completed_at = coalesce(student_phase_progress.completed_at, now()),
    assessment_answers = p_answers;

  insert into student_lesson_progress (lesson_id, student_id, is_completed, completed_at)
  values (p_lesson_id, v_student_id, true, now())
  on conflict (lesson_id, student_id)
  do update set
    is_completed = true,
    completed_at = coalesce(student_lesson_progress.completed_at, now());

  return jsonb_build_object('success', true, 'message', 'Chúc mừng em đã hoàn thành bài học!');
end;
$$;
revoke all on function public.submit_phase_assessment(uuid, jsonb) from public, anon;
grant execute on function public.submit_phase_assessment(uuid, jsonb) to authenticated;

-- ============================================================
-- PART C: Migration 019 — Teacher Teaching Plans
-- ============================================================

-- C1. Update constraints to include 'assessment' type.
-- CREATE TABLE IF NOT EXISTS does NOT alter existing check constraints, so if 018
-- was applied first (without 'assessment'), the old constraint persists. Fix:
alter table public.material_bank
  drop constraint if exists material_bank_material_type_check;
alter table public.material_bank
  add constraint material_bank_material_type_check check (
    material_type in ('image','animation','real_video','lecture_video','simulation',
                      'document','colab','assessment')
  );

alter table public.lesson_pathway_steps
  drop constraint if exists lesson_pathway_steps_step_type_check;
alter table public.lesson_pathway_steps
  add constraint lesson_pathway_steps_step_type_check check (
    step_type in ('image','animation','real_video','lecture_video','simulation',
                  'document','colab','assessment','checkpoint','exercise','reflection')
  );

-- C2. Teacher Teaching Plans
create table if not exists public.teacher_teaching_plans (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  lesson_code text not null check (lesson_code in ('B21','B22','B23','B24','B25','general')),
  plan jsonb not null check (jsonb_typeof(plan) = 'object' and octet_length(plan::text) <= 800000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.teacher_teaching_plans enable row level security;

drop policy if exists teacher_owns_plan on public.teacher_teaching_plans;
create policy teacher_owns_plan on public.teacher_teaching_plans for all to authenticated
using (teacher_id = auth.uid() and public.is_teacher())
with check (teacher_id = auth.uid() and public.is_teacher());

create index if not exists teacher_plans_owner_updated
  on public.teacher_teaching_plans (teacher_id, updated_at desc);

-- C3. Teacher Plan Applications
create table if not exists public.teacher_plan_applications (
  plan_id uuid not null references public.teacher_teaching_plans(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, lesson_id)
);
alter table public.teacher_plan_applications enable row level security;

drop policy if exists teacher_reads_own_plan_applications on public.teacher_plan_applications;
create policy teacher_reads_own_plan_applications on public.teacher_plan_applications
  for select to authenticated
  using (teacher_id = auth.uid() and public.is_teacher());

-- C4. RPC: apply_teacher_plan_draft
create or replace function public.apply_teacher_plan_draft(p_plan_id uuid, p_lesson_id uuid, p_steps jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  item jsonb;
  bank_id uuid;
  next_order integer;
  inserted integer := 0;
begin
  if actor is null or not public.is_teacher() then raise exception 'teacher_required'; end if;
  perform 1 from public.lessons where id = p_lesson_id and teacher_id = actor for update;
  if not found then raise exception 'lesson_not_owned'; end if;
  perform 1 from public.teacher_teaching_plans where id = p_plan_id and teacher_id = actor for update;
  if not found then raise exception 'plan_not_owned'; end if;
  if exists(select 1 from public.teacher_plan_applications where plan_id=p_plan_id and lesson_id=p_lesson_id) then raise exception 'already_applied'; end if;
  if p_steps is null or jsonb_typeof(p_steps) is distinct from 'array' then raise exception 'invalid_steps'; end if;
  if jsonb_array_length(p_steps) not between 1 and 720 then raise exception 'invalid_steps'; end if;
  for item in select value from jsonb_array_elements(p_steps) loop
    if coalesce(item->>'phase','') not in ('before_class','in_class','after_class')
      or coalesce(item->>'step_type','') not in ('image','animation','real_video','lecture_video','simulation','document','colab','assessment')
      or length(coalesce(item->>'title','')) not between 1 and 300
      or length(coalesce(item->>'instructions','')) > 8000
      or length(coalesce(item->>'content_url','')) not between 1 and 2000
      then raise exception 'invalid_step'; end if;
    bank_id := null;
    if nullif(item->>'material_id','') is not null then
      select id into bank_id from public.material_bank where id=(item->>'material_id')::uuid and (teacher_id=actor or is_system);
      if bank_id is null then raise exception 'material_not_owned'; end if;
    elsif nullif(item->>'canonical_material_id','') is null then
      if (item->>'content_url') !~ '^(https?://|/[^/]|activity:[a-z_]+$)' or (item->>'content_url') ~ '[[:cntrl:]<>"\\]' then raise exception 'unsafe_source'; end if;
      insert into public.material_bank(teacher_id,title,description,material_type,category,content_url,is_published,is_system)
      values(actor,item->>'title','Từ kế hoạch riêng; rà soát và xuất bản trước khi giao.',item->>'step_type','nuclear_physics',item->>'content_url',false,false)
      returning id into bank_id;
    else
      if (item->>'canonical_material_id') !~ '^system-[a-zA-Z0-9_-]+$' then raise exception 'invalid_canonical_id'; end if;
    end if;
    select coalesce(max(step_order),0)+1 into next_order from public.lesson_pathway_steps where lesson_id=p_lesson_id and phase=item->>'phase';
    insert into public.lesson_pathway_steps(lesson_id,phase,material_id,title,instructions,step_order,is_required,is_published,step_type,config)
    values(p_lesson_id,item->>'phase',bank_id,item->>'title',item->>'instructions',next_order,true,false,item->>'step_type',
           jsonb_build_object('canonical_material_id',item->>'canonical_material_id','content_url',item->>'content_url','teacher_plan_id',p_plan_id));
    inserted := inserted+1;
  end loop;
  insert into public.teacher_plan_applications(plan_id,lesson_id,teacher_id) values(p_plan_id,p_lesson_id,actor);
  return jsonb_build_object('success',true,'count',inserted);
end $$;
revoke all on function public.apply_teacher_plan_draft(uuid,uuid,jsonb) from public,anon;
grant execute on function public.apply_teacher_plan_draft(uuid,uuid,jsonb) to authenticated;

commit;
