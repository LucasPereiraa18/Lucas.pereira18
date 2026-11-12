import Link from "next/link";
import { Duration } from "@/components/duration";
import { EmployeeSelector } from "@/components/employee-selector";
import { MonthSelector } from "@/components/month-selector";
import { StatusState } from "@/components/status-state";
import { formatDateBR } from "@/src/lib/format";
import { requireUser } from "@/src/lib/auth";
import { localDateISO } from "@/src/domain/time/date";
import { getAttendanceMonth } from "@/src/services/attendance/attendance-service";
import { getVisibleEmployees } from "@/src/services/employees/filtered-employees-service";
import { markClosedDay, saveException, saveManualLabel, unmarkClosedDay } from "./actions";

export default async function MarksPage({ searchParams }: { searchParams: Promise<{ cpf?: string; mes?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const month = params.mes ?? localDateISO().slice(0, 7);
  try {
    const employees = await getVisibleEmployees(false);
    if (!employees.length) return <div className="page"><StatusState title="Nenhum funcionário disponível" description="O Secullum não retornou funcionários ativos para consulta." /></div>;
    const cpf = params.cpf && employees.some((employee) => employee.cpf === params.cpf) ? params.cpf : employees[0].cpf;
    const selected = employees.find((employee) => employee.cpf === cpf)!;
    const attendance = await getAttendanceMonth(cpf, month);
    return (
      <div className="page wide">
        <header className="page-header"><div><span className="eyebrow">Conferência mensal</span><h1>Marcações</h1><p>Todos os dias do mês, sem transformar ausência de dado em falta automaticamente.</p></div><Link className="button secondary no-print" href={`/api/export/marcacoes?cpf=${cpf}&mes=${month}`}>Exportar CSV</Link></header>
        <form method="get" className="filter-bar no-print"><EmployeeSelector employees={employees} value={cpf} /><MonthSelector value={month} /><button className="button primary" type="submit">Buscar</button></form>
        <section className="compact-stats"><div><span>Colaborador</span><strong>{selected.name}</strong></div><div><span>Trabalhadas</span><strong><Duration minutes={attendance.totals.workedMinutes} /></strong></div><div><span>Atrasos</span><strong><Duration minutes={attendance.totals.delayMinutes} /></strong></div><div><span>HE</span><strong><Duration minutes={attendance.totals.overtimeMinutes} /></strong></div><div><span>Ad. noturno</span><strong><Duration minutes={attendance.totals.nightMinutesReduced} /></strong></div></section>
        <section className="table-panel"><div className="table-scroll"><table><thead><tr><th>Data</th><th>Entrada</th><th>Saída int.</th><th>Retorno</th><th>Saída</th><th>Trabalhadas</th><th>Atraso</th><th>HE</th><th>Noturno</th><th>Situação</th><th className="no-print">Ações</th></tr></thead><tbody>{attendance.days.map((day) => {
          const label = day.metrics.label;
          return <tr key={day.date} className={!day.hasSecullumData ? "row-muted" : ""}><td>{formatDateBR(day.date)}</td><td>{day.entries[0] ?? "—"}</td><td>{day.exits[0] ?? "—"}</td><td>{day.entries[1] ?? "—"}</td><td>{day.exits[1] ?? "—"}</td><td><Duration minutes={day.metrics.workedMinutes} /></td><td><Duration minutes={day.metrics.totalDelayMinutes} /></td><td><Duration minutes={day.metrics.overtimeMinutes} /></td><td><Duration minutes={day.metrics.nightMinutesReduced} /></td><td>{day.manualLabel ? <span className="badge manual">{day.manualLabel}</span> : label ? <em className="derived-label">{label}</em> : !day.hasSecullumData ? <span className="muted">Sem batida</span> : <span className="badge success">Normal</span>}</td><td className="actions-cell no-print"><details><summary>Editar</summary><div className="popover-form"><form action={saveManualLabel}><input type="hidden" name="cpf" value={cpf} /><input type="hidden" name="date" value={day.date} /><label>Rótulo manual<input name="label" defaultValue={day.manualLabel ?? ""} placeholder="Ex.: ATESTADO" /></label><button className="button small" type="submit">Salvar rótulo</button></form><form action={saveException}><input type="hidden" name="cpf" value={cpf} /><input type="hidden" name="date" value={day.date} /><input type="hidden" name="kind" value="authorized" /><button className="button small secondary" type="submit">Marcar exceção</button></form>{user.role === "admin" ? day.isClosedDay ? <form action={unmarkClosedDay}><input type="hidden" name="date" value={day.date} /><button className="button small danger" type="submit">Reabrir dia</button></form> : <form action={markClosedDay}><input type="hidden" name="date" value={day.date} /><button className="button small secondary" type="submit">Loja fechada</button></form> : null}</div></details></td></tr>;
        })}</tbody></table></div></section>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("SECULLUM_CONFIG_MISSING")) return <div className="page"><StatusState title="Integração não configurada" description="Configure o Secullum antes de consultar as marcações." actionHref={user.role === "admin" ? "/configuracoes" : undefined} actionLabel={user.role === "admin" ? "Configurar" : undefined} tone="warning" /></div>;
    return <div className="page"><StatusState title="Erro ao consultar marcações" description={message} tone="error" /></div>;
  }
}
