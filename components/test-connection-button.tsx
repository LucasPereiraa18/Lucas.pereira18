"use client";
import { useState } from "react";

export function TestConnectionButton() {
  const [state, setState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function test() {
    setLoading(true); setState(null);
    try {
      const response = await fetch("/api/secullum/testar-conexao", { method: "POST" });
      const body = await response.json();
      setState(response.ok ? `Conexão validada. ${body.employees} funcionário(s) encontrados.` : `Falha: ${body.message ?? body.error}`);
    } catch { setState("Falha de rede ao testar a conexão."); }
    finally { setLoading(false); }
  }
  return <div className="inline-feedback"><button type="button" className="button secondary" disabled={loading} onClick={test}>{loading ? "Testando..." : "Testar conexão"}</button>{state ? <span>{state}</span> : null}</div>;
}
