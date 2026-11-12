import { createClient } from "@/src/lib/supabase/server";
import type { SchedulePeriod } from "@/src/domain/time/types";

export interface SecullumConfigRow {
  username: string;
  encrypted_password: string;
  database_id: string;
  mode: "read_only";
  tolerance_minutes: number;
  default_schedule: SchedulePeriod[] | null;
  timezone: string;
  opening_time: string | null;
  rep_grace_minutes: number;
}

export async function readSecullumConfigRow(): Promise<SecullumConfigRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("secullum_config")
    .select("username,encrypted_password,database_id,mode,tolerance_minutes,default_schedule,timezone,opening_time,rep_grace_minutes")
    .eq("id", 1)
    .maybeSingle<SecullumConfigRow>();
  if (error) throw new Error(`SECULLUM_CONFIG_READ_FAILED:${error.message}`);
  return data;
}

export async function upsertSecullumConfigRow(row: SecullumConfigRow, actorId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("secullum_config").upsert({
    id: 1,
    ...row,
    updated_by: actorId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`SECULLUM_CONFIG_WRITE_FAILED:${error.message}`);
}
