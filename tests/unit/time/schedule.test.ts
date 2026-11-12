import { describe, expect, it } from "vitest";
import { resolveExpectedSchedule } from "@/src/domain/time/schedule";
import type { SecullumPunchDay } from "@/src/domain/secullum/types";

const base: SecullumPunchDay = { date: "2026-10-01", entries: [], exits: [], memoryEntries: [], memoryExits: [], dayOff: false, compensated: false, observations: null, allowances: [], raw: {} };
const withMemory = (date: string, start = "16:00", end = "23:45"): SecullumPunchDay => ({ ...base, date, memoryEntries: [start], memoryExits: [end] });

describe("schedule fallback", () => {
  it("uses the day's memory first", () => {
    expect(resolveExpectedSchedule(withMemory("2026-10-02"), [], [{ start: "10:00", end: "18:00" }]).source).toBe("day-memory");
  });

  it("uses the unique most frequent employee memory", () => {
    const target = { ...base, date: "2026-10-04" };
    const result = resolveExpectedSchedule(target, [withMemory("1"), withMemory("2"), withMemory("3", "10:00", "18:00")], null);
    expect(result.source).toBe("employee-mode");
    expect(result.periods[0]).toEqual({ start: "16:00", end: "23:45" });
  });

  it("falls back globally when there is no unique mode", () => {
    const target = { ...base, date: "2026-10-04" };
    const result = resolveExpectedSchedule(target, [withMemory("1"), withMemory("2", "10:00", "18:00")], [{ start: "12:00", end: "20:00" }]);
    expect(result.source).toBe("global");
  });
});
