export const APP_TIME_ZONE = "America/Sao_Paulo" as const;

export type ClockValue = string | null;

export interface SchedulePeriod {
  start: string;
  end: string;
}

export interface ExpectedSchedule {
  periods: SchedulePeriod[];
  source: "day-memory" | "employee-mode" | "global" | "unavailable";
}

export interface DailyMetrics {
  workedMinutes: number | null;
  entryDelayMinutes: number;
  intervalDelayMinutes: number;
  totalDelayMinutes: number;
  overtimeMinutes: number;
  nightMinutesReduced: number;
  expectedMinutes: number | null;
  label: string | null;
  scheduleSource: ExpectedSchedule["source"];
}
