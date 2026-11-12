-- Add authenticated role-aware RLS while preserving existing deny policies as defense in depth.
-- The application already verifies user roles before sensitive actions;
-- these policies provide database-level defense in depth.

grant select, insert, update on table public.secullum_config to authenticated;
grant insert on table public.audit_logs to authenticated;
grant insert on table public.sync_logs to authenticated;


create policy secullum_config_select_admin
  on public.secullum_config for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.active and p.role = 'admin'
  ));

create policy secullum_config_insert_admin
  on public.secullum_config for insert to authenticated
  with check (
    updated_by = (select auth.uid()) and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.active and p.role = 'admin'
    )
  );

create policy secullum_config_update_admin
  on public.secullum_config for update to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.active and p.role = 'admin'
  ))
  with check (
    updated_by = (select auth.uid()) and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.active and p.role = 'admin'
    )
  );

create policy audit_logs_insert_staff
  on public.audit_logs for insert to authenticated
  with check (
    actor_id = (select auth.uid()) and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.active and p.role in ('admin','gestor')
    )
  );

create policy sync_logs_insert_active
  on public.sync_logs for insert to authenticated
  with check (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.active
  ));
