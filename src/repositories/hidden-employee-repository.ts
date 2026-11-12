import { createClient } from "@/src/lib/supabase/server";
import { normalizeCpf } from "@/src/services/secullum/normalizers";

export async function listHiddenEmployeeCpfs(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("hidden_employees").select("cpf");
  if (error) throw new Error(`HIDDEN_EMPLOYEES_READ_FAILED:${error.message}`);
  return new Set((data ?? []).map((row) => normalizeCpf(row.cpf)));
}

export async function hideEmployee(cpf: string, actorId: string, reason: string | null = null): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("hidden_employees").upsert({ cpf: normalizeCpf(cpf), reason, created_by: actorId });
  if (error) throw new Error(`HIDDEN_EMPLOYEE_WRITE_FAILED:${error.message}`);
}

export async function unhideEmployee(cpf: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("hidden_employees").delete().eq("cpf", normalizeCpf(cpf));
  if (error) throw new Error(`HIDDEN_EMPLOYEE_DELETE_FAILED:${error.message}`);
}
