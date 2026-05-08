create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text,
  task_label text,
  mode text not null,
  duration_minutes integer not null,
  actual_minutes integer not null,
  status text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint pomodoro_sessions_subject_check check (subject is null or char_length(trim(subject)) between 1 and 80),
  constraint pomodoro_sessions_task_label_check check (task_label is null or char_length(trim(task_label)) between 1 and 120),
  constraint pomodoro_sessions_mode_check check (mode in ('focus', 'short_break', 'long_break')),
  constraint pomodoro_sessions_status_check check (status in ('completed', 'cancelled')),
  constraint pomodoro_sessions_duration_minutes_check check (duration_minutes > 0 and duration_minutes <= 180),
  constraint pomodoro_sessions_actual_minutes_check check (actual_minutes > 0 and actual_minutes <= duration_minutes),
  constraint pomodoro_sessions_completed_at_check check (status <> 'completed' or completed_at is not null),
  constraint pomodoro_sessions_completed_after_started_check check (completed_at is null or completed_at >= started_at)
);

create table if not exists public.pomodoro_timer_starts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text,
  task_label text,
  mode text not null default 'focus',
  duration_minutes integer not null default 25,
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint pomodoro_timer_starts_subject_check check (subject is null or char_length(trim(subject)) between 1 and 80),
  constraint pomodoro_timer_starts_task_label_check check (task_label is null or char_length(trim(task_label)) between 1 and 120),
  constraint pomodoro_timer_starts_mode_check check (mode = 'focus'),
  constraint pomodoro_timer_starts_duration_minutes_check check (duration_minutes = 25)
);

alter table public.pomodoro_sessions enable row level security;
alter table public.pomodoro_timer_starts enable row level security;

drop policy if exists "Users can read their own Pomodoro sessions" on public.pomodoro_sessions;
drop policy if exists "Users can create their own Pomodoro sessions" on public.pomodoro_sessions;

create policy "Users can read their own Pomodoro sessions"
on public.pomodoro_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.start_pomodoro_session(
  p_subject text,
  p_task_label text
)
returns table (
  id uuid,
  subject text,
  task_label text,
  mode text,
  duration_minutes integer,
  started_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_subject text := nullif(trim(coalesce(p_subject, '')), '');
  v_task_label text := nullif(trim(coalesce(p_task_label, '')), '');
  v_duration_minutes integer := 25;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if v_subject is not null and char_length(v_subject) > 80 then
    raise exception 'Keep the subject under 80 characters.';
  end if;

  if v_task_label is not null and char_length(v_task_label) > 120 then
    raise exception 'Keep the task label under 120 characters.';
  end if;

  delete from public.pomodoro_timer_starts as pts
  where pts.user_id = v_user_id
    and pts.mode = 'focus';

  return query
  insert into public.pomodoro_timer_starts as pts (
    user_id,
    subject,
    task_label,
    mode,
    duration_minutes
  )
  values (
    v_user_id,
    v_subject,
    v_task_label,
    'focus',
    v_duration_minutes
  )
  returning
    pts.id,
    pts.subject,
    pts.task_label,
    pts.mode,
    pts.duration_minutes,
    pts.started_at;
end;
$$;

create or replace function public.complete_pomodoro_session(
  p_timer_id uuid
)
returns table (
  id uuid,
  subject text,
  task_label text,
  mode text,
  duration_minutes integer,
  actual_minutes integer,
  status text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_timer public.pomodoro_timer_starts%rowtype;
  v_completed_at timestamptz := now();
  v_elapsed_seconds numeric;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into v_timer
  from public.pomodoro_timer_starts as pts
  where pts.id = p_timer_id
    and pts.user_id = v_user_id
    and pts.mode = 'focus'
  for update;

  if v_timer.id is null then
    raise exception 'Pomodoro timer was not found.';
  end if;

  v_elapsed_seconds := extract(epoch from (v_completed_at - v_timer.started_at));

  if v_elapsed_seconds < ((v_timer.duration_minutes * 60) - 30) then
    raise exception 'Focus session is not complete yet.';
  end if;

  return query
  insert into public.pomodoro_sessions as ps (
    user_id,
    subject,
    task_label,
    mode,
    duration_minutes,
    actual_minutes,
    status,
    started_at,
    completed_at
  )
  values (
    v_user_id,
    v_timer.subject,
    v_timer.task_label,
    'focus',
    v_timer.duration_minutes,
    v_timer.duration_minutes,
    'completed',
    v_timer.started_at,
    v_completed_at
  )
  returning
    ps.id,
    ps.subject,
    ps.task_label,
    ps.mode,
    ps.duration_minutes,
    ps.actual_minutes,
    ps.status,
    ps.started_at,
    ps.completed_at,
    ps.created_at;

  delete from public.pomodoro_timer_starts as pts
  where pts.id = v_timer.id
    and pts.user_id = v_user_id;
end;
$$;

create or replace function public.cancel_pomodoro_session(
  p_timer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  delete from public.pomodoro_timer_starts as pts
  where pts.id = p_timer_id
    and pts.user_id = v_user_id;
end;
$$;

revoke all on function public.start_pomodoro_session(text, text) from public;
revoke all on function public.complete_pomodoro_session(uuid) from public;
revoke all on function public.cancel_pomodoro_session(uuid) from public;
grant execute on function public.start_pomodoro_session(text, text) to authenticated;
grant execute on function public.complete_pomodoro_session(uuid) to authenticated;
grant execute on function public.cancel_pomodoro_session(uuid) to authenticated;

create index if not exists pomodoro_sessions_user_id_completed_at_idx
on public.pomodoro_sessions (user_id, completed_at desc);

create index if not exists pomodoro_sessions_user_id_completed_focus_idx
on public.pomodoro_sessions (user_id, completed_at desc)
where mode = 'focus' and status = 'completed';

create index if not exists pomodoro_timer_starts_user_id_started_at_idx
on public.pomodoro_timer_starts (user_id, started_at desc);
