import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { getVisibleEmployees } from "@/src/services/employees/filtered-employees-service";

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const includeInactive = new URL(request.url).searchParams.get("inativos") === "1";
    return NextResponse.json({ data: await getVisibleEmployees(includeInactive) });
  } catch (error) { return apiError(error); }
}
