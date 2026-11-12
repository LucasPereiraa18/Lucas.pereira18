import { decryptSecret, encryptSecret } from "@/src/lib/crypto/credential-vault";
import { recordAudit } from "@/src/repositories/audit-log-repository";
import { readSecullumConfigRow, upsertSecullumConfigRow } from "@/src/repositories/secullum-config-repository";
import type { SaveSecullumConfigInput, SecullumConfigPublic, SecullumConfigSecret } from "./config-types";

export async function getPublicConfig(): Promise<SecullumConfigPublic | null> {
  const row = await readSecullumConfigRow();
  if (!row) return null;
  return {
    username: row.username,
    databaseId: row.database_id,
    hasPassword: Boolean(row.encrypted_password),
    mode: "read_only",
    toleranceMinutes: row.tolerance_minutes,
    defaultSchedule: row.default_schedule,
    timezone: row.timezone,
    openingTime: row.opening_time,
    repGraceMinutes: row.rep_grace_minutes,
  };
}

export async function getSecretConfig(): Promise<SecullumConfigSecret> {
  const row = await readSecullumConfigRow();
  if (!row) throw new Error("SECULLUM_CONFIG_MISSING");
  return {
    username: row.username,
    databaseId: row.database_id,
    hasPassword: true,
    password: await decryptSecret(row.encrypted_password),
    mode: "read_only",
    toleranceMinutes: row.tolerance_minutes,
    defaultSchedule: row.default_schedule,
    timezone: row.timezone,
    openingTime: row.opening_time,
    repGraceMinutes: row.rep_grace_minutes,
  };
}

export async function saveConfig(input: SaveSecullumConfigInput, actorId: string): Promise<void> {
  const current = await readSecullumConfigRow();
  if (!current && !input.password) throw new Error("SECULLUM_PASSWORD_REQUIRED");

  const encryptedPassword = input.password
    ? await encryptSecret(input.password)
    : current!.encrypted_password;

  await upsertSecullumConfigRow({
    username: input.username,
    encrypted_password: encryptedPassword,
    database_id: input.databaseId,
    mode: "read_only",
    tolerance_minutes: input.toleranceMinutes,
    default_schedule: input.defaultSchedule,
    timezone: input.timezone,
    opening_time: input.openingTime,
    rep_grace_minutes: input.repGraceMinutes,
  }, actorId);

  await recordAudit({
    actorId,
    action: current ? "secullum_config.updated" : "secullum_config.created",
    resourceType: "secullum_config",
    resourceKey: "1",
    metadata: {
      username: input.username,
      databaseId: input.databaseId,
      toleranceMinutes: input.toleranceMinutes,
      timezone: input.timezone,
      openingTime: input.openingTime,
      repGraceMinutes: input.repGraceMinutes,
      passwordChanged: Boolean(input.password),
    },
  });
}
