begin;

-- Do not expose correct answers through the student-facing API.
create or replace view public.student_video_checkpoints
with (security_invoker = true) as
select id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d, sort_order
from public.video_checkpoints;
grant select on public.student_video_checkpoints to authenticated;

create table if not exists public.video_checkpoint_attempts (
  id uuid primary key default gen_random_uuid(),
  checkpoint_id uuid not null references public.video_checkpoints(id) on delete cascade,
  material_id uuid not null references public.lesson_materials(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);
create index if not exists video_checkpoint_attempts_student_checkpoint_idx
  on public.video_checkpoint_attempts(student_id, checkpoint_id, attempted_at desc);
alter table public.video_checkpoint_attempts enable row level security;
create policy "video_checkpoint_attempts_student_select" on public.video_checkpoint_attempts
for select to authenticated using (student_id = auth.uid());

-- Direct writes would let a browser forge completion. Progress is recorded only below.
drop policy if exists "lesson_material_progress_student_manage" on public.lesson_material_progress;
create policy "lesson_material_progress_student_select" on public.lesson_material_progress
for select to authenticated using (student_id = auth.uid());

create or replace function public.record_video_progress(p_material_id uuid, p_watched_seconds numeric)
returns table (watched_seconds numeric, completion_percent numeric, is_complete boolean, answered_checkpoint_ids jsonb)
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_duration numeric; v_checkpoint_total integer; v_answered jsonb; v_complete boolean;
begin
  if v_user is null or p_watched_seconds is null or p_watched_seconds < 0 or p_watched_seconds > 86400 then raise exception 'invalid progress payload'; end if;
  select m.duration_minutes * 60 into v_duration from lesson_materials m join lessons l on l.id=m.lesson_id
    where m.id=p_material_id and m.material_type='video' and m.phase='before_class' and m.is_published and l.status='published'
      and exists (select 1 from class_members cm where cm.class_id=l.class_id and cm.student_id=v_user);
  if not found then raise exception 'material unavailable'; end if;
  select count(*) into v_checkpoint_total from video_checkpoints where material_id=p_material_id;
  select coalesce(jsonb_agg(distinct a.checkpoint_id), '[]'::jsonb) into v_answered from video_checkpoint_attempts a
    where a.material_id=p_material_id and a.student_id=v_user and a.is_correct;
  v_complete := p_watched_seconds >= greatest(coalesce(v_duration, 0) * .9, 1)
    and (v_checkpoint_total = 0 or jsonb_array_length(v_answered) >= v_checkpoint_total);
  insert into lesson_material_progress(material_id, student_id, watched_seconds, completion_percent, answered_checkpoints, is_complete, updated_at)
  values (p_material_id, v_user, least(p_watched_seconds, coalesce(v_duration, p_watched_seconds)),
    case when coalesce(v_duration,0)>0 then least(100, round(least(p_watched_seconds,v_duration)/v_duration*100,2)) else 0 end,
    v_answered, v_complete, now())
  on conflict (material_id, student_id) do update set watched_seconds=greatest(lesson_material_progress.watched_seconds, excluded.watched_seconds),
    completion_percent=greatest(lesson_material_progress.completion_percent, excluded.completion_percent), answered_checkpoints=excluded.answered_checkpoints,
    is_complete=lesson_material_progress.is_complete or excluded.is_complete, updated_at=now()
  returning lesson_material_progress.watched_seconds, lesson_material_progress.completion_percent, lesson_material_progress.is_complete, lesson_material_progress.answered_checkpoints
  into watched_seconds, completion_percent, is_complete, answered_checkpoint_ids;
  return next;
end; $$;

create or replace function public.submit_video_checkpoint(p_material_id uuid, p_checkpoint_id uuid, p_selected_option text)
returns table (is_correct boolean, attempt_count integer)
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_answer text; v_count integer;
begin
  if v_user is null or p_selected_option not in ('A','B','C','D') then raise exception 'invalid checkpoint payload'; end if;
  select c.correct_option into v_answer from video_checkpoints c join lesson_materials m on m.id=c.material_id join lessons l on l.id=m.lesson_id
    where c.id=p_checkpoint_id and c.material_id=p_material_id and m.is_published and l.status='published'
      and exists (select 1 from class_members cm where cm.class_id=l.class_id and cm.student_id=v_user);
  if not found then raise exception 'checkpoint unavailable'; end if;
  is_correct := p_selected_option = v_answer;
  insert into video_checkpoint_attempts(checkpoint_id, material_id, student_id, selected_option, is_correct)
    values(p_checkpoint_id, p_material_id, v_user, p_selected_option, is_correct);
  select count(*) into v_count from video_checkpoint_attempts where checkpoint_id=p_checkpoint_id and student_id=v_user;
  attempt_count := v_count; return next;
end; $$;

revoke all on function public.record_video_progress(uuid, numeric) from public;
revoke all on function public.submit_video_checkpoint(uuid, uuid, text) from public;
grant execute on function public.record_video_progress(uuid, numeric) to authenticated;
grant execute on function public.submit_video_checkpoint(uuid, uuid, text) to authenticated;
commit;
