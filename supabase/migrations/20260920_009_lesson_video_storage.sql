begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lesson-videos', 'lesson-videos', false, 524288000, array['video/mp4', 'video/webm', 'video/quicktime']::text[])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "lesson_videos_teacher_insert_owned"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'lesson-videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.is_teacher()
);

create policy "lesson_videos_teacher_select_owned"
on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "lesson_videos_teacher_delete_owned"
on storage.objects for delete to authenticated
using (
  bucket_id = 'lesson-videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.is_teacher()
);

create policy "lesson_videos_student_select_member_lesson"
on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-videos'
  and exists (
    select 1
    from public.lessons l
    where l.id::text = (storage.foldername(name))[2]
      and l.status = 'published'
      and l.class_id is not null
      and public.is_class_member(l.class_id)
  )
);

commit;