-- Unified, idempotent schema for your project (Supabase/Postgres, DEV without RLS)
begin;

-- UUID helpers (Supabase usually already has these, but safe to keep)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =========================================================
-- 1) TYPES
-- =========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('student', 'admin');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'address_input_type') then
    create type public.address_input_type as enum ('city', 'full_address');
  end if;
end $$;

-- =========================================================
-- 2) CORE BUSINESS TABLES
-- =========================================================

-- Events (input [a]: event name, abstract, date(s), cost, location, etc.)
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  location text not null,
  category text not null check (category = any (array['orange','green','blue']::text[])),
  image_url text not null,
  coordinates double precision[] not null,
  cost_usd numeric(10,2) not null default 0,
  capacity integer not null check (capacity >= 0),
  registered integer not null default 0 check (registered >= 0),
  tags text[] not null default '{}'::text[],
  source_url text,
  external_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_registered_le_capacity check (registered <= capacity)
);

-- If events already existed with legacy columns, add missing columns safely
alter table public.events add column if not exists start_at timestamptz;
alter table public.events add column if not exists end_at timestamptz;
alter table public.events add column if not exists cost_usd numeric(10,2) not null default 0;
alter table public.events add column if not exists source_url text;
alter table public.events add column if not exists external_event_id text;
alter table public.events add column if not exists updated_at timestamptz not null default now();

-- Registrations (input [c]: student name + student id)
create table if not exists public.registrations (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  middle_name text,
  last_name text not null,
  student_id text not null,
  event_id uuid not null references public.events(id) on delete cascade,
  status text not null default 'registered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_registrations_event_student
  on public.registrations(event_id, student_id);

-- =========================================================
-- 3) RBAC (auth.users integration)
-- =========================================================

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pending_admin_invites (
  email text primary key,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Optional profile table for default address info
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_address text,
  default_city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 4) MAP / PARKING / ROUTE INPUTS
-- =========================================================

-- Input [b]: customer address or city
create table if not exists public.user_address_inputs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  input_address text not null,
  input_type public.address_input_type not null,
  event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.parking_lots (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  campus text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  total_spots integer,
  available_spots integer,
  hourly_rate_usd numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_parking_suggestions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  parking_lot_id uuid not null references public.parking_lots(id) on delete cascade,
  distance_miles numeric(8,2),
  estimated_walk_minutes integer,
  created_at timestamptz not null default now(),
  unique (event_id, parking_lot_id)
);

create table if not exists public.route_queries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  origin_address text not null,
  destination_address text not null,
  distance_miles numeric(10,2),
  duration_minutes integer,
  toll_fee_usd numeric(10,2),
  provider text not null default 'google_maps',
  raw_response jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 5) COMMON UPDATED_AT TRIGGER FUNCTION
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists trg_registrations_updated_at on public.registrations;
create trigger trg_registrations_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_roles_updated_at on public.user_roles;
create trigger trg_user_roles_updated_at
before update on public.user_roles
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_parking_lots_updated_at on public.parking_lots;
create trigger trg_parking_lots_updated_at
before update on public.parking_lots
for each row execute function public.set_updated_at();

-- =========================================================
-- 6) RBAC FUNCTIONS + AUTH TRIGGER
-- =========================================================

-- Queue an email as future admin before inviteUserByEmail()
create or replace function public.queue_admin_invite(
  p_email text,
  p_invited_by uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pending_admin_invites (email, invited_by)
  values (lower(trim(p_email)), p_invited_by)
  on conflict (email) do update
    set invited_by = excluded.invited_by,
        created_at = now();
end;
$$;

-- Manual role setter
create or replace function public.set_user_role(
  p_user_id uuid,
  p_role public.app_role,
  p_invited_by uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role, invited_by)
  values (p_user_id, p_role, p_invited_by)
  on conflict (user_id) do update
    set role = excluded.role,
        invited_by = excluded.invited_by,
        updated_at = now();
end;
$$;

-- Assign student by default; admin if email was pre-invited
create or replace function public.handle_new_auth_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invited_by uuid;
  v_role public.app_role := 'student';
begin
  select invited_by
    into v_invited_by
  from public.pending_admin_invites
  where lower(email) = lower(new.email);

  if found then
    v_role := 'admin';
    delete from public.pending_admin_invites
    where lower(email) = lower(new.email);
  end if;

  insert into public.user_roles (user_id, role, invited_by)
  values (new.id, v_role, v_invited_by)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_role on auth.users;
create trigger on_auth_user_created_assign_role
after insert on auth.users
for each row execute function public.handle_new_auth_user_role();

-- =========================================================
-- 7) INDEXES
-- =========================================================
create index if not exists ix_events_start_at on public.events(start_at);
create index if not exists ix_events_category on public.events(category);
create index if not exists ix_registrations_event_id on public.registrations(event_id);
create index if not exists ix_registrations_student_id on public.registrations(student_id);
create index if not exists ix_user_roles_role on public.user_roles(role);
create index if not exists ix_user_address_inputs_user_id on public.user_address_inputs(user_id);
create index if not exists ix_route_queries_event_id on public.route_queries(event_id);

-- =========================================================
-- 8) DEV MODE: NO RLS
-- =========================================================
alter table public.events disable row level security;
alter table public.registrations disable row level security;
alter table public.user_roles disable row level security;
alter table public.pending_admin_invites disable row level security;
alter table public.user_profiles disable row level security;
alter table public.user_address_inputs disable row level security;
alter table public.parking_lots disable row level security;
alter table public.event_parking_suggestions disable row level security;
alter table public.route_queries disable row level security;

commit;