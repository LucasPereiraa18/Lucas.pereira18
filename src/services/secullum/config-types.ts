import type { SchedulePeriod } from "@/src/domain/time/types";

export interface SecullumConfigPublic {
  username: string;
  databaseId: string;
  hasPassword: boolean;
  mode: "read_only";
  toleranceMinutes: number;
  defaultSchedule: SchedulePeriod[] | null;
  timezone: string;
  openingTime: string | null;
  repGraceMinutes: number;
}

export interface SecullumConfigSecret extends SecullumConfigPublic {
  password: string;
}

export interface SaveSecullumConfigInput {
  username: string;
  databaseId: string;
  password?: string;
  toleranceMinutes: number;
  defaultSchedule: SchedulePeriod[] | null;
  timezone: string;
  openingTime: string | null;
  repGraceMinutes: number;
}
