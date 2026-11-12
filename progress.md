Plan: docs/plans/2026-10-27-ponto-lider-implementation.md

Status em 2026-10-27:
- Tasks 1-8: implementação local presente; verificação completa com npm/Vitest/Next build pendente porque este ambiente não consegue baixar dependências do registro npm.
- Task 9: Supabase cloud criado em `sa-east-1`; schema/RLS e advisors verificados. Falta configurar a chave secreta no ambiente de deploy, criar o primeiro usuário interno e inserir as credenciais Secullum pela aplicação.
- Task 10: documentação criada; verificação estrutural local passou.

Verificações executadas com sucesso:
- node scripts/check-project.mjs
- parser TypeScript/TSX: 86 arquivos sem erro sintático
- imports locais: 86 arquivos sem caminho quebrado
- motor de ponto: 6h41 trabalhadas, tolerância de entrada, 0 HE, 2h00 noturno reduzido no caso-base
- cofre de credenciais AES-256-GCM: cifra/decifra, IV diferente e rejeição de adulteração
- cliente Secullum: autenticação, cabeçalho do banco e retry único após 401

Limitação conhecida da especificação:
- O caso-base pede 5 min de atraso de intervalo, porém a fórmula de duração fornecida no mesmo documento produz 0 min. A versão implementa a fórmula de duração e documenta a divergência em docs/FECHAMENTO.md.
