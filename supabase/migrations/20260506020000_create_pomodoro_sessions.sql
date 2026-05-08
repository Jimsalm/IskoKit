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

alter table public.pomodoro_sessions enable row level security;

drop policy if exists "Users can read their own Pomodoro sessions" on public.pomodoro_sessions;
drop policy if exists "Users can create their own Pomodoro sessions" on public.pomodoro_sessions;

create policy "Users can read their own Pomodoro sessions"
on public.pomodoro_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own Pomodoro sessions"
on public.pomodoro_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create index if not exists pomodoro_sessions_user_id_completed_at_idx
on public.pomodoro_sessions (user_id, completed_at desc);

create index if not exists pomodoro_sessions_user_id_completed_focus_idx
on public.pomodoro_sessions (user_id, completed_at desc)
where mode = 'focus' and status = 'completed';
