import type { SecullumPunchDay, SecullumPunchDayRaw } from "../../domain/secullum/types";
import { normalizeCpf, normalizePunchDay } from "./normalizers";
import { SecullumHttpClient } from "./http-client";

export interface PunchQuery {
  startDate: string;
  endDate: string;
  cpf?: string;
}

export async function getPunches(client: SecullumHttpClient, query: PunchQuery): Promise<SecullumPunchDay[]> {
  const params = new URLSearchParams({ dataInicio: query.startDate, dataFim: query.endDate });
  if (query.cpf) params.set("funcionarioCpf", normalizeCpf(query.cpf));
  const raw = await client.request<SecullumPunchDayRaw[]>(`/Batidas?${params.toString()}`);
  return raw.map(normalizePunchDay);
}
