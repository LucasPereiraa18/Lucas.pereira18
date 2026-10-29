# Ponto Líder v2

Aplicação interna do **Bar Líder** para gestão e conferência de ponto integrada ao **Secullum Ponto Web**, agora com o módulo **Líder Pulse** de bonificação e gamificação.

## Ponto e jornada

- Painel e indicadores do mês
- Marcações por colaborador
- Funcionários ativos/inativos
- Cartão-ponto
- Justificativas e pendências
- Fechamento mensal
- Atrasos, horas extras e adicional noturno
- Exportação CSV
- Integração Secullum somente leitura

## Líder Pulse — v2

- Ranking mensal
- Vida / assiduidade
- Pontualidade baseada nas batidas do Secullum
- Execução de tarefas e checklists
- Nota coletiva
- Bonificação financeira
- XP e níveis
- Moedas
- Conquistas
- Loja de recompensas
- Histórico de ciclos
- Configuração centralizada das regras
- Proteção contra duplicidade de XP por idempotência

O módulo de bonificação é separado da folha de pagamento e utiliza os dados do ponto como uma das fontes de medição.

## Stack

- Next.js 16 / React 19 / TypeScript
- Supabase Auth + PostgreSQL + RLS
- Secullum Ponto Web
- Vitest e Playwright
- Vercel

## Segurança

- RLS no Supabase
- Perfis `admin` e `gestor`
- Credenciais do Secullum cifradas no servidor com AES-256-GCM
- CSP, HSTS, `X-Frame-Options: DENY` e `nosniff`
- Segredos fora do repositório
- CSV protegido contra formula injection
- Repositório público sanitizado, sem CPFs, senhas ou IDs internos reais

## Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://<SEU_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<SUA_CHAVE_PUBLICA>
SECULLUM_ENCRYPTION_KEY=<CHAVE_AES_256_BASE64>
```

## Banco

As migrations estão em `supabase/migrations/`, incluindo a migration do módulo de gamificação da v2.

## Qualidade

```bash
npm install
npm test
npm run typecheck
npm run build
```

## Produção

A aplicação é usada internamente pelo Bar Líder. Dados operacionais e credenciais reais não são versionados.

---

Desenvolvido por Lucas Pereira como projeto aplicado de desenvolvimento web, integração de API, banco de dados, regras de negócio e segurança de aplicações.
