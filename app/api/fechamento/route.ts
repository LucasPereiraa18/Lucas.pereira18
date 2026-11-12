import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { getMonthlyClosing } from "@/src/services/attendance/closing-service";

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const month = new URL(request.url).searchParams.get("mes");
    if (!month) return NextResponse.json({ error: "MONTH_REQUIRED" }, { status: 400 });
    return NextResponse.json({ data: await getMonthlyClosing(month) });
  } catch (error) { return apiError(error); }
}
