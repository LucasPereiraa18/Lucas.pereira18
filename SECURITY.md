# Security

Este repositório público é uma versão sanitizada do Ponto Líder.

- Nunca versione `.env`, senhas, tokens ou chaves privadas.
- As credenciais do Secullum são criptografadas no servidor.
- O Supabase usa RLS e perfis `admin`/`gestor`.
- A aplicação envia headers de hardening (CSP, HSTS, DENY de iframe e `nosniff`).
- CSVs são escapados para reduzir formula injection.
- Dados reais de funcionários e IDs internos não pertencem ao repositório.

Para reportar uma vulnerabilidade, abra um contato privado com o mantenedor em vez de publicar segredos em uma issue.
