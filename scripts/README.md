# Arranjos de auditoria

Medições que antes viviam numa sessão de trabalho e sumiam com ela. Todos
rodam a partir da raiz do repositório e sobem o `vite preview` sozinhos.

```bash
npm run build            # os arranjos medem o dist/, não o dev server
node scripts/a11y.mjs
```

Aponte `BASE_URL` para reaproveitar um servidor já de pé — nesse caso o
arranjo não derruba o que não subiu:

```bash
BASE_URL=http://localhost:4173 node scripts/a11y.mjs
```

Se o Chromium não for encontrado, rode `npx playwright install chromium` ou
aponte `PW_CHROMIUM_PATH` para um binário existente.

## `a11y.mjs`

axe-core nas quatro rotas, nos dois temas e nos dois idiomas — 16
combinações. Sai com código 1 se houver violação `serious` ou `critical`, ou
se o idioma declarado no documento divergir do renderizado.

```bash
node scripts/a11y.mjs             # relatório legível
node scripts/a11y.mjs --json      # saída para máquina
node scripts/a11y.mjs --baseline  # regrava docs/a11y-baseline.json
```

As `moderate` viram aviso e não barram: valem correção, não valem travar uma
entrega.

### Por que a auditoria força `prefers-reduced-motion`

Sem isso, o axe pega os elementos de `[data-reveal]` no meio do fade e mede
cores mescladas com o fundo. O contraste do mesmo botão muda conforme o
instante da medição, e duas execuções seguidas discordam. Com o movimento
reduzido, mede-se o estado assentado — que é o que a pessoa de fato lê.

O efeito colateral é bom: como nada fica meio transparente, o axe enxerga
mais elementos e a cobertura sobe.

## `overflow.mjs`

Quatro rotas em cinco larguras (320 a 1440), procurando conteúdo que
escape da janela. Sai com código 1 se algo passar, e nomeia os cinco
primeiros culpados.

```bash
node scripts/overflow.mjs      # ou npm run audit:overflow
```

Escolhido no lugar do diff de geometria completo para rodar no CI. O diff
compara 92.820 caixas contra uma base gravada, e exige regravar essa base
a cada mudança visual proposital — sem essa disciplina, o job falha por
construção e vira ruído. Esta verificação não tem base, não tem falso
positivo, e cobre o defeito que mais dói.

## `bundle-budget.mjs`

Tetos de tamanho sobre o `dist/`, com folga de cerca de 15% sobre o
medido. Um orçamento colado no valor atual dispara a cada oscilação do
minificador e ensina a ser ignorado; o que ele precisa pegar é tendência.

```bash
npm run build && node scripts/bundle-budget.mjs   # ou npm run audit:bundle
node scripts/bundle-budget.mjs --print            # mostra sem julgar
```

O peso é consequência. A causa — a contagem de dependências de runtime —
é vigiada por `frontend/src/shared/config/dependencies.test.ts`, que
falha se `package.json` ganhar qualquer coisa além de `react` e
`react-dom`.

## `e2e-modals.mjs`

Trava de rolagem, restauração de posição, fundo inerte e o diálogo em
tela deitada.

```bash
node scripts/e2e-modals.mjs      # ou npm run audit:modals
```

### Sobre a "intermitência de 2px"

Ela não existe no `useScrollLock`. Foram 71 ciclos de abrir e fechar em
cinco condições — com e sem animação, em densidade de pixel 1, 1.5 e 2, e
a partir de posição fracionária — e a restauração deu exata em todas.

O desvio vinha da medição: o arranjo antigo lia `Math.round(scrollY)`
entre timeouts fixos e comparava referências que não eram a mesma. Um
teste que erra por conta própria é pior que teste nenhum, porque ensina a
desconfiar do código certo. Aqui a posição é lida com precisão total e
comparada sem arredondar.

## No CI

O job `audit` do `.github/workflows/ci.yml` roda os três contra o
artefato de build que o job de qualidade publica — o que se mede é
exatamente o que seria publicado, sem construir duas vezes.

## `docs/a11y-baseline.json`

O estado que se quer preservar, não um alvo a perseguir. Hoje é zero
violação em 16 combinações; qualquer regressão futura aparece como diferença
contra este arquivo.
