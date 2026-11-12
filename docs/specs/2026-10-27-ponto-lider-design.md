# Ponto Líder — Design do Sistema

Data: 2026-10-27
Status: aguardando revisão do usuário
Escopo: uso interno exclusivo do Bar Líder

## 1. Objetivo

Criar um sistema totalmente independente do Ambiente Líder para consulta, cálculo e fechamento de ponto dos colaboradores do Bar Líder, consumindo a Integração Externa do Secullum Ponto Web.

O sistema deve permitir que o gestor/DP consulte marcações, atrasos, horas extras, adicional noturno, faltas, justificativas e fechamento mensal sem precisar abrir o portal do Secullum e sem duplicar digitação.

## 2. Escopo fechado

- Uso interno do Bar Líder.
- Uma única empresa/unidade lógica no sistema.
- Sem multiempresa.
- Sem intenção de comercialização/SaaS.
- Sem integração de código, banco, autenticação ou deploy com o Ambiente Líder.
- Projeto, repositório, banco de dados, credenciais, domínio e deploy próprios.
- Primeira versão com Secullum em modo somente leitura.
- Escrita no Secullum poderá ser habilitada posteriormente após validação do fechamento real.
- Sem página pública de autoconsulta por CPF na primeira versão.

## 3. Stack proposta

- Frontend e backend: Next.js + TypeScript.
- Banco: Supabase PostgreSQL.
- Autenticação: Supabase Auth.
- Acesso a dados e autenticação: `@supabase/supabase-js` + `@supabase/ssr`.
- Schema e evolução do banco: migrations SQL gerenciadas pelo Supabase CLI.
- Não usar Drizzle na primeira versão, para reduzir complexidade e manter uma única camada de acesso ao banco.
- Hospedagem da aplicação: ambiente independente do Ambiente Líder.
- Integração externa: API do Secullum Ponto Web exclusivamente a partir do servidor.

## 4. Arquitetura

Fluxo principal:

Relógio REP -> Nuvem Secullum -> API de Integração Externa -> Backend Ponto Líder -> Motor de cálculo -> Supabase/PostgreSQL -> Interface administrativa

O Secullum continua sendo a fonte das batidas. O Supabase armazena apenas dados próprios do Ponto Líder, como configurações, rótulos manuais, exceções, auditoria e estado de sincronização.

## 5. Módulos da interface

### 5.1 Painel

Exibe:
- quem está em expediente;
- atrasos do dia;
- horas extras do dia;
- faltas/ausências identificadas;
- totais do mês;
- adicional noturno do mês;
- estado da última sincronização com o Secullum.

### 5.2 Marcações

Filtros por colaborador e mês.

Colunas:
- data;
- Entrada1;
- Saida1;
- Entrada2;
- Saida2;
- horas trabalhadas;
- atraso de entrada;
- atraso de intervalo;
- atraso total;
- horas extras;
- adicional noturno;
- rótulo/situação.

A tela deve permitir exportação CSV e gerenciamento de dias de exceção/loja fechada.

### 5.3 Funcionários

Lista de funcionários do Secullum, com inativos ocultos por padrão.

Uma lista local de CPFs ocultos será aplicada dentro do serviço central de consulta de funcionários, para que painel, marcações e fechamento recebam o mesmo resultado filtrado.

### 5.4 Cartão ponto

Consulta individual por colaborador/data, destinada a conferência e impressão.

### 5.5 Justificativas

Leitura das pendências/solicitações vindas do Secullum.

Na primeira versão não haverá aprovação pelo Ponto Líder.

### 5.6 Fechamento mensal

Uma linha por colaborador com:
- dias trabalhados;
- faltas;
- atestados;
- sanções/rótulos relevantes;
- atrasos;
- horas extras;
- adicional noturno;
- feriados trabalhados, quando configurados;
- demais totais necessários à conferência da folha.

Exportação CSV obrigatória.

### 5.7 Configurações

Configurações do Secullum:
- usuário;
- senha;
- ID do banco selecionado;
- modo de integração;
- tolerância de entrada;
- jornada padrão de fallback;
- fuso horário do restaurante.

A senha nunca deve ser devolvida ao navegador após salva.

## 6. Integração com Secullum

O cliente Secullum será isolado em módulo próprio.

Responsabilidades:
- autenticar;
- obter e renovar token;
- injetar cabeçalhos obrigatórios;
- repetir uma chamada após 401;
- consultar funcionários;
- consultar batidas;
- consultar pendências;
- normalizar payloads PascalCase do fornecedor;
- retornar erros claros para diagnóstico.

A integração não será chamada diretamente pelo navegador.

## 7. Motor de cálculo

As fórmulas ficarão em um módulo central e reutilizável por painel, marcações, cartão ponto e fechamento.

### 7.1 Jornada prevista

Fallback em três níveis:
1. Memoria* do próprio dia;
2. horário mais frequente nas memórias daquele funcionário no período;
3. jornada padrão configurada no Ponto Líder.

### 7.2 Horas trabalhadas

Somar os períodos efetivamente trabalhados.

### 7.3 Atraso de entrada

Tolerância padrão de 5 minutos, parametrizável.

Diferenças menores ou iguais à tolerância retornam zero.

### 7.4 Atraso de intervalo

Comparar duração real do intervalo com duração prevista, sem tolerância.

### 7.5 Hora extra

max(0, horas trabalhadas - carga prevista do dia).

### 7.6 Adicional noturno

Faixa de 22:00 às 05:00, tratando o período como contínuo até 29:00 para jornadas que atravessam a madrugada.

Converter os minutos pela hora reduzida noturna usando 60/52,5.

### 7.7 Campos textuais

Valores como FOLGA e FALTA não podem ser interpretados como horário 00:00.

O parser deve retornar nulo para campos não-horários e encaminhar o texto ao mecanismo de rótulos.

## 8. Rótulos

Ordem de derivação:
1. texto literal nos campos de marcação;
2. Folga/Compensado sem batida;
3. Observacoes;
4. Abono2/Abono3/Abono4.

Rótulo manual tem precedência sobre o derivado.

Rótulo derivado não deve ser persistido no banco enquanto não houver alteração manual.

## 9. Modelo de dados no Supabase

Tabelas previstas:

### profiles
Perfil do usuário autenticado e seu nível de acesso.

### secullum_config
Configuração da integração, incluindo credencial cifrada no servidor.

### manual_labels
Rótulos manuais por CPF e data.

### schedule_exceptions
Dias de treinamento, evento ou autorização que alteram a regra normal.

### closed_days
Dias em que o restaurante não abriu.

### hidden_employees
CPFs ocultados localmente.

### sync_logs
Histórico de consultas/sincronização com o Secullum.

### audit_logs
Registro de alterações administrativas.

Nenhuma tabela de espelho completo das batidas será criada inicialmente.

## 10. Segurança

- Supabase Auth obrigatório.
- Sem cadastro público. Usuários serão criados manualmente pelo administrador.
- Papéis iniciais: `admin` e `gestor`.
- `admin`: configura integração, usuários, ocultações, exceções e rótulos.
- `gestor`: consulta painel, marcações, funcionários, cartão ponto, justificativas e fechamento; pode editar rótulos e exceções quando autorizado.
- RLS habilitado em todas as tabelas expostas.
- service_role/secret key nunca no navegador.
- Credenciais Secullum nunca em URL.
- Senha Secullum cifrada antes de persistir.
- GET de configuração retorna apenas indicador de senha existente.
- Auditoria para alterações de rótulos, ocultação e configurações.
- CPF deve ser exibido apenas onde necessário e preferencialmente mascarado em listas.

## 11. Diagnóstico

Estados obrigatórios:
- carregando;
- sem dados;
- credencial não configurada;
- erro de autenticação;
- erro bruto retornado pelo Secullum;
- possível falha de sincronização do REP.

Se houver funcionários escalados e nenhuma batida após a abertura + janela configurada, o sistema deve sinalizar possível falha de comunicação do relógio, sem classificar automaticamente como falta.

## 12. Escrita no Secullum

Fora do escopo da primeira versão.

Após validação real, poderá ser adicionada para:
- cadastrar/ativar funcionário;
- ocultar funcionário via invisivel=true.

Não será utilizada a propriedade demissao para desligamento via API.

## 13. Critérios de aceite principais

1. Jornada 16:00–17:45 / 18:45–23:45 com batidas 16:04 / 18:50 / 19:50 / 23:45 deve resultar em 6h41 trabalhadas, 5 minutos de atraso total, 0 hora extra e 2h00 de adicional noturno conforme a especificação funcional fornecida.
2. Entrada 4 minutos após o previsto deve gerar atraso zero com tolerância de 5 minutos.
3. Ausência de Memoria* deve usar o horário mais frequente do funcionário antes do fallback global.
4. Campo textual FOLGA não pode gerar cálculo de horas.
5. Token expirado deve ser renovado e a chamada repetida uma vez.
6. ID do banco ausente deve gerar erro explícito de configuração.
7. CPF ocultado deve desaparecer de todas as telas consumidoras do serviço central de funcionários.
8. Secullum indisponível não deve resultar em dados inventados.
9. Todas as tabelas de aplicação no Supabase devem ter RLS compatível com o modelo de acesso interno.

## 14. Fora de escopo

- Multiempresa.
- Venda do sistema.
- White-label.
- Portal público do colaborador.
- Aplicativo mobile nativo.
- Banco de horas avançado por convenção coletiva.
- Integração automática com folha de pagamento.
- Aprovação de pendências do Secullum.
- Migração ou alteração do Ambiente Líder.

## 15. Resultado esperado da primeira versão

Um sistema web independente chamado Ponto Líder, acessível apenas pela administração do Bar Líder, capaz de consultar o Secullum e transformar as marcações em informações mensais úteis para conferência de ponto e fechamento, sem duplicar dados ou expor credenciais.
