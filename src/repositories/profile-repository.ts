import type { AppUser, UserRole } from "@/src/domain/auth/types";
import { createClient } from "@/src/lib/supabase/server";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  active: boolean;
};

export async function getProfile(userId: string): Promise<AppUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,display_name,role,active")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) throw new Error(`PROFILE_READ_FAILED:${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.display_name,
    role: data.role,
    active: data.active,
  };
}
