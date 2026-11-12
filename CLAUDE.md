# Contexto do projeto — Ponto Líder v2 (Neon)

Este repositório/branch contém a versão Next.js/TypeScript do Ponto Líder (gestão de ponto de restaurante) e o módulo Líder Pulse. A migração de Supabase para Neon ainda **não está validada nem publicada**.

## Escopo

1. Preservar a leitura da API Secullum, sem alterar marcações, funcionários ou configurações do fornecedor.
2. Preservar o fluxo de ponto, relatórios e a gamificação Líder Pulse.
3. Migrar autenticação para Managed Better Auth/Neon Auth e queries para Neon Data API com RLS.
4. Recuperar ou importar dados do banco Supabase antigo **após** obter acesso autorizado e backup. Não presumir que os dados já existam no Neon.
5. Testar criação/redefinição de senha por e-mail, sessão, autorização admin/gestor, integridade dos dados, páginas e integração Secullum.

## Arquitetura

- `app/` rotas Next.js e páginas; `app/auth/[path]` para recuperação e autenticação.
- `src/lib/neon/` clientes e servidor de Neon Auth.
- `src/lib/supabase/server.ts` é um arquivo legado cujo *conteúdo* já foi adaptado à Neon Data API; renomear somente em refatoração consistente.
- `src/repositories/` repositórios PostgreSQL/PostgREST.
- `src/domain/` regras de negócio e cálculos.
- `neon/migrations/` SQL adaptado — **não aplicar sem comparar com o esquema real**.
- `supabase/migrations/` histórico da implementação anterior; não executar sobre o Neon.

## Estado real na última preparação

- Neon criado com 21 tabelas públicas, 52 políticas de acesso e 23 níveis Pulse.
- Neon Auth e Data API configurados.
- Perfil inicial do administrador cadastrado, mas a identidade ainda precisa ser verificada e a senha definida com fluxo seguro.
- O aplicativo adaptado ainda precisa de `npm install`, `npm run typecheck`, `npm test`, `npm run build` e teste E2E.
- Não substituir o domínio principal antes de o login e as rotas protegidas funcionarem em preview.

## Convenções de segurança

- Não solicitar nem registrar segredos, senhas, códigos OTP, tokens OAuth ou arquivos `.env` em chats, PRs ou commits.
- Variáveis de servidor: `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEON_DATA_API_URL`, `SECULLUM_ENCRYPTION_KEY`.
- Nunca usar uma chave de banco administrativa para contornar RLS; aplicar autorização no servidor.
- Manter a opção de rollback ao deployment Vercel anterior.
- A documentação do antigo Supabase não prevalece sobre a migração Neon; validar com docs atuais da Neon.
