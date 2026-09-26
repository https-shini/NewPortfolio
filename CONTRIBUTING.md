# Contribuindo

Projeto pessoal, mas sugestão e correção são bem-vindas. Este documento é o
fluxo real; o planejamento fica no
[Project #3](https://github.com/users/https-shini/projects/3) e as regras do
board em [`docs/guides/github-project.md`](docs/guides/github-project.md).

---

## Antes de escrever código

**Abra ou encontre a issue.** O board é o único planejamento ativo — se o
que você quer fazer não está lá, abra a issue primeiro. Os templates
(`.github/ISSUE_TEMPLATE/`) pedem contexto, especificação e critérios de
aceite verificáveis.

Prioridade, tamanho e status **não** vão no corpo da issue. Eles vivem nos
campos do Project, e por um motivo concreto: quando o mesmo dado existe nos
dois lugares, um dos dois envelhece e ninguém sabe qual.

---

## Ambiente

Node **22** (a mesma versão do CI) e npm.

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

As auditorias usam Chromium do Playwright:

```bash
npx playwright install --with-deps chromium
```

---

## Fluxo

O trabalho vai **direto para a `main`**, num commit por entrega. O repositório
mantém uma branch só, e não há branch de trabalho de longa duração.

A consequência prática está no passo 2: **não existe PR para o CI reprovar
antes**, então a verificação inteira roda localmente, antes do push. O CI no
push confirma; ele não é a primeira linha de defesa.

1. **Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).**
   O `commitlint` valida no hook `commit-msg`, e o `lint-staged` roda no
   `pre-commit`.

2. **Rode as portas antes do push.** A lista completa está em
   [O que o CI verifica](#o-que-o-ci-verifica).

    ```bash
    npm run lint && npm run type-check && npm run format:check && npm test
    npm run build && npm run csp:check && npm run icones:check
    npm run imagens:check && npm run changelog:check
    ```

    > **Sem cano.** `npm run lint | tail -1` devolve o código de saída do
    > `tail`, que é sempre 0 — e uma cadeia `&&` depois disso segue como se a
    > porta tivesse passado. Foi assim que o `04ebdd2` entrou na `main` com o
    > lint vermelho. Rode cada porta direto, ou junte com `&&`.

3. **`Closes #N` na mensagem do commit.** É o que fecha a issue e move o
   cartão no board quando o commit chega à `main`. Se o commit não fecha a
   issue inteira, use `Refs #N`.

4. **`git push origin main`.** O CI roda no push e confirma o que você já
   rodou.

E confira a autoria antes de seguir:

```bash
git log -1 --format='%an <%ae> | %cn <%ce>'   # sua identidade nos dois campos
git log -1 --format='%(trailers)'             # vazio
```

### Quando vale abrir um PR

O fluxo direto não proíbe PR — ele só deixa de ser obrigatório. Vale abrir um
quando a mudança for **visual e grande**, porque aí o preview da Vercel paga o
custo do ritual.

A integração Vercel + GitHub está ativa e o preview nasce sozinho: cada branch
empurrada ganha um deployment próprio, com URL própria, e o bot comenta o link
no PR. Conferido, e não suposto — os seis PRs desta série
(`docs/encerrar-excecao-da-4` até `docs/reorganizar-a-pasta-docs`) têm cada um
o seu deployment em estado `READY`, com o SHA do commit anotado.

O preview usa o mesmo Root Directory da produção — a raiz, onde `vercel.json`
e `api/` moram —, então o que se revisa ali é o que sobe.

> **O link de preview não é público.** O projeto tem Vercel Authentication
> ligada para tudo menos os domínios próprios
> (`ssoProtection: all_except_custom_domains`), então abrir uma URL de preview
> exige estar logado na conta. Só `gcruz.dev.br` é aberto. Mandar um preview
> para alguém de fora não funciona.

### Nunca mergeie pelo botão nem pela API do GitHub

Se um PR existir, o merge dele também é **local**. Os dois caminhos do GitHub
gravam:

```
autor:     Guilherme Cruz <100307080+https-shini@users.noreply.github.com>
committer: GitHub <noreply@github.com>
```

— trocam o e-mail do autor pelo alias `noreply` e põem `GitHub` como
committer, contrariando a regra da seção seguinte.

Isso não é hipótese. O commit `6c0567b` é o único do histórico recente com
autoria errada, e foi o único mergeado pela API; todos os seguintes foram
locais e saíram corretos nos dois campos.

Com o CI verde no PR:

```bash
git checkout main && git pull origin main
git merge --squash <a-branch-do-PR>
git commit                    # a mensagem descreve a entrega, e fecha com Closes #N
git push origin main
```

O squash é proposital: a branch guarda os passos do caminho, e `main` guarda a
entrega.

Depois do merge, o PR e a branch ficam para trás — feche o PR à mão, porque o
merge local não o fecha, e apague a branch. O critério de que nada se perdeu
não é o `git diff` contra a `main`, que acusa diferença assim que ela avança:
é a presença do commit de squash.

```bash
git log origin/main --oneline --grep="(#<número-do-PR>)"
git push origin --delete <a-branch-do-PR>
```

### Autoria dos commits

Todo o histórico deste repositório é assinado exclusivamente por
**Guilherme Cruz**, com a sua própria conta do Git. Commits enviados às
branches do repositório **não devem declarar coautor, cocriador ou
qualquer outra atribuição além do autor** — inclusive trailers automáticos
inseridos por ferramentas.

Contribuição externa entra por pull request a partir de um fork,
preservando no commit a autoria de quem a escreveu.

---

## O que o CI verifica

Dois jobs, em `push` para `main` e em todo `pull_request`.

**Qualidade e build**

| comando                   | o que barra                                               |
| ------------------------- | --------------------------------------------------------- |
| `npm run lint`            | ESLint, incluindo as regras de acessibilidade em JSX      |
| `npm run type-check`      | TypeScript sem `any` implícito                            |
| `npm run format:check`    | Prettier no repositório inteiro, Markdown incluído        |
| `npm test`                | a suíte do Vitest                                         |
| `npm run icones:check`    | ícones derivados em dia com a fonte                       |
| `npm run imagens:check`   | variantes de imagem em dia com as fotos de origem         |
| `npm run changelog:check` | `CHANGELOG.md` em dia com `RELEASE_NOTES`                 |
| `npm run build`           | build de produção, um documento HTML por rota             |
| `npm run csp:check`       | o hash do script inline em dia com a CSP do `vercel.json` |

**Auditorias sobre o site construído**

| comando                       | o que barra                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `npm run audit:a11y`          | violação do axe-core em qualquer combinação de rota, tema e idioma |
| `npm run audit:overflow`      | rolagem horizontal em qualquer largura auditada                    |
| `npm run audit:layers`        | camadas da atmosfera fora de ordem                                 |
| `npm run audit:identity`      | identidade visual das superfícies                                  |
| `npm run audit:release-notes` | as notas de versão ponta a ponta                                   |
| `npm run audit:modals`        | trava de rolagem e fundo inerte nos overlays                       |
| `npm run audit:bundle`        | orçamento de JS e CSS, medido **por documento**                    |

`npm run audit:perf` e `npm run rolagem` existem e **não** rodam no CI: os
dois medem tempo, e tempo varia demais entre execuções de runner para servir
de porta. São instrumentos de investigação, não guardas.

### Quando uma auditoria reprova

Ela reprova com o motivo. Duas regras:

- **Não suba o teto para o número passar.** Se o orçamento de bundle
  reprovou, ou a mudança custa bytes de verdade e isso precisa ser uma
  decisão consciente, ou a métrica está medindo a coisa errada — e aí o
  conserto é a métrica, com justificativa escrita.
- **Não desligue a regra.** `eslint-disable` só com comentário explicando
  por que aquele caso específico é diferente. Há exemplos no código.

---

## Alterando imagens ou ícones

`apps/web/src/assets/gerado/` é **derivado e commitado**. A Vercel não tem
o Chromium do Playwright, então gerar no build não funciona lá.

Trocou uma foto ou um ícone de origem:

```bash
npm run imagens    # ou: npm run icones
```

e commite o resultado junto. O `--check` no CI reprova quem esquecer.

---

## Documentação

Documentação afetada muda **no mesmo PR**.

O `format:check` cobre o **repositório inteiro** — `README.md`, `docs/`,
`.github/`, `scripts/` e `apps/web/src`. A configuração é uma só, na raiz:
`.prettierrc.json` e `.prettierignore`. O Prettier resolve configuração
subindo a partir de cada arquivo, e é por isso que ela mora lá e não em
`apps/web` — de onde não alcançaria nada da raiz.

O gancho de pre-commit já formata o que você preparou, então na prática não
há nada a rodar à mão. Se quiser formatar tudo de uma vez:

```bash
npm run format
```

O índice está em [`docs/README.md`](docs/README.md). Os que se usa no dia a
dia:

| documento                                                                        | papel                                                                    |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`docs/guides/github-project.md`](docs/guides/github-project.md)                 | fluxo, campos e regras do board                                          |
| [`docs/guides/github-project-setup.md`](docs/guides/github-project-setup.md)     | o que clicar para configurar o board, e como usá-lo no dia a dia         |
| [`docs/reference/AUDITORIA-2026-08.md`](docs/reference/AUDITORIA-2026-08.md)     | auditoria técnica e de posicionamento; §22 é a origem do backlog T01–T33 |
| [`docs/reference/PERFORMANCE-2026-08.md`](docs/reference/PERFORMANCE-2026-08.md) | o que foi medido, o que foi reprovado e o que não repetir                |
| [`docs/reference/ROADMAP.md`](docs/reference/ROADMAP.md)                         | **histórico**, encerrado — não abra trabalho a partir dele               |

---

## Escrita

O texto do repositório — commits, issues, documentação, comentários de
código — é em **português**, direto, sem entusiasmo de release. Comentário
explica **por que**, não o que a linha ao lado já diz.

Afirmação sobre o código vem lida do código, com o caminho junto. Se não
deu para verificar, o texto diz que não deu.
