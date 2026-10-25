-- Migration for the existing Tokyo Family trip project.
-- This removes the sign-in requirement and makes trip data public to anon clients.

revoke all on public.trip_members from anon, authenticated;
drop policy if exists "Invited members can see their invitation" on public.trip_members;

drop policy if exists "Trip members can read plans" on public.trip_plans;
drop policy if exists "Trip members can write plans" on public.trip_plans;
drop policy if exists "Trip members can update plans" on public.trip_plans;
drop policy if exists "Trip members can delete plans" on public.trip_plans;
drop policy if exists "Trip members can read expenses" on public.trip_expenses;
drop policy if exists "Trip members can write expenses" on public.trip_expenses;
drop policy if exists "Trip members can update expenses" on public.trip_expenses;
drop policy if exists "Trip members can delete expenses" on public.trip_expenses;
drop policy if exists "Trip members can read memo" on public.trip_memos;
drop policy if exists "Trip members can create memo" on public.trip_memos;
drop policy if exists "Trip members can edit memo" on public.trip_memos;

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
