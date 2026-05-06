create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text,
  title text not null,
  description text,
  due_date date not null,
  due_time time,
  priority text not null default 'medium',
  status text not null default 'pending',
  type text not null default 'homework',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assignments_title_check check (char_length(trim(title)) between 1 and 120),
  constraint assignments_description_check check (description is null or char_length(description) <= 1000),
  constraint assignments_subject_check check (subject is null or char_length(subject) <= 80),
  constraint assignments_priority_check check (priority in ('low', 'medium', 'high')),
  constraint assignments_status_check check (status in ('pending', 'in_progress', 'completed')),
  constraint assignments_type_check check (type in ('homework', 'quiz', 'project', 'exam', 'activity', 'report', 'other'))
);

alter table public.assignments enable row level security;

drop policy if exists "Users can read their own assignments" on public.assignments;
drop policy if exists "Users can create their own assignments" on public.assignments;
drop policy if exists "Users can update their own assignments" on public.assignments;
drop policy if exists "Users can delete their own assignments" on public.assignments;

create policy "Users can read their own assignments"
on public.assignments
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own assignments"
on public.assignments
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own assignments"
on public.assignments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own assignments"
on public.assignments
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assignments_set_updated_at on public.assignments;

create trigger assignments_set_updated_at
before update on public.assignments
for each row
execute function public.set_updated_at();

create index if not exists assignments_user_id_due_date_idx
on public.assignments (user_id, due_date, due_time);

create index if not exists assignments_user_id_status_idx
on public.assignments (user_id, status);

create index if not exists assignments_user_id_subject_idx
on public.assignments (user_id, subject)
where subject is not null;

create index if not exists assignments_user_id_created_at_idx
on public.assignments (user_id, created_at desc);
