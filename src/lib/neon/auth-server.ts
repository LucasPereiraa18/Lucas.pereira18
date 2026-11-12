import { createNeonAuth } from "@neondatabase/auth/next/server";

/** Managed Neon Auth, proxied through this Next.js application. */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
