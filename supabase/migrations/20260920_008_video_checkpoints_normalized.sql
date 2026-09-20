begin;

create table if not exists public.video_checkpoints (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.lesson_materials(id) on delete cascade,
  checkpoint_percent integer not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint video_checkpoints_percent_range check (checkpoint_percent > 0 and checkpoint_percent < 100),
  constraint video_checkpoints_correct_option_check check (correct_option in ('A', 'B', 'C', 'D'))
);

create index if not exists video_checkpoints_material_sort_idx
  on public.video_checkpoints(material_id, sort_order);

alter table public.video_checkpoints enable row level security;

create policy "video_checkpoints_teacher_select_owned"
on public.video_checkpoints for select to authenticated
using (exists (
  select 1
  from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = video_checkpoints.material_id
    and m.material_type = 'video'
    and l.teacher_id = auth.uid()
));

create policy "video_checkpoints_teacher_insert_owned"
on public.video_checkpoints for insert to authenticated
with check (exists (
  select 1
  from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = video_checkpoints.material_id
    and m.material_type = 'video'
    and l.teacher_id = auth.uid()
    and public.is_teacher()
));

create policy "video_checkpoints_teacher_update_owned"
on public.video_checkpoints for update to authenticated
using (exists (
  select 1
  from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = video_checkpoints.material_id
    and m.material_type = 'video'
    and l.teacher_id = auth.uid()
))
with check (exists (
  select 1
  from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = video_checkpoints.material_id
    and m.material_type = 'video'
    and l.teacher_id = auth.uid()
    and public.is_teacher()
));

create policy "video_checkpoints_teacher_delete_owned"
on public.video_checkpoints for delete to authenticated
using (exists (
  select 1
  from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = video_checkpoints.material_id
    and m.material_type = 'video'
    and l.teacher_id = auth.uid()
));

create policy "video_checkpoints_student_select_published"
on public.video_checkpoints for select to authenticated
using (exists (
  select 1
  from public.lesson_materials m
  join public.lessons l on l.id = m.lesson_id
  where m.id = video_checkpoints.material_id
    and m.material_type = 'video'
    and m.is_published = true
    and l.status = 'published'
    and l.class_id is not null
    and public.is_class_member(l.class_id)
));

commit;