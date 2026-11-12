import { describe, expect, it } from "vitest";
import { AUTO_REFRESH_INTERVAL_MS, formatRefreshInterval, shouldPauseAutoRefresh } from "@/src/lib/refresh";

describe("refresh controls", () => {
  it("uses a one-minute automatic refresh interval", () => {
    expect(AUTO_REFRESH_INTERVAL_MS).toBe(60_000);
    expect(formatRefreshInterval(AUTO_REFRESH_INTERVAL_MS)).toBe("1 min");
  });

  it("pauses automatic refresh while the user is editing or the page is hidden", () => {
    expect(shouldPauseAutoRefresh({ visibilityState: "hidden", hasFocusedEditable: false, hasOpenDetails: false })).toBe(true);
    expect(shouldPauseAutoRefresh({ visibilityState: "visible", hasFocusedEditable: true, hasOpenDetails: false })).toBe(true);
    expect(shouldPauseAutoRefresh({ visibilityState: "visible", hasFocusedEditable: false, hasOpenDetails: true })).toBe(true);
    expect(shouldPauseAutoRefresh({ visibilityState: "visible", hasFocusedEditable: false, hasOpenDetails: false })).toBe(false);
  });
});
