"use server";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/neon/auth-server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { error } = await auth.signIn.email({ email, password });
  if (error) redirect("/auth/sign-in?erro=credenciais");
  redirect("/painel");
}

export async function logout() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
