import { redirect } from "next/navigation";
import type { AppUser, UserRole } from "@/src/domain/auth/types";
import { getProfile } from "@/src/repositories/profile-repository";
import { createClient } from "@/src/lib/supabase/server";

export class AuthorizationError extends Error {
  constructor(public readonly code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
  }
}

export function assertRole(user: AppUser | null, roles: readonly UserRole[]): AppUser {
  if (!user || !user.active) throw new AuthorizationError("UNAUTHENTICATED");
  if (!roles.includes(user.role)) throw new AuthorizationError("FORBIDDEN");
  return user;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) return null;
  const profile = await getProfile(userId);
  return profile?.active ? profile : null;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<AppUser> {
  return assertRole(await requireUser(), roles);
}
