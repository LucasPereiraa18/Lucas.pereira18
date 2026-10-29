import { getPulseRanking } from "@/src/services/pulse/pulse-service";
import { currentMonthKey } from "@/src/domain/time/date";

function money(v:number){return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function pct(v:number|null){return v===null?"—":`${v.toFixed(1).replace(".",",")}%`}
function Progress({value}:{value:number|null}){return <div className="pulse-progress"><span style={{width:`${Math.max(0,Math.min(100,value??0))}%`}} /></div>}

export default async function RankingPage({searchParams}:{searchParams:Promise<{month?:string}>}){
  const query=await searchParams; const month=query.month ?? currentMonthKey();
  const {employees,collective}=await getPulseRanking(month);
  return <>
    <div className="panel pulse-cycle-bar"><div><strong>Ciclo atual: {month.split("-").reverse().join("/")}</strong><span className="muted"> · Coletiva {pct(collective.percent)}</span></div><a className="button secondary" href={`/gamificacao/ranking?month=${month}`}>Recomputar</a></div>
    {!employees.length?<div className="empty-state">Nenhum ciclo aberto.</div>:<div className="table-wrap pulse-ranking"><table><thead><tr><th>#</th><th>Colaborador</th><th>Nível</th><th>Vida</th><th>Pontual.</th><th>Execução</th><th>Coins</th><th>Conq.</th><th>R$ Vida</th><th>R$ Score</th><th>R$ Coletiva</th><th>Bônus</th><th>Total R$</th></tr></thead><tbody>{employees.map(e=><tr key={e.cpf}><td><strong>{e.rankPosition}º</strong></td><td><strong>{e.name}</strong><small className="table-sub">{e.delayMinutes} min atraso · {e.absences} falta(s)</small></td><td>{e.levelName}<small className="table-sub">{e.xpTotal} XP{e.nextLevelXp?` · faltam ${Math.max(0,e.nextLevelXp-e.xpTotal)}`:""}</small><Progress value={e.nextLevelXp?Math.min(100,e.xpTotal/e.nextLevelXp*100):100}/></td><td><span className="metric-value">{pct(e.lifePercent)}</span><Progress value={e.lifePercent}/></td><td><span className="metric-value">{pct(e.punctualityPercent)}</span><small className="table-sub">{e.daysOnTime}/{e.daysMeasured} dias no horário</small><Progress value={e.punctualityPercent}/></td><td><span className="metric-value">{pct(e.executionRate)}</span><small className="table-sub">{e.completed}/{e.assigned} · {e.points} pts</small><Progress value={e.executionRate}/></td><td>{e.coins}</td><td>{e.achievementCount}</td><td>{money(e.attendanceAmount)}</td><td>{money(e.scoreAmount)}</td><td>{money(e.collectiveAmount)}</td><td>{money(e.podiumAmount)}</td><td className="pulse-money">{money(e.totalAmount)}</td></tr>)}</tbody></table></div>}
  </>;
}
