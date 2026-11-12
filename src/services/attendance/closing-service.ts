import { getVisibleEmployees } from "@/src/services/employees/filtered-employees-service";
import { getAttendanceMonth } from "./attendance-service";

export interface EmployeeClosing {
  cpf: string; name: string; workedDays: number; absences: number; medicalCertificates: number; sanctions: number; delayMinutes: number; overtimeMinutes: number; nightMinutesReduced: number; holidayDays: number;
}

function normalizedLabel(label: string | null): string {
  return (label ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
}

export async function getMonthlyClosing(month: string): Promise<EmployeeClosing[]> {
  const employees = await getVisibleEmployees(false);
  return Promise.all(employees.map(async (employee) => {
    const attendance = await getAttendanceMonth(employee.cpf, month);
    const labels = attendance.days.map((day) => normalizedLabel(day.metrics.label));
    return {
      cpf: employee.cpf,
      name: employee.name,
      workedDays: attendance.days.filter((day) => (day.metrics.workedMinutes ?? 0) > 0).length,
      absences: labels.filter((label) => label === "FALTA").length,
      medicalCertificates: labels.filter((label) => label === "ATESTADO").length,
      sanctions: labels.filter((label) => label === "SANCAO").length,
      delayMinutes: attendance.totals.delayMinutes,
      overtimeMinutes: attendance.totals.overtimeMinutes,
      nightMinutesReduced: attendance.totals.nightMinutesReduced,
      holidayDays: labels.filter((label) => label === "FERIADO").length,
    };
  }));
}
