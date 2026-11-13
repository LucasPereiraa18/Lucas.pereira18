"use client";

import Link from "next/link";

export default function ProtectedError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page">
      <section className="status-state warning" role="alert">
        <h2>Não foi possível carregar esta página</h2>
        <p>A consulta encontrou uma falha. Se a integração com o Secullum ainda não foi configurada, abra Configurações e teste a conexão. Nenhuma marcação foi alterada.</p>
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={() => reset()}>Tentar novamente</button>
          <Link className="button primary" href="/configuracoes">Configurar Secullum</Link>
        </div>
      </section>
    </div>
  );
}
