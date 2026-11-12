import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { getDashboardSummary } from "@/src/services/attendance/dashboard-service";

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const month = new URL(request.url).searchParams.get("mes") ?? undefined;
    return NextResponse.json({ data: await getDashboardSummary(month) });
  } catch (error) { return apiError(error); }
}
