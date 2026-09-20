begin;

create or replace function public.list_class_members_for_teacher(p_class_id uuid)
returns table (
  student_id uuid,
  full_name text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'teacher'
  ) then
    return;
  end if;

  if not exists (
    select 1
    from public.classes
    where id = p_class_id
      and teacher_id = auth.uid()
  ) then
    return;
  end if;

  return query
  select cm.student_id, p.full_name, cm.joined_at
  from public.class_members cm
  join public.profiles p on p.id = cm.student_id
  where cm.class_id = p_class_id
    and p.role = 'student'
  order by cm.joined_at asc;
end;
$$;

revoke all on function public.list_class_members_for_teacher(uuid) from public;
grant execute on function public.list_class_members_for_teacher(uuid) to authenticated;

commit;