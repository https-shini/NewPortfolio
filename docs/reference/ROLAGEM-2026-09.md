# Custo de estilo na rolagem da home — atribuição, setembro de 2026

Este documento responde **quem** custa, não quanto. O quanto já estava medido:
a home ocupava ~80 % da thread principal durante a rolagem sob CPU 4×, com o
custo em recálculo de estilo e não em script.

A hipótese registrada na
[#31](https://github.com/https-shini/NewPortfolio/issues/31) era
`backdrop-filter` (o vidro) somado ao `AmbientBackground`. **A primeira metade
está errada.** O que segue é a medição que a desmente e o que ela aponta no
lugar.

Nenhuma correção foi aplicada — é critério explícito da issue. A correção é a
[#32](https://github.com/https-shini/NewPortfolio/issues/32), e agora ela sabe
onde mexer.

## Método

`npm run rolagem` (`scripts/rolagem.mjs`). Home, CPU 4×, mediana de três
execuções por cenário, `RecalcStyleDuration` lido do CDP. Cada cenário desliga
um suspeito por CSS injetado no fim da cascata — não por build separado, que
mudaria bundle, hash e ordem de carga junto.

A régua é a **amplitude do base entre execuções**: delta menor que ela é a
máquina, não atribuição. As três sessões deram amplitude de 138, 22 e 72 ms.

Mede thread principal, não quadros: em contêiner não há GPU e o Chromium
rasteriza por software, então contar quadros mediria o rasterizador. É o mesmo
motivo que o `scripts/perf.mjs` já documentava.

## O que saiu

Três sessões. `Δ` é a diferença de estilo contra o base da mesma sessão.

| cenário            | sessão 1 | sessão 2 | sessão 3 | veredito                           |
| ------------------ | -------- | -------- | -------- | ---------------------------------- |
| **base**           | 1003 ms  | 965 ms   | 1014 ms  | —                                  |
| sem vidro          | +108     | **+19**  | **+2**   | **absolvido**                      |
| sem atmosfera      | **−505** | **−527** | **−498** | culpado, mas não é o recorte certo |
| sem aurora         | —        | —        | +154     | absolvido                          |
| sem bokeh          | —        | —        | +23      | absolvido                          |
| **sem partículas** | —        | —        | **−597** | **o culpado**                      |
| sem animação       | —        | —        | **−517** | é a animação, não a presença       |
| amplitude do base  | 138      | 22       | 72       | a régua                            |

## O vidro está absolvido

Três medições: **+108, +19, +2 ms**. Nenhuma negativa, e as duas últimas
dentro da amplitude. Desligar `backdrop-filter` em tudo — 16 elementos que de
fato pintavam vidro na home, de 30 declarações em 11 arquivos de CSS — **não
reduz o recálculo de estilo**.

Isso não diz que vidro é grátis: parte do custo dele é trabalho de compositor,
que este arranjo deliberadamente não mede. Diz que **não é ele** que explica os
~1000 ms de estilo na rolagem, e que mexer nele para resolver isto seria mexer
no lugar errado.

## O culpado: as 39 partículas animadas

`.ambient__particles` sozinho responde por **−597 ms** — mais do que remover a
atmosfera inteira. E é o **único cenário em que a ocupação da thread cai**:

| cenário            | ocupação   |
| ------------------ | ---------- |
| base               | 82,7 %     |
| sem vidro          | 81,3 %     |
| sem atmosfera      | 80,6 %     |
| sem aurora         | 89,6 %     |
| sem bokeh          | 84,9 %     |
| **sem partículas** | **63,7 %** |
| sem animação       | 77,7 %     |

### Por que as partículas e não a aurora ou o bokeh: contagem

Contado no DOM da home a 1280×900, com movimento não reduzido:

| camada                         | elementos                             |
| ------------------------------ | ------------------------------------- |
| `.ambient__particle`           | **39**                                |
| `.ambient__bokeh b`            | 5                                     |
| `.ambient__aurora`             | 1 (mais dois pseudo-elementos)        |
| **animando na página inteira** | **71**, sendo 44 dentro do `.ambient` |

As partículas são **39 dos 44 elementos animados** dentro da atmosfera. A
proporção explica o resultado inteiro: desligar 5 elementos (bokeh) não move
nada, desligar 39 move tudo.

### A propriedade, que é o que a issue pede nomeado

`.ambient__particle` (`AmbientBackground.css:331-343`):

```css
animation-name: ambient-float; /* ou ambient-orb */
animation-iteration-count: infinite;
will-change: transform, opacity;
```

E a keyframe interpola `transform: translate(...) scale(...)` mais `opacity`.

**39 elementos com keyframe infinita, sempre.** Cada quadro obriga o motor de
estilo a computar o valor interpolado de cada um — e é isso que aparece como
`RecalcStyleDuration`.

A confirmação está no cenário `sem animação`: neutralizar só `animation` e
`transition` dentro do `.ambient`, **deixando todos os elementos no lugar**,
recupera −517 ms — a mesma faixa de remover a atmosfera inteira (−498). O custo
é o movimento, não a presença.

## Por que nenhuma auditoria viu isto

As partículas **não existem** sob `prefers-reduced-motion: reduce` — o efeito
tem uma saída antecipada em `AmbientBackground.tsx:124`, e nem semeia. Contado:

|                  | partículas | bokeh | animando na página |
| ---------------- | ---------- | ----- | ------------------ |
| movimento normal | 39         | 5     | **71**             |
| `reduce`         | **0**      | **0** | **3**              |

E o `newContext` de `scripts/lib/browser.mjs` força `reducedMotion: "reduce"`
por padrão — com razão, porque mede cor assentada e não meio de transição.

A consequência é que **`audit:a11y`, `audit:identity`, `audit:overflow`,
`audit:layers` e `audit:modals` todos medem uma home sem partícula nenhuma.**
Só o `perf.mjs` e este arranjo montam contexto próprio, sem esse padrão, e
veem o que a maioria de quem visita vê.

Não é defeito das auditorias — elas medem o que se propõem a medir. É um ponto
cego que vale estar escrito, porque explica por que um custo desse tamanho
sobreviveu a sete portas de CI.

## O que isto muda para a #32

1. **Não mexer no `backdrop-filter`.** Três medições o absolvem.
2. **O alvo é `.ambient__particle`**, e a alavanca é a animação — não a
   existência das partículas.
3. **Reduzir estilo não reduz ocupação por si.** Tirar a atmosfera inteira
   derrubou o estilo pela metade e deixou a ocupação em 80,6 %. Só o recorte
   das partículas moveu as duas juntas. Qualquer correção que baixe o estilo e
   não baixe a ocupação não entregou nada de perceptível.
4. **O `count` é parâmetro**, com padrão 39 (`AmbientBackground.tsx:112`), e
   já é escalado por `fracaoDeDensidade()`. Há uma alavanca contínua ali antes
   de qualquer reescrita — mas medir cada valor é trabalho da #32, não deste
   documento.

## O que este documento NÃO afirma

- **Nada sobre compositor e pintura.** O arranjo mede thread principal. Um
  suspeito absolvido aqui pode pesar no aparelho de quem visita por outro
  caminho.
- **Nada sobre CPU 1×.** Tudo aqui é 4×, que é onde o problema aparece. Em 1×
  a home já estava confortável na medição de agosto.
- **Nada sobre o aparelho real.** É contêiner, sem GPU, com rasterização por
  software. Os números são comparáveis **entre si**; não são o que um telefone
  mede.
- **Nada sobre as outras rotas.** Só a home. A atmosfera é uma instância para
  todas as rotas (`app/routes.tsx`), então o custo provavelmente acompanha —
  mas "provavelmente" não é medição.
