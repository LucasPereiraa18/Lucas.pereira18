import { redirect } from "next/navigation";
import type { AppUser, UserRole } from "@/src/domain/auth/types";
import { getProfile } from "@/src/repositories/profile-repository";
import { auth } from "@/src/lib/neon/auth-server";

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
  // Do not trust user IDs originating from request params, cookies or form data.
  const { data: session, error } = await auth.getSession();
  if (error || !session?.user?.id) return null;
  const profile = await getProfile(session.user.id);
  return profile?.active ? profile : null;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<AppUser> {
  return assertRole(await requireUser(), roles);
}
