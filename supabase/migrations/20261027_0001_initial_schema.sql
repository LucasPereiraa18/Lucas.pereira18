create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null check (role in ('admin', 'gestor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.secullum_config (
  id smallint primary key default 1 check (id = 1),
  username text not null,
  encrypted_password text not null,
  database_id text not null,
  mode text not null default 'read_only' check (mode = 'read_only'),
  tolerance_minutes integer not null default 5 check (tolerance_minutes between 0 and 60),
  default_schedule jsonb,
  timezone text not null default 'America/Sao_Paulo',
  opening_time time,
  rep_grace_minutes integer not null default 40 check (rep_grace_minutes between 0 and 240),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manual_labels (
  id uuid primary key default gen_random_uuid(),
  cpf text not null,
  work_date date not null,
  label text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cpf, work_date)
);

create table if not exists public.schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  cpf text,
  work_date date not null,
  kind text not null check (kind in ('training', 'event', 'authorized', 'other')),
  note text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cpf, work_date)
);

create table if not exists public.closed_days (
  work_date date primary key,
  reason text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.hidden_employees (
  cpf text primary key,
  reason text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.sync_logs (
  id bigint generated always as identity primary key,
  operation text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  status text not null check (status in ('success', 'error')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  resource_type text not null,
  resource_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.secullum_config enable row level security;
alter table public.manual_labels enable row level security;
alter table public.schedule_exceptions enable row level security;
alter table public.closed_days enable row level security;
alter table public.hidden_employees enable row level security;
alter table public.sync_logs enable row level security;
alter table public.audit_logs enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.secullum_config from anon, authenticated;
revoke all on table public.manual_labels from anon;
revoke all on table public.schedule_exceptions from anon;
revoke all on table public.closed_days from anon;
revoke all on table public.hidden_employees from anon;
revoke all on table public.sync_logs from anon;
revoke all on table public.audit_logs from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.manual_labels to authenticated;
grant select, insert, update, delete on table public.schedule_exceptions to authenticated;
grant select, insert, update, delete on table public.closed_days to authenticated;
grant select, insert, update, delete on table public.hidden_employees to authenticated;
grant select on table public.sync_logs to authenticated;

create policy profiles_select_self
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy manual_labels_read_active
  on public.manual_labels for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active));
create policy manual_labels_write_staff
  on public.manual_labels for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')
  ));
create policy manual_labels_update_staff
  on public.manual_labels for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')));
create policy manual_labels_delete_staff
  on public.manual_labels for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')));

create policy schedule_exceptions_read_active
  on public.schedule_exceptions for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active));
create policy schedule_exceptions_write_staff
  on public.schedule_exceptions for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')
  ));
create policy schedule_exceptions_update_staff
  on public.schedule_exceptions for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')));
create policy schedule_exceptions_delete_staff
  on public.schedule_exceptions for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')));

create policy closed_days_read_active
  on public.closed_days for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active));
create policy closed_days_insert_admin
  on public.closed_days for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'
  ));
create policy closed_days_update_admin
  on public.closed_days for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'));
create policy closed_days_delete_admin
  on public.closed_days for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'));

create policy hidden_employees_read_active
  on public.hidden_employees for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active));
create policy hidden_employees_insert_admin
  on public.hidden_employees for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'
  ));
create policy hidden_employees_update_admin
  on public.hidden_employees for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'));
create policy hidden_employees_delete_admin
  on public.hidden_employees for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active and p.role = 'admin'));

create policy sync_logs_read_active
  on public.sync_logs for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.active));

create index if not exists manual_labels_cpf_date_idx on public.manual_labels(cpf, work_date);
create index if not exists schedule_exceptions_cpf_date_idx on public.schedule_exceptions(cpf, work_date);
create index if not exists sync_logs_created_idx on public.sync_logs(created_at desc);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
