begin;

-- Create public.profile automatically whenever a Supabase Auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('teacher', 'student')
      then new.raw_user_meta_data ->> 'role'
    else 'student'
  end;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role
  )
  on conflict (id) do update
  set full_name = excluded.full_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Profiles are created by the trusted auth trigger, not directly by browser users.
drop policy if exists "profiles_insert_own" on public.profiles;

-- Prevent browser-authenticated users from changing their own role.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' and new.role is distinct from old.role then
    raise exception 'profile role cannot be changed by the current user';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change_trigger on public.profiles;

create trigger prevent_profile_role_change_trigger
before update on public.profiles
for each row execute procedure public.prevent_profile_role_change();

commit;
