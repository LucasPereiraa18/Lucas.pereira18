import { createClient } from "@/src/lib/supabase/server";

export interface ScheduleException { id: string; cpf: string | null; workDate: string; kind: string; note: string | null; }

export async function listScheduleExceptions(cpf: string, startDate: string, endDate: string): Promise<ScheduleException[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("schedule_exceptions").select("id,cpf,work_date,kind,note").gte("work_date", startDate).lte("work_date", endDate).or(`cpf.eq.${cpf},cpf.is.null`);
  if (error) throw new Error(`EXCEPTIONS_READ_FAILED:${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, cpf: row.cpf, workDate: row.work_date, kind: row.kind, note: row.note }));
}

export async function upsertScheduleException(cpf: string | null, workDate: string, kind: "training" | "event" | "authorized" | "other", note: string | null, actorId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_exceptions").upsert({ cpf, work_date: workDate, kind, note, created_by: actorId, updated_at: new Date().toISOString() }, { onConflict: "cpf,work_date" });
  if (error) throw new Error(`EXCEPTION_WRITE_FAILED:${error.message}`);
}

export async function deleteScheduleException(cpf: string | null, workDate: string): Promise<void> {
  const supabase = await createClient();
  let query = supabase.from("schedule_exceptions").delete().eq("work_date", workDate);
  query = cpf ? query.eq("cpf", cpf) : query.is("cpf", null);
  const { error } = await query;
  if (error) throw new Error(`EXCEPTION_DELETE_FAILED:${error.message}`);
}
