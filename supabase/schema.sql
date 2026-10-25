-- Fresh-project schema for anonymous trip editing.
-- Enables public read/write access to trip content by design.

create table public.trip_plans (
  trip_id uuid not null,
  trip_date date not null check (trip_date between date '2026-10-19' and date '2026-11-01'),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (trip_id, trip_date)
);

create table public.trip_expenses (
  trip_id uuid primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.trip_memos (
  trip_id uuid primary key,
  content text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.trip_plans enable row level security;
alter table public.trip_expenses enable row level security;
alter table public.trip_memos enable row level security;

grant select, insert, update, delete on public.trip_plans, public.trip_expenses, public.trip_memos to anon, authenticated;

create policy "Anyone can read trip plans" on public.trip_plans for select to anon, authenticated using (true);
create policy "Anyone can add trip plans" on public.trip_plans for insert to anon, authenticated with check (true);
create policy "Anyone can edit trip plans" on public.trip_plans for update to anon, authenticated using (true) with check (true);
create policy "Anyone can delete trip plans" on public.trip_plans for delete to anon, authenticated using (true);

create policy "Anyone can read trip expenses" on public.trip_expenses for select to anon, authenticated using (true);
create policy "Anyone can add trip expenses" on public.trip_expenses for insert to anon, authenticated with check (true);
create policy "Anyone can edit trip expenses" on public.trip_expenses for update to anon, authenticated using (true) with check (true);
create policy "Anyone can delete trip expenses" on public.trip_expenses for delete to anon, authenticated using (true);

create policy "Anyone can read trip memo" on public.trip_memos for select to anon, authenticated using (true);
create policy "Anyone can create trip memo" on public.trip_memos for insert to anon, authenticated with check (true);
create policy "Anyone can edit trip memo" on public.trip_memos for update to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.trip_plans, public.trip_expenses, public.trip_memos;
