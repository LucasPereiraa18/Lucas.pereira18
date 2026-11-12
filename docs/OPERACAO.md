# Operação do Ponto Líder

## 1. Acesso

Somente usuários internos criados no Supabase Auth podem entrar. Há dois perfis:

- `admin`: configuração do Secullum, ocultação local de funcionários e todas as consultas.
- `gestor`: consultas, rótulos e exceções operacionais.

Não existe cadastro público nem página pública por CPF.

## 2. Painel

O Painel mostra quem aparenta estar em expediente, totais do mês e o último estado de sincronização. O status “possível falha de sincronização do REP” é diagnóstico: ele aparece quando a loja já deveria estar aberta, passou a janela configurada e não existe nenhuma marcação recebida.

Esse alerta não cria falta e não altera o Secullum.

## 3. Marcações

Selecione colaborador e mês. A grade mostra todos os dias do período e diferencia:

- batida recebida do Secullum;
- dia sem batida;
- loja fechada;
- exceção autorizada;
- rótulo derivado do Secullum;
- rótulo manual.

O rótulo manual tem precedência e fica armazenado apenas no Ponto Líder.

## 4. Funcionários

A lista vem do Secullum. Um administrador pode ocultar um CPF localmente para que ele deixe de aparecer nos consumidores internos. Isso não preenche demissão e não modifica o cadastro legal no Secullum.

## 5. Cartão ponto

Permite selecionar funcionário e data, conferir as marcações e imprimir pelo navegador.

## 6. Justificativas

Exibe as pendências retornadas pelo Secullum em leitura. Aprovação ou edição de pendência não faz parte da versão 1.

## 7. Diagnóstico do REP

Se o sistema autentica normalmente, dias anteriores aparecem e o dia atual fica vazio para toda a equipe, verifique a conexão de internet do relógio REP. O Ponto Líder consulta a nuvem do Secullum; ele não lê diretamente o equipamento.

Quando a comunicação volta, as marcações podem aparecer retroativamente.

## 8. Backup e segredos

O banco deve seguir a política de backup da conta Supabase. Nunca copie para planilhas, GitHub ou documentação:

- `SECULLUM_ENCRYPTION_KEY`;
- senha do Secullum;
- tokens de autenticação.

Se `SECULLUM_ENCRYPTION_KEY` for trocada, a senha Secullum já cifrada deixa de ser legível e deve ser salva novamente pela tela de Configurações.
