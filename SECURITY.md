# Segurança — Ponto Líder

Este repositório é uma versão de portfólio do Ponto Líder. Dados operacionais, credenciais e identificadores internos não devem ser versionados.

## Controles implementados

- Autenticação administrativa via Supabase Auth.
- Row Level Security (RLS) nas tabelas públicas do banco.
- Princípio do menor privilégio aplicado às permissões SQL.
- Credenciais da integração externa tratadas apenas no servidor e armazenadas de forma criptografada.
- Segredos e configurações privadas via variáveis de ambiente.
- Content Security Policy (CSP).
- HTTP Strict Transport Security (HSTS).
- `X-Frame-Options: DENY` e `frame-ancestors 'none'` contra clickjacking.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: no-referrer`.
- `Permissions-Policy` restringindo câmera, microfone, geolocalização, pagamentos e USB.
- `X-Robots-Tag: noindex` no sistema interno.
- Respostas de API sem exposição de stack traces ou mensagens internas sensíveis.
- Exportações CSV protegidas contra spreadsheet/formula injection.
- Logs de auditoria e sincronização sem armazenamento de senhas.

## Conteúdo que nunca deve ser commitado

- Arquivos `.env` reais.
- Senhas do Supabase ou Secullum.
- Chaves privadas ou service-role keys.
- IDs internos de banco usados na operação real.
- CPFs, dados pessoais ou registros reais de funcionários.
- Dumps do banco de produção.
- Tokens de autenticação ou cookies de sessão.

## Validação da versão publicada

A versão de segurança foi validada com 40 testes automatizados, verificação TypeScript, lint dos arquivos alterados e build de produção.

## Relato de vulnerabilidades

Por ser um projeto pessoal de portfólio e uso interno, vulnerabilidades não devem ser abertas em issues públicas contendo dados sensíveis. Use um canal privado do proprietário do repositório.