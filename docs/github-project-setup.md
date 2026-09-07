# Roteiro de configuração do Project #3

Este documento é **executável**: seguido de cima a baixo, deixa o
[Project #3](https://github.com/users/https-shini/projects/3) configurado
por inteiro. As regras de uso estão em
[`github-project.md`](github-project.md); aqui está o que clicar.

Tudo abaixo é trabalho de painel. Projects v2 não tem escrita por API neste
ambiente, então nada disso pode ser automatizado a partir do repositório.

---

## 1. Campos

### Status — já existe

Cinco opções, na ordem: `Backlog` · `Ready` · `In progress` · `In review` ·
`Done`. Não mexer.

### Priority

Três opções. Manter três, e não quatro: escala com mais degraus que a
decisão real produz discussão sobre o degrau em vez de sobre o item.

| opção   | quando                                                                               |
| ------- | ------------------------------------------------------------------------------------ |
| `Alta`  | bloqueia outra coisa, tem risco de segurança, ou é o próximo passo do posicionamento |
| `Média` | importa e não bloqueia nada                                                          |
| `Baixa` | melhoria desejável sem impacto imediato                                              |

### Size

Cinco opções: `XS` · `S` · `M` · `L` · `XL`. Mede **escopo**, não urgência
nem dificuldade.

| opção | referência                                     |
| ----- | ---------------------------------------------- |
| `XS`  | um arquivo, uma linha de regra, sem teste novo |
| `S`   | um arquivo ou dois, com teste                  |
| `M`   | uma feature contida, várias camadas            |
| `L`   | uma rota nova inteira, ou conteúdo longo       |
| `XL`  | um projeto dentro do projeto                   |

### Estimate — configurar, deixar vazio

> Uma versão anterior de `github-project.md` aposentou este campo por
> duplicar `Size`. **Ele volta com significado próprio:** `Size` mede
> escopo, `Estimate` mede **esforço em horas**.

E fica **vazio até haver base para preenchê-lo**. Hoje não há: o projeto
não tem histórico de itens fechados com `Size` marcado, então qualquer
número seria chute com aparência de dado.

**Quando começar a preencher:** depois de ~10 itens fechados com `Size`
preenchido. Aí dá para medir quanto um `M` custou de verdade, e a
estimativa nasce de medição.

Preencher antes disso é pior que deixar vazio — campo vazio se lê como
"não sei"; campo com chute se lê como "sei".

### Start date · Target date

`Start date` entra ao mover para `In progress`, e é fato, não plano.

`Target date` **só onde houver compromisso real**. Não há nenhum hoje. Data
inventada envelhece em uma semana e passa a mentir no roadmap.

### Iteração — **não configurar**

Iteração pressupõe cadência estável. Este projeto é de um mantenedor com
CLT e faculdade em ano de formatura; a disponibilidade é irregular por
construção. Sprint que não fecha vira sprint que se ignora, e aí o campo
mente sobre o ritmo.

O agrupamento útil aqui é por **Milestone** (fase), que não tem data fixa.

### Campos personalizados — **nenhum**

Os sete nativos cobrem o necessário. Em particular **não crie um campo de
aprovação**: mover o cartão já é o ato de aprovar, e um campo que discorde
da coluna é mais uma coisa para divergir.

---

## 2. Milestones

Um por fase do backlog técnico, na ordem em que o roadmap as encadeia.
**Sem data** — o agrupamento é de escopo.

| milestone                           | issues                              |
| ----------------------------------- | ----------------------------------- |
| `Fase 0 · Higiene`                  | #11 #12 #13 #14                     |
| `Fase 1 · Posicionamento`           | #15 #16 #17 #18                     |
| `Fase 1.5 · Lastro AI & Automation` | #35 #36 #37 #38 #39 #40 #41 #42 #43 |
| `Fase 3 · Instrumentação`           | #19 #20 #21                         |
| `Fase 4 · Prova`                    | #22 #23 #24                         |
| `Fase 5 · Canal freelance`          | #25                                 |
| `Fase 6 · Robustez`                 | #26 #27 #28 #29 #30                 |
| `Fase 7 · Performance`              | #31 #32                             |

Fora de milestone, de propósito: #4 #5 #6 #7 #8 #9 e as sub-issues
#44–#49. São itens do board original, anteriores ao backlog por fases.
Entram numa fase quando a consolidação de #6 × T12/T13/T14 for decidida.

---

## 3. Preenchimento de `Priority` e `Size`

**A fonte é documentada, não inventada:** as colunas `Prior.` e `Esforço`
da §22 de [`AUDITORIA-2026-08.md`](AUDITORIA-2026-08.md).

**A conversão de prioridade**, e por que ela é assim:

```
P0 → Alta      P1 → Média      P2 → Baixa      P3 → Baixa
```

A escala da auditoria tem quatro degraus; a do board tem três. A tentação é
mapear P0 e P1 para `Alta`, mas isso põe **21 dos 32 itens** em `Alta` — e
campo em que dois terços dos itens são prioridade máxima não prioriza nada.
Deslocando um degrau, a distribuição fica 8 · 13 · 11.

**A conversão de esforço:** `Baixo → S` · `Médio → M` · `Grande → L`.

| issue | Priority | Size |     | issue | Priority | Size |
| ----- | -------- | ---- | --- | ----- | -------- | ---- |
| #11   | Baixa    | S    |     | #26   | Média    | M    |
| #12   | Baixa    | S    |     | #27   | Média    | S    |
| #13   | Média    | S    |     | #28   | Baixa    | M    |
| #14   | Baixa    | S    |     | #29   | Baixa    | M    |
| #15   | **Alta** | S    |     | #30   | Baixa    | S    |
| #16   | **Alta** | S    |     | #31   | Baixa    | M    |
| #17   | Média    | S    |     | #32   | Baixa    | M    |
| #18   | Baixa    | S    |     | #36   | Média    | S    |
| #19   | Média    | S    |     | #37   | **Alta** | M    |
| #20   | Média    | S    |     | #38   | **Alta** | M    |
| #21   | Baixa    | S    |     | #39   | **Alta** | M    |
| #22   | **Alta** | M    |     | #40   | **Alta** | M    |
| #23   | Média    | M    |     | #41   | Média    | M    |
| #24   | **Alta** | L    |     | #42   | Média    | S    |
| #25   | Média    | M    |     | #43   | Média    | S    |

**Os que não saem da auditoria** — o dado vem do corpo original das issues,
antes da limpeza de metadados:

| issue | Priority    | Size | fonte                                                        |
| ----- | ----------- | ---- | ------------------------------------------------------------ |
| #4    | `Alta`      | `XL` | o corpo dizia "Prioridade: Alta · Estimate 5 (Muito grande)" |
| #8    | `Média`     | `L`  | "Prioridade sugerida: Média · Estimate 4 (Grande)"           |
| #9    | **decidir** | `M`  | o corpo dizia "Média-alta", que não existe na escala         |

**Sem dado nenhum**, e que ficam vazios até você decidir: #5, #6, #7, #35 e
as sub-issues #44–#49.

---

## 4. Assignee

**Todas as issues abertas → `https-shini`.** Repositório de mantenedor
único; não há ambiguidade a resolver, e `In progress` exige o campo
preenchido.

---

### Cor dos rótulos

Os treze em uso nasceram com o cinza padrão do GitHub. Colorir por família
faz o board ser lido de relance, em vez de palavra por palavra:

| família        | rótulos                        | sugestão                                        |
| -------------- | ------------------------------ | ----------------------------------------------- |
| qualidade      | `perf` `a11y` `test`           | um tom só, frio                                 |
| risco          | `security`                     | vermelho, sozinho — é o que precisa saltar      |
| conteúdo       | `content` `ux` `seo`           | um tom quente                                   |
| infraestrutura | `ci` `arch` `data` `analytics` | um tom neutro                                   |
| manutenção     | `docs` `chore`                 | cinza, o padrão atual, já serve                 |
| estado         | `status:blocked`               | amarelo ou laranja, distinto de todos os outros |

`status:blocked` é o único que descreve estado e não área — a cor dele
deveria destoar de propósito.

---

## 5. Views

Seis, cada uma respondendo uma pergunta que você faz de fato. View sem
pergunta é view que ninguém abre.

### 5.1 · `Board` — o quadro operacional

Layout **Board**, agrupado por `Status`. É a visão padrão.

### 5.2 · `Precisa de mim` — a mais importante

Layout **Table**. Filtro:

```
is:open status:"Ready","In review"
```

São exatamente as **duas portas de aprovação**. Se esta view está vazia,
nada espera por você. Se tem item, ele espera — e a coluna diz qual porta.

### 5.3 · `Pronto para começar`

Layout **Table**, ordenado por `Priority` decrescente. Filtro:

```
is:open -label:status:blocked status:"Backlog","Ready"
```

Responde "o que dá para pegar agora sem esbarrar em nada". Hoje devolve 20
dos 44 itens abertos.

### 5.4 · `Bloqueados`

Layout **Table**, agrupado por `Milestone`. Filtro:

```
is:open label:status:blocked
```

Hoje: 24 itens. O agrupamento por fase mostra **onde** a fila trava.

### 5.5 · `Roadmap`

Layout **Roadmap**, agrupado por `Milestone`, usando `Start date` e
`Target date`.

Vai nascer sem barras, porque não há data em item nenhum. Isso é honesto:
o roadmap tem ordem e não tem prazo. As barras aparecem conforme os
compromissos aparecerem.

### 5.6 · `Tudo`

Layout **Table**, agrupado por `Milestone`, com todos os campos visíveis.
É a view de auditoria — a que se abre para achar o que está incompleto.

### O que **não** criar

- **`My items`** — repositório de uma pessoa; a view seria igual a `Tudo`.
- **View por rótulo de área** — o filtro da barra resolve, e seis views já
  são o limite do que se mantém atualizado.

---

## 6. Automações

### Já ativas — verificado por comportamento

| regra                  | evidência                                   |
| ---------------------- | ------------------------------------------- |
| item novo → `Backlog`  | #28 e #44 criadas por API entraram sozinhas |
| issue fechada → `Done` | #10, #34, #50, #52                          |

### A corrigir

**PR aberto → move para `In progress`, e deveria mover para `In review`.**

Medido com antes e depois: a issue #52 estava em `Backlog` e passou a
`In progress` ao abrir o PR #53. A automação está uma coluna atrás, e o
`In review` fica sem porta de entrada.

No painel: **Workflows → Pull request opened → `In review`**.

### A verificar

**PR mergeado → `Done`.** Não dá para isolar hoje: `Closes #N` fecha a
issue no merge, e o fechamento já move para `Done` sozinho. As duas regras
produzem o mesmo efeito observável.

### `Auto-archive`

Itens em `Done` há mais de 60 dias saem do board sem sumir do repositório.
Vale ligar quando `Done` passar de ~30 cartões; hoje são 4.

---

## 7. Como usar no dia a dia

| a pergunta                  | onde                                   |
| --------------------------- | -------------------------------------- |
| O que precisa de mim?       | view **Precisa de mim**                |
| O que dá para começar?      | view **Pronto para começar**           |
| O que está travado, e onde? | view **Bloqueados**, agrupada por fase |
| O que está sendo feito?     | **Board**, coluna `In progress`        |
| O que espera revisão?       | **Board**, coluna `In review`          |
| O que já saiu?              | **Board**, coluna `Done`               |
| Qual a prioridade?          | **Pronto para começar**, já ordenada   |
| Qual a direção?             | **Roadmap**, agrupado por fase         |
| O que está incompleto?      | **Tudo**, procurando campo vazio       |

### A rotina que mantém isso vivo

**Ao abrir issue:** tipo e rótulos. O `Backlog` é automático.

**Ao promover para `Ready`:** `Priority` e `Size` preenchidos, critérios de
aceite verificáveis, dependências fechadas.

**Ao aprovar (porta 1):** mover para `In progress`, pôr `Assignee` e
`Start date`, criar a branch.

**Ao abrir PR:** `Closes #N` no corpo. O resto é automático — depois da
correção da seção 6.

**Ao aprovar (porta 2):** os nove pontos da §7 de `github-project.md`.

**Ao fechar uma issue:** procurar quem a citava como dependência e tirar o
`status:blocked` de quem destravou. É o único passo que não tem automação
nem verificação, e é onde o board apodrece se ninguém olhar.

---

## 8. Ordem de execução

1. Campos: confirmar `Priority` e `Size`; criar `Estimate` e deixar vazio.
2. Os oito milestones da seção 2.
3. `Priority` e `Size` pela tabela da seção 3.
4. `Assignee` em todas.
5. As seis views da seção 5.
6. Corrigir a automação de PR.
7. Proteger `main`: PR obrigatório e os dois checks do CI, **sem** exigir
   aprovação de revisor e **sem** histórico linear — as duas travariam seu
   próprio merge.
8. Remover os nove rótulos padrão do GitHub listados em
   `github-project.md` §5.
9. Colorir os treze em uso, pela seção 4.

### Higiene de branch

Branch de PR mergeado não se apaga sozinha aqui. O
"Automatically delete head branches" das configurações do repositório **não
resolve o caso**: ele só age em merge feito pelo botão do GitHub, e os
merges deste projeto são locais. Ligá-lo prometeria algo que não entrega.

Então a limpeza é manual, e o critério de segurança é um só: **existe em
`main` o commit de squash daquele PR?** Se existe, a branch não guarda
trabalho pendente.

```bash
git log origin/main --oneline --grep="(#<número-do-PR>)"
git push origin --delete <a-branch>
```

Não use `git diff` contra `main` para decidir isso. Ele responde a pergunta
errada: assim que `main` avança, o diff passa a mostrar diferença mesmo
quando nada se perdeu — o que aparece é o texto antigo, legitimamente
superado por PRs posteriores.

Os passos 1 a 5 são o grosso. Feitos eles, o board responde às nove
perguntas da seção 7.
