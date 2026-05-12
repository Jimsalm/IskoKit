create table if not exists public.file_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tool_used text not null,
  input_file_names text[] not null,
  output_file_name text,
  file_count integer not null,
  original_size bigint not null,
  output_size bigint,
  created_at timestamptz not null default now(),
  constraint file_activities_tool_used_check check (
    tool_used in (
      'merge_pdf',
      'split_pdf',
      'image_to_pdf',
      'pdf_to_image',
      'compress_pdf',
      'word_to_pdf',
      'pdf_to_word',
      'edit_pdf',
      'pdf_annotator',
      'sign_pdf'
    )
  ),
  constraint file_activities_file_count_check check (file_count between 1 and 10),
  constraint file_activities_original_size_check check (original_size >= 0),
  constraint file_activities_output_size_check check (output_size is null or output_size >= 0),
  constraint file_activities_output_file_name_check check (
    output_file_name is null or char_length(output_file_name) <= 255
  )
);

alter table public.file_activities enable row level security;

drop policy if exists "Users can read their own file activities" on public.file_activities;
drop policy if exists "Users can create their own file activities" on public.file_activities;

create policy "Users can read their own file activities"
on public.file_activities
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own file activities"
on public.file_activities
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create index if not exists file_activities_user_id_created_at_idx
on public.file_activities (user_id, created_at desc);
