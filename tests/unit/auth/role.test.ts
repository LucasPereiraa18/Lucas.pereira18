import { describe, expect, it } from "vitest";
import { assertRole, AuthorizationError } from "@/src/lib/auth";
import type { AppUser } from "@/src/domain/auth/types";

const admin: AppUser = { id: "1", email: "a@lider.test", name: "Admin", role: "admin", active: true };
const manager: AppUser = { id: "2", email: "g@lider.test", name: "Gestor", role: "gestor", active: true };

describe("role authorization", () => {
  it("allows an admin into an admin-only resource", () => {
    expect(assertRole(admin, ["admin"])).toBe(admin);
  });

  it("rejects a manager from an admin-only resource", () => {
    expect(() => assertRole(manager, ["admin"])).toThrowError(new AuthorizationError("FORBIDDEN"));
  });

  it("rejects missing users", () => {
    expect(() => assertRole(null, ["admin", "gestor"])).toThrowError(new AuthorizationError("UNAUTHENTICATED"));
  });
});
