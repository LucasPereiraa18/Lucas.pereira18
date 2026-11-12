"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { authClient } from "@/src/lib/neon/auth-client";

export function NeonProviders({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      redirectTo="/painel"
      emailOTP
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
