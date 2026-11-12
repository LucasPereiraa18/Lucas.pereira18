import { NextRequest, NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { getAttendanceMonth } from "@/src/services/attendance/attendance-service";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    const cpf = request.nextUrl.searchParams.get("cpf")?.replace(/\D/g, "") ?? "";
    const date = request.nextUrl.searchParams.get("data") ?? "";
    if (!/^\d{11}$/.test(cpf) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "INVALID_PARAMETERS" }, { status: 400 });
    }
    const attendance = await getAttendanceMonth(cpf, date.slice(0, 7));
    return NextResponse.json({ cpf, date, day: attendance.days.find((item) => item.date === date) ?? null });
  } catch (error) {
    return apiError(error);
  }
}
