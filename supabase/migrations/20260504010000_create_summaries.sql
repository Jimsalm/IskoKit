create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  file_id text,
  title text not null,
  input_type text not null,
  summary_type text not null,
  content text not null,
  source_text_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint summaries_input_type_check check (input_type in ('pasted_text', 'uploaded_file')),
  constraint summaries_summary_type_check check (summary_type in ('quick_summary', 'key_points', 'exam_reviewer'))
);

alter table public.summaries enable row level security;

create policy "Users can read their own summaries"
on public.summaries
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own summaries"
on public.summaries
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own summaries"
on public.summaries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own summaries"
on public.summaries
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

drop trigger if exists summaries_set_updated_at on public.summaries;

create trigger summaries_set_updated_at
before update on public.summaries
for each row
execute function public.set_updated_at();

create index if not exists summaries_user_id_created_at_idx
on public.summaries (user_id, created_at desc);

create index if not exists summaries_user_id_summary_type_idx
on public.summaries (user_id, summary_type);
