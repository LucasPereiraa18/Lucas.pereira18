import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { getPublicConfig, saveConfig } from "@/src/services/secullum/config-service";
import type { SaveSecullumConfigInput } from "@/src/services/secullum/config-types";

export async function GET() {
  try {
    await requireApiUser(["admin"]);
    return NextResponse.json({ data: await getPublicConfig() });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(["admin"]);
    const input = await request.json() as SaveSecullumConfigInput;
    await saveConfig(input, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
