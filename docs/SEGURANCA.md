# Segurança

## Princípios

- Aplicação interna, sem signup público.
- Supabase Auth para sessão.
- Autorização de aplicação baseada em `public.profiles`, não em `user_metadata` editável.
- RLS habilitado em todas as tabelas do schema `public`.
- Configuração Secullum e auditoria não são expostas diretamente ao papel `authenticated`.
- Chave secreta Supabase e chave de cifra existem somente no servidor.

## Credencial Secullum

A senha é cifrada com AES-256-GCM e IV aleatório antes de ser armazenada. A API de configuração devolve apenas `hasPassword: true/false`, nunca o segredo original.

O token Secullum fica somente em memória e é renovado automaticamente. Em `401`, o cliente limpa o token e faz uma única nova autenticação/tentativa.

## Dados pessoais

CPFs são necessários para correlacionar o colaborador com o Secullum, mas a interface deve evitar exposição desnecessária. Não existe rota pública para consulta de ponto.

## Auditoria

Alterações locais relevantes registram ator e ação, incluindo rótulos, exceções, dias fechados, ocultação de funcionário e alteração de configuração. Metadados de auditoria nunca devem conter senha Secullum.

## Rotação de segredos

Ao trocar `SECULLUM_ENCRYPTION_KEY`, salve novamente a senha do Secullum, pois a credencial anterior não poderá mais ser descriptografada.

## Bootstrap do ambiente cloud

O projeto Supabase do Ponto Líder é `glrqiislduaycahayczr`, hospedado em `sa-east-1`.

1. A URL e a publishable key podem permanecer no frontend e já estão no `.env.example`.
2. O aplicativo usa o usuário autenticado e RLS do Supabase; não precisa de Secret Key administrativa em produção.
3. Gere `SECULLUM_ENCRYPTION_KEY` com `node scripts/generate-encryption-key.mjs` e salve-a como segredo do servidor.
4. Crie o primeiro usuário em Supabase Auth e, depois, uma linha correspondente em `public.profiles` com `role='admin'` e `active=true`.
5. Não habilite cadastro público no Ponto Líder; a aplicação não possui tela de cadastro.
