import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { createSecullumClient } from "@/src/services/secullum/client-factory";
import { getEmployees } from "@/src/services/secullum/employees-service";

export async function POST() {
  try {
    await requireApiUser(["admin"]);
    const employees = await getEmployees(await createSecullumClient());
    return NextResponse.json({ ok: true, employees: employees.length });
  } catch (error) { return apiError(error); }
}
