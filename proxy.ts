import { auth } from "@/src/lib/neon/auth-server";

// Auth views and /api/auth/* are public automatically. Private app routes
// still perform server-side role checks (middleware alone is not authorization).
export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
