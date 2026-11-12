import { getVisibleEmployees } from "@/src/services/employees/filtered-employees-service";
import { getAttendanceMonth } from "@/src/services/attendance/attendance-service";
import { aggregatePunctuality, calculateCollective, calculateLife, calculatePunctualityDay, rewardAmounts } from "@/src/domain/pulse/engine";
import type { PulseConfig, PulseEmployeeResult } from "@/src/domain/pulse/types";
import { getPulseAchievementCounts, getPulseCoinTotals, getPulseCollective, getPulseConfigRows, getPulseLevels, getPulseScores, getPulseXpTotals } from "@/src/repositories/pulse/pulse-repository";

function n(v: unknown, fallback: number) { const x = Number(v); return Number.isFinite(x) ? x : fallback; }

export async function getPulseConfig(): Promise<PulseConfig> {
  const rows = await getPulseConfigRows();
  const map = new Map(rows.map((r:any) => [r.key, r.value]));
  const caps:any = map.get("reward_caps") ?? {};
  const life:any = map.get("life_penalties") ?? {};
  const punctuality:any = map.get("punctuality") ?? {};
  const collective:any = map.get("collective_weights") ?? {};
  const program:any = map.get("program") ?? {};
  return {
    caps: { attendance:n(caps.attendance,100), score:n(caps.score,100), collective:n(caps.collective,100), podium:caps.podium ?? {"1":100,"2":50,"3":25} },
    life: { delay_per_hour:n(life.delay_per_hour,1), absence:n(life.absence,10), medical:n(life.medical,5), sanction:n(life.sanction,15) },
    punctuality: { weight:n(punctuality.weight,10), early_tolerance:n(punctuality.early_tolerance,5), interval_tolerance:n(punctuality.interval_tolerance,2), late_exit_tolerance:n(punctuality.late_exit_tolerance,1) },
    collectiveWeights: { sanitary:n(collective.sanitary,40), delivery:n(collective.delivery,40), errors:n(collective.errors,20) },
    programName: String(program.name ?? "Líder Pulse"),
  };
}

function levelFor(xp:number, levels:any[]) {
  let current = levels[0] ?? { level:1, name:"Nível 1", min_xp:0 };
  for (const level of levels) if (xp >= Number(level.min_xp)) current = level;
  const next = levels.find((l:any) => Number(l.level) === Number(current.level)+1);
  return { level:Number(current.level), levelName:String(current.name), nextLevelXp:next ? Number(next.min_xp) : null };
}

export async function getPulseRanking(month:string): Promise<{ config:PulseConfig; collective:ReturnType<typeof calculateCollective>; employees:PulseEmployeeResult[] }> {
  const [employees, config, scores, collectiveRow, xpTotals, coins, levels, achievementCounts] = await Promise.all([
    getVisibleEmployees(false), getPulseConfig(), getPulseScores(month), getPulseCollective(month), getPulseXpTotals(), getPulseCoinTotals(), getPulseLevels(), getPulseAchievementCounts()
  ]);
  const scoreMap = new Map(scores.map((s:any) => [s.cpf, s]));
  const collective = calculateCollective({ sanitaryScore:collectiveRow?.sanitary_score == null ? null : Number(collectiveRow.sanitary_score), deliveryScore:collectiveRow?.delivery_score == null ? null : Number(collectiveRow.delivery_score), operationalErrors:collectiveRow?.operational_errors == null ? null : Number(collectiveRow.operational_errors) }, config.collectiveWeights);
  const provisional = await Promise.all(employees.map(async (employee) => {
    const attendance = await getAttendanceMonth(employee.cpf, month);
    const labels = attendance.days.map(d => d.metrics.label);
    const life = calculateLife({ delayMinutes:attendance.totals.delayMinutes, labels, config:config.life });
    const punctDays = attendance.days.map(d => calculatePunctualityDay(d, config.punctuality));
    const punct = aggregatePunctuality(punctDays);
    const score:any = scoreMap.get(employee.cpf);
    const assigned = Number(score?.assigned ?? 0), completed = Number(score?.completed ?? 0), points = Number(score?.points ?? 0);
    const executionRate = assigned > 0 ? completed / assigned * 100 : null;
    return { employee, attendance, life, punct, punctDays, assigned, completed, points, executionRate };
  }));
  const sorted = [...provisional].sort((a,b) => b.life.percent-a.life.percent || (b.punct.percent ?? 100)-(a.punct.percent ?? 100) || (b.executionRate ?? -1)-(a.executionRate ?? -1) || b.points-a.points || a.employee.name.localeCompare(b.employee.name,"pt-BR"));
  const maxExecutionRate = Math.max(0, ...provisional.map(p => p.executionRate ?? 0)) || null;
  return { config, collective, employees: sorted.map((p,index) => {
    const position=index+1;
    const amounts=rewardAmounts({ life:p.life.percent, executionRate:p.executionRate, maxExecutionRate, collective:collective.percent, position, tenureFactor:1, caps:config.caps });
    const xp=xpTotals.get(p.employee.cpf) ?? 0;
    const lvl=levelFor(xp, levels);
    return { cpf:p.employee.cpf, name:p.employee.name, lifePercent:p.life.percent, punctualityPercent:p.punct.percent, daysMeasured:p.punct.daysMeasured, daysOnTime:p.punct.daysOnTime, sequenceOnTime:p.punct.sequenceOnTime, totalOnTime:p.punct.totalOnTime, executionRate:p.executionRate, assigned:p.assigned, completed:p.completed, points:p.points, collectivePercent:collective.percent, ...amounts, rankPosition:position, delayMinutes:p.attendance.totals.delayMinutes, absences:p.life.absences, medicalCertificates:p.life.medical, sanctions:p.life.sanctions, xpTotal:xp, ...lvl, coins:coins.get(p.employee.cpf) ?? 0, achievementCount:achievementCounts.get(p.employee.cpf) ?? 0, punctualityDays:p.punctDays };
  }) };
}
