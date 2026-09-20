begin;

alter table public.lessons
  alter column topic_id drop not null;

alter table public.lessons
  add column if not exists learning_objectives text not null default '';

drop policy if exists "lessons_teacher_insert" on public.lessons;

create policy "lessons_teacher_insert"
on public.lessons for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and public.is_teacher()
  and (
    class_id is null
    or exists (
      select 1
      from public.classes
      where id = class_id
        and teacher_id = auth.uid()
    )
  )
);

commit;