export type UserRole = "admin" | "gestor";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  active: boolean;
}
