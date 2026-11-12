"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/src/lib/auth";
import { upsertPulseCollective, upsertPulseScore } from "@/src/repositories/pulse/pulse-repository";

function nullableNumber(v:FormDataEntryValue|null){if(v==null||String(v).trim()==="") return null; const n=Number(v); return Number.isFinite(n)?n:null}
export async function saveScore(form:FormData){const u=await requireRole("admin","gestor"); await upsertPulseScore({cpf:String(form.get("cpf")),month:String(form.get("month")),assigned:Number(form.get("assigned")||0),completed:Number(form.get("completed")||0),points:Number(form.get("points")||0),note:String(form.get("note")||"")||null,userId:u.id}); revalidatePath("/gamificacao");}
export async function saveCollective(form:FormData){const u=await requireRole("admin","gestor"); await upsertPulseCollective({month:String(form.get("month")),sanitary:nullableNumber(form.get("sanitary")),delivery:nullableNumber(form.get("delivery")),errors:nullableNumber(form.get("errors")),sanitarySource:String(form.get("sanitarySource")||"")||null,deliverySource:String(form.get("deliverySource")||"")||null,notes:String(form.get("notes")||"")||null,userId:u.id}); revalidatePath("/gamificacao");}
