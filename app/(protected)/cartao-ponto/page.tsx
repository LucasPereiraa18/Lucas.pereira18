import { EmployeeSelector } from "@/components/employee-selector";
import { Duration } from "@/components/duration";
import { StatusState } from "@/components/status-state";
import { PrintButton } from "@/components/print-button";
import { formatDateBR } from "@/src/lib/format";
import { localDateISO } from "@/src/domain/time/date";
import { getAttendanceMonth } from "@/src/services/attendance/attendance-service";
import { getVisibleEmployees } from "@/src/services/employees/filtered-employees-service";

export default async function TimeCardPage({ searchParams }: { searchParams: Promise<{ cpf?: string; data?: string }> }) {
  const params = await searchParams;
  const date = params.data ?? localDateISO();
  try {
    const employees = await getVisibleEmployees(false);
    if (!employees.length) return <div className="page"><StatusState title="Nenhum funcionário" description="Não há funcionários disponíveis." /></div>;
    const cpf = params.cpf && employees.some((e) => e.cpf === params.cpf) ? params.cpf : employees[0].cpf;
    const employee = employees.find((e) => e.cpf === cpf)!;
    const attendance = await getAttendanceMonth(cpf, date.slice(0, 7));
    const day = attendance.days.find((item) => item.date === date);
    return <div className="page print-page"><header className="page-header no-print"><div><span className="eyebrow">Conferência individual</span><h1>Cartão ponto</h1><p>Visualização de um dia para conferência e impressão.</p></div><PrintButton /></header><form method="get" className="filter-bar no-print"><EmployeeSelector employees={employees} value={cpf} /><label className="field"><span>Data</span><input type="date" name="data" defaultValue={date} /></label><button className="button primary" type="submit">Buscar</button></form>{day ? <article className="time-card"><div className="time-card-header"><div><span>Ponto Líder · Bar Líder</span><h2>{employee.name}</h2></div><strong>{formatDateBR(day.date)}</strong></div><div className="time-card-grid"><div><span>Entrada</span><strong>{day.entries[0] ?? "—"}</strong></div><div><span>Saída intervalo</span><strong>{day.exits[0] ?? "—"}</strong></div><div><span>Retorno</span><strong>{day.entries[1] ?? "—"}</strong></div><div><span>Saída</span><strong>{day.exits[1] ?? "—"}</strong></div></div><dl className="summary-list"><div><dt>Horas trabalhadas</dt><dd><Duration minutes={day.metrics.workedMinutes} /></dd></div><div><dt>Atraso</dt><dd><Duration minutes={day.metrics.totalDelayMinutes} /></dd></div><div><dt>Hora extra</dt><dd><Duration minutes={day.metrics.overtimeMinutes} /></dd></div><div><dt>Adicional noturno</dt><dd><Duration minutes={day.metrics.nightMinutesReduced} /></dd></div><div><dt>Situação</dt><dd>{day.metrics.label ?? "Normal"}</dd></div></dl></article> : <StatusState title="Dia sem registro" description="Não há informação para a data selecionada." />}</div>;
  } catch (error) { return <div className="page"><StatusState title="Erro ao carregar cartão ponto" description={error instanceof Error ? error.message : String(error)} tone="error" /></div>; }
}
