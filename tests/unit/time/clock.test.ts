import { describe, expect, it } from "vitest";
import { formatDuration, parseClockValue } from "@/src/domain/time/clock";

describe("clock parsing", () => {
  it("parses HH:MM", () => expect(parseClockValue("23:45")).toBe(1425));
  it("returns null for labels", () => expect(parseClockValue("FOLGA")).toBeNull());
  it("formats durations", () => expect(formatDuration(401)).toBe("06:41"));
});
