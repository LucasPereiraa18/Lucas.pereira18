"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/src/lib/auth";
import { recordAudit } from "@/src/repositories/audit-log-repository";
import { hideEmployee, unhideEmployee } from "@/src/repositories/hidden-employee-repository";
import { normalizeCpf } from "@/src/services/secullum/normalizers";

export async function hideEmployeeAction(formData: FormData) {
  const user = await requireRole("admin");
  const cpf = normalizeCpf(String(formData.get("cpf") ?? ""));
  await hideEmployee(cpf, user.id, String(formData.get("reason") ?? "").trim() || null);
  await recordAudit({ actorId: user.id, action: "employee.hidden", resourceType: "employee", resourceKey: cpf });
  revalidatePath("/funcionarios");
}

export async function unhideEmployeeAction(formData: FormData) {
  const user = await requireRole("admin");
  const cpf = normalizeCpf(String(formData.get("cpf") ?? ""));
  await unhideEmployee(cpf);
  await recordAudit({ actorId: user.id, action: "employee.unhidden", resourceType: "employee", resourceKey: cpf });
  revalidatePath("/funcionarios");
}
