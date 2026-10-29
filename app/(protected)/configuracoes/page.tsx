import { TestConnectionButton } from "@/components/test-connection-button";
import { requireRole } from "@/src/lib/auth";
import { getPublicConfig } from "@/src/services/secullum/config-service";
import { saveConfigAction } from "./actions";

export default async function ConfigPage({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireRole("admin");
  const params = await searchParams;
  const config = await getPublicConfig();
  const first = config?.defaultSchedule?.[0];
  const second = config?.defaultSchedule?.[1];
  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">Administração</span><h1>Configurações</h1><p>Credenciais e regras locais usadas para consultar o Secullum.</p></div></header>
      {params.salvo ? <div className="alert success">Configuração salva.</div> : null}
      <form action={saveConfigAction} className="panel form-grid">
        <div className="section-title span-2"><h2>Integração Secullum</h2><p>A senha fica cifrada e nunca é devolvida a esta tela.</p></div>
        <label className="field"><span>Usuário Secullum</span><input name="username" defaultValue={config?.username ?? ""} required /></label>
        <label className="field"><span>ID do banco selecionado</span><input name="databaseId" defaultValue={config?.databaseId ?? ""} required /></label>
        <label className="field"><span>Senha {config?.hasPassword ? "(deixe em branco para manter)" : ""}</span><input type="password" name="password" required={!config?.hasPassword} autoComplete="new-password" /></label>
        <label className="field"><span>Modo</span><input value="Somente leitura" disabled /></label>
        <div className="section-title span-2"><h2>Jornada de fallback</h2><p>Usada somente quando não houver memória diária nem horário frequente do colaborador.</p></div>
        <label className="field"><span>Entrada 1</span><input type="time" name="entrada1" defaultValue={first?.start ?? ""} /></label>
        <label className="field"><span>Saída 1</span><input type="time" name="saida1" defaultValue={first?.end ?? ""} /></label>
        <label className="field"><span>Entrada 2</span><input type="time" name="entrada2" defaultValue={second?.start ?? ""} /></label>
        <label className="field"><span>Saída 2</span><input type="time" name="saida2" defaultValue={second?.end ?? ""} /></label>
        <label className="field"><span>Tolerância de entrada (min)</span><input type="number" min="0" max="60" name="toleranceMinutes" defaultValue={config?.toleranceMinutes ?? 5} /></label>
        <label className="field"><span>Horário de abertura</span><input type="time" name="openingTime" defaultValue={config?.openingTime?.slice(0, 5) ?? ""} /></label>
        <label className="field"><span>Janela de alerta do REP (min)</span><input type="number" min="0" max="240" name="repGraceMinutes" defaultValue={config?.repGraceMinutes ?? 40} /></label>
        <label className="field"><span>Fuso</span><input value="America/Sao_Paulo" disabled /></label>
        <div className="form-actions span-2"><button className="button primary" type="submit">Salvar configurações</button><TestConnectionButton /></div>
      </form>
    </div>
  );
}
