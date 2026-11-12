import { parseClockValue } from "@/src/domain/time/clock";
import type { AttendanceDay } from "@/src/services/attendance/attendance-service";
import type { PulseCollectiveInput, PulseCollectiveResult, PulseConfig, PulsePunctualityDay } from "./types";

export function normalizeOccurrence(label: string | null): "absence" | "medical" | "sanction" | "off" | "other" {
  const value = (label ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
  if (value === "FALTA") return "absence";
  if (["ATESTADO", "LICENCA"].includes(value)) return "medical";
  if (["SANCAO", "SUSPENSAO", "ADVERTENCIA"].includes(value)) return "sanction";
  if (["FOLGA", "FERIADO", "FERIAS", "AFASTAMENTO", "LOJA FECHADA", "COMPENSADO"].includes(value)) return "off";
  return "other";
}

export function calculateLife(input: { delayMinutes: number; labels: Array<string | null>; config: PulseConfig["life"] }) {
  const counts = input.labels.reduce((acc, label) => {
    const type = normalizeOccurrence(label);
    if (type === "absence") acc.absences += 1;
    if (type === "medical") acc.medical += 1;
    if (type === "sanction") acc.sanctions += 1;
    return acc;
  }, { absences: 0, medical: 0, sanctions: 0 });
  const delayPenalty = (input.delayMinutes / 60) * input.config.delay_per_hour;
  const percent = Math.max(0, Math.min(100, 100 - delayPenalty - counts.absences * input.config.absence - counts.medical * input.config.medical - counts.sanctions * input.config.sanction));
  return { percent, ...counts };
}

function minutes(v: string | null | undefined) { return parseClockValue(v ?? null); }

export function calculatePunctualityDay(day: AttendanceDay, cfg: PulseConfig["punctuality"]): PulsePunctualityDay {
  const occurrence = normalizeOccurrence(day.metrics.label);
  if (occurrence === "off") return { date: day.date, score: null, deviationMinutes: 0, reason: "dia fora da média", onTime: null };
  const entry = minutes(day.entries[0]);
  const intervalOut = minutes(day.exits[0]);
  const intervalReturn = minutes(day.entries[1]);
  const finalExit = minutes(day.exits[1] ?? day.exits[0]);
  const expectedStart = minutes(day.expectedPeriods?.[0]?.start);
  const expectedEnd = minutes(day.expectedPeriods?.at(-1)?.end);
  if (entry === null || expectedStart === null || expectedEnd === null) return { date: day.date, score: null, deviationMinutes: 0, reason: "sem batida ou horário previsto", onTime: null };

  let deviation = 0;
  const reasons: string[] = [];
  if (entry > expectedStart) { const d = entry - expectedStart; deviation += d; reasons.push(`entrada atrasada ${d} min`); }
  if (entry < expectedStart - cfg.early_tolerance) { const d = expectedStart - entry - cfg.early_tolerance; deviation += d; reasons.push(`entrada antecipada ${d} min além da tolerância`); }
  if (intervalOut !== null && intervalReturn !== null) {
    const breakMinutes = intervalReturn >= intervalOut ? intervalReturn - intervalOut : intervalReturn + 1440 - intervalOut;
    const diff = Math.abs(breakMinutes - 60);
    if (diff > cfg.interval_tolerance) { const d = diff - cfg.interval_tolerance; deviation += d; reasons.push(`intervalo desviou ${d} min`); }
  }
  if (finalExit !== null && finalExit > expectedEnd + cfg.late_exit_tolerance) {
    const d = finalExit - expectedEnd - cfg.late_exit_tolerance; deviation += d; reasons.push(`saída depois ${d} min`);
  }
  const score = Math.max(0, 100 - deviation * cfg.weight);
  return { date: day.date, score, deviationMinutes: deviation, reason: reasons.join("; ") || "sem desvio", onTime: deviation === 0 };
}

export function aggregatePunctuality(days: PulsePunctualityDay[]) {
  const measured = days.filter((d) => d.score !== null);
  const percent = measured.length ? measured.reduce((s, d) => s + (d.score ?? 0), 0) / measured.length : null;
  const daysOnTime = measured.filter((d) => d.onTime).length;
  let sequence = 0;
  for (const d of days) {
    if (d.onTime === null) continue;
    if (d.onTime) sequence += 1; else sequence = 0;
  }
  return { percent, daysMeasured: measured.length, daysOnTime, sequenceOnTime: sequence, totalOnTime: daysOnTime };
}

export function calculateCollective(input: PulseCollectiveInput, weights: PulseConfig["collectiveWeights"]): PulseCollectiveResult {
  const raw = [
    input.sanitaryScore === null ? null : { key: "sanitary", label: "Laudo/visita sanitária", value: input.sanitaryScore, nominalWeight: weights.sanitary },
    input.deliveryScore === null ? null : { key: "delivery", label: "Plataformas de delivery", value: input.deliveryScore, nominalWeight: weights.delivery },
    input.operationalErrors === null ? null : { key: "errors", label: "Erros operacionais", value: Math.max(0, 100 - input.operationalErrors * 2), nominalWeight: weights.errors },
  ].filter(Boolean) as Array<{ key: string; label: string; value: number; nominalWeight: number }>;
  const measuredWeight = raw.reduce((s, x) => s + x.nominalWeight, 0);
  if (!measuredWeight) return { percent: 0, legs: [], measuredWeight: 0 };
  const legs = raw.map((x) => ({ ...x, effectiveWeight: x.nominalWeight / measuredWeight * 100 }));
  const percent = legs.reduce((s, x) => s + x.value * x.effectiveWeight / 100, 0);
  return { percent, legs, measuredWeight };
}

export function rewardAmounts(input: { life: number; executionRate: number | null; maxExecutionRate: number | null; collective: number; position: number; tenureFactor: number; caps: PulseConfig["caps"] }) {
  const attendanceAmount = input.life / 100 * input.caps.attendance * input.tenureFactor;
  const scoreAmount = input.executionRate === null || !input.maxExecutionRate ? 0 : Math.min(input.caps.score, input.executionRate / input.maxExecutionRate * input.caps.score);
  const collectiveAmount = input.collective / 100 * input.caps.collective * input.tenureFactor;
  const podiumAmount = input.caps.podium[String(input.position)] ?? 0;
  return { attendanceAmount, scoreAmount, collectiveAmount, podiumAmount, totalAmount: attendanceAmount + scoreAmount + collectiveAmount + podiumAmount };
}
