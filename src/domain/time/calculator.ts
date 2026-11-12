import type { SecullumPunchDay } from "../secullum/types";
import type { DailyMetrics, ExpectedSchedule } from "./types";
import { normalizeEndMinute, parseClockValue } from "./clock";
import { deriveLabel } from "./labels";

export interface CalculateDailyInput {
  day: SecullumPunchDay;
  schedule: ExpectedSchedule;
  toleranceMinutes: number;
  manualLabel?: string | null;
  isClosedDay?: boolean;
  isExceptionDay?: boolean;
}

function validActualPeriods(day: SecullumPunchDay): Array<{ start: number; end: number }> {
  const result: Array<{ start: number; end: number }> = [];
  for (let i = 0; i < Math.max(day.entries.length, day.exits.length); i += 1) {
    const start = parseClockValue(day.entries[i]);
    const endRaw = parseClockValue(day.exits[i]);
    if (start !== null && endRaw !== null) result.push({ start, end: normalizeEndMinute(start, endRaw) });
  }
  return result;
}

function validExpectedPeriods(schedule: ExpectedSchedule): Array<{ start: number; end: number }> {
  return schedule.periods.flatMap((period) => {
    const start = parseClockValue(period.start);
    const endRaw = parseClockValue(period.end);
    return start !== null && endRaw !== null ? [{ start, end: normalizeEndMinute(start, endRaw) }] : [];
  });
}

function sumDurations(periods: Array<{ start: number; end: number }>): number {
  return periods.reduce((sum, period) => sum + Math.max(0, period.end - period.start), 0);
}

function overlap(startA: number, endA: number, startB: number, endB: number): number {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function nightClockMinutes(periods: Array<{ start: number; end: number }>): number {
  let total = 0;
  for (const period of periods) {
    // Normalize early-morning-only periods into the continuous 24:00-29:00 representation.
    const start = period.start < 5 * 60 ? period.start + 24 * 60 : period.start;
    const end = period.end <= 5 * 60 ? period.end + 24 * 60 : period.end;
    total += overlap(start, end, 22 * 60, 29 * 60);
  }
  return total;
}

export function calculateDailyMetrics(input: CalculateDailyInput): DailyMetrics {
  const actual = validActualPeriods(input.day);
  const expected = validExpectedPeriods(input.schedule);
  const derivedLabel = deriveLabel(input.day);
  const label = input.manualLabel?.trim() || derivedLabel;

  const workedMinutes = actual.length ? sumDurations(actual) : null;
  const expectedMinutes = expected.length ? sumDurations(expected) : null;
  const suppressDelay = Boolean(input.isClosedDay || input.isExceptionDay || label === "FOLGA" || label === "COMPENSADO");

  let entryDelayMinutes = 0;
  if (!suppressDelay && actual.length && expected.length) {
    const diff = Math.max(0, actual[0].start - expected[0].start);
    entryDelayMinutes = diff <= input.toleranceMinutes ? 0 : diff;
  }

  let intervalDelayMinutes = 0;
  if (!suppressDelay && actual.length >= 2 && expected.length >= 2) {
    const actualBreak = Math.max(0, actual[1].start - actual[0].end);
    const expectedBreak = Math.max(0, expected[1].start - expected[0].end);
    intervalDelayMinutes = Math.max(0, actualBreak - expectedBreak);
  }

  const overtimeMinutes = workedMinutes !== null && expectedMinutes !== null
    ? Math.max(0, workedMinutes - expectedMinutes)
    : 0;

  const reducedNight = Math.round(nightClockMinutes(actual) * (60 / 52.5));

  return {
    workedMinutes,
    entryDelayMinutes,
    intervalDelayMinutes,
    totalDelayMinutes: entryDelayMinutes + intervalDelayMinutes,
    overtimeMinutes,
    nightMinutesReduced: reducedNight,
    expectedMinutes,
    label,
    scheduleSource: input.schedule.source,
  };
}
