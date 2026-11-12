-- Neon v2: Managed Better Auth + Neon Data API, UUID identities.
create table if not exists public.pulse_cycles (
  id uuid primary key default gen_random_uuid(),
  month text not null unique check (month ~ '^\\d{4}-\\d{2}$'),
  status text not null default 'open' check (status in ('open','closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by uuid references neon_auth."user"(id),
  created_at timestamptz not null default now()
);

create table if not exists public.pulse_links (
  cpf text primary key,
  employee_name text not null,
  source_identifier text not null,
  admission_date date,
  active boolean not null default true,
  updated_by uuid references neon_auth."user"(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_score_monthly (
  cpf text not null,
  month text not null check (month ~ '^\\d{4}-\\d{2}$'),
  assigned integer not null default 0 check (assigned >= 0),
  completed integer not null default 0 check (completed >= 0),
  points numeric(12,2) not null default 0 check (points >= 0),
  source_note text,
  updated_by uuid references neon_auth."user"(id),
  updated_at timestamptz not null default now(),
  primary key (cpf, month),
  check (completed <= assigned or assigned = 0)
);

create table if not exists public.pulse_collective_monthly (
  month text primary key check (month ~ '^\\d{4}-\\d{2}$'),
  sanitary_score numeric(5,2) check (sanitary_score between 0 and 100),
  delivery_score numeric(5,2) check (delivery_score between 0 and 100),
  operational_errors integer check (operational_errors >= 0),
  sanitary_source text,
  delivery_source text,
  notes text,
  updated_by uuid references neon_auth."user"(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_configs (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references neon_auth."user"(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_levels (
  level integer primary key check (level > 0),
  name text not null,
  min_xp integer not null check (min_xp >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.pulse_xp_history (
  id bigint generated always as identity primary key,
  cpf text not null,
  amount integer not null,
  origin text not null,
  reference text,
  description text,
  created_at timestamptz not null default now()
);
create unique index if not exists pulse_xp_idempotency_idx
  on public.pulse_xp_history(cpf, origin, reference)
  where reference is not null;
create index if not exists pulse_xp_cpf_idx on public.pulse_xp_history(cpf, created_at);

create table if not exists public.pulse_coins_history (
  id bigint generated always as identity primary key,
  cpf text not null,
  amount integer not null,
  origin text not null,
  reference text,
  description text,
  created_at timestamptz not null default now()
);
create unique index if not exists pulse_coins_idempotency_idx
  on public.pulse_coins_history(cpf, origin, reference)
  where reference is not null;
create index if not exists pulse_coins_cpf_idx on public.pulse_coins_history(cpf, created_at);

create table if not exists public.pulse_achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  condition_type text not null,
  target numeric(12,2) not null check (target >= 0),
  rarity text not null default 'common' check (rarity in ('common','rare','epic','legendary')),
  coin_reward integer not null default 50 check (coin_reward >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_achievement_unlocks (
  achievement_id uuid not null references public.pulse_achievements(id) on delete cascade,
  cpf text not null,
  unlocked_at timestamptz not null default now(),
  reference text,
  primary key (achievement_id, cpf)
);

create table if not exists public.pulse_store_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  coin_price integer not null check (coin_price > 0),
  stock integer check (stock is null or stock >= 0),
  daily_limit integer not null default 1 check (daily_limit > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_store_redemptions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.pulse_store_products(id),
  cpf text not null,
  coin_cost integer not null check (coin_cost > 0),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references neon_auth."user"(id),
  note text
);

create table if not exists public.pulse_bonus_history (
  id uuid primary key default gen_random_uuid(),
  month text not null check (month ~ '^\\d{4}-\\d{2}$'),
  cpf text not null,
  employee_name text not null,
  rank_position integer,
  life_percent numeric(6,2) not null,
  punctuality_percent numeric(6,2),
  execution_rate numeric(6,2),
  collective_percent numeric(6,2) not null,
  attendance_amount numeric(12,2) not null,
  score_amount numeric(12,2) not null,
  collective_amount numeric(12,2) not null,
  podium_amount numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  xp_awarded integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  closed_at timestamptz not null default now(),
  closed_by uuid references neon_auth."user"(id),
  unique (month, cpf)
);

insert into public.pulse_configs(key, value, description) values
  ('reward_caps', '{"attendance":100,"score":100,"collective":100,"podium":{"1":100,"2":50,"3":25}}', 'Tetos e bônus em R$'),
  ('life_penalties', '{"delay_per_hour":1,"absence":10,"medical":5,"sanction":15}', 'Descontos da Vida'),
  ('punctuality', '{"weight":10,"early_tolerance":5,"interval_tolerance":2,"late_exit_tolerance":1}', 'Parâmetros de pontualidade'),
  ('collective_weights', '{"sanitary":40,"delivery":40,"errors":20}', 'Pesos nominais da nota coletiva'),
  ('program', '{"name":"Líder Pulse","timezone":"America/Sao_Paulo"}', 'Identidade do programa')
on conflict (key) do nothing;

insert into public.pulse_levels(level, name, min_xp)
select n, 'Nível ' || n, case when n = 1 then 0 else (n-1)*(n-1)*100 end
from generate_series(1,23) n
on conflict (level) do nothing;

insert into public.pulse_achievements(code,name,description,condition_type,target,rarity,coin_reward) values
 ('xp-500','Primeiros 500 XP','Acumule 500 XP','xp_total',500,'common',50),
 ('xp-2000','Ritmo forte','Acumule 2.000 XP','xp_total',2000,'rare',150),
 ('vida-100','Mês impecável','Feche um mês com 100% de Vida','life_percent',100,'rare',150),
 ('pontual-30','Relógio suíço','Complete 30 dias sem atraso','days_on_time_total',30,'epic',400)
on conflict (code) do nothing;

alter table public.pulse_cycles enable row level security;
alter table public.pulse_links enable row level security;
alter table public.pulse_score_monthly enable row level security;
alter table public.pulse_collective_monthly enable row level security;
alter table public.pulse_configs enable row level security;
alter table public.pulse_levels enable row level security;
alter table public.pulse_xp_history enable row level security;
alter table public.pulse_coins_history enable row level security;
alter table public.pulse_achievements enable row level security;
alter table public.pulse_achievement_unlocks enable row level security;
alter table public.pulse_store_products enable row level security;
alter table public.pulse_store_redemptions enable row level security;
alter table public.pulse_bonus_history enable row level security;

revoke all on table public.pulse_cycles, public.pulse_links, public.pulse_score_monthly, public.pulse_collective_monthly,
  public.pulse_configs, public.pulse_levels, public.pulse_xp_history, public.pulse_coins_history,
  public.pulse_achievements, public.pulse_achievement_unlocks, public.pulse_store_products,
  public.pulse_store_redemptions, public.pulse_bonus_history from anonymous;

grant select, insert, update on table public.pulse_cycles, public.pulse_links, public.pulse_score_monthly,
  public.pulse_collective_monthly, public.pulse_configs, public.pulse_achievements, public.pulse_store_products,
  public.pulse_store_redemptions to authenticated;
grant select on table public.pulse_levels, public.pulse_xp_history, public.pulse_coins_history,
  public.pulse_achievement_unlocks, public.pulse_bonus_history to authenticated;

-- Active staff can read program data; writes are restricted to admin/gestor, with configuration/closing restricted to admin.
do $$
declare t text;
begin
  foreach t in array array['pulse_cycles','pulse_links','pulse_score_monthly','pulse_collective_monthly','pulse_configs','pulse_levels','pulse_xp_history','pulse_coins_history','pulse_achievements','pulse_achievement_unlocks','pulse_store_products','pulse_store_redemptions','pulse_bonus_history'] loop
    execute format('create policy %I on public.%I for select to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active))', t || '_read_active', t);
  end loop;
end $$;

create policy pulse_links_write_staff on public.pulse_links for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')));
create policy pulse_score_write_staff on public.pulse_score_monthly for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')));
create policy pulse_collective_write_staff on public.pulse_collective_monthly for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')));
create policy pulse_achievements_write_admin on public.pulse_achievements for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'));
create policy pulse_products_write_admin on public.pulse_store_products for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'));
create policy pulse_redemptions_write_staff on public.pulse_store_redemptions for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role in ('admin','gestor')));
create policy pulse_configs_write_admin on public.pulse_configs for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'));
create policy pulse_cycles_write_admin on public.pulse_cycles for all to authenticated
 using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'))
 with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='admin'));
