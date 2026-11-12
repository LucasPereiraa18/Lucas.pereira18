import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/src/lib/auth";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
