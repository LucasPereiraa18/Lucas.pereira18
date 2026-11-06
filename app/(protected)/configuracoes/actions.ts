"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/src/lib/auth";
import { saveConfig } from "@/src/services/secullum/config-service";
import type { SchedulePeriod } from "@/src/domain/time/types";

function scheduleFrom(formData: FormData): SchedulePeriod[] | null {
  const pairs = [["entrada1", "saida1"], ["entrada2", "saida2"]] as const;
  const periods = pairs.flatMap(([startKey, endKey]) => {
    const start = String(formData.get(startKey) ?? "").trim();
    const end = String(formData.get(endKey) ?? "").trim();
    return start && end ? [{ start, end }] : [];
  });
  return periods.length ? periods : null;
}

export async function saveConfigAction(formData: FormData) {
  const user = await requireRole("admin");
  await saveConfig({
    username: String(formData.get("username") ?? "").trim(),
    databaseId: String(formData.get("databaseId") ?? "").trim(),
    password: String(formData.get("password") ?? "") || undefined,
    toleranceMinutes: Number(formData.get("toleranceMinutes") ?? 5),
    defaultSchedule: scheduleFrom(formData),
    timezone: "America/Sao_Paulo",
    openingTime: String(formData.get("openingTime") ?? "").trim() || null,
    repGraceMinutes: Number(formData.get("repGraceMinutes") ?? 40),
  }, user.id);
  redirect("/configuracoes?salvo=1");
}
