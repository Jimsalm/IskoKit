create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text,
  question text not null,
  answer text not null,
  difficulty text not null,
  type text not null,
  source_type text not null,
  source_id uuid,
  is_ai_generated boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flashcards_difficulty_check check (difficulty in ('easy', 'medium', 'hard')),
  constraint flashcards_type_check check (type in ('qa', 'definition', 'exam_prep')),
  constraint flashcards_source_type_check check (source_type in ('manual_text', 'note', 'summary')),
  constraint flashcards_source_id_check check (
    (source_type = 'manual_text' and source_id is null)
    or (source_type in ('note', 'summary') and source_id is not null)
  )
);

alter table public.flashcards enable row level security;

create policy "Users can read their own flashcards"
on public.flashcards
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own flashcards"
on public.flashcards
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
on public.flashcards
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
on public.flashcards
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

drop trigger if exists flashcards_set_updated_at on public.flashcards;

create trigger flashcards_set_updated_at
before update on public.flashcards
for each row
execute function public.set_updated_at();

create index if not exists flashcards_user_id_created_at_idx
on public.flashcards (user_id, created_at desc);

create index if not exists flashcards_user_id_subject_idx
on public.flashcards (user_id, subject);

create index if not exists flashcards_user_id_difficulty_type_idx
on public.flashcards (user_id, difficulty, type);
