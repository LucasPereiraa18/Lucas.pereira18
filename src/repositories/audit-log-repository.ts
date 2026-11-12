import { createClient } from "@/src/lib/supabase/server";

export interface AuditEntry {
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceKey?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_key: entry.resourceKey ?? null,
    metadata: entry.metadata ?? {},
  });
  if (error) throw new Error(`AUDIT_WRITE_FAILED:${error.message}`);
}
