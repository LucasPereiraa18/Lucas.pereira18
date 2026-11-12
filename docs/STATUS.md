# Status de implementação

## Implementado localmente

- Projeto independente Next.js/TypeScript.
- Supabase Auth e migration PostgreSQL com RLS.
- Perfis internos `admin` e `gestor`.
- Cofre AES-256-GCM para senha Secullum.
- Cliente Secullum read-only com cache de token e retry único em 401.
- Funcionários, marcações, pendências, painel, cartão ponto e fechamento.
- Fallback de jornada, tolerância, horas trabalhadas, HE e adicional noturno.
- Rótulos manuais, exceções, dias fechados, ocultação local, logs e auditoria.
- Exportações CSV.
- Interface administrativa responsiva e impressão de cartão ponto.
- Documentação operacional e de segurança.

## Verificado neste ambiente

`node scripts/check-project.mjs` passou. O parser TypeScript/TSX passou em 86 arquivos, os imports locais foram conferidos e os módulos puros de cálculo, cifra e cliente HTTP foram executados isoladamente com sucesso.

## Verificação que ainda depende de ambiente externo

O ambiente de construção atual não possui as dependências npm em cache e não consegue acessar o registro npm. Por isso `npm install`, `npm run build`, Vitest, ESLint e Playwright não puderam ser executados aqui.

O projeto Supabase cloud ainda não foi criado porque a ação exige confirmação explícita da organização. As credenciais reais do Secullum também não devem ser enviadas pelo chat; elas serão cadastradas pela tela segura após o deploy.
