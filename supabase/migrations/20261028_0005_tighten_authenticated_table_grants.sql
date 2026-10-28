revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;

revoke all on table public.sync_logs from authenticated;
grant select, insert on table public.sync_logs to authenticated;

revoke all on table public.audit_logs from authenticated;
grant insert on table public.audit_logs to authenticated;

revoke all on table public.secullum_config from authenticated;
grant select, insert, update on table public.secullum_config to authenticated;

revoke all on table public.manual_labels from authenticated;
grant select, insert, update, delete on table public.manual_labels to authenticated;

revoke all on table public.schedule_exceptions from authenticated;
grant select, insert, update, delete on table public.schedule_exceptions to authenticated;

revoke all on table public.closed_days from authenticated;
grant select, insert, update, delete on table public.closed_days to authenticated;

revoke all on table public.hidden_employees from authenticated;
grant select, insert, update, delete on table public.hidden_employees to authenticated;

revoke all on table public.profiles, public.secullum_config, public.manual_labels, public.schedule_exceptions,
  public.closed_days, public.hidden_employees, public.sync_logs, public.audit_logs from anon;
