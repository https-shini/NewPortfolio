# Custo de estilo na rolagem da home — atribuição e correção, setembro de 2026

Este documento responde **quem** custa, e registra o que foi feito a respeito.
O quanto já estava medido: a home ocupava ~80 % da thread principal durante a
rolagem sob CPU 4×, com o custo em recálculo de estilo e não em script.

A hipótese registrada na
[#31](https://github.com/https-shini/NewPortfolio/issues/31) era
`backdrop-filter` (o vidro) somado ao `AmbientBackground`. **A primeira metade
está errada.** A segunda estava certa, e virou a correção da
[#32](https://github.com/https-shini/NewPortfolio/issues/32): a contagem de
partículas caiu de **39 para 20**.

**O resultado, medido antes e depois no mesmo dia:**

|                     | antes (39) | depois (20)               |
| ------------------- | ---------- | ------------------------- |
| recálculo de estilo | 337 ms/s   | **242 ms/s** (−95, −28 %) |
| ocupação da thread  | 79,6 %     | **61,3 %** (−18,3 pontos) |
| amplitude da sessão | 18 ms/s    | 15 ms/s                   |

O ganho é de cinco a seis vezes a amplitude das duas sessões. É a primeira vez
nesta série que uma correção sai do piso de ruído com folga.

---

## Duas correções de método, aplicadas a este documento

As duas vieram de medir, não de reler.

> **1 · Comparar milissegundos absolutos entre cenários estava errado.** A
> primeira versão deste arquivo fazia isso, e o cenário "sem ponteiro" deu
> **+268 ms** de estilo — o que parecia dizer que mover o ponteiro _alivia_ o
> custo.
>
> Não alivia. Sem eventos de ponteiro o navegador gasta menos em hit-testing e
> sobra orçamento para **mais quadros de animação na mesma janela de relógio**
> — e mais quadros é mais recálculo. Os cenários tinham densidade diferente, e
> comparar o absoluto comparava a densidade. O arranjo passou a reportar
> **estilo por segundo** e a duração da janela.

> **2 · Eu afirmei que a metade `transform` das keyframes "dá para cozinhar", e
> não dá.** O texto dizia: "`--mx`/`--dx`/`--dy` são **constantes por
> partícula**, escritas na semeadura" — e concluía que por isso poderiam virar
> número literal.
>
> Constante **por partícula** é exatamente o que impede. Cada partícula recebe
> seu próprio vetor na semeadura (`AmbientBackground.tsx:215-222`:
> `dy` depende de `chance(0.75)` e do número de células, `dx` de
> `randInt(-2, 2)`, `mx` de `-dx * rand(0.4, 0.9)`), e a regra
> `@keyframes ambient-float` é **uma só, compartilhada pelas 39**. Um literal
> na keyframe daria a todas o mesmo caminho — que é precisamente a aparência
> que o `var()` existe para evitar.
>
> O cenário "transform literal" do arranjo, portanto, **não mede uma correção
> disponível**: ele mede uma home em que todas as partículas derivam em
> paralelo. O ganho que ele mostra é real e **não é colhível**.

## Método

`npm run rolagem` (`scripts/rolagem.mjs`). Home, CPU 4×, mediana de três por
cenário, `RecalcStyleDuration` do CDP **dividido pela janela medida**. Cada
cenário desliga um suspeito por CSS injetado no fim da cascata — não por build
separado, que mudaria bundle, hash e ordem de carga junto.

A régua é a **amplitude do base entre execuções** na mesma sessão: delta menor
que ela é a máquina, não atribuição. As sessões desta investigação deram 55,
33, 18, 15 e 8 ms/s — a amplitude varia muito, e é por isso que ela é
reportada junto e não assumida.

Mede thread principal, não quadros: em contêiner não há GPU e o Chromium
rasteriza por software, então contar quadros mediria o rasterizador.

## O diagnóstico, na sessão de régua mais fina antes da correção

Amplitude de **18 ms/s**, base em **337 ms/s**, ocupação 79,6 %:

| cenário            | estilo/s | Δ/s      | ocupação   | faixa   | veredito       |
| ------------------ | -------- | -------- | ---------- | ------- | -------------- |
| **base**           | 337      | —        | 79,6 %     | 323–341 | —              |
| sem vidro          | 288      | −49      | 81,1 %     | 271–298 | ver abaixo     |
| sem ponteiro       | 371      | +34      | 89,9 %     | 370–374 | **absolvido**  |
| opacidade literal  | 287      | −50      | 76,2 %     | 276–296 | não colhível   |
| transform literal  | 275      | −62      | 84,9 %     | 265–280 | não colhível   |
| keyframes literais | 240      | −97      | 75,4 %     | 231–241 | não colhível   |
| sem animação       | 148      | −189     | 75,0 %     | 143–162 | é o movimento  |
| **sem partículas** | 146      | **−191** | **49,6 %** | 141–153 | **a alavanca** |

### O vidro: seis medições, e a sexta resolve a quinta

| sessão     | 1   | 2   | 3   | 4   | 5       | 6   |
| ---------- | --- | --- | --- | --- | ------- | --- |
| Δ estilo/s | −10 | −4  | +15 | +2  | **−49** | −3  |
| amplitude  | 55  | 33  | —   | —   | **18**  | 15  |

A quinta medição foi a única a passar da amplitude da sua sessão, e por isso
**precisou de uma sexta** antes de eu escrever qualquer coisa. A sexta deu
**−3 ms/s** contra amplitude de 15. Seis medições com delta que troca de sinal
não descrevem um custo: descrevem ruído.

Há um segundo argumento, independente da régua: **desligar o vidro fez a
ocupação da thread SUBIR** nas duas sessões finais (79,6 → 81,1 % e 61,3 →
71,8 %). Um suspeito que, removido, deixa a thread mais ocupada não é o que
estava ocupando a thread.

Desligar `backdrop-filter` nos 16 elementos que de fato pintavam vidro na home
— de 30 declarações em 11 arquivos — **não reduz o recálculo de estilo**. Isso
não diz que vidro é grátis: parte do custo dele é compositor, que este arranjo
deliberadamente não mede. Diz que **não é ele** que explica o custo na rolagem.

### O ponteiro está absolvido

`useAmbientMotion.ts:205` escreve `style.translate` **por partícula** num laço
de quadro, para as próximas ao cursor. Parecia suspeito: escrever estilo inline
num elemento com animação rodando invalida o estilo dele.

Não é. Rolar **sem mover o ponteiro** deu `+34 ms/s` nas duas sessões — custo
negativo, ou seja, mais estilo sem o ponteiro. É o efeito de densidade descrito
na correção de método 1, e não um alívio.

### As partículas animadas são a alavanca

`−191 ms/s`, dez vezes a amplitude, e a ocupação caindo de 79,6 % para 49,6 % —
**o único cenário em que a thread de fato desocupa**. Neutralizar só
`animation`, deixando os elementos no lugar, recupera praticamente o mesmo
(`−189`). **O custo é o movimento, não a presença.**

Contado no DOM da home a 1280×900 antes da correção: **39
`.ambient__particle`**, 5 `.ambient__bokeh b`, 1 aurora. As partículas eram
**39 dos 44 elementos animados** dentro do `.ambient` — e é essa proporção que
explica por que desligar o bokeh (5 elementos) não moveu nada.

## Por que nenhuma auditoria viu isto

As partículas **não existem** sob `prefers-reduced-motion: reduce` — o efeito
sai antecipado em `AmbientBackground.tsx:124` e nem semeia:

|                           | partículas | bokeh | animando na página |
| ------------------------- | ---------- | ----- | ------------------ |
| movimento normal (antes)  | 39         | 5     | **71**             |
| movimento normal (depois) | 20         | 5     | **52**             |
| `reduce`                  | **0**      | **0** | **3**              |

E o `newContext` de `scripts/lib/browser.mjs` força `reducedMotion: "reduce"`
por padrão — com razão, porque mede cor assentada e não meio de transição.

A consequência é que **`audit:a11y`, `audit:identity`, `audit:overflow`,
`audit:layers` e `audit:modals` todos medem uma home sem partícula nenhuma.**
Só o `perf.mjs` e este arranjo montam contexto próprio e veem o que a maioria
de quem visita vê.

Isso tem uma segunda consequência, que vale dizer em voz alta: **essas portas
passando não é evidência de que a aparência está certa** depois de uma mudança
nas partículas. Elas continuam cegas para ela. Quem verifica é a medição acima
e o olho de quem decide.

Não é defeito das auditorias. É o ponto cego que explica como um custo desse
tamanho sobreviveu a sete portas de CI.

## A correção por compositação, e por que ela não é colhível

As keyframes interpolam `transform` **e** `opacity` através de `calc()` sobre
`var()` (`AmbientBackground.css:352-400`). O navegador não compõe animação cujo
valor de keyframe depende de propriedade personalizada: a substituição acontece
na resolução de estilo, na thread principal. O mecanismo está certo, e o ganho
de reescrever as duas com número literal é real — `−97 ms/s` com amplitude 18.

Mas nenhuma das duas metades pode ser cozinhada:

| metade                                                      | por que não dá                                                                                                                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transform`, sobre `--mx`/`--dx`/`--dy`                     | os três são **diferentes em cada partícula** (`AmbientBackground.tsx:215-222`), e a `@keyframes` é **uma só para todas**. Literal daria a todas o mesmo caminho — a aparência que o `var()` existe para evitar |
| `opacity`, sobre `--peak`/`--ambient-peak`/`--ambient-gain` | `--ambient-peak` vem do **tema** (`[data-theme="light"] .ambient`, linha 418). Cozinhar quebraria a troca de tema ao vivo                                                                                      |

Dar a cada partícula uma keyframe literal própria seria trocar recálculo de
estilo por 39 regras no CSSOM — não medi, e não vou afirmar que compensa.

**Fica registrado como mecanismo compreendido e correção indisponível.**

## A curva da contagem, e a decisão

A alavanca que a atribuição isolou. Medida por `npm run rolagem -- --contagem`,
numa sessão com amplitude de **8 ms/s** — cada passo está muito acima dela.

| partículas    | estilo/s | Δ/s  | ocupação |
| ------------- | -------- | ---- | -------- |
| 39 (então)    | 299      | —    | 79,0 %   |
| 28            | 260      | −39  | 79,0 %   |
| **20 (hoje)** | 253      | −46  | 72,5 %   |
| 12            | 223      | −76  | 72,9 %   |
| 6             | 196      | −103 | 62,9 %   |
| 0             | 151      | −148 | 56,9 %   |

Duas leituras que a curva dá e a média não daria:

- **O estilo cai desde o primeiro corte**, em cerca de 4 ms/s por partícula.
- **A ocupação não.** Ficava em 79 % até 28 partículas e só então cedia. Foi
  por isso que **20** foi o alvo escolhido, e não 28: 28 melhorava o número e
  não a experiência.

> A redução foi medida por `:nth-child`, não pela prop `count`: mudar a prop
> exigiria remontar a página por cenário, e a comparação mediria a remontagem
> também.

### A correção aplicada rendeu mais do que a curva previa

`AmbientBackground.tsx` — `count = 39` passou a `count = 20`. Uma linha.

A curva previa `253 ms/s`. O build com `count = 20` deu **242 ms/s**, e a
ocupação **61,3 %** contra os 72,5 % previstos. **A previsão errou para baixo**,
e a razão é a aproximação declarada acima: esconder por `:nth-child` deixa as 20
primeiras posições de um campo semeado para 39, enquanto `count = 20` semeia 20
posições pela caixa inteira — com a sua própria distribuição de tamanho,
duração e de orbes (`chance(0.2)`), que são os elementos mais caros.

O que o antes e o depois dizem, lado a lado, nas duas sessões de régua fina:

|             | base | sem partículas | custo das partículas | por partícula |
| ----------- | ---- | -------------- | -------------------- | ------------- |
| antes (39)  | 337  | 146            | **191 ms/s**         | 4,9 ms/s      |
| depois (20) | 242  | 157            | **85 ms/s**          | 4,3 ms/s      |

O piso — o que custa tudo que **não** é partícula — ficou em 146 e 157 ms/s nas
duas sessões. É a consistência interna que dá confiança no resto: o arranjo
mediu a mesma home nas duas vezes, e só a parte que mudou mudou.

### O que a redução faz em cada tela, e por que não é proporcional

A semeadura é `Math.max(8, Math.round(count * fracaoDeDensidade()))`
(`AmbientBackground.tsx:129`), e a fração multiplica por largura e por sinais
do aparelho (`:83-108`):

| contexto                    | com 39 | com 20                       |
| --------------------------- | ------ | ---------------------------- |
| ≥ 1100px                    | 39     | **20**                       |
| 700–1099px                  | 29     | **15**                       |
| < 700px                     | 20     | **10**                       |
| < 700px + 4 GB de RAM       | 12     | **8** ← o piso passa a valer |
| < 700px + economia de dados | 8      | **8** (já no piso)           |

O desktop perde mais, e o piso de 8 protege o celular fraco — que já recebia
menos. A leitura intuitiva ("todo mundo perde metade") está errada.

## O que este documento NÃO afirma

- **Nada sobre compositor e pintura.** O arranjo mede thread principal. Um
  suspeito absolvido aqui pode pesar no aparelho de quem visita por outro
  caminho.
- **Nada sobre CPU 1×.** Tudo aqui é 4×, que é onde o problema aparece.
- **Nada sobre o aparelho real.** É contêiner, sem GPU, com rasterização por
  software. Os números são comparáveis **entre si**; não são o que um telefone
  mede.
- **Nada sobre as outras rotas.** Só a home. A atmosfera é uma instância para
  todas as rotas (`app/routes.tsx`), então o custo provavelmente acompanha —
  mas "provavelmente" não é medição.
- **Nada sobre a aparência.** Que 20 partículas sejam suficientes para a
  atmosfera é decisão de produto, tomada por quem é dono dela. Este documento
  só garante que a decisão foi tomada com número.
