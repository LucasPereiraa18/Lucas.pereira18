import type { SecullumEmployee, SecullumPunchDay, SecullumPunchDayRaw } from "../../domain/secullum/types";

type DescriptionObject = { Descricao?: unknown } | null | undefined;

function description(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (value && typeof value === "object" && "Descricao" in value) {
    const raw = (value as DescriptionObject)?.Descricao;
    return typeof raw === "string" ? raw.trim() || null : null;
  }
  return null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeCpf(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).replace(/\D/g, "")
    : "";
}

export function normalizeEmployee(raw: Record<string, unknown>): SecullumEmployee {
  const dismissalDate = nullableString(raw.Demissao);
  return {
    id: (raw.Id as string | number | undefined) ?? "",
    name: nullableString(raw.Nome) ?? "",
    cpf: normalizeCpf(raw.Cpf ?? raw.CPF),
    functionDescription: description(raw.Funcao),
    departmentDescription: description(raw.Departamento),
    dismissalDate,
    active: dismissalDate === null,
  };
}

function field(raw: SecullumPunchDayRaw, prefix: string, index: number): string | null {
  const value = raw[`${prefix}${index}`];
  return nullableString(value);
}

function normalizeDate(value: unknown): string {
  const raw = nullableString(value);
  if (!raw) return "";
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  return iso ? iso[1] : raw;
}

export function normalizePunchDay(raw: SecullumPunchDayRaw): SecullumPunchDay {
  return {
    date: normalizeDate(raw.Data),
    entries: [1, 2, 3, 4, 5].map((i) => field(raw, "Entrada", i)),
    exits: [1, 2, 3, 4, 5].map((i) => field(raw, "Saida", i)),
    memoryEntries: [1, 2, 3, 4, 5].map((i) => field(raw, "MemoriaEntrada", i)),
    memoryExits: [1, 2, 3, 4, 5].map((i) => field(raw, "MemoriaSaida", i)),
    dayOff: raw.Folga === true,
    compensated: raw.Compensado === true,
    observations: nullableString(raw.Observacoes),
    allowances: [raw.Abono2, raw.Abono3, raw.Abono4],
    raw,
  };
}

export function allowanceDescription(value: unknown): string | null {
  return description(value);
}
