create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists closed_days_created_by_idx on public.closed_days(created_by);
create index if not exists hidden_employees_created_by_idx on public.hidden_employees(created_by);
create index if not exists manual_labels_created_by_idx on public.manual_labels(created_by);
create index if not exists schedule_exceptions_created_by_idx on public.schedule_exceptions(created_by);
create index if not exists secullum_config_updated_by_idx on public.secullum_config(updated_by);
