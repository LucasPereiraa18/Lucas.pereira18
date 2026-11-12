"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/painel", "Painel"],
  ["/marcacoes", "Marcações"],
  ["/funcionarios", "Funcionários"],
  ["/cartao-ponto", "Cartão ponto"],
  ["/justificativas", "Justificativas"],
  ["/fechamento", "Fechamento"],
  ["/gamificacao/ranking", "Gamificação"],
] as const;

export function SidebarNav({ showConfig }: { showConfig: boolean }) {
  const pathname = usePathname();
  const links = showConfig ? [...items, ["/configuracoes", "Configurações"] as const] : items;

  return (
    <nav aria-label="Navegação principal">
      {links.map(([href, label]) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
