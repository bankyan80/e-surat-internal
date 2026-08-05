-- ============================================
-- Perbaikan RLS: hindari subquery rekursif
-- pada policy yang mereferensikan tabel yang sama
-- ============================================

-- Fungsi bantu cek administrator (security definer)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'Administrator' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Perbaiki policy select pada profiles
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- Perbaiki policy update pada profiles
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- Perbaiki policy insert pada profiles
drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

-- Perbaiki policy delete pada profiles
drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- Perbaiki policy select pada audit_logs
drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());
