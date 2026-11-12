import { describe, expect, it } from "vitest";
import { calculateDailyMetrics } from "@/src/domain/time/calculator";
import type { SecullumPunchDay } from "@/src/domain/secullum/types";

function day(overrides: Partial<SecullumPunchDay> = {}): SecullumPunchDay {
  return { date: "2026-10-27", entries: ["16:04", "19:50", null, null, null], exits: ["18:50", "23:45", null, null, null], memoryEntries: [], memoryExits: [], dayOff: false, compensated: false, observations: null, allowances: [], raw: {}, ...overrides };
}

const schedule = { periods: [{ start: "16:00", end: "17:45" }, { start: "18:45", end: "23:45" }], source: "day-memory" as const };

describe("daily attendance calculator", () => {
  it("calculates worked time, tolerance, overtime and reduced night time", () => {
    const result = calculateDailyMetrics({ day: day(), schedule, toleranceMinutes: 5 });
    expect(result.workedMinutes).toBe(401);
    expect(result.entryDelayMinutes).toBe(0);
    // The source document's duration formula yields zero here because both breaks are 60 min.
    expect(result.intervalDelayMinutes).toBe(0);
    expect(result.overtimeMinutes).toBe(0);
    expect(result.nightMinutesReduced).toBe(120);
  });

  it("counts the full delay when it exceeds tolerance", () => {
    const result = calculateDailyMetrics({ day: day({ entries: ["16:06", null, null, null, null], exits: ["17:45", null, null, null, null] }), schedule: { periods: [schedule.periods[0]], source: "day-memory" }, toleranceMinutes: 5 });
    expect(result.entryDelayMinutes).toBe(6);
  });

  it("does not calculate a textual FOLGA as time", () => {
    const result = calculateDailyMetrics({ day: day({ entries: ["FOLGA", null, null, null, null], exits: [null, null, null, null, null] }), schedule, toleranceMinutes: 5 });
    expect(result.workedMinutes).toBeNull();
    expect(result.label).toBe("FOLGA");
  });
});
