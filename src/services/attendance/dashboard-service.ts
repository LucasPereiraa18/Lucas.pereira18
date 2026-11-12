import { localDateISO, localMinuteOfDay } from "@/src/domain/time/date";
import { parseClockValue } from "@/src/domain/time/clock";
import { getLastSyncLog } from "@/src/repositories/sync-log-repository";
import { listClosedDays } from "@/src/repositories/closed-day-repository";
import { getVisibleEmployees } from "@/src/services/employees/filtered-employees-service";
import { getPublicConfig } from "@/src/services/secullum/config-service";
import { getAttendanceMonth } from "./attendance-service";

export interface DashboardSummary {
  month: string;
  today: string;
  employees: number;
  workingNow: Array<{ cpf: string; name: string }>;
  todayDelayMinutes: number;
  todayOvertimeMinutes: number;
  monthDelayMinutes: number;
  monthOvertimeMinutes: number;
  monthNightMinutesReduced: number;
  possibleRepSyncFailure: boolean;
  lastSync: { status: string; finishedAt: string | null; errorMessage: string | null } | null;
}

export async function getDashboardSummary(month?: string): Promise<DashboardSummary> {
  const today = localDateISO();
  const targetMonth = month ?? today.slice(0, 7);
  const [employees, config, closedDays] = await Promise.all([getVisibleEmployees(false), getPublicConfig(), listClosedDays(today, today)]);
  if (!config) throw new Error("SECULLUM_CONFIG_MISSING");
  const attendance = await Promise.all(employees.map((employee) => getAttendanceMonth(employee.cpf, targetMonth)));
  const todayByEmployee = attendance.map((item, index) => ({ employee: employees[index], day: item.days.find((day) => day.date === today) ?? null, month: item }));
  const workingNow = todayByEmployee.filter(({ day }) => {
    if (!day) return false;
    const entries = day.entries.filter((value) => parseClockValue(value) !== null).length;
    const exits = day.exits.filter((value) => parseClockValue(value) !== null).length;
    return entries > exits;
  }).map(({ employee }) => ({ cpf: employee.cpf, name: employee.name }));

  const totalTodayPunches = todayByEmployee.reduce((sum, { day }) => sum + (day ? [...day.entries, ...day.exits].filter((value) => parseClockValue(value) !== null).length : 0), 0);
  const openingMinute = config.openingTime ? parseClockValue(config.openingTime.slice(0, 5)) : null;
  const possibleRepSyncFailure = !closedDays.has(today) && employees.length > 0 && totalTodayPunches === 0 && openingMinute !== null && localMinuteOfDay() > openingMinute + config.repGraceMinutes;

  const lastSync = await getLastSyncLog();
  return {
    month: targetMonth,
    today,
    employees: employees.length,
    workingNow,
    todayDelayMinutes: todayByEmployee.reduce((sum, { day }) => sum + (day?.metrics.totalDelayMinutes ?? 0), 0),
    todayOvertimeMinutes: todayByEmployee.reduce((sum, { day }) => sum + (day?.metrics.overtimeMinutes ?? 0), 0),
    monthDelayMinutes: attendance.reduce((sum, item) => sum + item.totals.delayMinutes, 0),
    monthOvertimeMinutes: attendance.reduce((sum, item) => sum + item.totals.overtimeMinutes, 0),
    monthNightMinutesReduced: attendance.reduce((sum, item) => sum + item.totals.nightMinutesReduced, 0),
    possibleRepSyncFailure,
    lastSync,
  };
}
