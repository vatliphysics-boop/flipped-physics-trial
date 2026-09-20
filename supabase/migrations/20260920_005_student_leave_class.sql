begin;

create policy "class_members_student_delete_own"
on public.class_members for delete
to authenticated
using (
  student_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'student'
  )
);

commit;