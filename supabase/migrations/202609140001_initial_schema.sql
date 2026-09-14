create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Automation',
  description text not null,
  case_study text,
  image_url text,
  video_url text,
  technologies text[] not null default '{}',
  results jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1),
  company_size text,
  process text,
  message text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Published projects are public" on public.projects;
create policy "Published projects are public" on public.projects
for select to anon, authenticated using (published = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated users manage projects" on public.projects;
create policy "Authenticated users manage projects" on public.projects
for all to authenticated using (true) with check (true);

drop policy if exists "Anyone can submit an inquiry" on public.inquiries;
create policy "Anyone can submit an inquiry" on public.inquiries
for insert to anon, authenticated with check (true);

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

drop policy if exists "Public project media is readable" on storage.objects;
create policy "Public project media is readable" on storage.objects
for select using (bucket_id = 'project-media');

drop policy if exists "Authenticated users upload project media" on storage.objects;
create policy "Authenticated users upload project media" on storage.objects
for insert to authenticated with check (bucket_id = 'project-media');
drop policy if exists "Authenticated users update project media" on storage.objects;
create policy "Authenticated users update project media" on storage.objects
for update to authenticated using (bucket_id = 'project-media');
drop policy if exists "Authenticated users delete project media" on storage.objects;
create policy "Authenticated users delete project media" on storage.objects
for delete to authenticated using (bucket_id = 'project-media');
