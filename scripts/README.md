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

## `e2e-release-notes.mjs`

28 verificações sobre o índice e a página de cada versão: status, título,
canonical, timeline sustentada pela camada local, selo de sincronização,
permalink, navegação entre versões, versão inexistente, selo do rodapé, e
tradução do `h1` nos dois idiomas.

```bash
node scripts/e2e-release-notes.mjs      # ou npm run audit:release-notes
```

Junta os dois roteiros que antes viviam separados. Separados, repetiam o
mesmo arranque e as mesmas asserções de rodapé — e divergiam sempre que
só um dos dois era corrigido.

A API responde lista vazia de propósito: o que se verifica é que a camada
local sustenta as páginas sozinha, que é o que acontece na prática
enquanto não há release publicada no GitHub.

## `geometry.mjs`

O diff que provou que a conversão para mobile-first não mudou o layout:
288 cenários (4 rotas × 36 larguras × 2 temas), cerca de 93 mil caixas.

```bash
node scripts/geometry.mjs captura antes.json
# ...mexe no CSS...
node scripts/geometry.mjs captura depois.json
node scripts/geometry.mjs diff antes.json depois.json
```

**Ferramenta manual, de propósito.** No CI quem roda é a asserção de
zero-overflow: o diff exige regravar a base a cada mudança visual
proposital, e sem essa disciplina o job falha por construção e vira ruído.

Não compara capturas de tela porque duas capturas do **mesmo** código já
diferiram em 41 quadros — o autoplay do carrossel e os contadores do Sobre
tornam o pixel instável. Compara a caixa de cada elemento, que não depende
de qual slide está ativo. A tolerância de meio pixel está uma ordem de
grandeza acima do maior ruído medido e uma ordem abaixo do que um
breakpoint trocado causaria.

## `layers.mjs`

Três invariantes sobre a atmosfera, sem linha de base.

```bash
node scripts/layers.mjs      # ou npm run audit:layers
```

1. **Ordem de pintura** — `.ambient` tem z-index negativo. Com z-index 0 ela
   era um elemento posicionado, e elemento posicionado pinta depois de bloco
   em fluxo: toda seção que não declarasse `position` afundava. Eram duas,
   `.about` e `.work`; as outras seis se salvavam por acidente. O invariante
   cobra o z-index e não o posicionamento de cada seção, porque negativo
   resolve para qualquer elemento, presente ou futuro.

2. **Teto de vidro** — no máximo 6 elementos com `backdrop-filter`
   efetivamente pintando, área somada abaixo de uma janela. Seis é o que
   existe hoje na `/links`, que é o desenho de referência do conceito. Não é
   meta, é limite: um sétimo elemento desfocado é decoração. Conta só o que
   pinta — o `.mobile-nav` está `visibility: hidden` e inflava a medição em
   1,33 Mpx sem custar nada.

3. **Cobertura de partículas** — seis posições de rolagem por rota, e a
   contagem nunca cai abaixo de 60% do valor no topo. É a asserção que teria
   pegado, em qualquer ponto do histórico, o defeito de a atmosfera sair da
   janela conforme a página descia.

## `identity.mjs`

A trava que transforma "não mexa nisso" em asserção.

```bash
node scripts/identity.mjs             # confere
node scripts/identity.mjs --baseline  # regrava a base
```

Lê os valores **computados** de 66 superfícies em quatro rotas e dois temas —
fundo, `backdrop-filter`, opacidade, as quatro bordas, os quatro raios, os
quatro espaçamentos, cor e tipo — e falha nomeando a propriedade que
divergiu.

Ler o computado, e não o CSS escrito, é o ponto: o defeito que ela existe
para pegar é o de cascata, em que ninguém editou a regra do cartão e mesmo
assim a cor dele mudou.

`box-shadow` é a única propriedade fora da comparação, e isso é deliberado.
O tratamento de vidro dos componentes é somado por sombra; com ela de fora,
a base prova que todo o resto ficou parado.

Se uma mudança de identidade for intencional, regrave a base **no mesmo
commit** e explique no corpo dele.

## `perf.mjs`

Carga e rolagem nas três rotas, com a CPU normal e quatro vezes mais
lenta.

```bash
node scripts/perf.mjs                  # ou npm run audit:perf
node scripts/perf.mjs --atraso=1200    # simula CDN de terceiro lento
node scripts/perf.mjs --json
```

### Por que mede thread principal e não quadros por segundo

Em contêiner não há GPU: o Chromium rasteriza por software (SwiftShader,
confirmado pelo `WEBGL_debug_renderer_info`). Contar quadros ali mede o
rasterizador, não a página — um `backdrop-filter` que na máquina de quem
visita é trabalho de compositor aparece como se derrubasse a página pela
metade. Foi o que aconteceu: a `/links` marcava 30 fps e o número não
reagia a nenhum nível de throttling de CPU, porque não era CPU.

`script`, `estilo`, `layout` e ocupação da thread principal são a mesma
coisa em qualquer máquina. E o leitor de quadros ainda é ruim de outro
jeito: ele só devolve 16,7, 33,3 ou 50ms, então uma melhora de 20% ou não
aparece ou vira o dobro.

### `--atraso` e o que ele revelou

As duas folhas de estilo de fonte (Fontshare e Google Fonts) eram
`<link rel="stylesheet">` comuns — e portanto seguravam a primeira
pintura até dois hosts de terceiros responderem. O atraso entrava um a um
no tempo de tela branca: com 1,2s de CDN lento, a home levava 1.576ms
para pintar; sem esperá-los, 400ms.

Hoje as duas carregam com `media="print"` e voltam para `all` no
`onload`, com `<noscript>` para quem não roda JavaScript. Com o mesmo
1,2s de atraso a home pinta em 388ms — a espera pelo terceiro saiu do
caminho crítico.

### Fora do CI

Falta base para julgar: o tempo de carga depende do runner, e um teto que
oscila com a máquina ensina a ignorar o job. Aqui o que serve é comparar
duas execuções na mesma máquina, antes e depois de uma mudança — como o
`geometry.mjs`.

## `changelog.mjs`

Gera o `CHANGELOG.md` da raiz a partir de `RELEASE_NOTES`.

```bash
npm run changelog          # escreve
npm run changelog:check    # confere; sai 1 se divergir
```

O arquivo é derivado, não uma segunda fonte de verdade. Mas derivado só
continua derivado enquanto alguém regenera, então
`frontend/src/shared/config/changelog.test.ts` roda o modo de conferência
na suíte de sempre: acrescentar versão sem regenerar falha ali, e não
meses depois quando alguém reparar que o arquivo mente.

Roda em Node puro com `--experimental-strip-types`, sem o Vite no caminho.

## No CI

O job `audit` do `.github/workflows/ci.yml` roda a acessibilidade, a
rolagem horizontal, o roteiro das notas de versão, os overlays e o
orçamento contra o artefato de build que o job de qualidade publica — o
que se mede é exatamente o que seria publicado, sem construir duas vezes.

O `geometry.mjs` fica de fora, pelo motivo descrito acima.

## `docs/a11y-baseline.json`

O estado que se quer preservar, não um alvo a perseguir. Hoje é zero
violação em 16 combinações; qualquer regressão futura aparece como diferença
contra este arquivo.
