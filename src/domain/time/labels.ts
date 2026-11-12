import type { SecullumPunchDay } from "../secullum/types";
import { parseClockValue } from "./clock";

function allowanceDescription(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (value && typeof value === "object" && "Descricao" in value) {
    const raw = (value as { Descricao?: unknown }).Descricao;
    return typeof raw === "string" ? raw.trim() || null : null;
  }
  return null;
}

function literalPunchText(day: SecullumPunchDay): string | null {
  for (const value of [...day.entries, ...day.exits]) {
    if (value && parseClockValue(value) === null) return value.trim();
  }
  return null;
}

function hasClockPunch(day: SecullumPunchDay): boolean {
  return [...day.entries, ...day.exits].some((value) => parseClockValue(value) !== null);
}

export function deriveLabel(day: SecullumPunchDay): string | null {
  const literal = literalPunchText(day);
  if (literal) return literal;
  if (!hasClockPunch(day) && day.dayOff) return "FOLGA";
  if (!hasClockPunch(day) && day.compensated) return "COMPENSADO";
  if (day.observations?.trim()) return day.observations.trim();
  for (const allowance of day.allowances) {
    const description = allowanceDescription(allowance);
    if (description) return description;
  }
  return null;
}
