alter table public.inquiries
  add column if not exists status text not null default 'new',
  add column if not exists replied_at timestamptz;

drop policy if exists "Authenticated users read inquiries" on public.inquiries;
create policy "Authenticated users read inquiries" on public.inquiries
for select to authenticated using (true);

drop policy if exists "Authenticated users update inquiries" on public.inquiries;
create policy "Authenticated users update inquiries" on public.inquiries
for update to authenticated using (true) with check (true);