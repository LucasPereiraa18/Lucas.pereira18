import { createClient } from "@/src/lib/supabase/server";

export async function listClosedDays(startDate: string, endDate: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("closed_days").select("work_date").gte("work_date", startDate).lte("work_date", endDate);
  if (error) throw new Error(`CLOSED_DAYS_READ_FAILED:${error.message}`);
  return new Set((data ?? []).map((row) => row.work_date));
}

export async function addClosedDay(workDate: string, actorId: string, reason: string | null = null): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("closed_days").upsert({ work_date: workDate, reason, created_by: actorId });
  if (error) throw new Error(`CLOSED_DAY_WRITE_FAILED:${error.message}`);
}

export async function removeClosedDay(workDate: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("closed_days").delete().eq("work_date", workDate);
  if (error) throw new Error(`CLOSED_DAY_DELETE_FAILED:${error.message}`);
}
