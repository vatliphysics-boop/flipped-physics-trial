begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null check (role in ('teacher', 'student')),
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create index if not exists classes_teacher_id_idx on public.classes(teacher_id);
create index if not exists class_members_class_id_idx on public.class_members(class_id);
create index if not exists class_members_student_id_idx on public.class_members(student_id);
create index if not exists topics_teacher_id_idx on public.topics(teacher_id);
create index if not exists lessons_topic_id_idx on public.lessons(topic_id);
create index if not exists lessons_class_id_idx on public.lessons(class_id);
create index if not exists lessons_teacher_id_idx on public.lessons(teacher_id);
create index if not exists lessons_status_idx on public.lessons(status);

-- Helper functions are SECURITY DEFINER so policy checks do not recurse through RLS.
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

create or replace function public.is_class_teacher(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes
    where id = target_class_id and teacher_id = auth.uid()
  );
$$;

create or replace function public.is_class_member(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members
    where class_id = target_class_id and student_id = auth.uid()
  );
$$;

revoke all on function public.is_teacher() from public;
revoke all on function public.is_class_teacher(uuid) from public;
revoke all on function public.is_class_member(uuid) from public;
grant execute on function public.is_teacher() to authenticated;
grant execute on function public.is_class_teacher(uuid) to authenticated;
grant execute on function public.is_class_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.topics enable row level security;
alter table public.lessons enable row level security;

-- Profiles: users can manage only their own profile.
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Classes: teachers manage their own classes; students can read classes they joined.
create policy "classes_teacher_select"
on public.classes for select
to authenticated
using (teacher_id = auth.uid());

create policy "classes_student_select_joined"
on public.classes for select
to authenticated
using (public.is_class_member(id));

create policy "classes_teacher_insert"
on public.classes for insert
to authenticated
with check (teacher_id = auth.uid() and public.is_teacher());

create policy "classes_teacher_update"
on public.classes for update
to authenticated
using (teacher_id = auth.uid() and public.is_teacher())
with check (teacher_id = auth.uid() and public.is_teacher());

create policy "classes_teacher_delete"
on public.classes for delete
to authenticated
using (teacher_id = auth.uid() and public.is_teacher());

-- Memberships: students can read their own rows; class teachers can read/manage rows for their classes.
create policy "class_members_student_select_own"
on public.class_members for select
to authenticated
using (student_id = auth.uid());

create policy "class_members_teacher_select"
on public.class_members for select
to authenticated
using (public.is_class_teacher(class_id));

create policy "class_members_teacher_insert"
on public.class_members for insert
to authenticated
with check (public.is_class_teacher(class_id));

create policy "class_members_teacher_delete"
on public.class_members for delete
to authenticated
using (public.is_class_teacher(class_id));

-- Topics: teachers manage only their own topics.
create policy "topics_teacher_select"
on public.topics for select
to authenticated
using (teacher_id = auth.uid());

create policy "topics_teacher_insert"
on public.topics for insert
to authenticated
with check (teacher_id = auth.uid() and public.is_teacher());

create policy "topics_teacher_update"
on public.topics for update
to authenticated
using (teacher_id = auth.uid() and public.is_teacher())
with check (teacher_id = auth.uid() and public.is_teacher());

create policy "topics_teacher_delete"
on public.topics for delete
to authenticated
using (teacher_id = auth.uid() and public.is_teacher());

-- Lessons: teachers manage their own lessons.
create policy "lessons_teacher_select"
on public.lessons for select
to authenticated
using (teacher_id = auth.uid());

create policy "lessons_teacher_insert"
on public.lessons for insert
to authenticated
with check (teacher_id = auth.uid() and public.is_teacher());

create policy "lessons_teacher_update"
on public.lessons for update
to authenticated
using (teacher_id = auth.uid() and public.is_teacher())
with check (teacher_id = auth.uid() and public.is_teacher());

create policy "lessons_teacher_delete"
on public.lessons for delete
to authenticated
using (teacher_id = auth.uid() and public.is_teacher());

-- Students may read only published lessons assigned to a class they joined.
create policy "lessons_student_select_published"
on public.lessons for select
to authenticated
using (
  status = 'published'
  and class_id is not null
  and public.is_class_member(class_id)
);

commit;
