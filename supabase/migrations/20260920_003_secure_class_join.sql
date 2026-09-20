begin;

create or replace function public.join_class_by_code(p_join_code text)
returns table (
  success boolean,
  message text,
  class_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text;
  target_class_id uuid;
  current_user_id uuid;
  inserted_membership_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    return query select false, 'Bạn cần đăng nhập để tham gia lớp học.', null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = current_user_id
      and role = 'student'
  ) then
    return query select false, 'Bạn không có quyền tham gia lớp học.', null::uuid;
    return;
  end if;

  normalized_code := upper(trim(coalesce(p_join_code, '')));

  if normalized_code = '' then
    return query select false, 'Vui lòng nhập mã lớp.', null::uuid;
    return;
  end if;

  select id
  into target_class_id
  from public.classes
  where join_code = normalized_code;

  if target_class_id is null then
    return query select false, 'Không tìm thấy lớp học với mã này.', null::uuid;
    return;
  end if;

  if exists (
    select 1
    from public.class_members
    where class_id = target_class_id
      and student_id = current_user_id
  ) then
    return query select false, 'Bạn đã tham gia lớp học này.', target_class_id;
    return;
  end if;

  insert into public.class_members (class_id, student_id)
  values (target_class_id, current_user_id)
  on conflict (class_id, student_id) do nothing
  returning id into inserted_membership_id;

  if inserted_membership_id is not null then
    return query select true, 'Tham gia lớp học thành công.', target_class_id;
  end if;

  return query select false, 'Không thể tham gia lớp học. Vui lòng thử lại.', target_class_id;
end;
$$;

revoke all on function public.join_class_by_code(text) from public;
grant execute on function public.join_class_by_code(text) to authenticated;

commit;