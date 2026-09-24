begin;

-- Keep the existing material/progress architecture for simulations and submissions.
alter table public.lesson_material_progress
  add column if not exists response jsonb not null default '{}'::jsonb;

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

-- Restrict existing writes to published materials in a student's enrolled class.
-- This replaces the previous own-student-id-only policy without weakening RLS.
drop policy if exists "lesson_material_progress_student_manage" on public.lesson_material_progress;
create policy "lesson_material_progress_student_select" on public.lesson_material_progress
for select to authenticated using (student_id = auth.uid());
create policy "lesson_material_progress_student_insert" on public.lesson_material_progress
for insert to authenticated with check (
  student_id = auth.uid() and not public.is_teacher()
  and exists (
    select 1 from public.lesson_materials m join public.lessons l on l.id = m.lesson_id
    where m.id = material_id and m.is_published and l.status = 'published' and public.is_class_member(l.class_id)
  )
);
create policy "lesson_material_progress_student_update" on public.lesson_material_progress
for update to authenticated using (student_id = auth.uid()) with check (
  student_id = auth.uid() and not public.is_teacher()
  and exists (
    select 1 from public.lesson_materials m join public.lessons l on l.id = m.lesson_id
    where m.id = material_id and m.is_published and l.status = 'published' and public.is_class_member(l.class_id)
  )
);

-- Preserve fixed lesson identity while allowing the existing class FK's ON DELETE
-- SET NULL to run. A normal reassignment is still rejected. Materials are retained.
create or replace function public.enforce_fixed_nuclear_lesson()
returns trigger language plpgsql as $$
declare fixed record; class_was_deleted boolean := false;
begin
  if tg_op = 'DELETE' then
    if old.curriculum_code is not null then
      raise exception 'Fixed Nuclear Physics curriculum lessons cannot be deleted';
    end if;
    return old;
  end if;
  if tg_op = 'UPDATE' and old.curriculum_code is not null then
    class_was_deleted := old.class_id is not null and new.class_id is null
      and not exists (select 1 from public.classes where id = old.class_id);
    if new.curriculum_code is distinct from old.curriculum_code then
      raise exception 'Fixed Nuclear Physics lesson identity cannot be changed';
    end if;
    if new.class_id is distinct from old.class_id and not class_was_deleted then
      raise exception 'Fixed Nuclear Physics lesson class assignment cannot be changed';
    end if;
    if new.teacher_id is distinct from old.teacher_id then
      raise exception 'Fixed Nuclear Physics lesson teacher cannot be changed';
    end if;
  end if;
  if tg_op = 'UPDATE' and old.curriculum_code is null and new.curriculum_code is not null then
    raise exception 'Fixed Nuclear Physics lessons cannot be created by updating an existing lesson';
  end if;
  if new.curriculum_code is not null then
    if new.class_id is null and not class_was_deleted then
      if tg_op = 'INSERT' then
        raise exception 'Fixed Nuclear Physics lessons must belong to a class';
      elsif old.class_id is not null then
        raise exception 'Fixed Nuclear Physics lessons must belong to a class';
      end if;
    end if;
    select * into fixed from public.fixed_nuclear_lesson_values(new.curriculum_code);
    if fixed.lesson_title is null then raise exception 'Invalid fixed Nuclear Physics curriculum code'; end if;
    new.title := fixed.lesson_title;
    new.curriculum_order := fixed.lesson_order;
    new.activity_key := fixed.lesson_activity_key;
  end if;
  return new;
end;
$$;
commit;
