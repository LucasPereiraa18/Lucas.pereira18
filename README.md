# Ponto Líder

Sistema web interno desenvolvido para apoiar a gestão de ponto do Bar Líder, integrando dados do Secullum Ponto Web e centralizando marcações, atrasos, horas extras, adicional noturno, justificativas, cartão-ponto e fechamento mensal.

**Aplicação em produção:** https://ponto-lider.vercel.app

> O ambiente publicado é de uso interno e exige autenticação. O repositório contém apenas código e exemplos sanitizados para portfólio; dados e credenciais reais não são versionados.

## Objetivo

O projeto nasceu de uma necessidade real de operação: consultar e organizar as marcações já registradas no relógio de ponto e sincronizadas com o Secullum, reduzindo trabalho manual e melhorando a conferência mensal.

## Stack

- Next.js 16 + React 19 + TypeScript
- Supabase Auth + PostgreSQL
- Integração server-side com Secullum Ponto Web
- Vitest para testes unitários e de integração
- Vercel para deploy

## Principais recursos

- Autenticação administrativa
- Dashboard de ponto
- Consulta de marcações por mês
- Funcionários ativos
- Cartão-ponto
- Justificativas e rótulos manuais
- Fechamento mensal
- Cálculo de atrasos, horas extras e adicional noturno
- Exportação CSV protegida contra formula injection
- Logs de sincronização e auditoria
- Configuração centralizada da integração Secullum

## Segurança

A versão de portfólio não contém credenciais, senhas, CPFs reais, IDs internos do banco Secullum ou chaves privadas. O projeto usa RLS no Supabase, privilégios reduzidos por tabela, credenciais de integração criptografadas no servidor, autenticação por perfil e headers HTTP de hardening.

Também foram adicionados CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, respostas de erro sem detalhes internos e proteção de CSV contra formula injection.

Consulte [SECURITY.md](SECURITY.md) para os detalhes.

## Qualidade

A versão endurecida foi validada com:

- 12 arquivos de teste
- 40 testes aprovados
- TypeScript sem erros
- ESLint nos arquivos alterados
- build de produção concluído

## Estrutura de portfólio

O repositório apresenta os principais componentes técnicos do Ponto Líder, incluindo autenticação/autorização, criptografia de credenciais, hardening HTTP, segurança de exportações, configuração do Supabase e testes automatizados. Dados operacionais e segredos do restaurante ficam fora do versionamento por design.

## Status

Projeto em uso interno e evolução contínua.

---

Desenvolvido por Lucas Pereira como projeto aplicado de desenvolvimento web, integração de API, banco de dados e segurança de aplicações.