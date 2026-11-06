import Link from "next/link";

const tabs = [
  ["/gamificacao/ranking","Ranking"],
  ["/gamificacao/metas","Metas & Cards"],
  ["/gamificacao/registros","Registros"],
  ["/gamificacao/conquistas","Conquistas"],
  ["/gamificacao/loja","Loja"],
  ["/gamificacao/historico","Histórico"],
  ["/gamificacao/configuracoes","Configurações"],
] as const;

export default function GamificationLayout({children}:{children:React.ReactNode}) {
  return <div className="page pulse-page">
    <header className="page-header pulse-header"><div><span className="eyebrow">Bonificação e progressão</span><h1>Líder Pulse — Gamificação</h1><p>Programa mensal auditável de assiduidade, execução, nota coletiva e progressão.</p></div></header>
    <nav className="pulse-tabs" aria-label="Gamificação">{tabs.map(([href,label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
    {children}
  </div>;
}
