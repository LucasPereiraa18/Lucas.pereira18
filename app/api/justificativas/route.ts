import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/src/lib/api";
import { createSecullumClient } from "@/src/services/secullum/client-factory";
import { getPendingRequests } from "@/src/services/secullum/pending-service";

export async function GET() {
  try {
    await requireApiUser();
    return NextResponse.json({ data: await getPendingRequests(await createSecullumClient()) });
  } catch (error) { return apiError(error); }
}
