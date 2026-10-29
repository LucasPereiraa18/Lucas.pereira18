import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { app: "Ponto Líder", version: "2.0.0", module: "Líder Pulse" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
