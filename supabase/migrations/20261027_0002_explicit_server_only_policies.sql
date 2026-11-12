create policy secullum_config_deny_client_access
  on public.secullum_config
  for all
  to authenticated
  using (false)
  with check (false);

create policy audit_logs_deny_client_access
  on public.audit_logs
  for all
  to authenticated
  using (false)
  with check (false);
