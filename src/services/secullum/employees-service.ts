import type { SecullumEmployee } from "../../domain/secullum/types";
import { normalizeEmployee, normalizeCpf } from "./normalizers";
import { SecullumHttpClient } from "./http-client";

export async function getEmployees(client: SecullumHttpClient): Promise<SecullumEmployee[]> {
  const raw = await client.request<Record<string, unknown>[]>("/Funcionarios");
  return raw.map(normalizeEmployee);
}

export async function getEmployeeByCpf(client: SecullumHttpClient, cpf: string): Promise<SecullumEmployee | null> {
  const digits = normalizeCpf(cpf);
  const raw = await client.request<Record<string, unknown> | null>(`/Funcionarios/Cpf?cpf=${encodeURIComponent(digits)}`);
  return raw ? normalizeEmployee(raw) : null;
}
