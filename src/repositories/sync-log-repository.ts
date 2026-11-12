import { createClient } from "@/src/lib/supabase/server";

export async function recordSyncLog(input: { operation: string; startedAt: string; finishedAt: string; status: "success" | "error"; errorCode?: string | null; errorMessage?: string | null; }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("sync_logs").insert({
    operation: input.operation,
    started_at: input.startedAt,
    finished_at: input.finishedAt,
    status: input.status,
    error_code: input.errorCode ?? null,
    error_message: input.errorMessage?.slice(0, 2000) ?? null,
  });
  if (error) throw new Error(`SYNC_LOG_WRITE_FAILED:${error.message}`);
}

export async function getLastSyncLog(): Promise<{ status: string; finishedAt: string | null; errorMessage: string | null } | null> {
  const supabase = await import("@/src/lib/supabase/server").then((m) => m.createClient());
  const { data, error } = await supabase.from("sync_logs").select("status,finished_at,error_message").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`SYNC_LOG_READ_FAILED:${error.message}`);
  return data ? { status: data.status, finishedAt: data.finished_at, errorMessage: data.error_message } : null;
}
