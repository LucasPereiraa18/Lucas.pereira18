# Security

Este repositório público é uma versão sanitizada do Ponto Líder v2.

- Nunca versione `.env`, senhas, tokens ou chaves privadas.
- As credenciais do Secullum são criptografadas no servidor.
- O Supabase usa RLS e perfis `admin`/`gestor`.
- A aplicação envia headers de hardening (CSP, HSTS, DENY de iframe e `nosniff`).
- CSVs são escapados para reduzir formula injection.
- Dados reais de funcionários e IDs internos não pertencem ao repositório.
- O módulo Líder Pulse usa chaves de idempotência para evitar XP duplicado em recálculos.

Para reportar uma vulnerabilidade, use um canal privado com o mantenedor e nunca publique segredos em issues.
