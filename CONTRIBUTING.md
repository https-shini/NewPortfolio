# Contribuindo

Projeto pessoal, mas sugestão e correção são bem-vindas. Este documento é o
fluxo real; o planejamento fica no
[Project #3](https://github.com/users/https-shini/projects/3) e as regras do
board em [`docs/github-project.md`](docs/github-project.md).

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

1. **Branch a partir de `main`.** Contribuição externa entra por fork.
2. **Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).**
   O `commitlint` valida na hora do commit (hook `commit-msg`), e o
   `lint-staged` roda no `pre-commit`.
3. **Abra o PR** com `Closes #N` no corpo — é o que liga o PR à issue no
   board e move o cartão. Se o PR não fecha a issue inteira, use `Refs #N`.
4. **O CI precisa passar.** Ele roda sozinho no PR; a lista está abaixo.

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

| comando                 | o que barra                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run lint`          | ESLint, incluindo as regras de acessibilidade em JSX |
| `npm run type-check`    | TypeScript sem `any` implícito                       |
| `npm run format:check`  | Prettier — **inclui os arquivos Markdown**           |
| `npm test`              | a suíte do Vitest                                    |
| `npm run icones:check`  | ícones derivados em dia com a fonte                  |
| `npm run imagens:check` | variantes de imagem em dia com as fotos de origem    |
| `npm run build`         | build de produção, um documento HTML por rota        |

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

`npm run audit:perf` existe e **não** roda no CI: ele mede tempo, e tempo
varia demais entre execuções de runner para servir de porta.

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

Ressalva de escopo: `npm run format:check` roda apenas dentro de
`apps/web` (`src/**` e os `*.md` de lá). **`README.md`, `docs/` e
`.github/` na raiz ficam de fora do CI** — formate-os à mão antes de
commitar:

```bash
npx prettier --write README.md CONTRIBUTING.md "docs/**/*.md" ".github/**/*.{yml,md}"
```

| documento                                                    | papel                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [`docs/github-project.md`](docs/github-project.md)           | fluxo, campos e regras do board                                          |
| [`docs/AUDITORIA-2026-08.md`](docs/AUDITORIA-2026-08.md)     | auditoria técnica e de posicionamento; §22 é a origem do backlog T01–T33 |
| [`docs/PERFORMANCE-2026-08.md`](docs/PERFORMANCE-2026-08.md) | o que foi medido, o que foi reprovado e o que não repetir                |
| [`docs/ROADMAP.md`](docs/ROADMAP.md)                         | **histórico**, encerrado — não abra trabalho a partir dele               |

---

## Escrita

O texto do repositório — commits, issues, documentação, comentários de
código — é em **português**, direto, sem entusiasmo de release. Comentário
explica **por que**, não o que a linha ao lado já diz.

Afirmação sobre o código vem lida do código, com o caminho junto. Se não
deu para verificar, o texto diz que não deu.
