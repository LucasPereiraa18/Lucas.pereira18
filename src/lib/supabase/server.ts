import { createClient as createNeonClient } from "@neondatabase/neon-js";
import { auth } from "@/src/lib/neon/auth-server";

/**
 * Neon Data API: keep the existing repository `.from()` queries unchanged.
 * The JWT is supplied per request and verified by Neon's Data API; it is never
 * replaced by an admin/owner database token, so PostgreSQL RLS remains active.
 */
export async function createClient() {
  return createNeonClient({
    dataApi: {
      url: process.env.NEON_DATA_API_URL!,
      getToken: async () => {
        const { data, error } = await auth.token();
        if (error || !data?.token) return "";
        return data.token;
      },
    },
  });
}
