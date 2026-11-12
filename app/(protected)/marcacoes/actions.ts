"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/src/lib/auth";
import { recordAudit } from "@/src/repositories/audit-log-repository";
import { addClosedDay, removeClosedDay } from "@/src/repositories/closed-day-repository";
import { deleteScheduleException, upsertScheduleException } from "@/src/repositories/exception-repository";
import { deleteManualLabel, upsertManualLabel } from "@/src/repositories/manual-label-repository";
import { normalizeCpf } from "@/src/services/secullum/normalizers";

export async function saveManualLabel(formData: FormData) {
  const user = await requireRole("admin", "gestor");
  const cpf = normalizeCpf(String(formData.get("cpf") ?? ""));
  const date = String(formData.get("date") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (label) await upsertManualLabel(cpf, date, label, user.id);
  else await deleteManualLabel(cpf, date);
  await recordAudit({ actorId: user.id, action: label ? "manual_label.saved" : "manual_label.deleted", resourceType: "manual_label", resourceKey: `${cpf}:${date}`, metadata: { label: label || null } });
  revalidatePath("/marcacoes");
}

export async function saveException(formData: FormData) {
  const user = await requireRole("admin", "gestor");
  const cpf = normalizeCpf(String(formData.get("cpf") ?? ""));
  const date = String(formData.get("date") ?? "");
  const kind = String(formData.get("kind") ?? "authorized") as "training" | "event" | "authorized" | "other";
  const note = String(formData.get("note") ?? "").trim() || null;
  await upsertScheduleException(cpf, date, kind, note, user.id);
  await recordAudit({ actorId: user.id, action: "schedule_exception.saved", resourceType: "schedule_exception", resourceKey: `${cpf}:${date}`, metadata: { kind, note } });
  revalidatePath("/marcacoes");
}

export async function removeException(formData: FormData) {
  const user = await requireRole("admin", "gestor");
  const cpf = normalizeCpf(String(formData.get("cpf") ?? ""));
  const date = String(formData.get("date") ?? "");
  await deleteScheduleException(cpf, date);
  await recordAudit({ actorId: user.id, action: "schedule_exception.deleted", resourceType: "schedule_exception", resourceKey: `${cpf}:${date}` });
  revalidatePath("/marcacoes");
}

export async function markClosedDay(formData: FormData) {
  const user = await requireRole("admin");
  const date = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;
  await addClosedDay(date, user.id, reason);
  await recordAudit({ actorId: user.id, action: "closed_day.saved", resourceType: "closed_day", resourceKey: date, metadata: { reason } });
  revalidatePath("/marcacoes");
}

export async function unmarkClosedDay(formData: FormData) {
  const user = await requireRole("admin");
  const date = String(formData.get("date") ?? "");
  await removeClosedDay(date);
  await recordAudit({ actorId: user.id, action: "closed_day.deleted", resourceType: "closed_day", resourceKey: date });
  revalidatePath("/marcacoes");
}
