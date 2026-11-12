import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve("supabase/migrations/20261027_0001_initial_schema.sql"), "utf8").toLowerCase();
const tables = ["profiles", "secullum_config", "manual_labels", "schedule_exceptions", "closed_days", "hidden_employees", "sync_logs", "audit_logs"];

describe("initial Supabase schema", () => {
  it.each(tables)("enables RLS on %s", (table) => {
    expect(sql).toContain(`alter table public.${table} enable row level security`);
  });

  it("does not grant browser access to Secullum credentials", () => {
    expect(sql).toContain("revoke all on table public.secullum_config from anon, authenticated");
  });

  it("keeps audit logs server-only", () => {
    expect(sql).toContain("revoke all on table public.audit_logs from anon, authenticated");
  });
});
