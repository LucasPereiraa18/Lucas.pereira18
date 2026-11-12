import { createClient } from "@/src/lib/supabase/server";

export interface ManualLabel { cpf: string; workDate: string; label: string; }

export async function listManualLabels(cpf: string, startDate: string, endDate: string): Promise<ManualLabel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("manual_labels").select("cpf,work_date,label").eq("cpf", cpf).gte("work_date", startDate).lte("work_date", endDate);
  if (error) throw new Error(`MANUAL_LABELS_READ_FAILED:${error.message}`);
  return (data ?? []).map((row) => ({ cpf: row.cpf, workDate: row.work_date, label: row.label }));
}

export async function upsertManualLabel(cpf: string, workDate: string, label: string, actorId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("manual_labels").upsert({ cpf, work_date: workDate, label, created_by: actorId, updated_at: new Date().toISOString() }, { onConflict: "cpf,work_date" });
  if (error) throw new Error(`MANUAL_LABEL_WRITE_FAILED:${error.message}`);
}

export async function deleteManualLabel(cpf: string, workDate: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("manual_labels").delete().eq("cpf", cpf).eq("work_date", workDate);
  if (error) throw new Error(`MANUAL_LABEL_DELETE_FAILED:${error.message}`);
}
