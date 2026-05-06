create table if not exists public.gwa_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  semester text not null,
  school_year text not null,
  gwa numeric(4,2) not null,
  total_units numeric(6,2) not null,
  total_subjects integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gwa_records_semester_check check (char_length(trim(semester)) between 1 and 80),
  constraint gwa_records_school_year_check check (char_length(trim(school_year)) between 1 and 40),
  constraint gwa_records_gwa_check check (gwa between 1.00 and 5.00),
  constraint gwa_records_total_units_check check (total_units > 0),
  constraint gwa_records_total_subjects_check check (total_subjects > 0)
);

create table if not exists public.gwa_subjects (
  id uuid primary key default gen_random_uuid(),
  gwa_record_id uuid not null references public.gwa_records(id) on delete cascade,
  subject_name text not null,
  subject_code text,
  units numeric(5,2) not null,
  grade text not null,
  is_included boolean not null default true,
  created_at timestamptz not null default now(),
  constraint gwa_subjects_subject_name_check check (char_length(trim(subject_name)) between 1 and 160),
  constraint gwa_subjects_subject_code_check check (subject_code is null or char_length(subject_code) <= 40),
  constraint gwa_subjects_units_check check (units > 0),
  constraint gwa_subjects_grade_check check (grade in ('1.00', '1.25', '1.50', '1.75', '2.00', '2.25', '2.50', '2.75', '3.00', '4.00', '5.00', 'INC', 'DRP', 'NFE', 'P', 'F'))
);

alter table public.gwa_records enable row level security;
alter table public.gwa_subjects enable row level security;

drop policy if exists "Users can read their own GWA records" on public.gwa_records;
drop policy if exists "Users can create their own GWA records" on public.gwa_records;
drop policy if exists "Users can update their own GWA records" on public.gwa_records;
drop policy if exists "Users can delete their own GWA records" on public.gwa_records;

create policy "Users can read their own GWA records"
on public.gwa_records
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own GWA records"
on public.gwa_records
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own GWA records"
on public.gwa_records
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own GWA records"
on public.gwa_records
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read subjects from their own GWA records" on public.gwa_subjects;
drop policy if exists "Users can create subjects for their own GWA records" on public.gwa_subjects;
drop policy if exists "Users can update subjects for their own GWA records" on public.gwa_subjects;
drop policy if exists "Users can delete subjects from their own GWA records" on public.gwa_subjects;

create policy "Users can read subjects from their own GWA records"
on public.gwa_subjects
for select
to authenticated
using (
  exists (
    select 1
    from public.gwa_records
    where public.gwa_records.id = public.gwa_subjects.gwa_record_id
      and public.gwa_records.user_id = (select auth.uid())
  )
);

create policy "Users can create subjects for their own GWA records"
on public.gwa_subjects
for insert
to authenticated
with check (
  exists (
    select 1
    from public.gwa_records
    where public.gwa_records.id = public.gwa_subjects.gwa_record_id
      and public.gwa_records.user_id = (select auth.uid())
  )
);

create policy "Users can update subjects for their own GWA records"
on public.gwa_subjects
for update
to authenticated
using (
  exists (
    select 1
    from public.gwa_records
    where public.gwa_records.id = public.gwa_subjects.gwa_record_id
      and public.gwa_records.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.gwa_records
    where public.gwa_records.id = public.gwa_subjects.gwa_record_id
      and public.gwa_records.user_id = (select auth.uid())
  )
);

create policy "Users can delete subjects from their own GWA records"
on public.gwa_subjects
for delete
to authenticated
using (
  exists (
    select 1
    from public.gwa_records
    where public.gwa_records.id = public.gwa_subjects.gwa_record_id
      and public.gwa_records.user_id = (select auth.uid())
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

drop trigger if exists gwa_records_set_updated_at on public.gwa_records;

create trigger gwa_records_set_updated_at
before update on public.gwa_records
for each row
execute function public.set_updated_at();

create index if not exists gwa_records_user_id_created_at_idx
on public.gwa_records (user_id, created_at desc);

create index if not exists gwa_records_user_id_school_year_idx
on public.gwa_records (user_id, school_year);

create index if not exists gwa_subjects_gwa_record_id_idx
on public.gwa_subjects (gwa_record_id);
