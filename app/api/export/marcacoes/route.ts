import { NextRequest } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { formatDuration } from "@/src/domain/time/clock";
import { formatDateBR } from "@/src/lib/format";
import { getAttendanceMonth } from "@/src/services/attendance/attendance-service";
import { toCsv } from "@/src/services/attendance/csv";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    const cpf = request.nextUrl.searchParams.get("cpf")?.replace(/\D/g, "") ?? "";
    const month = request.nextUrl.searchParams.get("mes") ?? "";
    if (!/^\d{11}$/.test(cpf) || !/^\d{4}-\d{2}$/.test(month)) {
      return new Response(JSON.stringify({ error: "INVALID_PARAMETERS" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const attendance = await getAttendanceMonth(cpf, month);
    const csv = toCsv(
      ["Data", "Entrada", "Saída intervalo", "Retorno", "Saída", "Horas trabalhadas", "Atraso", "Hora extra", "Adicional noturno", "Situação"],
      attendance.days.map((day) => [
        formatDateBR(day.date),
        day.entries[0] ?? "",
        day.exits[0] ?? "",
        day.entries[1] ?? "",
        day.exits[1] ?? "",
        formatDuration(day.metrics.workedMinutes ?? 0),
        formatDuration(day.metrics.totalDelayMinutes),
        formatDuration(day.metrics.overtimeMinutes),
        formatDuration(day.metrics.nightMinutesReduced),
        day.metrics.label ?? (day.hasSecullumData ? "Normal" : "Sem batida"),
      ]),
    );
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="marcacoes-${cpf}-${month}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
