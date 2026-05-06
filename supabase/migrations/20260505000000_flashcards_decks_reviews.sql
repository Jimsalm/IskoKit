create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  subject text not null,
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flashcard_decks_title_check check (char_length(trim(title)) between 1 and 120),
  constraint flashcard_decks_subject_check check (char_length(trim(subject)) between 1 and 80),
  constraint flashcard_decks_description_check check (description is null or char_length(description) <= 240)
);

alter table public.flashcard_decks enable row level security;

create policy "Users can read their own flashcard decks"
on public.flashcard_decks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own flashcard decks"
on public.flashcard_decks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own flashcard decks"
on public.flashcard_decks
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own flashcard decks"
on public.flashcard_decks
for delete
to authenticated
using ((select auth.uid()) = user_id);

alter table public.flashcards
add column if not exists deck_id uuid references public.flashcard_decks(id) on delete cascade,
add column if not exists review_count integer not null default 0,
add column if not exists correct_count integer not null default 0,
add column if not exists incorrect_count integer not null default 0,
add column if not exists difficulty_level integer not null default 0,
add column if not exists last_reviewed_at timestamptz,
add column if not exists next_review_at timestamptz;

alter table public.flashcards
drop constraint if exists flashcards_type_check,
drop constraint if exists flashcards_source_type_check,
drop constraint if exists flashcards_source_id_check,
drop constraint if exists flashcards_review_count_check,
drop constraint if exists flashcards_correct_count_check,
drop constraint if exists flashcards_incorrect_count_check,
drop constraint if exists flashcards_difficulty_level_check;

alter table public.flashcards
add constraint flashcards_type_check check (type in ('qa', 'definition', 'exam_prep', 'concept_check')),
add constraint flashcards_source_type_check check (source_type in ('manual', 'manual_text', 'note', 'summary')),
add constraint flashcards_source_id_check check (
  (source_type in ('manual', 'manual_text') and source_id is null)
  or (source_type in ('note', 'summary') and source_id is not null)
),
add constraint flashcards_review_count_check check (review_count >= 0),
add constraint flashcards_correct_count_check check (correct_count >= 0),
add constraint flashcards_incorrect_count_check check (incorrect_count >= 0),
add constraint flashcards_difficulty_level_check check (difficulty_level between 0 and 10);

drop policy if exists "Users can create their own flashcards" on public.flashcards;
drop policy if exists "Users can update their own flashcards" on public.flashcards;

create policy "Users can create their own flashcards"
on public.flashcards
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and deck_id is not null
  and exists (
    select 1
    from public.flashcard_decks
    where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = (select auth.uid())
  )
);

create policy "Users can update their own flashcards"
on public.flashcards
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and deck_id is not null
  and exists (
    select 1
    from public.flashcard_decks
    where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = (select auth.uid())
  )
);

create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  result text not null,
  rating text,
  reviewed_at timestamptz not null default now(),
  constraint flashcard_reviews_result_check check (result in ('correct', 'incorrect')),
  constraint flashcard_reviews_rating_check check (rating is null or rating in ('easy', 'good', 'hard'))
);

alter table public.flashcard_reviews enable row level security;

create policy "Users can read their own flashcard reviews"
on public.flashcard_reviews
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own flashcard reviews"
on public.flashcard_reviews
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.flashcards
    where flashcards.id = flashcard_reviews.flashcard_id
      and flashcards.deck_id = flashcard_reviews.deck_id
      and flashcards.user_id = (select auth.uid())
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists flashcard_decks_set_updated_at on public.flashcard_decks;

create trigger flashcard_decks_set_updated_at
before update on public.flashcard_decks
for each row
execute function public.set_updated_at();

drop trigger if exists flashcards_set_updated_at on public.flashcards;

create trigger flashcards_set_updated_at
before update on public.flashcards
for each row
execute function public.set_updated_at();

create index if not exists flashcard_decks_user_id_updated_at_idx
on public.flashcard_decks (user_id, updated_at desc);

create index if not exists flashcard_decks_user_id_subject_idx
on public.flashcard_decks (user_id, subject);

create index if not exists flashcards_user_id_deck_id_created_at_idx
on public.flashcards (user_id, deck_id, created_at desc)
where deck_id is not null;

create index if not exists flashcards_user_id_deck_id_next_review_at_idx
on public.flashcards (user_id, deck_id, next_review_at)
where deck_id is not null;

create index if not exists flashcard_reviews_user_id_deck_id_reviewed_at_idx
on public.flashcard_reviews (user_id, deck_id, reviewed_at desc);

create index if not exists flashcard_reviews_user_id_flashcard_id_idx
on public.flashcard_reviews (user_id, flashcard_id);
