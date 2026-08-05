-- ============================================
-- SIMSURAT - Skema Database
-- Sistem Informasi Manajemen Surat Internal
-- ============================================

-- 1. Tabel surat
create table if not exists public.surat (
  id uuid primary key default gen_random_uuid(),
  nomor_surat text not null,
  tanggal date not null,
  perihal text not null,
  jenis text not null check (jenis in ('Surat Masuk', 'Surat Keluar')),
  tujuan text not null,
  file_pdf text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_surat_tanggal on public.surat (tanggal);
create index if not exists idx_surat_jenis on public.surat (jenis);
create index if not exists idx_surat_nomor on public.surat (nomor_surat);

-- 2. Tabel profiles (perpanjangan auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'Operator' check (role in ('Administrator', 'Operator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Tabel audit_logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  user_email text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on public.audit_logs (created_at desc);

-- 4. Trigger updated_at untuk surat
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_surat_updated_at on public.surat;
create trigger trg_surat_updated_at
  before update on public.surat
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- 5. Trigger membuat profile otomatis saat user terdaftar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when (select count(*) from public.profiles) = 0 then 'Administrator'
      else 'Operator'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- 6. Enable RLS
alter table public.surat enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

-- 7. Policies surat
drop policy if exists "surat_select_auth" on public.surat;
create policy "surat_select_auth"
  on public.surat for select
  to authenticated
  using (true);

drop policy if exists "surat_insert_auth" on public.surat;
create policy "surat_insert_auth"
  on public.surat for insert
  to authenticated
  with check (true);

drop policy if exists "surat_update_auth" on public.surat;
create policy "surat_update_auth"
  on public.surat for update
  to authenticated
  using (true);

drop policy if exists "surat_delete_auth" on public.surat;
create policy "surat_delete_auth"
  on public.surat for delete
  to authenticated
  using (true);

-- 8. Policies profiles
-- Fungsi bantu cek administrator tanpa subquery rekursif
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

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- 9. Policies audit_logs
drop policy if exists "audit_logs_insert_auth" on public.audit_logs;
create policy "audit_logs_insert_auth"
  on public.audit_logs for insert
  to authenticated
  with check (true);

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

-- ============================================
-- Storage: bucket 'surat'
-- ============================================
insert into storage.buckets (id, name, public)
values ('surat', 'surat', false)
on conflict (id) do nothing;

drop policy if exists "surat_storage_insert" on storage.objects;
create policy "surat_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'surat');

drop policy if exists "surat_storage_read" on storage.objects;
create policy "surat_storage_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'surat');

drop policy if exists "surat_storage_delete" on storage.objects;
create policy "surat_storage_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'surat');

drop policy if exists "surat_storage_update" on storage.objects;
create policy "surat_storage_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'surat');

-- ============================================
-- Fungsi bantuan untuk statistik (digunakan di dashboard)
-- ============================================
create or replace function public.count_surat_by_type(target text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)
  from public.surat
  where jenis = target
$$;

-- ============================================
-- Fungsi administrasi pengguna (hanya Administrator)
-- Menggunakan security definer agar dapat mengelola auth.users
-- ============================================
create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_user_id uuid;
  is_admin boolean;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'Administrator'
  ) into is_admin;

  if not is_admin then
    raise exception 'Hanya Administrator yang dapat mengelola pengguna';
  end if;

  if p_role not in ('Administrator', 'Operator') then
    raise exception 'Role tidak valid';
  end if;

  insert into auth.users (
    instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', p_full_name),
    'authenticated',
    'authenticated',
    now(),
    now()
  )
  returning id into new_user_id;

  insert into public.profiles (id, email, full_name, role)
  values (new_user_id, p_email, p_full_name, p_role);

  return new_user_id;
end;
$$;

create or replace function public.admin_update_user(
  p_user_id uuid,
  p_full_name text,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  is_admin boolean;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'Administrator'
  ) into is_admin;

  if not is_admin then
    raise exception 'Hanya Administrator yang dapat mengelola pengguna';
  end if;

  if p_role not in ('Administrator', 'Operator') then
    raise exception 'Role tidak valid';
  end if;

  update public.profiles
  set full_name = p_full_name,
      role = p_role,
      updated_at = now()
  where id = p_user_id;

  update auth.users
  set raw_user_meta_data = jsonb_build_object('full_name', p_full_name)
  where id = p_user_id;
end;
$$;

create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  is_admin boolean;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'Administrator'
  ) into is_admin;

  if not is_admin then
    raise exception 'Hanya Administrator yang dapat mengelola pengguna';
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;
