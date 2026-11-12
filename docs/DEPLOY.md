# Deploy do Ponto Líder

## Destino recomendado

Vercel, com o Supabase já criado em `sa-east-1`.

## Supabase já configurado

- Projeto: Ponto Lider
- Project ref: `glrqiislduaycahayczr`
- URL: `https://glrqiislduaycahayczr.supabase.co`
- Banco Secullum do Bar Líder: `131887`

## Variáveis necessárias no ambiente de produção

```env
NEXT_PUBLIC_SUPABASE_URL=https://glrqiislduaycahayczr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key do projeto>
SECULLUM_ENCRYPTION_KEY=<chave AES-256 em base64, somente servidor>
```

### Regras de segurança

- `SECULLUM_ENCRYPTION_KEY` nunca recebe prefixo `NEXT_PUBLIC_`.
- Não salvar a senha do Secullum em arquivo `.env` nem em código.
- A senha do Secullum deve ser inserida pela tela `/configuracoes` depois do deploy.
- Depois que uma senha Secullum for salva, não trocar `SECULLUM_ENCRYPTION_KEY` sem antes cadastrar a senha novamente.

## Gerar a chave AES

No projeto:

```bash
node scripts/generate-encryption-key.mjs
```

Copie a saída diretamente para a variável `SECULLUM_ENCRYPTION_KEY` do provedor de hospedagem. Não faça commit do valor.

## Primeiro acesso

1. Abrir a URL publicada.
2. Entrar com `lucaswessnerr@gmail.com` e a senha criada no Supabase Auth.
3. Abrir **Configurações**.
4. Em **Integração Secullum**, informar:
   - Usuário: o e-mail do usuário autorizado em **Integração com Sistemas** no Secullum.
   - Banco ID: `131887`.
   - Senha: a senha desse usuário Secullum.
   - Modo: somente leitura.
5. Clicar **Salvar configurações**.
6. Clicar **Testar conexão**.
7. Confirmar que a resposta mostra funcionários encontrados.

## Validação funcional mínima

Depois da conexão:

1. Abrir **Funcionários** e confirmar que a lista é a mesma do Secullum.
2. Escolher um funcionário conhecido em **Marcações**.
3. Consultar outubro/2026 e comparar um dia com o Ponto Web.
4. Validar horas trabalhadas, intervalo, adicional noturno e horário previsto.
5. Só depois usar o **Fechamento** como apoio para folha.
