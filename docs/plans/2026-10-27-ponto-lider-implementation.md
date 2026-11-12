# Ponto Líder Implementation Plan

> **For agentic workers:** Use the host's available task-by-task implementation workflow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um sistema web independente para uso interno do Bar Líder que leia o Secullum Ponto Web, calcule jornada/atrasos/horas extras/adicional noturno e gere fechamento mensal com autenticação e persistência no Supabase.

**Architecture:** Aplicação Next.js 16 com App Router, autenticação SSR via Supabase Auth e PostgreSQL como banco próprio. O navegador chama apenas rotas/Server Actions do Ponto Líder; o servidor mantém as credenciais Secullum cifradas, obtém/renova token e normaliza a API externa. O motor de cálculo é puro e compartilhado por painel, marcações, cartão ponto e fechamento.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase PostgreSQL/Auth, `@supabase/supabase-js`, `@supabase/ssr`, Zod, Vitest, Playwright, Web Crypto API, CSS Modules/Tailwind opcional apenas se necessário.

## Global Constraints

- Uso interno exclusivo do Bar Líder.
- Projeto totalmente independente do Ambiente Líder: sem compartilhamento de repositório, banco, autenticação ou deploy.
- Uma única empresa/unidade lógica; sem multiempresa e sem SaaS.
- Primeira versão do Secullum em somente leitura.
- Sem página pública de autoconsulta por CPF.
- Supabase Auth obrigatório e sem cadastro público.
- Papéis iniciais: `admin` e `gestor`.
- Credenciais Secullum só podem ser usadas no servidor e a senha nunca pode retornar ao navegador.
- Senha Secullum deve ser cifrada antes da persistência.
- RLS deve estar habilitado em todas as tabelas expostas.
- O Secullum permanece como fonte das batidas; não criar espelho completo das marcações no banco.
- Jornada prevista usa fallback: memória do dia -> horário mais frequente do funcionário no período -> jornada global configurada.
- Tolerância de entrada padrão: 5 minutos, configurável.
- Atraso de intervalo compara duração real contra duração prevista, sem tolerância.
- Hora extra = `max(0, trabalhado - carga prevista)`.
- Adicional noturno considera 22:00-05:00 e fator `60/52.5`.
- Textos como `FOLGA` e `FALTA` não podem ser interpretados como horário.
- Rótulo manual prevalece sobre rótulo derivado; rótulo derivado não é persistido automaticamente.
- Datas de negócio devem ser calculadas em `America/Sao_Paulo` no servidor.
- Estados obrigatórios: carregando, vazio, credencial ausente, erro de autenticação, erro Secullum e possível falha do REP.
- Fechamento mensal e marcações devem exportar CSV.
- Escrita no Secullum fica fora da primeira versão.

---

### Task 1: Scaffold independente, contratos de domínio e suíte de testes

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `src/domain/time/types.ts`
- Create: `src/domain/secullum/types.ts`
- Create: `src/domain/auth/types.ts`
- Test: `tests/unit/smoke.test.ts`

**Interfaces:**
- Consumes: nenhum código anterior.
- Produces: tipos `SecullumEmployee`, `SecullumPunchDay`, `ExpectedSchedule`, `DailyMetrics`, `UserRole`, `AppUser` e scripts `dev`, `build`, `lint`, `test`, `test:e2e`, `typecheck`.

- [ ] **Step 1: Add the focused failing test**

Criar `tests/unit/smoke.test.ts` importando `APP_TIME_ZONE` de `src/domain/time/types.ts` e afirmando `America/Sao_Paulo`.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/smoke.test.ts`
Expected: falha de import porque o módulo ainda não existe.

- [ ] **Step 3: Implement the minimum behavior**

Criar o projeto Next.js 16/React 19, TypeScript estrito, aliases `@/*`, scripts padronizados e contratos de domínio. Fixar versões no `package.json` e gerar `pnpm-lock.yaml`. `APP_TIME_ZONE` deve ser constante literal `America/Sao_Paulo`.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/smoke.test.ts`
Expected: 1 teste passando.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm typecheck && pnpm build`
Expected: ambos encerram com código 0 e a rota `/` compila.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts vitest.config.ts playwright.config.ts .env.example .gitignore app src tests
git commit -m "chore: scaffold standalone ponto lider"
```

### Task 2: Supabase Auth, schema, RLS e perfil interno

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `proxy.ts`
- Create: `app/login/page.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `app/(protected)/layout.tsx`
- Create: `supabase/migrations/20261027_0001_initial_schema.sql`
- Create: `src/repositories/profile-repository.ts`
- Test: `tests/unit/auth/role.test.ts`
- Test: `tests/integration/supabase/schema.sql.test.ts`

**Interfaces:**
- Consumes: `UserRole` e `AppUser` da Task 1; env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Produces: `createBrowserClient()`, `createServerClient()`, `updateSession(request)`, `requireUser()`, `requireRole(...roles)`, tabelas `profiles`, `secullum_config`, `manual_labels`, `schedule_exceptions`, `closed_days`, `hidden_employees`, `sync_logs`, `audit_logs`.

- [ ] **Step 1: Add the focused failing test**

Testar que `requireRole` aceita `admin` para recurso admin, rejeita `gestor` com erro `FORBIDDEN`, e que um usuário não autenticado gera `UNAUTHENTICATED`. No teste SQL, verificar textualmente/por execução local que todas as tabelas públicas criadas possuem `enable row level security` e políticas explícitas.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/auth/role.test.ts tests/integration/supabase/schema.sql.test.ts`
Expected: falha porque helpers e migration ainda não existem.

- [ ] **Step 3: Implement the minimum behavior**

Usar `@supabase/ssr` para sessão em cookies e `proxy.ts` no padrão Next.js 16, refrescando claims no servidor. Não implementar signup público. Criar `profiles` com `id uuid` referenciando `auth.users`, `role` restrito a `admin|gestor`, `active boolean`, timestamps. Demais tabelas devem ter `created_by uuid`/`updated_by` quando aplicável, RLS habilitado e políticas baseadas em `auth.uid()` + perfil ativo; mutações de configuração/ocultações ficam restritas a admin. Não usar `user_metadata` para autorização. A migration deve conceder apenas o acesso necessário aos papéis `authenticated` e manter `anon` sem leitura das tabelas internas.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/auth/role.test.ts tests/integration/supabase/schema.sql.test.ts`
Expected: todos passam.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm typecheck && pnpm build`
Expected: build autenticado compila; `/login` permanece público e rotas protegidas redirecionam usuário sem sessão.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add src/lib/supabase src/repositories app/login app/auth 'app/(protected)' proxy.ts supabase tests
 git commit -m "feat: add supabase auth and secured schema"
```

### Task 3: Cofre de credenciais e configuração Secullum

**Files:**
- Create: `src/lib/crypto/credential-vault.ts`
- Create: `src/repositories/secullum-config-repository.ts`
- Create: `src/services/secullum/config-service.ts`
- Create: `app/(protected)/configuracoes/page.tsx`
- Create: `app/api/secullum/config/route.ts`
- Create: `app/api/secullum/testar-conexao/route.ts`
- Test: `tests/unit/crypto/credential-vault.test.ts`
- Test: `tests/unit/secullum/config-service.test.ts`

**Interfaces:**
- Consumes: `SECULLUM_ENCRYPTION_KEY`, Supabase server client e papel `admin`.
- Produces: `encryptSecret(plainText)`, `decryptSecret(payload)`, `getPublicConfig()` retornando `{ username, databaseId, hasPassword, toleranceMinutes, defaultSchedule, timezone }`, `saveConfig(input)`, `testConnection()`.

- [ ] **Step 1: Add the focused failing test**

Cobrir round-trip de criptografia, IV aleatório produzindo ciphertext diferente para a mesma senha, rejeição de payload adulterado e garantia de que `getPublicConfig()` nunca contém a senha/ciphertext.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/crypto/credential-vault.test.ts tests/unit/secullum/config-service.test.ts`
Expected: falha por módulos ausentes.

- [ ] **Step 3: Implement the minimum behavior**

Usar AES-256-GCM via Web Crypto. `SECULLUM_ENCRYPTION_KEY` deve ser segredo server-only e nunca usar prefixo `NEXT_PUBLIC_`. Persistir versão do envelope, IV e ciphertext. `saveConfig` exige username, databaseId e password apenas no primeiro cadastro; em edições posteriores, senha vazia preserva a existente. `GET` público autenticado retorna somente os campos seguros. `POST` de configuração exige admin e grava auditoria sem senha. `testar-conexao` usa a credencial descriptografada somente em memória.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/crypto/credential-vault.test.ts tests/unit/secullum/config-service.test.ts`
Expected: todos passam e nenhum snapshot contém segredo.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm typecheck && pnpm build`
Expected: rota de configurações compila e não serializa `SECULLUM_ENCRYPTION_KEY` para o cliente.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add src/lib/crypto src/repositories/secullum-config-repository.ts src/services/secullum 'app/(protected)/configuracoes' app/api/secullum tests/unit/crypto tests/unit/secullum
git commit -m "feat: secure secullum credentials"
```

### Task 4: Cliente Secullum read-only e normalização

**Files:**
- Create: `src/services/secullum/http-client.ts`
- Create: `src/services/secullum/auth-token-cache.ts`
- Create: `src/services/secullum/normalizers.ts`
- Create: `src/services/secullum/employees-service.ts`
- Create: `src/services/secullum/punches-service.ts`
- Create: `src/services/secullum/pending-service.ts`
- Test: `tests/unit/secullum/http-client.test.ts`
- Test: `tests/unit/secullum/normalizers.test.ts`

**Interfaces:**
- Consumes: credenciais descriptografadas da Task 3.
- Produces: `SecullumHttpClient.request<T>()`, `getEmployees()`, `getEmployeeByCpf(cpf)`, `getPunches({ cpf, startDate, endDate })`, `getPendingRequests()`.

- [ ] **Step 1: Add the focused failing test**

Mockar `fetch` e testar: autenticação `POST https://autenticador.secullum.com.br/Token` com `grant_type=password`, `client_id=3`; header `secullumidbancoselecionado`; cache usando `expires_in - 60s`; um 401 limpa token, reautentica e repete exatamente uma vez; segundo 401 retorna erro; erro HTTP mantém status e corpo bruto; normalizador trata `Funcao.Descricao`, `Departamento.Descricao`, `Demissao` nula como ativo e campos textuais de batida sem convertê-los em horário.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/secullum/http-client.test.ts tests/unit/secullum/normalizers.test.ts`
Expected: falha porque cliente não existe.

- [ ] **Step 3: Implement the minimum behavior**

Base API `https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna`. Toda chamada usa `Authorization: Bearer`, `Content-Type: application/json; charset=utf-8`, `Accept-Language: pt-BR` e `secullumidbancoselecionado`. Falta de databaseId deve resultar em erro `SECULLUM_CONFIG_MISSING`. Não adicionar endpoints de escrita. O normalizador deve preservar o payload bruto relevante para diagnóstico sem expor credenciais.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/secullum/http-client.test.ts tests/unit/secullum/normalizers.test.ts`
Expected: todos passam, incluindo retry único do 401.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm typecheck && pnpm build`
Expected: 0 erros e nenhum segredo referenciado em Client Components.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add src/services/secullum tests/unit/secullum
git commit -m "feat: add read only secullum client"
```

### Task 5: Motor de jornada e cálculos trabalhistas da aplicação

**Files:**
- Create: `src/domain/time/clock.ts`
- Create: `src/domain/time/schedule.ts`
- Create: `src/domain/time/labels.ts`
- Create: `src/domain/time/calculator.ts`
- Test: `tests/unit/time/clock.test.ts`
- Test: `tests/unit/time/schedule.test.ts`
- Test: `tests/unit/time/calculator.test.ts`

**Interfaces:**
- Consumes: `SecullumPunchDay`, `ExpectedSchedule`, tolerância e exceções.
- Produces: `parseClockValue(value)`, `resolveExpectedSchedule(day, periodDays, globalSchedule)`, `deriveLabel(day)`, `calculateDailyMetrics(input): DailyMetrics`.

- [ ] **Step 1: Add the focused failing test**

Criar casos exatos: jornada 16:00-17:45 / 18:45-23:45 com batidas 16:04 / 18:50 / 19:50 / 23:45 => 6h41, atraso entrada 0, atraso intervalo 5m, extra 0, adicional noturno 2h00; entrada +4m => atraso 0; entrada +6m => atraso 6m conforme regra de tolerância descrita; `FOLGA` => sem cálculo; memória ausente => moda das memórias do funcionário; ausência de moda utilizável => jornada global; jornada atravessando meia-noite; intervalo real menor que o previsto => atraso de intervalo 0; dia de loja fechada/exceção não gera atraso automático.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/time`
Expected: falha por funções ausentes.

- [ ] **Step 3: Implement the minimum behavior**

Representar minutos internamente como inteiros para evitar erros de ponto flutuante. Tratar 22:00-05:00 como janela contínua 22:00-29:00 e aplicar `60/52.5` só ao total noturno final. `resolveExpectedSchedule` deve usar a memória do próprio dia; na falta, calcular a combinação de períodos mais frequente do funcionário no intervalo consultado; por último usar a configuração global. `deriveLabel` segue ordem literal -> folga/compensado -> observações -> abonos. Rótulo manual será aplicado fora deste módulo como override.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/time`
Expected: todos os critérios de aceite matemáticos passam.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm test && pnpm typecheck`
Expected: suíte completa verde e tipos consistentes.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add src/domain/time tests/unit/time
git commit -m "feat: add attendance calculation engine"
```

### Task 6: Repositórios locais, rótulos, exceções, ocultações e auditoria

**Files:**
- Create: `src/repositories/manual-label-repository.ts`
- Create: `src/repositories/exception-repository.ts`
- Create: `src/repositories/closed-day-repository.ts`
- Create: `src/repositories/hidden-employee-repository.ts`
- Create: `src/repositories/sync-log-repository.ts`
- Create: `src/repositories/audit-log-repository.ts`
- Create: `src/services/employees/filtered-employees-service.ts`
- Test: `tests/unit/repositories/local-overrides.test.ts`
- Test: `tests/unit/employees/filtered-employees-service.test.ts`

**Interfaces:**
- Consumes: Supabase server client, `getEmployees()` da Task 4.
- Produces: CRUD restrito para rótulos/exceções/dias fechados/ocultações; `getVisibleEmployees()`; `recordSyncLog()`; `recordAudit()`.

- [ ] **Step 1: Add the focused failing test**

Testar que um CPF ocultado desaparece de `getVisibleEmployees()`; CPF é normalizado apenas para comparação/armazenamento como dígitos; rótulo manual vence derivado sem apagar o derivado; criar/alterar/excluir override gera auditoria com usuário, ação, data e chave do recurso; logs nunca guardam senha/token.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/repositories tests/unit/employees`
Expected: falha por repositórios ausentes.

- [ ] **Step 3: Implement the minimum behavior**

Centralizar filtragem de ocultos no serviço de funcionários, não nas páginas. Usar upsert por chave natural `(cpf, date)` em rótulos e exceções. `sync_logs` armazena início/fim, status, endpoint lógico e erro sanitizado. Auditoria registra alterações administrativas, nunca credencial em claro/ciphertext/token.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/repositories tests/unit/employees`
Expected: todos passam.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm test && pnpm typecheck`
Expected: suíte verde.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add src/repositories src/services/employees tests/unit/repositories tests/unit/employees
git commit -m "feat: add local attendance overrides and audit"
```

### Task 7: Casos de uso agregados e APIs internas

**Files:**
- Create: `src/services/attendance/attendance-service.ts`
- Create: `src/services/attendance/closing-service.ts`
- Create: `src/services/attendance/dashboard-service.ts`
- Create: `src/services/attendance/csv.ts`
- Create: `app/api/marcacoes/route.ts`
- Create: `app/api/funcionarios/route.ts`
- Create: `app/api/cartao-ponto/route.ts`
- Create: `app/api/justificativas/route.ts`
- Create: `app/api/painel/route.ts`
- Create: `app/api/fechamento/route.ts`
- Create: `app/api/export/marcacoes/route.ts`
- Create: `app/api/export/fechamento/route.ts`
- Test: `tests/unit/attendance/attendance-service.test.ts`
- Test: `tests/unit/attendance/closing-service.test.ts`

**Interfaces:**
- Consumes: cliente Secullum, motor de cálculo e overrides locais.
- Produces: DTOs `AttendanceMonth`, `DashboardSummary`, `EmployeeClosing`, CSV UTF-8 com cabeçalho consistente.

- [ ] **Step 1: Add the focused failing test**

Testar agregação mensal, precedência de rótulo manual, dias fechados, funcionário oculto, Secullum vazio sem inventar falta, erro Secullum propagado com código amigável + mensagem bruta, cálculo de fechamento por funcionário e escape CSV para nomes/rótulos contendo vírgula/aspas.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/attendance`
Expected: falha por serviços ausentes.

- [ ] **Step 3: Implement the minimum behavior**

Rotas exigem sessão. `admin` e `gestor` podem ler; alterações continuam em rotas específicas das Tasks 3/6. Cada consulta externa grava `sync_logs`. Quando todos os funcionários esperados não possuem batidas após o horário de abertura + janela configurada, o painel retorna `possibleRepSyncFailure=true`, nunca transforma isso automaticamente em faltas. CSV deve usar datas `DD/MM/YYYY` para leitura humana e valores de duração em `HH:MM`.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/attendance`
Expected: todos passam.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm test && pnpm typecheck && pnpm build`
Expected: suíte e build verdes.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add src/services/attendance app/api tests/unit/attendance
git commit -m "feat: add attendance use cases and exports"
```

### Task 8: Interface administrativa completa

**Files:**
- Create: `app/(protected)/painel/page.tsx`
- Create: `app/(protected)/marcacoes/page.tsx`
- Create: `app/(protected)/funcionarios/page.tsx`
- Create: `app/(protected)/cartao-ponto/page.tsx`
- Create: `app/(protected)/justificativas/page.tsx`
- Create: `app/(protected)/fechamento/page.tsx`
- Create: `components/app-shell.tsx`
- Create: `components/status-state.tsx`
- Create: `components/duration.tsx`
- Create: `components/employee-selector.tsx`
- Create: `components/month-selector.tsx`
- Test: `tests/e2e/auth.spec.ts`
- Test: `tests/e2e/navigation.spec.ts`
- Test: `tests/e2e/attendance.spec.ts`

**Interfaces:**
- Consumes: APIs internas da Task 7 e configuração da Task 3.
- Produces: UI desktop-first do gestor/DP com navegação para Painel, Marcações, Funcionários, Cartão ponto, Justificativas, Fechamento e Configurações.

- [ ] **Step 1: Add the focused failing test**

Playwright deve verificar: visitante vai para login; usuário autenticado chega ao Painel; navegação entre sete áreas; estados loading/empty/config-missing/secullum-error/possible-REP-failure; tabela de marcações mostra todas as colunas; fechamento exporta CSV; CPF aparece mascarado nas listas; página de cartão ponto possui estilo de impressão sem navegação lateral.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test:e2e`
Expected: falha porque páginas ainda não existem.

- [ ] **Step 3: Implement the minimum behavior**

UI simples e interna, sem marketing. Desktop-first com responsividade suficiente para consulta em tablet/celular, mas sem fluxo operacional mobile dedicado. Usar componentes compartilhados para estados e duração. Não duplicar fórmulas no frontend: páginas apenas renderizam DTOs calculados no servidor. Tela de marcações permite salvar rótulo manual/exceção conforme permissão. Tela de funcionários permite ocultar/desocultar somente para admin. Configurações só aparece para admin.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test:e2e`
Expected: fluxos principais passam com fixtures/mocks determinísticos.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e && pnpm build`
Expected: todos encerram com código 0.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add app components tests/e2e
git commit -m "feat: add ponto lider management interface"
```

### Task 9: Provisionamento Supabase real, validação de segurança e smoke test Secullum

**Files:**
- Modify: `.env.local` (local, não versionado)
- Create: `docs/OPERACAO.md`
- Create: `docs/SEGURANCA.md`
- Create: `scripts/smoke-secullum.mjs`
- Test: `tests/integration/live/supabase.test.ts`

**Interfaces:**
- Consumes: projeto Supabase escolhido pelo usuário, publishable key, secret server-side apropriado quando necessário, `SECULLUM_ENCRYPTION_KEY` e credenciais Secullum inseridas pela própria tela.
- Produces: banco provisionado, tipos TS gerados, primeiro admin criado manualmente, verificação dos advisors e smoke test de conexão sem persistir segredo em logs.

- [ ] **Step 1: Add the focused failing test**

Criar teste de integração opt-in (`LIVE_TESTS=1`) que autentica usuário de teste, lê `profiles`, confirma bloqueio anônimo e confirma que configuração pública retorna `hasPassword` sem senha.

- [ ] **Step 2: Verify the relevant failure**

Run: `LIVE_TESTS=1 pnpm test -- tests/integration/live/supabase.test.ts`
Expected: falha enquanto projeto/env ainda não estiver provisionado.

- [ ] **Step 3: Implement the minimum behavior**

Criar projeto Supabase em `sa-east-1` quando o usuário confirmar a organização/custo aplicável. Aplicar migration, criar primeiro usuário/admin manualmente, gerar tipos TypeScript e salvar somente chaves publicáveis no frontend. Configurar segredo de criptografia server-only. Inserir credenciais Secullum exclusivamente pela tela de Configurações. Executar Advisors de segurança e desempenho; corrigir qualquer alerta de RLS/permissão causado pelo projeto. Rodar smoke de autenticação Secullum e uma consulta read-only de funcionários/batidas.

- [ ] **Step 4: Verify the focused pass**

Run: `LIVE_TESTS=1 pnpm test -- tests/integration/live/supabase.test.ts && node scripts/smoke-secullum.mjs`
Expected: teste Supabase verde e smoke Secullum retorna conexão válida ou erro explícito de credencial/configuração sem stack contendo senha.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: tudo verde com env real; Advisors sem vulnerabilidade de RLS criada por este projeto.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add docs scripts tests/integration/live src/types/database.ts
git commit -m "chore: verify production integrations"
```

### Task 10: Fechamento de qualidade e documentação de uso

**Files:**
- Create: `README.md`
- Create: `docs/FECHAMENTO.md`
- Modify: `docs/OPERACAO.md`
- Modify: `docs/SEGURANCA.md`

**Interfaces:**
- Consumes: sistema completo.
- Produces: instruções de execução, configuração, rotina mensal, diagnóstico de REP e limites conhecidos.

- [ ] **Step 1: Add the focused failing test**

Adicionar verificação automatizada de documentação (`tests/unit/docs-required.test.ts`) que exige README e seções de configuração, backup/segredos, diagnóstico do REP, fechamento e limitações.

- [ ] **Step 2: Verify the relevant failure**

Run: `pnpm test -- tests/unit/docs-required.test.ts`
Expected: falha enquanto documentação final não existir.

- [ ] **Step 3: Implement the minimum behavior**

Documentar instalação, variáveis de ambiente, como criar usuários, como configurar Secullum, como interpretar falha de sincronização do REP, como fechar o mês, como exportar CSV e limitações: dependência da nuvem Secullum, regras coletivas/feriados não inferidos e ausência de escrita no Secullum. Registrar que números devem ser validados com contabilidade antes de uso definitivo em folha quando houver regra específica de CCT/banco de horas.

- [ ] **Step 4: Verify the focused pass**

Run: `pnpm test -- tests/unit/docs-required.test.ts`
Expected: passa.

- [ ] **Step 5: Run the affected integration check**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e && pnpm build`
Expected: pipeline completo verde.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add README.md docs tests/unit/docs-required.test.ts
git commit -m "docs: add ponto lider operations guide"
```

## Unresolved externally observable decisions

1. **Organização Supabase:** existe uma única organização conectada, `lucaswessnerr@gmail.com's Org`, mas a criação do projeto cloud exige confirmação explícita do usuário para usar essa organização.
2. **Conta administrativa inicial:** o e-mail do primeiro usuário `admin` ainda não foi especificado; o sistema será preparado para criação manual no Supabase Auth sem signup público.
3. **Hospedagem e domínio:** o provedor/URL final ainda não foi definido. O código será compatível com uma implantação padrão de Next.js; a escolha de hospedagem não altera a arquitetura das Tasks 1-8.
4. **Jornada/horário de abertura reais do Bar Líder:** a aplicação terá configuração editável e não embutirá valores presumidos; sem configuração e sem `Memoria*`, o cálculo deve retornar estado de jornada insuficiente em vez de inventar horários.
