create table if not exists public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.project_categories enable row level security;

drop policy if exists "Public can read project categories" on public.project_categories;
create policy "Public can read project categories" on public.project_categories
for select to anon, authenticated using (true);

drop policy if exists "Authenticated users manage project categories" on public.project_categories;
create policy "Authenticated users manage project categories" on public.project_categories
for all to authenticated using (true) with check (true);

insert into public.project_categories (name)
values ('AI Automation'), ('Web Development')
on conflict (name) do nothing;
