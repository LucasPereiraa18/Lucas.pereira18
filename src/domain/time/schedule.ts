import type { SecullumPunchDay } from "../secullum/types";
import type { ExpectedSchedule, SchedulePeriod } from "./types";
import { parseClockValue } from "./clock";

function periodsFromMemory(day: SecullumPunchDay): SchedulePeriod[] {
  const periods: SchedulePeriod[] = [];
  for (let i = 0; i < Math.max(day.memoryEntries.length, day.memoryExits.length); i += 1) {
    const start = day.memoryEntries[i];
    const end = day.memoryExits[i];
    if (start && end && parseClockValue(start) !== null && parseClockValue(end) !== null) {
      periods.push({ start, end });
    }
  }
  return periods;
}

function scheduleKey(periods: SchedulePeriod[]): string {
  return periods.map((period) => `${period.start}-${period.end}`).join("|");
}

export function resolveExpectedSchedule(
  day: SecullumPunchDay,
  periodDays: SecullumPunchDay[],
  globalSchedule: SchedulePeriod[] | null,
): ExpectedSchedule {
  const own = periodsFromMemory(day);
  if (own.length) return { periods: own, source: "day-memory" };

  const candidates = periodDays
    .map(periodsFromMemory)
    .filter((periods) => periods.length > 0);

  const counts = new Map<string, { periods: SchedulePeriod[]; count: number; firstIndex: number }>();
  candidates.forEach((periods, index) => {
    const key = scheduleKey(periods);
    const current = counts.get(key);
    if (current) current.count += 1;
    else counts.set(key, { periods, count: 1, firstIndex: index });
  });

  const ranked = [...counts.values()].sort((a, b) => b.count - a.count || a.firstIndex - b.firstIndex);
  if (ranked.length && (ranked.length === 1 || ranked[0].count > ranked[1].count)) {
    return { periods: ranked[0].periods, source: "employee-mode" };
  }

  if (globalSchedule?.length) return { periods: globalSchedule, source: "global" };
  return { periods: [], source: "unavailable" };
}
