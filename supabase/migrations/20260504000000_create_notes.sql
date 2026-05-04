create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  color text,
  is_pinned boolean not null default false,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_source_check check (source in ('manual', 'ai_summary', 'imported'))
);

alter table public.notes enable row level security;

create policy "Users can read their own notes"
on public.notes
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own notes"
on public.notes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own notes"
on public.notes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own notes"
on public.notes
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;

create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

create index if not exists notes_user_id_created_at_idx
on public.notes (user_id, created_at desc);

create index if not exists notes_user_id_is_pinned_idx
on public.notes (user_id, is_pinned desc);
