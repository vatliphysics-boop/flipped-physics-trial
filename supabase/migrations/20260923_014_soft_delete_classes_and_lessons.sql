begin;

-- Soft deletion preserves class membership, lessons, materials, progress, submissions and storage objects.
alter table public.classes
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id);
alter table public.lessons
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id);

create index if not exists classes_active_teacher_idx on public.classes(teacher_id, created_at desc) where deleted_at is null;
create index if not exists classes_deleted_teacher_idx on public.classes(teacher_id, deleted_at desc) where deleted_at is not null;
create index if not exists lessons_active_class_curriculum_idx on public.lessons(class_id, curriculum_code) where deleted_at is null;

create or replace function public.is_class_teacher(target_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = target_class_id and teacher_id = auth.uid() and deleted_at is null);
$$;

create or replace function public.is_class_member(target_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.class_id = target_class_id and cm.student_id = auth.uid() and c.deleted_at is null
  );
$$;

drop policy if exists "classes_teacher_select" on public.classes;
create policy "classes_teacher_select" on public.classes for select to authenticated using (teacher_id = auth.uid());
drop policy if exists "classes_student_select_joined" on public.classes;
create policy "classes_student_select_joined" on public.classes for select to authenticated using (deleted_at is null and public.is_class_member(id));
drop policy if exists "classes_teacher_update" on public.classes;
create policy "classes_teacher_update" on public.classes for update to authenticated using (teacher_id = auth.uid() and public.is_teacher()) with check (teacher_id = auth.uid() and public.is_teacher());

drop policy if exists "lessons_student_select_published" on public.lessons;
create policy "lessons_student_select_published" on public.lessons for select to authenticated using (
  deleted_at is null and status = 'published' and class_id is not null and public.is_class_member(class_id)
);

drop policy if exists "lesson_materials_student_select_published" on public.lesson_materials;
create policy "lesson_materials_student_select_published" on public.lesson_materials for select to authenticated using (
  is_published = true and exists (
    select 1 from public.lessons l
    where l.id = lesson_materials.lesson_id and l.deleted_at is null and l.status = 'published'
      and l.class_id is not null and public.is_class_member(l.class_id)
  )
);

