begin;

drop policy if exists "lesson_videos_teacher_insert_owned" on storage.objects;
drop policy if exists "lesson_videos_teacher_select_owned" on storage.objects;
drop policy if exists "lesson_videos_teacher_delete_owned" on storage.objects;
drop policy if exists "lesson_videos_student_select_member_lesson" on storage.objects;

create policy "lesson_videos_teacher_insert_owned"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'lesson-videos'
  and public.is_teacher()
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.lessons l
    where l.id::text = (storage.foldername(name))[2]
      and l.teacher_id = auth.uid()
  )
);

create policy "lesson_videos_teacher_select_owned"
on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-videos'
  and exists (
    select 1 from public.lessons l
    where l.id::text = (storage.foldername(name))[2]
      and l.teacher_id = auth.uid()
  )
);

create policy "lesson_videos_teacher_delete_owned"
on storage.objects for delete to authenticated
using (
  bucket_id = 'lesson-videos'
  and public.is_teacher()
  and exists (
    select 1 from public.lessons l
    where l.id::text = (storage.foldername(name))[2]
      and l.teacher_id = auth.uid()
  )
);

create policy "lesson_videos_student_select_member_lesson"
on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-videos'
  and exists (
    select 1
    from public.lessons l
    join public.lesson_materials m on m.lesson_id = l.id
    where l.id::text = (storage.foldername(name))[2]
      and m.content_url = 'storage:lesson-videos/' || name
      and m.material_type = 'video'
      and m.is_published = true
      and l.status = 'published'
      and l.class_id is not null
      and public.is_class_member(l.class_id)
  )
);

commit;