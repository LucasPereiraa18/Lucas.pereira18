import { NextRequest } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { formatDuration } from "@/src/domain/time/clock";
import { getMonthlyClosing } from "@/src/services/attendance/closing-service";
import { toCsv } from "@/src/services/attendance/csv";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    const month = request.nextUrl.searchParams.get("mes") ?? "";
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return new Response(JSON.stringify({ error: "INVALID_MONTH" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const closing = await getMonthlyClosing(month);
    const csv = toCsv(
      ["Funcionário", "CPF", "Dias trabalhados", "Faltas", "Atestados", "Sanções", "Feriados trabalhados", "Atrasos", "Horas extras", "Adicional noturno"],
      closing.map((row) => [row.name, row.cpf, row.workedDays, row.absences, row.medicalCertificates, row.sanctions, row.holidayDays, formatDuration(row.delayMinutes), formatDuration(row.overtimeMinutes), formatDuration(row.nightMinutesReduced)]),
    );
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fechamento-${month}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
