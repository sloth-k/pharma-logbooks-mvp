create extension if not exists "pgcrypto";

create type public.record_status as enum (
  'draft',
  'in_progress',
  'submitted',
  'under_review',
  'approved',
  'effective',
  'archived'
);

create type public.signature_meaning as enum (
  'performed',
  'reviewed',
  'verified',
  'approved'
);

create type public.audit_action as enum (
  'insert',
  'update',
  'status_change',
  'sign',
  'attach',
  'export'
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id),
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique(site_id, code)
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id),
  code text not null,
  name text not null,
  area_type text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique(department_id, code)
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas(id),
  code text not null,
  name text not null,
  equipment_type text not null,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  unique(area_id, code)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  employee_code text not null unique,
  default_site_id uuid references public.sites(id),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  site_id uuid references public.sites(id),
  department_id uuid references public.departments(id),
  area_id uuid references public.areas(id),
  assigned_at timestamptz not null default timezone('utc', now()),
  assigned_by uuid references public.profiles(id)
);

create table if not exists public.training_requirements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  is_active boolean not null default true
);

create table if not exists public.user_training_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  training_requirement_id uuid not null references public.training_requirements(id),
  status text not null check (status in ('qualified', 'expired', 'pending')),
  valid_until date,
  unique(user_id, training_requirement_id)
);

create table if not exists public.logbook_templates (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id),
  department_id uuid references public.departments(id),
  code text not null unique,
  name text not null,
  category text not null,
  description text,
  current_version_no integer,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.logbook_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.logbook_templates(id) on delete cascade,
  version_no integer not null,
  status text not null check (status in ('draft', 'approved', 'superseded')),
  definition jsonb not null,
  effective_from date,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  unique(template_id, version_no)
);

create table if not exists public.logbooks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.logbook_templates(id),
  template_version_id uuid not null references public.logbook_template_versions(id),
  site_id uuid not null references public.sites(id),
  department_id uuid not null references public.departments(id),
  area_id uuid references public.areas(id),
  equipment_id uuid references public.equipment(id),
  logbook_no text not null unique,
  business_date date not null,
  shift_code text,
  status public.record_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  submitted_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.logbook_entries (
  id uuid primary key default gen_random_uuid(),
  logbook_id uuid not null references public.logbooks(id) on delete cascade,
  section_key text not null,
  row_no integer not null default 1,
  field_values jsonb not null,
  entry_hash text,
  status text not null default 'active' check (status in ('active', 'corrected')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  corrected_by uuid references public.profiles(id),
  corrected_at timestamptz,
  correction_reason text
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  logbook_id uuid not null references public.logbooks(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  file_name text not null,
  content_type text not null,
  file_size bigint not null,
  checksum_sha256 text not null,
  uploaded_by uuid not null references public.profiles(id),
  uploaded_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.signature_events (
  id uuid primary key default gen_random_uuid(),
  logbook_id uuid not null references public.logbooks(id) on delete cascade,
  signer_id uuid not null references public.profiles(id),
  meaning public.signature_meaning not null,
  comment text,
  record_hash text not null,
  signed_at timestamptz not null default timezone('utc', now()),
  auth_context jsonb not null default '{}'::jsonb
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action public.audit_action not null,
  actor_user_id uuid references public.profiles(id),
  actor_name text,
  site_id uuid references public.sites(id),
  department_id uuid references public.departments(id),
  old_data jsonb,
  new_data jsonb,
  reason text,
  signature_event_id uuid references public.signature_events(id),
  request_meta jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_logbooks_site_dept_date
  on public.logbooks(site_id, department_id, business_date);

create index if not exists idx_logbooks_status
  on public.logbooks(status);

create index if not exists idx_logbook_entries_logbook
  on public.logbook_entries(logbook_id);

create index if not exists idx_audit_events_record
  on public.audit_events(table_name, record_id, occurred_at desc);

create index if not exists idx_signature_events_logbook
  on public.signature_events(logbook_id, signed_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_logbooks_updated_at on public.logbooks;
create trigger trg_logbooks_updated_at
before update on public.logbooks
for each row
execute function public.set_updated_at();

create or replace function public.current_user_role_codes()
returns text[]
language sql
stable
as $$
  select coalesce(array_agg(r.code), '{}')
  from public.user_role_assignments ura
  join public.roles r on r.id = ura.role_id
  where ura.user_id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.logbooks enable row level security;
alter table public.logbook_entries enable row level security;
alter table public.audit_events enable row level security;
alter table public.signature_events enable row level security;
alter table public.logbook_templates enable row level security;
alter table public.logbook_template_versions enable row level security;

create policy "profiles_self_read"
on public.profiles
for select
using (id = auth.uid());

create policy "logbooks_read_for_assigned_users"
on public.logbooks
for select
using (
  auth.uid() is not null
);

create policy "logbooks_insert_for_operators"
on public.logbooks
for insert
with check (
  auth.uid() is not null
  and (
    'operator' = any(public.current_user_role_codes())
    or 'supervisor' = any(public.current_user_role_codes())
    or 'qa_reviewer' = any(public.current_user_role_codes())
  )
);

create policy "entries_read_for_assigned_users"
on public.logbook_entries
for select
using (auth.uid() is not null);

create policy "entries_insert_for_operators"
on public.logbook_entries
for insert
with check (
  auth.uid() is not null
  and (
    'operator' = any(public.current_user_role_codes())
    or 'supervisor' = any(public.current_user_role_codes())
  )
);

create policy "audit_read_for_reviewers"
on public.audit_events
for select
using (
  auth.uid() is not null
  and (
    'qa_reviewer' = any(public.current_user_role_codes())
    or 'qa_approver' = any(public.current_user_role_codes())
    or 'admin' = any(public.current_user_role_codes())
  )
);

create policy "signatures_read_for_assigned_users"
on public.signature_events
for select
using (auth.uid() is not null);

insert into public.roles (code, name)
values
  ('operator', 'Operator'),
  ('supervisor', 'Supervisor'),
  ('qa_reviewer', 'QA Reviewer'),
  ('qa_approver', 'QA Approver'),
  ('admin', 'System Admin')
on conflict (code) do nothing;

comment on table public.audit_events is 'Append-only GMP-style audit events. Application should never expose update/delete on this table.';
comment on table public.logbook_template_versions is 'Versioned immutable template definitions.';
comment on table public.signature_events is 'Electronic sign-off events linked to a frozen record hash.';
