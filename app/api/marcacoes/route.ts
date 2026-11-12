import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { getAttendanceMonth } from "@/src/services/attendance/attendance-service";

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const params = new URL(request.url).searchParams;
    const cpf = params.get("cpf");
    const month = params.get("mes");
    if (!cpf || !month) return NextResponse.json({ error: "CPF_AND_MONTH_REQUIRED" }, { status: 400 });
    return NextResponse.json({ data: await getAttendanceMonth(cpf, month) });
  } catch (error) { return apiError(error); }
}
