import { StatusState } from "@/components/status-state";
import { createSecullumClient } from "@/src/services/secullum/client-factory";
import { getPendingRequests } from "@/src/services/secullum/pending-service";

export default async function PendingPage() {
  try {
    const items = await getPendingRequests(await createSecullumClient());
    return <div className="page"><header className="page-header"><div><span className="eyebrow">Somente leitura</span><h1>Justificativas</h1><p>Pendências recebidas do Secullum. Aprovações continuam no portal do fornecedor.</p></div></header>{items.length ? <section className="panel"><div className="list">{items.map((item, index) => <details className="json-card" key={index}><summary>Pendência {index + 1}</summary><pre>{JSON.stringify(item, null, 2)}</pre></details>)}</div></section> : <StatusState title="Nenhuma pendência" description="O Secullum não retornou solicitações pendentes." tone="success" />}</div>;
  } catch (error) { return <div className="page"><StatusState title="Erro ao consultar justificativas" description={error instanceof Error ? error.message : String(error)} tone="error" /></div>; }
}
