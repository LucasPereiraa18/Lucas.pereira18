export const AUTO_REFRESH_INTERVAL_MS = 60_000;

export function formatRefreshInterval(milliseconds: number): string {
  if (milliseconds % 60_000 === 0) {
    const minutes = milliseconds / 60_000;
    return `${minutes} min`;
  }

  return `${Math.round(milliseconds / 1_000)} s`;
}

export type AutoRefreshSafetyInput = {
  visibilityState: "visible" | "hidden" | "prerender";
  hasFocusedEditable: boolean;
  hasOpenDetails: boolean;
};

export function shouldPauseAutoRefresh(input: AutoRefreshSafetyInput): boolean {
  return input.visibilityState !== "visible" || input.hasFocusedEditable || input.hasOpenDetails;
}
