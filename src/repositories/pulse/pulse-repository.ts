import { createClient } from "@/src/lib/supabase/server";

export async function getPulseConfigRows() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_configs").select("key,value");
  if (error) throw error;
  return data ?? [];
}

export async function getPulseScores(month: string) {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_score_monthly").select("cpf,assigned,completed,points,source_note").eq("month", month);
  if (error) throw error;
  return data ?? [];
}

export async function getPulseCollective(month: string) {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_collective_monthly").select("*").eq("month", month).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertPulseScore(input: { cpf:string; month:string; assigned:number; completed:number; points:number; note?:string|null; userId:string }) {
  const sb = await createClient();
  const { error } = await sb.from("pulse_score_monthly").upsert({ cpf:input.cpf, month:input.month, assigned:input.assigned, completed:input.completed, points:input.points, source_note:input.note ?? null, updated_by:input.userId, updated_at:new Date().toISOString() });
  if (error) throw error;
}

export async function upsertPulseCollective(input: { month:string; sanitary:number|null; delivery:number|null; errors:number|null; sanitarySource?:string|null; deliverySource?:string|null; notes?:string|null; userId:string }) {
  const sb = await createClient();
  const { error } = await sb.from("pulse_collective_monthly").upsert({ month:input.month, sanitary_score:input.sanitary, delivery_score:input.delivery, operational_errors:input.errors, sanitary_source:input.sanitarySource ?? null, delivery_source:input.deliverySource ?? null, notes:input.notes ?? null, updated_by:input.userId, updated_at:new Date().toISOString() });
  if (error) throw error;
}

export async function getPulseXpTotals() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_xp_history").select("cpf,amount");
  if (error) throw error;
  const map = new Map<string,number>();
  for (const row of data ?? []) map.set(row.cpf, (map.get(row.cpf) ?? 0) + row.amount);
  return map;
}

export async function getPulseCoinTotals() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_coins_history").select("cpf,amount");
  if (error) throw error;
  const map = new Map<string,number>();
  for (const row of data ?? []) map.set(row.cpf, (map.get(row.cpf) ?? 0) + row.amount);
  return map;
}

export async function getPulseLevels() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_levels").select("level,name,min_xp").order("level");
  if (error) throw error;
  return data ?? [];
}

export async function getPulseAchievementCounts() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_achievement_unlocks").select("cpf");
  if (error) throw error;
  const map = new Map<string,number>();
  for (const row of data ?? []) map.set(row.cpf, (map.get(row.cpf) ?? 0) + 1);
  return map;
}

export async function listPulseAchievements() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_achievements").select("*").eq("active", true).order("target");
  if (error) throw error;
  return data ?? [];
}

export async function listPulseStoreProducts() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_store_products").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function listPulseBonusHistory() {
  const sb = await createClient();
  const { data, error } = await sb.from("pulse_bonus_history").select("*").order("month", { ascending:false }).order("rank_position");
  if (error) throw error;
  return data ?? [];
}
