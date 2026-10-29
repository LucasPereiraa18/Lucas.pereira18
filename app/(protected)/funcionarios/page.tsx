import Link from "next/link";
import { StatusState } from "@/components/status-state";
import { maskCpf } from "@/src/lib/format";
import { requireUser } from "@/src/lib/auth";
import { getEmployeesWithVisibility } from "@/src/services/employees/filtered-employees-service";
import { hideEmployeeAction, unhideEmployeeAction } from "./actions";

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ inativos?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const includeInactive = params.inativos === "1";
  try {
    const items = await getEmployeesWithVisibility(includeInactive);
    const visible = items.filter((item) => !item.hidden);
    const hidden = items.filter((item) => item.hidden);
    return <div className="page">
      <header className="page-header"><div><span className="eyebrow">Cadastro do Secullum</span><h1>Funcionários</h1><p>A lista é somente leitura; ocultações são locais ao Ponto Líder.</p></div><Link className="button secondary" href={includeInactive ? "/funcionarios" : "/funcionarios?inativos=1"}>{includeInactive ? "Ocultar inativos" : "Exibir inativos"}</Link></header>
      <section className="table-panel"><table><thead><tr><th>Nome</th><th>CPF</th><th>Função</th><th>Departamento</th><th>Status</th>{user.role === "admin" ? <th>Ação local</th> : null}</tr></thead><tbody>{visible.map(({ employee }) => <tr key={employee.cpf}><td><strong>{employee.name}</strong></td><td>{maskCpf(employee.cpf)}</td><td>{employee.functionDescription ?? "—"}</td><td>{employee.departmentDescription ?? "—"}</td><td><span className={`badge ${employee.active ? "success" : "neutral"}`}>{employee.active ? "Ativo" : "Inativo"}</span></td>{user.role === "admin" ? <td><form action={hideEmployeeAction}><input type="hidden" name="cpf" value={employee.cpf} /><button className="link-button danger-text" type="submit">Ocultar</button></form></td> : null}</tr>)}</tbody></table></section>
      {user.role === "admin" && hidden.length ? <section className="panel"><div className="panel-header"><h2>Ocultados localmente</h2><span>{hidden.length}</span></div><div className="list">{hidden.map(({ employee }) => <div className="list-row" key={employee.cpf}><div><strong>{employee.name}</strong><small>{maskCpf(employee.cpf)}</small></div><form action={unhideEmployeeAction}><input type="hidden" name="cpf" value={employee.cpf} /><button className="button small secondary" type="submit">Mostrar novamente</button></form></div>)}</div></section> : null}
    </div>;
  } catch (error) { return <div className="page"><StatusState title="Não foi possível carregar funcionários" description={error instanceof Error ? error.message : String(error)} tone="error" /></div>; }
}
