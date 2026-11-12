import Link from "next/link";
import { Duration } from "@/components/duration";
import { MonthSelector } from "@/components/month-selector";
import { StatusState } from "@/components/status-state";
import { localDateISO } from "@/src/domain/time/date";
import { maskCpf } from "@/src/lib/format";
import { getMonthlyClosing } from "@/src/services/attendance/closing-service";

export default async function ClosingPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const params = await searchParams;
  const month = params.mes ?? localDateISO().slice(0, 7);
  try {
    const rows = await getMonthlyClosing(month);
    const totals = rows.reduce((acc, row) => ({ workedDays: acc.workedDays + row.workedDays, absences: acc.absences + row.absences, medicalCertificates: acc.medicalCertificates + row.medicalCertificates, sanctions: acc.sanctions + row.sanctions, delayMinutes: acc.delayMinutes + row.delayMinutes, overtimeMinutes: acc.overtimeMinutes + row.overtimeMinutes, nightMinutesReduced: acc.nightMinutesReduced + row.nightMinutesReduced, holidayDays: acc.holidayDays + row.holidayDays }), { workedDays: 0, absences: 0, medicalCertificates: 0, sanctions: 0, delayMinutes: 0, overtimeMinutes: 0, nightMinutesReduced: 0, holidayDays: 0 });
    return <div className="page wide"><header className="page-header"><div><span className="eyebrow">Conferência da folha</span><h1>Fechamento do mês</h1><p>Resumo calculado a partir das batidas e rótulos conferidos.</p></div><Link className="button secondary" href={`/api/export/fechamento?mes=${month}`}>Exportar CSV</Link></header><form method="get" className="filter-bar"><MonthSelector value={month} /><button className="button primary" type="submit">Calcular</button></form>{rows.length ? <section className="table-panel"><div className="table-scroll"><table><thead><tr><th>Funcionário</th><th>CPF</th><th>Dias trab.</th><th>Faltas</th><th>Atestados</th><th>Sanções</th><th>Feriados</th><th>Atrasos</th><th>HE</th><th>Ad. noturno</th></tr></thead><tbody>{rows.map((row) => <tr key={row.cpf}><td><strong>{row.name}</strong></td><td>{maskCpf(row.cpf)}</td><td>{row.workedDays}</td><td>{row.absences}</td><td>{row.medicalCertificates}</td><td>{row.sanctions}</td><td>{row.holidayDays}</td><td><Duration minutes={row.delayMinutes} /></td><td><Duration minutes={row.overtimeMinutes} /></td><td><Duration minutes={row.nightMinutesReduced} /></td></tr>)}</tbody><tfoot><tr><th>Total</th><th>—</th><th>{totals.workedDays}</th><th>{totals.absences}</th><th>{totals.medicalCertificates}</th><th>{totals.sanctions}</th><th>{totals.holidayDays}</th><th><Duration minutes={totals.delayMinutes} /></th><th><Duration minutes={totals.overtimeMinutes} /></th><th><Duration minutes={totals.nightMinutesReduced} /></th></tr></tfoot></table></div></section> : <StatusState title="Sem funcionários para fechar" description="Nenhum funcionário ativo foi retornado pelo Secullum." />}</div>;
  } catch (error) { return <div className="page"><StatusState title="Erro no fechamento" description={error instanceof Error ? error.message : String(error)} tone="error" /></div>; }
}
