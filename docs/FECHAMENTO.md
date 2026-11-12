# Fechamento mensal

## Fluxo recomendado

1. Abra **Marcações** e confira dias sem batida ou com rótulos pendentes.
2. Registre rótulos manuais apenas quando houver confirmação operacional, por exemplo `FALTA`, `ATESTADO`, `SANÇÃO` ou `FERIADO`.
3. Marque dias de loja fechada e exceções autorizadas quando aplicável.
4. Abra **Fechamento** e confira os totais de cada funcionário.
5. Exporte o CSV para conferência administrativa/contábil.
6. Valide banco de horas, convenção coletiva, feriado regional e regras da folha antes de usar os totais como valor definitivo de folha.

## Regras calculadas

### Horas trabalhadas

Soma dos períodos válidos de entrada/saída. Textos como `FOLGA` e `FALTA` nunca são interpretados como horário.

### Jornada prevista

Ordem de fallback:

1. `Memoria*` daquele dia no Secullum;
2. horário mais frequente daquele funcionário no período, quando houver um modo único;
3. jornada global configurada pelo administrador.

Sem uma jornada resolvida, o sistema não inventa atraso nem hora extra.

### Atraso de entrada

Diferença entre entrada real e prevista. Diferenças de até a tolerância configurada, por padrão cinco minutos, contam zero.

### Atraso de intervalo

O Ponto Líder usa a fórmula descrita na seção de cálculos da especificação fornecida:

`duração real do intervalo - duração prevista do intervalo`, limitada a zero quando negativa.

A especificação também contém um caso de aceite em que 18:50–19:50 é tratado como cinco minutos de atraso para um intervalo previsto de 17:45–18:45. As duas durações são 60 minutos, portanto esse resultado contradiz a própria fórmula. A versão 1 mantém a fórmula de duração e, nesse caso, calcula **0 min** de atraso de intervalo. Essa regra deve ser validada antes de qualquer mudança.

### Hora extra

`max(0, horas trabalhadas - carga prevista do dia)`.

### Adicional noturno

Conta os minutos trabalhados dentro de 22:00–05:00 e converte pela hora reduzida usando o fator `60 / 52,5`.

## Ausências

Um dia vazio não vira falta automaticamente. A coluna de faltas do fechamento aumenta somente quando a situação explícita normalizada for `FALTA`.

## Exportação

O CSV de fechamento contém funcionário, CPF, dias trabalhados, faltas, atestados, sanções, feriados trabalhados, atrasos, horas extras e adicional noturno.
