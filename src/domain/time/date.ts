import { APP_TIME_ZONE } from "./types";

export function localDateISO(date = new Date(), timeZone = APP_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function localMinuteOfDay(date = new Date(), timeZone = APP_TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

export function monthRange(month: string): { startDate: string; endDate: string } {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("INVALID_MONTH");
  const [year, monthNumber] = month.split("-").map(Number);
  if (monthNumber < 1 || monthNumber > 12) throw new Error("INVALID_MONTH");
  const last = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { startDate: `${month}-01`, endDate: `${month}-${String(last).padStart(2, "0")}` };
}

export function dateRange(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (cursor <= end) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export function currentMonthKey(date = new Date(), timeZone = APP_TIME_ZONE): string {
  return localDateISO(date, timeZone).slice(0, 7);
}
