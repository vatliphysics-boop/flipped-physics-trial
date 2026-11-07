-- Apply after 017 and 018. Private teacher plans; draft-only, atomic lesson import.
begin;
alter table public.material_bank drop constraint if exists material_bank_material_type_check;
alter table public.material_bank add constraint material_bank_material_type_check check (material_type in ('image','animation','real_video','lecture_video','simulation','document','colab','assessment'));
alter table public.lesson_pathway_steps drop constraint if exists lesson_pathway_steps_step_type_check;
alter table public.lesson_pathway_steps add constraint lesson_pathway_steps_step_type_check check (step_type in ('image','animation','real_video','lecture_video','simulation','document','colab','assessment','checkpoint','exercise','reflection'));

create table if not exists public.teacher_teaching_plans (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  lesson_code text not null check (lesson_code in ('B21','B22','B23','B24','B25','general')),
  plan jsonb not null check (jsonb_typeof(plan) = 'object' and octet_length(plan::text) <= 800000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.teacher_teaching_plans enable row level security;
drop policy if exists teacher_owns_plan on public.teacher_teaching_plans;
create policy teacher_owns_plan on public.teacher_teaching_plans for all to authenticated
using (teacher_id = auth.uid() and public.is_teacher())
with check (teacher_id = auth.uid() and public.is_teacher());
create index if not exists teacher_plans_owner_updated on public.teacher_teaching_plans (teacher_id, updated_at desc);

create table if not exists public.teacher_plan_applications (
  plan_id uuid not null references public.teacher_teaching_plans(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, lesson_id)
);
alter table public.teacher_plan_applications enable row level security;
drop policy if exists teacher_reads_own_plan_applications on public.teacher_plan_applications;
create policy teacher_reads_own_plan_applications on public.teacher_plan_applications for select to authenticated using (teacher_id = auth.uid() and public.is_teacher());

create or replace function public.apply_teacher_plan_draft(p_plan_id uuid, p_lesson_id uuid, p_steps jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  item jsonb;
  bank_id uuid;
  next_order integer;
  inserted integer := 0;
begin
  if actor is null or not public.is_teacher() then raise exception 'teacher_required'; end if;
  -- Row locks serialize imports into one lesson and edits/imports of this plan.
  perform 1 from public.lessons where id = p_lesson_id and teacher_id = actor for update;
  if not found then raise exception 'lesson_not_owned'; end if;
  perform 1 from public.teacher_teaching_plans where id = p_plan_id and teacher_id = actor for update;
  if not found then raise exception 'plan_not_owned'; end if;
  if exists(select 1 from public.teacher_plan_applications where plan_id=p_plan_id and lesson_id=p_lesson_id) then raise exception 'already_applied'; end if;
  if p_steps is null or jsonb_typeof(p_steps) is distinct from 'array' then raise exception 'invalid_steps'; end if;
  if jsonb_array_length(p_steps) not between 1 and 720 then raise exception 'invalid_steps'; end if;
  for item in select value from jsonb_array_elements(p_steps) loop
    if coalesce(item->>'phase','') not in ('before_class','in_class','after_class')
      or coalesce(item->>'step_type','') not in ('image','animation','real_video','lecture_video','simulation','document','colab','assessment')
      or length(coalesce(item->>'title','')) not between 1 and 300
      or length(coalesce(item->>'instructions','')) > 8000
      or length(coalesce(item->>'content_url','')) not between 1 and 2000
      then raise exception 'invalid_step'; end if;
    bank_id := null;
    if nullif(item->>'material_id','') is not null then
      select id into bank_id from public.material_bank where id=(item->>'material_id')::uuid and (teacher_id=actor or is_system);
      if bank_id is null then raise exception 'material_not_owned'; end if;
    elsif nullif(item->>'canonical_material_id','') is null then
      -- App server supplies validated URLs. This also rejects unsafe direct RPC submissions.
      if (item->>'content_url') !~ '^(https?://|/[^/]|activity:[a-z_]+$)' or (item->>'content_url') ~ '[[:cntrl:]<>"\\]' then raise exception 'unsafe_source'; end if;
      insert into public.material_bank(teacher_id,title,description,material_type,category,content_url,is_published,is_system)
      values(actor,item->>'title','Từ kế hoạch riêng; rà soát và xuất bản trước khi giao.',item->>'step_type','nuclear_physics',item->>'content_url',false,false)
      returning id into bank_id;
    else
      if (item->>'canonical_material_id') !~ '^system-[a-zA-Z0-9_-]+$' then raise exception 'invalid_canonical_id'; end if;
    end if;
    select coalesce(max(step_order),0)+1 into next_order from public.lesson_pathway_steps where lesson_id=p_lesson_id and phase=item->>'phase';
    insert into public.lesson_pathway_steps(lesson_id,phase,material_id,title,instructions,step_order,is_required,is_published,step_type,config)
    values(p_lesson_id,item->>'phase',bank_id,item->>'title',item->>'instructions',next_order,true,false,item->>'step_type',jsonb_build_object('canonical_material_id',item->>'canonical_material_id','content_url',item->>'content_url','teacher_plan_id',p_plan_id));
    inserted := inserted+1;
  end loop;
  insert into public.teacher_plan_applications(plan_id,lesson_id,teacher_id) values(p_plan_id,p_lesson_id,actor);
  return jsonb_build_object('success',true,'count',inserted);
end $$;
revoke all on function public.apply_teacher_plan_draft(uuid,uuid,jsonb) from public,anon;
grant execute on function public.apply_teacher_plan_draft(uuid,uuid,jsonb) to authenticated;
commit;
