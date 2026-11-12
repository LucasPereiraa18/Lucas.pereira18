import type { SecullumPunchDay } from "@/src/domain/secullum/types";
import type { DailyMetrics } from "@/src/domain/time/types";
import { calculateDailyMetrics } from "@/src/domain/time/calculator";
import { dateRange, monthRange } from "@/src/domain/time/date";
import { deriveLabel } from "@/src/domain/time/labels";
import { resolveExpectedSchedule } from "@/src/domain/time/schedule";
import { listClosedDays } from "@/src/repositories/closed-day-repository";
import { listScheduleExceptions } from "@/src/repositories/exception-repository";
import { listManualLabels } from "@/src/repositories/manual-label-repository";
import { recordSyncLog } from "@/src/repositories/sync-log-repository";
import { getPublicConfig } from "@/src/services/secullum/config-service";
import { createSecullumClient } from "@/src/services/secullum/client-factory";
import { SecullumApiError } from "@/src/services/secullum/http-client";
import { getPunches } from "@/src/services/secullum/punches-service";

export interface AttendanceDay {
  date: string;
  entries: Array<string | null>;
  exits: Array<string | null>;
  metrics: DailyMetrics;
  derivedLabel: string | null;
  manualLabel: string | null;
  hasSecullumData: boolean;
  isClosedDay: boolean;
  isExceptionDay: boolean;
  expectedPeriods: Array<{ start: string; end: string }>;
}
export interface AttendanceMonth { cpf: string; month: string; days: AttendanceDay[]; totals: { workedMinutes: number; delayMinutes: number; overtimeMinutes: number; nightMinutesReduced: number; }; }

function emptyDay(date: string): SecullumPunchDay {
  return { date, entries: [null, null, null, null, null], exits: [null, null, null, null, null], memoryEntries: [null, null, null, null, null], memoryExits: [null, null, null, null, null], dayOff: false, compensated: false, observations: null, allowances: [], raw: {} };
}

export async function getAttendanceMonth(cpf: string, month: string): Promise<AttendanceMonth> {
  const { startDate, endDate } = monthRange(month);
  const config = await getPublicConfig();
  if (!config) throw new Error("SECULLUM_CONFIG_MISSING");
  const startedAt = new Date().toISOString();
  try {
    const client = await createSecullumClient();
    const [punchDays, labels, exceptions, closedDays] = await Promise.all([
      getPunches(client, { cpf, startDate, endDate }),
      listManualLabels(cpf, startDate, endDate),
      listScheduleExceptions(cpf, startDate, endDate),
      listClosedDays(startDate, endDate),
    ]);
    const byDate = new Map(punchDays.filter((day) => day.date).map((day) => [day.date, day]));
    const labelByDate = new Map(labels.map((item) => [item.workDate, item.label]));
    const exceptionDates = new Set(exceptions.map((item) => item.workDate));
    const days = dateRange(startDate, endDate).map((date) => {
      const sourceDay = byDate.get(date);
      const day = sourceDay ?? emptyDay(date);
      const schedule = resolveExpectedSchedule(day, punchDays, config.defaultSchedule);
      const manualLabel = labelByDate.get(date) ?? null;
      const closed = closedDays.has(date);
      const systemLabel = closed ? "LOJA FECHADA" : null;
      const metrics = calculateDailyMetrics({
        day,
        schedule,
        toleranceMinutes: config.toleranceMinutes,
        manualLabel: manualLabel ?? systemLabel,
        isClosedDay: closed,
        isExceptionDay: exceptionDates.has(date),
      });
      return { date, entries: day.entries, exits: day.exits, metrics, derivedLabel: deriveLabel(day), manualLabel, hasSecullumData: Boolean(sourceDay), isClosedDay: closed, isExceptionDay: exceptionDates.has(date), expectedPeriods: schedule.periods };
    });
    const totals = days.reduce((acc, day) => ({
      workedMinutes: acc.workedMinutes + (day.metrics.workedMinutes ?? 0),
      delayMinutes: acc.delayMinutes + day.metrics.totalDelayMinutes,
      overtimeMinutes: acc.overtimeMinutes + day.metrics.overtimeMinutes,
      nightMinutesReduced: acc.nightMinutesReduced + day.metrics.nightMinutesReduced,
    }), { workedMinutes: 0, delayMinutes: 0, overtimeMinutes: 0, nightMinutesReduced: 0 });
    await recordSyncLog({ operation: "attendance_month", startedAt, finishedAt: new Date().toISOString(), status: "success" });
    return { cpf, month, days, totals };
  } catch (error) {
    const code = error instanceof SecullumApiError ? error.code : error instanceof Error ? error.message.split(":")[0] : "UNKNOWN";
    const message = error instanceof SecullumApiError ? error.body : error instanceof Error ? error.message : String(error);
    try { await recordSyncLog({ operation: "attendance_month", startedAt, finishedAt: new Date().toISOString(), status: "error", errorCode: code, errorMessage: message }); } catch {}
    throw error;
  }
}
