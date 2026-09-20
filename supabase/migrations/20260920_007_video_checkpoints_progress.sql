begin;

alter table public.lesson_materials
  add column if not exists checkpoint_questions jsonb not null default '[]'::jsonb;

create table if not exists public.lesson_material_progress (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.lesson_materials(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  watched_seconds numeric not null default 0,
  completion_percent numeric not null default 0,
  answered_checkpoints jsonb not null default '[]'::jsonb,
  is_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(material_id, student_id),
  constraint lesson_material_progress_percent check (completion_percent >= 0 and completion_percent <= 100)
);

create index if not exists lesson_material_progress_student_idx on public.lesson_material_progress(student_id);
alter table public.lesson_material_progress enable row level security;

create policy "lesson_material_progress_student_manage"
on public.lesson_material_progress for all to authenticated
using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "lesson_material_progress_teacher_select"
on public.lesson_material_progress for select to authenticated
using (exists (
  select 1 from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = lesson_material_progress.material_id and l.teacher_id = auth.uid()
));

commit;