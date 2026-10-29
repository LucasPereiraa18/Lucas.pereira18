# Ponto Líder v2

Aplicação interna do **Bar Líder** para gestão e conferência de ponto integrada ao **Secullum Ponto Web**, agora com o módulo **Líder Pulse** de bonificação e gamificação.

## Funcionalidades

### Ponto e jornada
- Painel e indicadores do mês
- Marcações por colaborador
- Funcionários ativos/inativos
- Cartão-ponto
- Justificativas e pendências
- Fechamento mensal
- Atrasos, horas extras e adicional noturno
- Exportação CSV
- Integração Secullum somente leitura

### Líder Pulse — v2
- Ranking mensal
- Vida / assiduidade
- Pontualidade baseada nas batidas do Secullum
- Execução de tarefas e checklists
- Nota coletiva
- Bonificação financeira
- XP e níveis
- Moedas e conquistas
- Loja de recompensas
- Histórico de ciclos
- Configuração centralizada das regras
- Idempotência para impedir XP duplicado em recálculos

## Stack
Next.js 16, React 19, TypeScript, Supabase Auth/PostgreSQL/RLS, Secullum Ponto Web, Vitest, Playwright e Vercel.

## Segurança
RLS, perfis admin/gestor, credenciais Secullum cifradas com AES-256-GCM, CSP/HSTS, proteção contra clickjacking, segredos fora do repositório e CSV protegido contra formula injection.

O repositório público é sanitizado e não contém CPFs, senhas, chaves privadas ou IDs internos reais.

---
Desenvolvido por Lucas Pereira.
