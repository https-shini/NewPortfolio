# GitHub Project — como este repositório é planejado

Fonte de verdade do planejamento do NewPortfolio. Se algo aqui divergir do
board, do README ou de uma issue, **este documento vale** e a divergência é
um defeito a corrigir.

- **Project #3 — "Controle de Danos - NewPortfolio"**, público, do usuário
  `https-shini`.
- **Repositório:** `https-shini/NewPortfolio`, branch padrão `main`.

---

## 1. A regra que sustenta todas as outras

> **O campo do Project é a verdade. O corpo da issue não repete metadado.**

Status, prioridade, tamanho, estimativa, tipo e datas vivem **só** nos
campos do Project. O corpo da issue descreve o problema, a especificação e
os critérios de aceite — nada mais.

Isso não é preferência de estilo. Antes desta regra o repositório tinha a
issue #4 marcada como `Ready` no board e escrita como `Backlog` no corpo,
as duas publicadas ao mesmo tempo. Metadado duplicado envelhece em um dos
dois lugares, e quem lê não tem como saber qual.

Consequência prática: **nenhum template de issue pede prioridade ou
estimativa.** Quem abre a issue descreve; quem prioriza usa o painel.

---

## 2. Fluxo — as cinco etapas

```
Backlog  →  Ready  →  In progress  →  In review  →  Done
```

| Etapa           | O que significa                                      | Quando um item entra aqui                                                                                            |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Backlog**     | Registrado, ainda não comprometido                   | Toda issue nova nasce aqui                                                                                           |
| **Ready**       | Entendido o bastante para começar sem perguntar nada | O corpo tem critérios de aceite verificáveis, as dependências estão fechadas e `Priority` e `Size` estão preenchidos |
| **In progress** | Alguém está trabalhando nele agora                   | Existe branch. Só entra com `Assignee` preenchido                                                                    |
| **In review**   | O trabalho existe e está sendo revisado              | Existe **PR aberto** ligado à issue, e o CI está rodando ou passou                                                   |
| **Done**        | Entregue e verificado                                | O PR foi mergeado em `main` e os critérios de aceite estão todos marcados                                            |

### As transições que não podem acontecer

- **`Backlog` → `In progress`** sem passar por `Ready`: significa que
  começou sem o item estar entendido.
- **`In progress` → `Done`** pulando `In review`: é o que acontece quando
  se commita direto em `main`. Enquanto isso for a prática, `In review` é
  decoração — ver a seção 6.
- **Qualquer coisa → `Done`** com critério de aceite desmarcado.

### Voltar é normal

`In review` → `In progress` quando a revisão pede mudança. `Ready` →
`Backlog` quando a prioridade muda ou aparece uma dependência nova. Voltar
não é fracasso; item parado em `In progress` por semanas é.

---

## 3. Os campos

| Campo           | Tipo                    | Quem preenche, e quando                                                   |
| --------------- | ----------------------- | ------------------------------------------------------------------------- |
| **Status**      | seleção única, 5 opções | Move-se pelo board. Nunca escrito no corpo                                |
| **Priority**    | seleção única           | Ao promover para `Ready`                                                  |
| **Size**        | seleção única           | Ao promover para `Ready`                                                  |
| **Estimate**    | número                  | Ver a nota abaixo                                                         |
| **Start date**  | data                    | Ao entrar em `In progress`                                                |
| **Target date** | data                    | Só quando existe compromisso real. Sem prazo é melhor que prazo inventado |
| **Type**        | Issue Type nativo       | Na abertura                                                               |
| **Assignee**    | pessoa                  | Obrigatório a partir de `In progress`                                     |
| **Labels**      | rótulos                 | Na abertura — ver a seção 5                                               |

### `Priority`

`Alta` · `Média` · `Baixa`. **Não existe "Média-alta".** Se um item parece
não caber na escala, o problema costuma ser que ele mistura duas coisas de
urgência diferente — divida.

### `Estimate` e `Size` — pendência declarada

Hoje os dois medem a mesma coisa. A escala que emergiu nos corpos das
issues (`5 (Muito grande)`, `4 (Grande)`, `3 (Médio)`) é de 1 a 5 mapeando
para tamanho, exatamente o que `Size` já faz.

**Decisão em aberto:** aposentar um dos dois, ou dar a `Estimate` um
significado próprio (horas, pontos). Enquanto não decidido, preencha
**apenas `Size`** e deixe `Estimate` vazio — dois campos dizendo a mesma
coisa divergem no dia em que um dos dois não é atualizado.

### `Type`

Os Issue Types deste repositório são **`Feature`**, **`Bug`** e **`Task`**.
`enhancement`, `chore` e `refactor` **não são tipos** — são rótulos
(seção 5). Um item que muda comportamento visível é `Feature`; um que
conserta comportamento errado é `Bug`; o resto é `Task`.

---

## 4. Issues e sub-issues

### Quando dividir

Divida quando **qualquer uma** destas for verdade:

- O item entrega valor em mais de um momento (dá para mergear uma parte).
- `Size` é o maior da escala.
- O corpo já vem dividido em frentes com critérios de aceite separados.
- Partes diferentes dependem de decisões diferentes ainda não tomadas.

As partes entram como **sub-issues**, não como issues soltas. É o que
alimenta o campo `Sub-issues progress` do board — com issues soltas, o
progresso de um item grande fica invisível.

### O que um corpo de issue precisa ter

1. **Contexto** — o estado atual, com caminho de arquivo quando existir.
2. **Objetivo** — uma frase.
3. **Especificação** — o suficiente para alguém que não escreveu a issue
   executar.
4. **Critérios de aceite** — caixas de seleção, cada uma verificável por
   quem não escreveu o item.
5. **Arquivos envolvidos.**
6. **Dependências** — outras issues, por número.
7. **Definição de pronto** — o que se testa, e como.

Afirmação sobre o código vem **lida do código**, com o caminho junto. Se
não deu para verificar, escreva que não deu.

### O que não entra no corpo

Status, prioridade, tamanho, estimativa, tipo, prazo (seção 1) — e HTML.
O corpo é **Markdown**. Colar de editor de texto rico produz
`<html><body><!--StartFragment-->` e uma árvore HTML que o GitHub renderiza
diferente do resto.

---

## 5. Rótulos

Rótulo é **área e natureza**; nunca prioridade nem status (esses são
campos).

Os rótulos abaixo existem no repositório e espelham a coluna `Categoria`
do backlog em `docs/AUDITORIA-2026-08.md` §22 — não são uma taxonomia
nova.

| Rótulo      | Uso                                                             |
| ----------- | --------------------------------------------------------------- |
| `perf`      | tempo de carregamento, orçamento de bundle, custo de estilo     |
| `a11y`      | acessibilidade, axe, navegação por teclado                      |
| `seo`       | metadados, sitemap, dados estruturados, indexação               |
| `security`  | headers, CSP, dependências vulneráveis, segredos, rate limiting |
| `docs`      | documentação, README, registro de decisão                       |
| `ci`        | pipeline e arranjos de auditoria                                |
| `content`   | texto, posicionamento, curadoria de projetos                    |
| `ux`        | afordância, hierarquia visual, caminhos de conversão            |
| `analytics` | instrumentação e eventos                                        |
| `arch`      | estrutura de dados e organização de camadas                     |
| `data`      | curadoria e integridade de dado                                 |
| `test`      | cobertura de teste                                              |
| `chore`     | manutenção sem mudança de comportamento                         |
| `refactor`  | reorganização de código a comportamento constante               |

Todos nasceram com a cor cinza padrão do GitHub. Colorir por família —
uma para qualidade, outra para conteúdo, outra para infraestrutura —
é trabalho de painel, e ajuda a ler o board de relance.

Um item pode ter mais de um. Item sem rótulo nenhum não deveria sair de
`Backlog`.

---

## 6. Pull requests, e por que `In review` existe

O fluxo previsto é **issue → branch → PR → CI → merge**. O CI já roda em
`pull_request` para `main` e cobre, em dois jobs:

`lint` · `type-check` · `format:check` · `test` · `icones:check` ·
`imagens:check` · `build` · `audit:a11y` · `audit:overflow` ·
`audit:layers` · `audit:identity` · `audit:release-notes` ·
`audit:modals` · `audit:bundle`

**Estado real, registrado aqui de propósito:** o histórico tem 64 commits
diretos em `main` nos últimos 30 dias, zero merges e nenhum PR desde julho.
Nenhuma issue tem branch ou PR ligado. Enquanto isso continuar, `In review`
não tem porta de entrada e `Done` é marcado à mão.

Não é um defeito do board — é a prática divergindo do fluxo. Registrado
como decisão pendente, não como regra quebrada.

### Ligar PR e issue

Use `Closes #N` no corpo do PR. Isso liga os dois no board e fecha a issue
no merge. Um PR que não fecha a issue inteira usa `Refs #N`.

---

## 7. Critérios de `Done`

Um item só é `Done` quando **todos** valem:

- [ ] Todos os critérios de aceite marcados.
- [ ] O CI passou na branch mergeada.
- [ ] O comportamento foi verificado em produção, quando visível ao usuário.
- [ ] A documentação afetada foi atualizada no mesmo PR.
- [ ] Nenhum critério foi removido para caber no prazo — se o escopo
      encolheu, o que saiu virou issue nova, ligada.

---

## 8. Manutenção deste arranjo

**A cada item que entra:** tipo e rótulos na abertura; `Backlog`.

**A cada item que sai:** conferir se algum documento em `docs/` ou o README
afirmava algo que a entrega desmentiu.

**Revisão periódica:**

- Item em `In progress` sem commit há mais de duas semanas volta para
  `Ready` ou ganha uma nota dizendo o que trava.
- Item em `Backlog` há muito tempo e sem prioridade: decidir ou fechar.
  Backlog infinito é backlog que ninguém lê.
- Campo vazio em item `Ready` ou adiante é defeito.

**Onde mais o projeto planeja:**

| lugar                           | papel                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------ |
| **Project #3**                  | o único planejamento ativo                                                     |
| `docs/AUDITORIA-2026-08.md` §22 | origem do backlog técnico T01–T33; cada T tem issue e a tabela traz o número   |
| `docs/PERFORMANCE-2026-08.md`   | registro de medição — o que foi medido, o que foi reprovado, o que não repetir |
| `docs/ROADMAP.md`               | **histórico**, encerrado. Não abrir trabalho novo a partir dele                |
| `README.md` §Roadmap            | aponta para o board. Não lista item                                            |

---

## 9. O que precisa ser feito no painel do Project

Estas ações não têm equivalente em arquivo do repositório — só o painel do
Project as executa.

### Correções pendentes

1. **Issue [#4](https://github.com/https-shini/NewPortfolio/issues/4) — `Status`.**
   Está `Ready` no board. O corpo dizia `Backlog`, e os dois estavam
   publicados se contradizendo. O corpo já não afirma status nenhum — falta
   decidir qual dos dois valia e deixar o campo certo.

2. **Preencher `Priority` e `Size` com o dado que já existia nos corpos:**

   | issue                                                                            | `Priority`                                                         | `Size`            |
   | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------- |
   | [#4](https://github.com/https-shini/NewPortfolio/issues/4) — Backend de contato  | `Alta`                                                             | o maior da escala |
   | [#8](https://github.com/https-shini/NewPortfolio/issues/8) — Página `/projetos`  | `Média`                                                            | o segundo maior   |
   | [#9](https://github.com/https-shini/NewPortfolio/issues/9) — Refatoração do Work | **decidir** — o corpo dizia `Média-alta`, que não existe na escala | médio             |

   `Estimate` fica vazio até a pendência da seção 3 ser decidida.

3. **`Priority` e `Size` dos itens T01–T33.** Os corpos trazem a prioridade
   original da auditoria (`P0`–`P3`) e o esforço, mas essa escala não é a do
   board. Mapear as duas, ou preencher item a item.

4. **`Assignee`** em todas — hoje nenhuma tem dono.

5. **Datas.** Só onde houver compromisso real. Nenhum documento do
   repositório traz prazo, e prazo inventado é pior que campo vazio.

### Adicionar os cartões ao board

O repositório passou de 6 para 46 issues. Se a automação de auto-add
existir, elas entraram sozinhas; se não, precisam ser adicionadas — e criar
a automação vale mais que adicionar 40 cartões à mão.

`Type` e rótulos já estão preenchidos em todas as issues, novas e antigas.

### Verificações

6. **Automações do Project.** Confirmar se existem, e criar as que faltarem:
   - item novo no repositório → entra em `Backlog`;
   - PR aberto ligado à issue → `In review`;
   - PR mergeado → `Done`.

   Sem a primeira, cada issue nova precisa ser adicionada ao board à mão.

7. **Views.** Uma por status (o board) já existe. Com 46 itens, vale uma
   view por rótulo (`perf`, `a11y`, `security`) para as revisões de
   qualidade, e uma agrupada por `Priority` para o planejamento.

8. **Cor dos rótulos.** Os 14 nasceram cinza. Colorir por família ajuda a
   ler o board de relance.

### Decisões em aberto

| #   | decisão                                                                                                                                                                                                                                                                                | onde                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `Estimate` × `Size` — aposentar um, ou dar significado próprio ao outro                                                                                                                                                                                                                | seção 3                                                                                                                                                                              |
| 2   | **Namespace de rota.** Três documentos propõem três URLs para o mesmo território: `/projetos` (a lista), `/projetos/:slug` (o estudo de caso) e `/case/[slug]` (o mesmo case, outro prefixo). Decidir antes de implementar qualquer uma — trocar URL depois custa redirect e canonical | [#6](https://github.com/https-shini/NewPortfolio/issues/6), [#8](https://github.com/https-shini/NewPortfolio/issues/8), [#23](https://github.com/https-shini/NewPortfolio/issues/23) |
| 3   | O diretório `backend/` — remover, ou manter reservado com justificativa escrita. Hoje o repositório afirma as duas coisas                                                                                                                                                              | [#11](https://github.com/https-shini/NewPortfolio/issues/11)                                                                                                                         |
| 4   | **Voltar a trabalhar por PR.** Sem isso `In review` continua decorativo e `Done` não tem porta de entrada                                                                                                                                                                              | seção 6                                                                                                                                                                              |
| 5   | Consolidar a página de estudo de caso: [#6](https://github.com/https-shini/NewPortfolio/issues/6) e os itens T12, T13 e T14 descrevem a mesma entrega em granularidades diferentes                                                                                                     | [#6](https://github.com/https-shini/NewPortfolio/issues/6)                                                                                                                           |
| 6   | O item "Blog técnico integrado", que existia só no README §Roadmap e não tinha issue: vira cartão, ou sai                                                                                                                                                                              | —                                                                                                                                                                                    |
| 7   | Se a suíte E2E entra no job de auditoria do CI ou ganha um próprio                                                                                                                                                                                                                     | [#5](https://github.com/https-shini/NewPortfolio/issues/5)                                                                                                                           |
| 8   | Onde mora a apresentação das automações de `scripts/` — seção na home, item da vitrine, ou página própria                                                                                                                                                                              | [#36](https://github.com/https-shini/NewPortfolio/issues/36)                                                                                                                         |
