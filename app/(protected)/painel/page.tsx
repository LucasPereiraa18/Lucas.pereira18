import { Duration } from "@/components/duration";
import { StatusState } from "@/components/status-state";
import { requireUser } from "@/src/lib/auth";
import { getDashboardSummary } from "@/src/services/attendance/dashboard-service";

export default async function DashboardPage() {
  const user = await requireUser();
  try {
    const summary = await getDashboardSummary();
    return (
      <div className="page">
        <header className="page-header"><div><span className="eyebrow">Visão geral</span><h1>Painel do dia</h1><p>Resumo operacional do ponto e do mês atual.</p></div><div className={`sync-pill ${summary.lastSync?.status === "error" ? "error" : "ok"}`}>Última consulta: {summary.lastSync?.finishedAt ? new Date(summary.lastSync.finishedAt).toLocaleString("pt-BR") : "sem registro"}</div></header>
        {summary.possibleRepSyncFailure ? <div className="alert warning"><strong>Possível falha de sincronização do REP.</strong> Nenhuma batida foi recebida após a janela configurada. Confira a conexão do relógio antes de classificar ausências.</div> : null}
        <section className="stats-grid">
          <article className="stat"><span>Em expediente agora</span><strong>{summary.workingNow.length}</strong><small>{summary.employees} funcionário(s) ativo(s)</small></article>
          <article className="stat"><span>Atrasos hoje</span><strong><Duration minutes={summary.todayDelayMinutes} /></strong><small>Total calculado no dia</small></article>
          <article className="stat"><span>Horas extras hoje</span><strong><Duration minutes={summary.todayOvertimeMinutes} /></strong><small>Total calculado no dia</small></article>
          <article className="stat"><span>Adicional noturno no mês</span><strong><Duration minutes={summary.monthNightMinutesReduced} /></strong><small>Hora noturna reduzida</small></article>
        </section>
        <div className="two-column">
          <section className="panel"><div className="panel-header"><h2>Em expediente</h2><span>{summary.today}</span></div>{summary.workingNow.length ? <div className="list">{summary.workingNow.map((employee) => <div className="list-row" key={employee.cpf}><strong>{employee.name}</strong><span className="badge success">Em expediente</span></div>)}</div> : <p className="muted">Nenhum colaborador identificado em expediente agora.</p>}</section>
          <section className="panel"><div className="panel-header"><h2>Totais do mês</h2><span>{summary.month}</span></div><dl className="summary-list"><div><dt>Atrasos</dt><dd><Duration minutes={summary.monthDelayMinutes} /></dd></div><div><dt>Horas extras</dt><dd><Duration minutes={summary.monthOvertimeMinutes} /></dd></div><div><dt>Adicional noturno</dt><dd><Duration minutes={summary.monthNightMinutesReduced} /></dd></div></dl></section>
        </div>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("SECULLUM_CONFIG_MISSING")) return <div className="page"><StatusState title="Secullum ainda não configurado" description="Cadastre as credenciais e o ID do banco antes de consultar o ponto." actionHref={user.role === "admin" ? "/configuracoes" : undefined} actionLabel={user.role === "admin" ? "Abrir configurações" : undefined} tone="warning" /></div>;
    return <div className="page"><StatusState title="Não foi possível carregar o painel" description={message} tone="error" /></div>;
  }
}
