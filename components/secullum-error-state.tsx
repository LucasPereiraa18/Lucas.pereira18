import { StatusState } from "@/components/status-state";

export function SecullumErrorState({ error }: { error: unknown }) {
  const missing = error instanceof Error && error.message.includes("SECULLUM_CONFIG_MISSING");
  return (
    <StatusState
      title={missing ? "Secullum ainda não configurado" : "Não foi possível consultar o Secullum"}
      description={missing
        ? "Cadastre novamente o usuário e a senha de integração do Secullum em Configurações. O sistema continua em modo somente leitura."
        : "A consulta ao serviço de ponto falhou. Verifique a conexão em Configurações; os dados ainda não foram atualizados."}
      actionHref="/configuracoes"
      actionLabel="Abrir configurações"
      tone="warning"
    />
  );
}
