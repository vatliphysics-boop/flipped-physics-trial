begin;

alter table public.lessons
  add column if not exists curriculum_code text,
  add column if not exists curriculum_order integer,
  add column if not exists activity_key text,
  add column if not exists homework_title text not null default '',
  add column if not exists homework_description text not null default '',
  add column if not exists homework_instructions text not null default '',
  add column if not exists homework_due_date date,
  add column if not exists homework_status text not null default 'draft';

alter table public.lessons
  drop constraint if exists lessons_homework_status_check;
alter table public.lessons
  add constraint lessons_homework_status_check check (homework_status in ('draft', 'published'));

create unique index if not exists lessons_class_curriculum_code_idx
  on public.lessons(class_id, curriculum_code)
  where curriculum_code is not null and class_id is not null;

create or replace function public.fixed_nuclear_lesson_values(p_code text)
returns table (lesson_title text, lesson_order integer, lesson_activity_key text)
language sql immutable
as $$
  select case p_code
    when 'B21' then 'Bài 21. Cấu trúc hạt nhân'
    when 'B22' then 'Bài 22. Phản ứng hạt nhân và năng lượng liên kết'
    when 'B23' then 'Bài 23. Hiện tượng phóng xạ'
    when 'B24' then 'Bài 24. Công nghiệp hạt nhân'
    when 'B25' then 'Bài 25. Bài tập về vật lí hạt nhân'
  end,
  case p_code when 'B21' then 1 when 'B22' then 2 when 'B23' then 3 when 'B24' then 4 when 'B25' then 5 end,
  case p_code when 'B21' then 'nuclear_structure' when 'B22' then 'binding_energy' when 'B23' then 'radioactive_decay' when 'B24' then 'nuclear_industry' when 'B25' then 'nuclear_physics_practice' end
  where p_code in ('B21', 'B22', 'B23', 'B24', 'B25');
$$;

create or replace function public.enforce_fixed_nuclear_lesson()
returns trigger
language plpgsql
as $$
declare fixed record;
begin
  if tg_op = 'DELETE' then
    if old.curriculum_code is not null then
      raise exception 'Fixed Nuclear Physics curriculum lessons cannot be deleted';
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' and old.curriculum_code is not null then
    if new.curriculum_code is distinct from old.curriculum_code then
      raise exception 'Fixed Nuclear Physics lesson identity cannot be changed';
    end if;
    if new.class_id is distinct from old.class_id then
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
    if new.class_id is null then
      raise exception 'Fixed Nuclear Physics lessons must belong to a class';
    end if;
    select * into fixed from public.fixed_nuclear_lesson_values(new.curriculum_code);
    if fixed.lesson_title is null then
      raise exception 'Invalid fixed Nuclear Physics curriculum code';
    end if;
    new.title := fixed.lesson_title;
    new.curriculum_order := fixed.lesson_order;
    new.activity_key := fixed.lesson_activity_key;
  end if;
  return new;
end;
$$;

drop trigger if exists lessons_fixed_curriculum_values on public.lessons;
create trigger lessons_fixed_curriculum_values
before insert or update or delete on public.lessons
for each row execute function public.enforce_fixed_nuclear_lesson();

create or replace function public.seed_fixed_nuclear_curriculum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lessons (class_id, teacher_id, title, description, status, curriculum_code, curriculum_order, activity_key)
  select new.id, new.teacher_id, fixed.lesson_title, 'Chương IV — Vật lí hạt nhân', 'draft', code, fixed.lesson_order, fixed.lesson_activity_key
  from (values ('B21'), ('B22'), ('B23'), ('B24'), ('B25')) curriculum(code)
  cross join lateral public.fixed_nuclear_lesson_values(curriculum.code) fixed
  on conflict (class_id, curriculum_code) where curriculum_code is not null do nothing;
  return new;
end;
$$;

drop trigger if exists classes_seed_fixed_nuclear_curriculum on public.classes;
create trigger classes_seed_fixed_nuclear_curriculum
after insert on public.classes
for each row execute function public.seed_fixed_nuclear_curriculum();

insert into public.lessons (class_id, teacher_id, title, description, status, curriculum_code, curriculum_order, activity_key)
select c.id, c.teacher_id, fixed.lesson_title, 'Chương IV — Vật lí hạt nhân', 'draft', curriculum.code, fixed.lesson_order, fixed.lesson_activity_key
from public.classes c
cross join (values ('B21'), ('B22'), ('B23'), ('B24'), ('B25')) curriculum(code)
cross join lateral public.fixed_nuclear_lesson_values(curriculum.code) fixed
where not exists (
  select 1 from public.lessons l
  where l.class_id = c.id and l.curriculum_code = curriculum.code
)
on conflict (class_id, curriculum_code) where curriculum_code is not null do nothing;

drop policy if exists "lessons_teacher_insert" on public.lessons;
create policy "lessons_teacher_insert"
on public.lessons for insert to authenticated
with check (
  teacher_id = auth.uid()
  and public.is_teacher()
  and curriculum_code is null
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

create index if not exists lessons_curriculum_order_idx on public.lessons(curriculum_order);

commit;