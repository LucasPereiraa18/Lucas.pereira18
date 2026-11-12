# Ponto Líder v2 — Neon PostgreSQL e Neon Auth

## Concluído no projeto real

- Projeto Neon **Ponto Lider**, branch `production`, banco `neondb`.
- Neon Auth (Managed Better Auth) e Data API habilitados.
- 21 tabelas e 52 políticas RLS; 23 níveis Pulse.
- Perfil administrativo inicial criado e vinculado à conta autorizada, com e-mail ainda não verificado.
- Conta não verificada, **sem senha definida nesta migração**. Usuário deve concluir verificação/redefinição por e-mail via `/auth/forgot-password`.

## Código-fonte adaptado

O app deixa de utilizar `@supabase/ssr` e passa a usar:
- `@neondatabase/auth/next/server`: sessões, proxy e login.
- `@neondatabase/auth-ui`: login, recuperação e redefinição de senha.
- `@neondatabase/neon-js`: Data API com JWT da sessão, mantendo RLS para cada consulta.

No Vercel criar (Server-side):
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_COOKIE_SECRET`: gerado com `openssl rand -base64 32`
- `NEON_DATA_API_URL`
- `SECULLUM_ENCRYPTION_KEY`: preservar chave anterior para continuar lendo configuração Secullum existente, se dados forem migrados.

**Nunca colar credenciais no chat, GitHub ou frontend.**

## Status pendente

- O ZIP é código-fonte **em preparação**, e **não significa deploy feito**.
- Dependências e build Next.js precisam ser instalados/testados em ambiente com npm acessível.
- Aplicação ainda precisa de deploy de preview e validação E2E: e-mail de recuperação, senha nova, sessão, ranking, CRUD com JWT e Secullum somente leitura.
- Projeto Supabase original está pausado; **dados antigos não foram migrados**. Recuperá-los antes de descartar o Supabase.
- Os SQLs em `neon/migrations/` representam a definição original convertida; o provisionamento inicial no Neon foi criado com instruções equivalentes em transações, não usando exatamente esses arquivos. Não aplicar cegamente em banco populado.
- Desabilitar cadastro público após o novo administrador validar login, para evitar cadastro de contas não autorizadas. O RLS já impede acesso à aplicação sem perfil ativo.

## Referências oficiais

https://neon.com/docs/auth/quick-start/nextjs-api-only
https://neon.com/docs/auth/guides/password-reset
https://neon.com/docs/auth/migrate/from-supabase
https://github.com/neondatabase/neon-js/blob/main/packages/auth/NEXT-JS.md
