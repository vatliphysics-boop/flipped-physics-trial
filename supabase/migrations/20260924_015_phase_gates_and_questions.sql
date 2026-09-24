begin;

-- Phase Final Questions (for Phase 1 & 2)
create table if not exists public.phase_final_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  phase text not null check (phase in ('before_class', 'in_class')),
  question_text text not null,
  correct_answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.phase_final_questions enable row level security;
create policy "teacher_manage_final_questions" on public.phase_final_questions for all to authenticated using (exists (select 1 from public.lessons where id = lesson_id and teacher_id = auth.uid()));
create policy "student_read_final_questions" on public.phase_final_questions for select to authenticated using (true);

-- Phase Assessment Questions (for Phase 3)
create table if not exists public.phase_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question_type text not null check (question_type in ('single_choice', 'true_false', 'short_answer')),
  difficulty text not null check (difficulty in ('nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao')),
  content jsonb not null,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.phase_assessment_questions enable row level security;
create policy "teacher_manage_assessment" on public.phase_assessment_questions for all to authenticated using (exists (select 1 from public.lessons where id = lesson_id and teacher_id = auth.uid()));
create policy "student_read_assessment" on public.phase_assessment_questions for select to authenticated using (is_published = true);

-- Student Phase Progress
create table if not exists public.student_phase_progress (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  phase text not null check (phase in ('before_class', 'in_class', 'after_class')),
  is_completed boolean not null default false,
  completed_at timestamptz,
  primary key (lesson_id, student_id, phase)
);
alter table public.student_phase_progress enable row level security;
create policy "student_manage_phase_progress" on public.student_phase_progress for all to authenticated using (student_id = auth.uid());
create policy "teacher_read_phase_progress" on public.student_phase_progress for select to authenticated using (exists (select 1 from public.lessons where id = lesson_id and teacher_id = auth.uid()));

-- Student Lesson Progress
create table if not exists public.student_lesson_progress (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  primary key (lesson_id, student_id)
);
alter table public.student_lesson_progress enable row level security;
create policy "student_manage_lesson_progress" on public.student_lesson_progress for all to authenticated using (student_id = auth.uid());
create policy "teacher_read_lesson_progress" on public.student_lesson_progress for select to authenticated using (exists (select 1 from public.lessons where id = lesson_id and teacher_id = auth.uid()));

-- Also support colab in lesson_materials
alter table public.lesson_materials drop constraint if exists lesson_materials_material_type_check;
alter table public.lesson_materials add constraint lesson_materials_material_type_check check (material_type in ('video', 'simulation', 'infographic', 'worksheet', 'quiz', 'colab', 'pdf'));

commit;
