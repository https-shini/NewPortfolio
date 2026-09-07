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

### Exceções registradas

Exceção que não vira regra precisa ficar escrita, com data e motivo — senão
a regra apodrece em silêncio. E precisa de **gatilho de encerramento**, não
de prazo: data marcada em item que depende de decisão só produz data
vencida. O que encerra a exceção é o evento, e ele fica nomeado.

**Nenhuma exceção aberta hoje.**

### Encerradas

| aberta     | item                                                       | exceção                                                                                       | como encerrou                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 07/09/2026 | [#4](https://github.com/https-shini/NewPortfolio/issues/4) | permanecia em `Ready` sem atender a Definition of Ready, por duas decisões pendentes no corpo | **encerrada em 07/09/2026.** As duas foram analisadas contra o código e nenhuma era decisão de produto: a visibilidade do formulário é consequência da implementação, e o honeypot no servidor não pega a ameaça para a qual foi proposto. Registrado nas issues [#4](https://github.com/https-shini/NewPortfolio/issues/4), [#45](https://github.com/https-shini/NewPortfolio/issues/45) e [#47](https://github.com/https-shini/NewPortfolio/issues/47) |

Uma lição que vale guardar: das duas pendências, **nenhuma precisava de
decisão**. Uma pergunta apresentava uma consequência da implementação como
se fosse escolha; a outra propunha uma técnica que não funcionava contra a
ameaça citada. Item parado em `Ready` "esperando decisão" merece essa
leitura antes de virar exceção — às vezes o que falta é análise, não
resposta.

> **O que sobrou na #4**, e que **não** é motivo para devolver o cartão:
> `Priority` e `Size` seguem vazios. A Definition of Ready pede os dois, e
> preenchê-los é ação de painel, de trinta segundos. O item está entendido
> o bastante para alguém começar sem perguntar nada — que é o que a etapa
> significa. Campo vazio aqui é pendência de escrituração, não de
> entendimento.

### Voltar é normal

`In review` → `In progress` quando a revisão pede mudança. `Ready` →
`Backlog` quando a prioridade muda ou aparece uma dependência nova. Voltar
não é fracasso; item parado em `In progress` por semanas é.

---

## 3. Os campos

| Campo            | Tipo                    | Quem preenche, e quando                                                   |
| ---------------- | ----------------------- | ------------------------------------------------------------------------- |
| **Status**       | seleção única, 5 opções | Move-se pelo board. Nunca escrito no corpo                                |
| **Priority**     | seleção única           | Ao promover para `Ready`                                                  |
| **Size**         | seleção única           | Ao promover para `Ready`                                                  |
| ~~**Estimate**~~ | —                       | **Aposentado** em 07/09/2026 — ver a nota abaixo                          |
| **Start date**   | data                    | Ao entrar em `In progress`                                                |
| **Target date**  | data                    | Só quando existe compromisso real. Sem prazo é melhor que prazo inventado |
| **Type**         | Issue Type nativo       | Na abertura                                                               |
| **Assignee**     | pessoa                  | Obrigatório a partir de `In progress`                                     |
| **Labels**       | rótulos                 | Na abertura — ver a seção 5                                               |

### `Priority`

`Alta` · `Média` · `Baixa`. **Não existe "Média-alta".** Se um item parece
não caber na escala, o problema costuma ser que ele mistura duas coisas de
urgência diferente — divida.

### `Estimate` — aposentado

**Decidido em 07/09/2026: o campo sai. `Size` é o único medidor de dimensão
do trabalho.**

Os dois mediam a mesma coisa. A escala que emergiu nos corpos das issues
(`5 (Muito grande)`, `4 (Grande)`, `3 (Médio)`) era de 1 a 5 mapeando para
tamanho — exatamente o que `Size` já faz. Dois campos dizendo a mesma coisa
divergem no dia em que um dos dois não é atualizado, e a partir daí ninguém
sabe qual está certo.

A decisão saiu agora porque **nenhum item usava `Estimate`**: não houve
migração, e o custo nunca mais seria tão baixo.

Se um dia fizer falta uma medida diferente de tamanho — horas, ou pontos —,
ela volta como campo novo **com a metodologia escrita antes do primeiro
preenchimento**. Campo sem metodologia definida vira palpite registrado.

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

Rótulo é **área e natureza técnica**. Nunca prioridade, nunca status —
esses são campos do Project, e rótulo que duplica campo diverge dele no dia
em que um dos dois não é atualizado.

Há **uma exceção deliberada**, justificada abaixo: `status:blocked`.

### Em uso

Espelham a coluna `Categoria` do backlog em `docs/AUDITORIA-2026-08.md`
§22 — não são taxonomia nova.

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

Um item pode ter mais de um. Item sem rótulo nenhum não deveria sair de
`Backlog`.

> **`refactor` não existe.** Uma versão anterior desta tabela o listava.
> Rótulo no GitHub só nasce quando é aplicado a alguma issue, e nenhuma o
> usou. Ou ele passa a ser aplicado, ou some da tabela — documentar rótulo
> inexistente é o mesmo defeito que esta seção existe para evitar.

### `status:blocked` — o único rótulo de estado, e por quê

"Bloqueado" **não é uma das cinco etapas**, e não deveria ser: um item
bloqueado continua pertencendo à etapa em que parou. Um `Status` próprio
para bloqueio criaria uma sexta coluna por onde todo item travado passaria
a vazar, perdendo a informação de onde ele estava.

Por isso o bloqueio é rótulo. Para não virar rótulo subjetivo, tem gatilho
verificável dos dois lados.

**Entra quando** — e só quando — existe, **escrita na issue**, uma
dependência não resolvida que impede o trabalho de começar ou continuar, e
ela é uma destas três:

1. outra issue deste repositório, citada por número, ainda aberta;
2. uma decisão registrada como pendente no corpo, sem resposta;
3. um impedimento externo nomeado — acesso, credencial, resposta de
   terceiro, limitação de ambiente.

**Sai quando** a dependência nomeada deixa de existir: a issue citada
fecha, a decisão é respondida, ou o impedimento é removido.

**Não entra** por "está difícil", "falta tempo" ou "tem coisa mais
importante". Isso não é bloqueio — é ordem de fila, e ordem de fila é o
campo `Priority`.

Regra prática: se não dá para escrever numa linha **o que precisa
acontecer para o rótulo sair**, o item não está bloqueado.

**Como manter.** O rótulo não se atualiza sozinho. Quando uma issue fecha,
os itens que dependiam dela param de estar bloqueados — e alguém precisa
tirar o rótulo. Enquanto não houver a verificação automática da seção 9,
isso é trabalho manual: ao fechar uma issue, procurar quem a citava.

**Quem NÃO recebe o rótulo:** item que precisa de uma decisão _durante_ a
execução, e não _antes_ dela. A escolha entre duas saídas registrada como
critério de aceite é trabalho do item, não impedimento para começá-lo.

### Os padrões do GitHub que sobraram

O repositório carrega **nove rótulos** criados pelo GitHub na origem e
nunca aplicados a issue nenhuma. Seis duplicam algo que já tem lugar
próprio:

| Rótulo             | Problema                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `bug`              | duplica o **Issue Type** `Bug`                                                                     |
| `enhancement`      | duplica o Issue Type `Feature` — e era o vocabulário que a #9 usava no corpo sem existir como tipo |
| `documentation`    | duplica o rótulo `docs`                                                                            |
| `duplicate`        | duplica o `state_reason` nativo de fechamento                                                      |
| `invalid`          | idem — é `not planned`                                                                             |
| `wontfix`          | idem                                                                                               |
| `question`         | não é área nem natureza técnica                                                                    |
| `good first issue` | sem sentido num repositório de mantenedor único                                                    |
| `help wanted`      | idem                                                                                               |

**Proposta: remover os nove.** Nenhum está aplicado. Remover rótulo é ação
destrutiva e depende de aprovação — fica registrado aqui, não executado.

## 6. Pull requests, e por que `In review` existe

O fluxo previsto é **issue → branch → PR → CI → merge**. O CI já roda em
`pull_request` para `main` e cobre, em dois jobs:

`lint` · `type-check` · `format:check` · `test` · `icones:check` ·
`imagens:check` · `build` · `audit:a11y` · `audit:overflow` ·
`audit:layers` · `audit:identity` · `audit:release-notes` ·
`audit:modals` · `audit:bundle`

**Estado real, registrado aqui de propósito:** o trabalho vem entrando em
`main` por push direto, e **nenhum PR foi aberto desde 23/07/2026**. Nenhuma
issue tem branch ou PR ligado. Enquanto isso continuar, `In review` não tem
porta de entrada e `Done` é marcado à mão.

> Uma versão anterior desta seção dizia "zero merges no histórico". Era
> impreciso: são zero **commits de merge**. Dos três PRs do repositório,
> **dois foram mergeados** — o #1 em 22/05 e o #3 em 23/07 —, por squash ou
> rebase, que não produzem commit de merge. O #2 foi fechado sem merge.

Não é um defeito do board — é a prática divergindo do fluxo.

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
   **Resolvido:** o corpo dizia `Backlog` enquanto o board dizia `Ready`, os
   dois publicados se contradizendo. O corpo já não afirma status nenhum, e
   a decisão foi manter `Ready`. A exceção está registrada na seção 2, com o
   motivo — as três decisões pendentes no corpo continuam abertas.

2. **Preencher `Priority` e `Size` com o dado que já existia nos corpos:**

   | issue                                                                            | `Priority`                                                         | `Size`            |
   | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------- |
   | [#4](https://github.com/https-shini/NewPortfolio/issues/4) — Backend de contato  | `Alta`                                                             | o maior da escala |
   | [#8](https://github.com/https-shini/NewPortfolio/issues/8) — Página `/projetos`  | `Média`                                                            | o segundo maior   |
   | [#9](https://github.com/https-shini/NewPortfolio/issues/9) — Refatoração do Work | **decidir** — o corpo dizia `Média-alta`, que não existe na escala | médio             |

   `Estimate` não é preenchido: o campo foi aposentado (seção 3).

3. **`Priority` e `Size` dos itens T01–T33.** Os corpos trazem a prioridade
   original da auditoria (`P0`–`P3`) e o esforço, mas essa escala não é a do
   board. Mapear as duas, ou preencher item a item.

4. **`Assignee`** em todas — hoje nenhuma tem dono.

5. **Datas.** Só onde houver compromisso real. Nenhum documento do
   repositório traz prazo, e prazo inventado é pior que campo vazio.

### Automações — o que está verificado

Duas automações nativas do Project **existem e funcionam**. Não são
suposição: foram verificadas por comportamento, em 07/09/2026.

| automação              | evidência                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| item novo → `Backlog`  | as issues [#28](https://github.com/https-shini/NewPortfolio/issues/28) e [#44](https://github.com/https-shini/NewPortfolio/issues/44) foram criadas por API sem nenhum campo ser tocado, e apareceram com `Status: Backlog` |
| issue fechada → `Done` | as issues [#10](https://github.com/https-shini/NewPortfolio/issues/10) e [#34](https://github.com/https-shini/NewPortfolio/issues/34) foram fechadas por API e apareceram com `Status: Done`                                |

Consequência prática: **cartão novo não precisa ser adicionado à mão.** As
40 issues criadas em 07/09 entraram no board sozinhas.

### E uma que existe, mas aponta para a coluna errada

A automação de PR aberto move o item para **`In progress`**, não para
`In review`. Pela tabela da seção 2, `In progress` significa "alguém está
trabalhando nele agora" e `In review` significa "existe PR aberto ligado à
issue". A automação está uma coluna atrás da correta, e o `In review`
continua sem porta de entrada — que era exatamente o problema que este
documento apontava.

**Evidência de antes e depois**, medida em 07/09/2026 com a issue
[#52](https://github.com/https-shini/NewPortfolio/issues/52):

| momento                                                                                          | `Status`          |
| ------------------------------------------------------------------------------------------------ | ----------------- |
| logo após a criação, sem branch nem PR                                                           | `Backlog`         |
| logo após abrir o PR [#53](https://github.com/https-shini/NewPortfolio/pull/53) com `Closes #52` | **`In progress`** |

> A primeira vez que isto apareceu, com a issue #50 e o PR #51, o `Status`
> anterior não tinha sido conferido — era **inferência**. O teste com a #52
> registrou o baseline antes de abrir o PR, então agora é observação. A
> distinção importa: só o segundo caso é evidência.

**Pendente de decisão:** reconfigurar a automação para `In review`, ou
mudar o significado das colunas. A primeira preserva o fluxo documentado; a
segunda exigiria reescrever a seção 2. Recomendo a primeira.

Falta verificar `PR mergeado → Done` de forma isolada. Ela é encoberta pela
automação de fechamento, já que `Closes #N` fecha a issue no merge e o
fechamento por si só já move para `Done` — então o efeito observado não
distingue as duas.

Todas essas são transições factuais: pertencem à automação nativa ou ao CI,
nunca ao julgamento de uma pessoa ou de um modelo.

### Verificações

6. **Corrigir a automação de PR aberto.** Ela existe, mas move o item para
   `In progress` em vez de `In review` (ver acima). Enquanto não for
   corrigida, `In review` não tem porta de entrada.
   Verificar também `PR mergeado → Done`.

7. **Proteção de `main`.** Decidida em 07/09/2026 e ainda não configurada:

   | regra                            | valor                                                                       |
   | -------------------------------- | --------------------------------------------------------------------------- |
   | Pull Request obrigatório         | **sim**                                                                     |
   | Checks obrigatórios              | `Lint · Type-check · Test · Build` e `Acessibilidade · Rolagem · Orçamento` |
   | Branch atualizada antes do merge | **sim**                                                                     |
   | Aprovação de revisor             | **não** — há um único CODEOWNER, e exigir aprovação travaria todo merge     |
   | Histórico linear                 | **não** — quebraria o squash já usado nos PRs #1 e #3                       |

8. **Views.** Uma por status (o board) já existe. Com 46 itens, vale uma
   view por rótulo (`perf`, `a11y`, `security`) para as revisões de
   qualidade, e uma agrupada por `Priority` para o planejamento.

9. **Cor dos rótulos.** Os 13 em uso nasceram cinza. Colorir por família
   ajuda a ler o board de relance.

10. ~~Criar `status:blocked`~~ — **feito em 07/09/2026.** O rótulo existe e
    está aplicado nas issues que atendem ao critério da seção 5. Não há
    ferramenta de criar rótulo neste ambiente: ele nasceu ao ser aplicado,
    como os outros treze.

11. **Remover os nove rótulos padrão do GitHub** listados na seção 5.
    Nenhum está aplicado a issue alguma; seis duplicam Issue Type, rótulo
    ou `state_reason`. Ação destrutiva — aguarda aprovação.

12. **Apagar duas branches sem trabalho pendente**, verificado por
    conteúdo e não por histórico:
    - a branch de análise em `5096bae` — zero commits que `main` não tenha;
      está atrás dela. **O nome dela carrega um prefixo de ferramenta**, o
      que por si só contraria a regra de autoria do `CONTRIBUTING.md`;
      apagá-la resolve as duas coisas de uma vez;
    - `docs/registrar-automacoes-verificadas` — `git diff` contra `main`
      **vazio**. Os dois commits dela não aparecem no histórico de `main`
      porque o merge foi squash, mas o conteúdo está integralmente lá.

    Ação destrutiva — aguarda aprovação.

### Decisões em aberto

| #   | decisão                                                                                                                                                                            | onde                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | O diretório `backend/` — remover, ou manter reservado com justificativa escrita. Hoje o repositório afirma as duas coisas                                                          | [#11](https://github.com/https-shini/NewPortfolio/issues/11) |
| 2   | Consolidar a página de estudo de caso: [#6](https://github.com/https-shini/NewPortfolio/issues/6) e os itens T12, T13 e T14 descrevem a mesma entrega em granularidades diferentes | [#6](https://github.com/https-shini/NewPortfolio/issues/6)   |
| 3   | O item "Blog técnico integrado", que existia só no README §Roadmap e não tinha issue: vira cartão, ou sai                                                                          | —                                                            |
| 4   | Se a suíte E2E entra no job de auditoria do CI ou ganha um próprio                                                                                                                 | [#5](https://github.com/https-shini/NewPortfolio/issues/5)   |
| 5   | Onde mora a apresentação das automações de `scripts/` — seção na home, item da vitrine, ou página própria                                                                          | [#36](https://github.com/https-shini/NewPortfolio/issues/36) |

Saíram desta tabela por terem sido decididas: `Estimate` × `Size` (seção 3),
voltar a trabalhar por PR (seção 6) e o namespace de rota (seção 10).

---

## 10. Decisões de arquitetura tomadas aqui

Decisão que atravessa várias issues não cabe no corpo de nenhuma delas —
ela vive aqui, e as issues apontam para cá.

### Namespace de rota — decidido em 07/09/2026

**`/projetos` é a lista. `/projetos/<slug>` é o estudo de caso.
`/case/[slug]` está descartado.**

Três documentos propunham três URLs para o mesmo território:

| origem                                                                          | proposta                                               |
| ------------------------------------------------------------------------------- | ------------------------------------------------------ |
| issue [#8](https://github.com/https-shini/NewPortfolio/issues/8)                | `/projetos` — a lista de repositórios                  |
| issue [#6](https://github.com/https-shini/NewPortfolio/issues/6)                | `/projetos/:slug` — o estudo de caso                   |
| backlog T13, issue [#23](https://github.com/https-shini/NewPortfolio/issues/23) | `/case/[slug]` — o mesmo estudo de caso, outro prefixo |

**Por que `/projetos/<slug>` e não `/case/<slug>`:**

- **Um namespace só.** Duas raízes para o mesmo assunto obrigam quem lê a
  saber qual usar, e obrigam o sitemap, o canonical e os links internos a
  conhecerem as duas.
- **A hierarquia diz a verdade.** Um estudo de caso é o detalhe de um
  projeto. `/projetos/<slug>` diz isso pela própria URL; `/case/<slug>`
  esconde a relação.
- **A lista vira o índice dos casos** de graça, sem página de índice
  própria.
- **Sem dívida de redirect.** Trocar URL publicada depois custa redirect
  permanente e canonical, para sempre.
- **Consistência de forma.** As rotas do site são minúsculas e em
  português onde o assunto é português (`/links`, `/release-notes`). O
  `<slug>` segue o mesmo padrão.

**O que continua em aberto, e é outra pergunta:** se `/projetos` lista
**todos** os repositórios públicos ou só os curados. Isso é escopo de
produto, não de nomenclatura, e vive na issue
[#8](https://github.com/https-shini/NewPortfolio/issues/8). Se a lista
mostrar todos, apenas alguns terão estudo de caso — o card leva ao caso
quando existir, e ao repositório quando não.

**Aplicado retroativamente** em 07/09/2026 nas issues que citavam a rota:
[#6](https://github.com/https-shini/NewPortfolio/issues/6) e
[#23](https://github.com/https-shini/NewPortfolio/issues/23) tiveram título e
corpo alinhados, e o bloco de "decisão pendente" saiu de ambas.

A issue [#8](https://github.com/https-shini/NewPortfolio/issues/8) já usava
`/projetos` e não precisou de mudança de rota — só perde a menção ao
conflito.

> **Correção.** Uma versão anterior da auditoria dizia que a #4 tinha o
> namespace entre as suas decisões pendentes. Não tinha: `/contato` não
> divide território com `/projetos`, e a leitura do corpo confirma duas
> pendências, não três. O erro era meu.
