import { NextResponse } from "next/server";
import { AuthorizationError, assertRole, getCurrentUser } from "@/src/lib/auth";
import type { AppUser, UserRole } from "@/src/domain/auth/types";
import { SecullumApiError } from "@/src/services/secullum/http-client";

export async function requireApiUser(roles: readonly UserRole[] = ["admin", "gestor"]): Promise<AppUser> {
  return assertRole(await getCurrentUser(), roles);
}

export function apiError(error: unknown): NextResponse {
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.code }, { status: error.code === "UNAUTHENTICATED" ? 401 : 403 });
  }

  if (error instanceof SecullumApiError) {
    return NextResponse.json(
      { error: error.code, upstreamStatus: error.status },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  if (message === "SECULLUM_CONFIG_MISSING") return NextResponse.json({ error: message }, { status: 409 });
  if (message === "SECULLUM_PASSWORD_REQUIRED") return NextResponse.json({ error: message }, { status: 400 });
  if (message === "INVALID_MONTH") return NextResponse.json({ error: message }, { status: 400 });

  return NextResponse.json(
    { error: "INTERNAL_ERROR" },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}
