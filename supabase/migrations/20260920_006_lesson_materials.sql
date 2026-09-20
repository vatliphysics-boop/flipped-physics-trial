begin;

create table if not exists public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id),
  phase text not null check (phase in ('before_class', 'in_class', 'after_class')),
  material_type text not null check (material_type in ('video', 'simulation', 'infographic', 'worksheet', 'quiz')),
  title text not null,
  description text,
  content_url text,
  duration_minutes integer,
  instructions text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint lesson_materials_duration_positive check (duration_minutes is null or duration_minutes > 0)
);

create index if not exists lesson_materials_lesson_id_idx on public.lesson_materials(lesson_id);
create index if not exists lesson_materials_teacher_id_idx on public.lesson_materials(teacher_id);

alter table public.lesson_materials enable row level security;

create policy "lesson_materials_teacher_select_owned"
on public.lesson_materials for select
to authenticated
using (teacher_id = auth.uid() and exists (
  select 1 from public.lessons
  where lessons.id = lesson_materials.lesson_id and lessons.teacher_id = auth.uid()
));

create policy "lesson_materials_teacher_insert_owned"
on public.lesson_materials for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and public.is_teacher()
  and exists (
    select 1 from public.lessons
    where lessons.id = lesson_materials.lesson_id and lessons.teacher_id = auth.uid()
  )
);

create policy "lesson_materials_teacher_update_owned"
on public.lesson_materials for update
to authenticated
using (teacher_id = auth.uid() and exists (
  select 1 from public.lessons
  where lessons.id = lesson_materials.lesson_id and lessons.teacher_id = auth.uid()
))
with check (
  teacher_id = auth.uid()
  and public.is_teacher()
  and exists (
    select 1 from public.lessons
    where lessons.id = lesson_materials.lesson_id and lessons.teacher_id = auth.uid()
  )
);

create policy "lesson_materials_teacher_delete_owned"
on public.lesson_materials for delete
to authenticated
using (teacher_id = auth.uid() and exists (
  select 1 from public.lessons
  where lessons.id = lesson_materials.lesson_id and lessons.teacher_id = auth.uid()
));

create policy "lesson_materials_student_select_published"
on public.lesson_materials for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.lessons
    where lessons.id = lesson_materials.lesson_id
      and lessons.status = 'published'
      and lessons.class_id is not null
      and public.is_class_member(lessons.class_id)
  )
);

commit;