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

create or replace function public.save_gwa_record(
  p_record_id uuid,
  p_semester text,
  p_school_year text,
  p_subjects jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_record_id uuid;
  v_subject jsonb;
  v_subject_name text;
  v_subject_code text;
  v_units numeric;
  v_units_text text;
  v_grade text;
  v_is_included boolean;
  v_total_units numeric := 0;
  v_total_subjects integer := 0;
  v_total_weighted_grades numeric := 0;
  v_gwa numeric;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if char_length(trim(coalesce(p_semester, ''))) not between 1 and 80 then
    raise exception 'Semester is required.';
  end if;

  if char_length(trim(coalesce(p_school_year, ''))) not between 1 and 40 then
    raise exception 'School year is required.';
  end if;

  if p_subjects is null
    or jsonb_typeof(p_subjects) <> 'array'
    or jsonb_array_length(p_subjects) = 0 then
    raise exception 'Save at least one subject breakdown.';
  end if;

  for v_subject in
    select value
    from jsonb_array_elements(p_subjects)
  loop
    v_subject_name := trim(coalesce(v_subject ->> 'subjectName', ''));
    v_subject_code := nullif(trim(coalesce(v_subject ->> 'subjectCode', '')), '');
    v_units_text := trim(coalesce(v_subject ->> 'units', ''));
    v_grade := trim(coalesce(v_subject ->> 'grade', ''));

    if char_length(v_subject_name) not between 1 and 160 then
      raise exception 'Subject name is required.';
    end if;

    if v_subject_code is not null and char_length(v_subject_code) > 40 then
      raise exception 'Keep the subject code under 40 characters.';
    end if;

    if v_units_text !~ '^[0-9]+(\.[0-9]+)?$' then
      raise exception 'Units must be a number.';
    end if;

    v_units := v_units_text::numeric;

    if v_units <= 0 then
      raise exception 'Units must be greater than 0.';
    end if;

    if v_units > 99 then
      raise exception 'Keep units under 100.';
    end if;

    if v_grade not in (
      '1.00',
      '1.25',
      '1.50',
      '1.75',
      '2.00',
      '2.25',
      '2.50',
      '2.75',
      '3.00',
      '4.00',
      '5.00',
      'INC',
      'DRP',
      'NFE',
      'P',
      'F'
    ) then
      raise exception 'Choose a valid grade.';
    end if;

    v_is_included := v_grade in (
      '1.00',
      '1.25',
      '1.50',
      '1.75',
      '2.00',
      '2.25',
      '2.50',
      '2.75',
      '3.00',
      '4.00',
      '5.00'
    );

    if v_is_included then
      v_total_units := v_total_units + v_units;
      v_total_subjects := v_total_subjects + 1;
      v_total_weighted_grades := v_total_weighted_grades + (v_grade::numeric * v_units);
    end if;
  end loop;

  if v_total_subjects = 0 or v_total_units <= 0 then
    raise exception 'At least one subject must have a numeric grade.';
  end if;

  v_gwa := round(v_total_weighted_grades / v_total_units, 2);

  if p_record_id is null then
    insert into public.gwa_records (
      user_id,
      semester,
      school_year,
      gwa,
      total_units,
      total_subjects
    )
    values (
      v_user_id,
      trim(p_semester),
      trim(p_school_year),
      v_gwa,
      round(v_total_units, 2),
      v_total_subjects
    )
    returning id into v_record_id;
  else
    update public.gwa_records
    set
      semester = trim(p_semester),
      school_year = trim(p_school_year),
      gwa = v_gwa,
      total_units = round(v_total_units, 2),
      total_subjects = v_total_subjects
    where id = p_record_id
      and user_id = v_user_id
    returning id into v_record_id;

    if v_record_id is null then
      raise exception 'GWA record was not found.';
    end if;

    delete from public.gwa_subjects
    where gwa_record_id = v_record_id;
  end if;

  for v_subject in
    select value
    from jsonb_array_elements(p_subjects)
  loop
    v_subject_name := trim(coalesce(v_subject ->> 'subjectName', ''));
    v_subject_code := nullif(trim(coalesce(v_subject ->> 'subjectCode', '')), '');
    v_units := trim(coalesce(v_subject ->> 'units', ''))::numeric;
    v_grade := trim(coalesce(v_subject ->> 'grade', ''));
    v_is_included := v_grade in (
      '1.00',
      '1.25',
      '1.50',
      '1.75',
      '2.00',
      '2.25',
      '2.50',
      '2.75',
      '3.00',
      '4.00',
      '5.00'
    );

    insert into public.gwa_subjects (
      gwa_record_id,
      subject_name,
      subject_code,
      units,
      grade,
      is_included
    )
    values (
      v_record_id,
      v_subject_name,
      v_subject_code,
      v_units,
      v_grade,
      v_is_included
    );
  end loop;

  return v_record_id;
end;
$$;

revoke all on function public.save_gwa_record(uuid, text, text, jsonb) from public;
grant execute on function public.save_gwa_record(uuid, text, text, jsonb) to authenticated;

create index if not exists gwa_records_user_id_created_at_idx
on public.gwa_records (user_id, created_at desc);

create index if not exists gwa_records_user_id_school_year_idx
on public.gwa_records (user_id, school_year);

create index if not exists gwa_subjects_gwa_record_id_idx
on public.gwa_subjects (gwa_record_id);
