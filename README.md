# Ponto Líder v2 — Líder Pulse

Sistema interno do Bar Líder, desenvolvido em Next.js, React e TypeScript, para acompanhar ponto de funcionários (integração Secullum **somente leitura**) e indicadores de reconhecimento do módulo Líder Pulse.

## Funcionalidades

- Painel, marcações, cartão-ponto, funcionários, justificativas, fechamento e exportação.
- Líder Pulse: Vida/assiduidade, pontualidade, execução, nota coletiva, bônus, ranking, XP, níveis, moedas, conquistas e loja.
- API Secullum apenas para consulta; nenhuma marcação é gravada no sistema do fornecedor.

## Situação desta branch

**Versão de migração em andamento, não é uma release de produção.** A versão publicada no domínio do Ponto Líder ainda utiliza o backend antigo; esta branch contém a adaptação para Neon e deve ser validada em preview antes de qualquer troca de ambiente.

- Novo banco Neon PostgreSQL: estrutura criada; veja `NEON-MIGRACAO.md`.
- Neon Auth e Neon Data API: ativados, novo perfil administrativo inicial cadastrado.
- Senha nova do administrador: **não definida**; falta confirmação por e-mail e teste do login.
- Os dados antigos do Supabase pausado **não foram migrados**.
- O conteúdo da pasta `neon/migrations/` é referência de migração; **não reaplique cegamente** no banco inicializado.
- Necessário instalar dependências, executar testes, corrigir eventuais incompatibilidades de SDK e realizar deploy de preview.

## Stack

- Next.js 16 + React 19 + TypeScript.
- PostgreSQL no Neon, Managed Better Auth e Data API, acesso aos dados com RLS.
- Vitest e Playwright.
- Vercel para deploy.

## Desenvolvimento local

Requer Node.js >= 22.13.0.

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm test
npm run build
npm run dev
```

Preencha as variáveis no ambiente local ou Vercel, **nunca no GitHub**:

- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_COOKIE_SECRET` (segredo aleatório, >= 32 caracteres)
- `NEON_DATA_API_URL`
- `SECULLUM_ENCRYPTION_KEY` (somente servidor, manter valor se importar dados cifrados)

Configurar usuário e senha da Secullum pela interface autenticada, nunca em arquivos versionados.

## Segurança

Não publique credenciais, chaves, dados de colaboradores ou arquivos `.env`. O acesso administrativo deve ser permitido somente a usuários com perfil ativo e papel autorizado. Teste a proteção de rotas e de RLS antes de publicar. Recomenda-se usar um repositório **privado** para produção e uso corporativo.

## Documentação

- [Guia de migração para o Neon](NEON-MIGRACAO.md)
- [Contexto para Claude ou outros agentes](CLAUDE.md)
- [Informações da v2](RELEASE-V2.md)
- [Documentação operacional](docs/OPERACAO.md)
