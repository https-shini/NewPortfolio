# Custo de estilo na rolagem da home — atribuição, setembro de 2026

Este documento responde **quem** custa, não quanto. O quanto já estava medido:
a home ocupava ~80 % da thread principal durante a rolagem sob CPU 4×, com o
custo em recálculo de estilo e não em script.

A hipótese registrada na
[#31](https://github.com/https-shini/NewPortfolio/issues/31) era
`backdrop-filter` (o vidro) somado ao `AmbientBackground`. **A primeira metade
está errada**, e a segunda precisa de recorte.

Nenhuma correção foi aplicada. Isso é critério da #31, e acabou sendo também a
conclusão para a [#32](https://github.com/https-shini/NewPortfolio/issues/32) —
ver **O que a #32 deve fazer**, no fim.

---

## Correção de método, aplicada a este documento

> A primeira versão deste arquivo comparava **milissegundos absolutos** de
> `RecalcStyleDuration` entre cenários. **Isso estava errado**, e eu descobri
> medindo: o cenário "sem ponteiro" deu **+268 ms** de estilo, o que parecia
> dizer que mover o ponteiro _alivia_ o custo.
>
> Não alivia. Sem eventos de ponteiro o navegador gasta menos em hit-testing e
> sobra orçamento para **mais quadros de animação na mesma janela de relógio** —
> e mais quadros é mais recálculo. Os cenários tinham densidade diferente, e
> comparar o absoluto comparava a densidade.
>
> O arranjo passou a reportar **estilo por segundo** e a duração da janela, e a
> mediana passou a ser tirada sobre a grandeza normalizada. Os números abaixo
> são os novos. As **conclusões** da primeira versão sobreviveram — vidro
> absolvido, partículas culpadas —, porque as duas se sustentavam também na
> ocupação, que já era normalizada. As **magnitudes** não sobreviveram.

## Método

`npm run rolagem` (`scripts/rolagem.mjs`). Home, CPU 4×, mediana de três por
cenário, `RecalcStyleDuration` do CDP **dividido pela janela medida**. Cada
cenário desliga um suspeito por CSS injetado no fim da cascata — não por build
separado, que mudaria bundle, hash e ordem de carga junto.

A régua é a **amplitude do base entre execuções** na mesma sessão: delta menor
que ela é a máquina, não atribuição. As sessões deram 55, 33 e 8 ms/s — a
amplitude varia muito, e é por isso que ela é reportada junto e não assumida.

Mede thread principal, não quadros: em contêiner não há GPU e o Chromium
rasteriza por software, então contar quadros mediria o rasterizador.

## O diagnóstico

Sessão com amplitude de **55 ms/s**, base em **334 ms/s** e ocupação 78,4 %:

| cenário            | estilo/s | Δ/s      | ocupação | veredito                      |
| ------------------ | -------- | -------- | -------- | ----------------------------- |
| **base**           | 334      | —        | 78,4 %   | —                             |
| sem vidro          | 324      | −10      | 76,9 %   | **absolvido**                 |
| sem ponteiro       | 371      | +37      | 78,1 %   | **absolvido**                 |
| transform literal  | 276      | −58      | 80,8 %   | na fronteira do ruído         |
| opacidade literal  | 283      | −51      | 73,8 %   | dentro do ruído               |
| keyframes literais | 243      | **−91**  | 75,2 %   | real, e modesto               |
| sem partículas     | 155      | **−179** | 60,1 %   | **a alavanca**                |
| sem animação       | 156      | **−178** | 72,7 %   | é o movimento, não a presença |

### O vidro está absolvido

Quatro medições, em quatro sessões: **−10, −4, +15, +2 ms/s**. Nenhuma
consistente, todas dentro da amplitude da sessão. Desligar `backdrop-filter`
nos 16 elementos que de fato pintavam vidro na home — de 30 declarações em 11
arquivos — **não reduz o recálculo de estilo**.

Isso não diz que vidro é grátis: parte do custo dele é compositor, que este
arranjo deliberadamente não mede. Diz que **não é ele** que explica o custo na
rolagem.

### O ponteiro está absolvido

`useAmbientMotion.ts:205` escreve `style.translate` **por partícula** num laço
de quadro, para as próximas ao cursor. Parecia suspeito: escrever estilo inline
num elemento com animação rodando invalida o estilo dele.

Não é. Rolar **sem mover o ponteiro** deu `+37 ms/s` e ocupação idêntica
(78,1 % contra 78,4 %). O empurrão por proximidade não é o custo.

### As 39 partículas animadas são a alavanca

`−179 ms/s`, mais de três vezes a amplitude, e a ocupação cai de 78,4 % para
60,1 %. Neutralizar só `animation` — **deixando os elementos no lugar** —
recupera praticamente o mesmo (`−178`). **O custo é o movimento, não a
presença.**

Contado no DOM da home a 1280×900: **39 `.ambient__particle`**,
5 `.ambient__bokeh b`, 1 aurora. As partículas são **39 dos 44 elementos
animados** dentro do `.ambient` — e é essa proporção que explica por que
desligar o bokeh (5 elementos) não moveu nada.

## Por que nenhuma auditoria viu isto

As partículas **não existem** sob `prefers-reduced-motion: reduce` — o efeito
sai antecipado em `AmbientBackground.tsx:124` e nem semeia:

|                  | partículas | bokeh | animando na página |
| ---------------- | ---------- | ----- | ------------------ |
| movimento normal | 39         | 5     | **71**             |
| `reduce`         | **0**      | **0** | **3**              |

E o `newContext` de `scripts/lib/browser.mjs` força `reducedMotion: "reduce"`
por padrão — com razão, porque mede cor assentada e não meio de transição.

A consequência é que **`audit:a11y`, `audit:identity`, `audit:overflow`,
`audit:layers` e `audit:modals` todos medem uma home sem partícula nenhuma.**
Só o `perf.mjs` e este arranjo montam contexto próprio e veem o que a maioria
de quem visita vê.

Não é defeito das auditorias. É o ponto cego que explica como um custo desse
tamanho sobreviveu a sete portas de CI.

## A correção por compositação, e por que ela não vale

As keyframes interpolam `transform` **e** `opacity` através de `calc()` sobre
`var()` (`AmbientBackground.css:352-400`). O navegador não compõe animação cujo
valor de keyframe depende de propriedade personalizada: a substituição acontece
na resolução de estilo, na thread principal.

Reescrever as duas com número literal rende **−91 ms/s numa sessão e −64 em
outra** — real, mas 20 a 27 % do custo, contra os 54 % que desligar a animação
rende.

E não dá para colher isso sem efeito colateral:

| metade                                                      | dá para cozinhar?                                                                                                                 | rende sozinha                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `transform`, sobre `--mx`/`--dx`/`--dy`                     | **sim** — são constantes por partícula, escritas na semeadura                                                                     | −58 ms/s, contra amplitude de 55 |
| `opacity`, sobre `--peak`/`--ambient-peak`/`--ambient-gain` | **não** — `--ambient-peak` vem do tema (`[data-theme="light"] .ambient`, linha 418), e cozinhar quebraria a troca de tema ao vivo | −51 ms/s, dentro do ruído        |

**A metade que dá para consertar sem efeito colateral não limpa o piso de
ruído.** Aplicá-la seria reivindicar um ganho que a variância não sustenta — e
a #32 é explícita sobre isso: "se o ganho não sobreviver à variância, reverter
e registrar".

Fica registrado, e não aplicado.

## A curva da contagem

A alavanca que a atribuição isolou. Medida por `npm run rolagem -- --contagem`,
numa sessão com amplitude de **8 ms/s** — cada passo abaixo está muito acima
dela.

| partículas    | estilo/s | Δ/s  | ocupação |
| ------------- | -------- | ---- | -------- |
| **39 (hoje)** | 299      | —    | 79,0 %   |
| 28            | 260      | −39  | 79,0 %   |
| 20            | 253      | −46  | 72,5 %   |
| 12            | 223      | −76  | 72,9 %   |
| 6             | 196      | −103 | 62,9 %   |
| 0             | 151      | −148 | 56,9 %   |

Duas leituras que a curva dá e a média não daria:

- **O estilo cai desde o primeiro corte**, em cerca de 4 ms/s por partícula.
- **A ocupação não.** Ela fica em 79 % até 28 partículas, cai para ~72 % entre
  20 e 12, e só desaba em 6. Entre 20 e 12 o estilo melhora e a ocupação não
  muda — ou seja, há um trecho da curva em que cortar partícula melhora o
  número e não melhora a experiência.

> A redução foi medida por `:nth-child`, não pela prop `count`: mudar a prop
> exigiria remontar a página por cenário, e a comparação mediria a remontagem
> também. O que importa é quantos elementos **animam**, e é isso que o seletor
> controla. A distribuição espacial fica ligeiramente diferente de uma
> semeadura com `count` menor — é aproximação, e está dito.

## O que a #32 deve fazer

1. **Não mexer no `backdrop-filter`.** Quatro medições o absolvem.
2. **Não mexer no empurrão por ponteiro.** Absolvido.
3. **Não aplicar a compositação.** A metade sem efeito colateral não limpa o
   ruído; a outra quebra a troca de tema.
4. **A única alavanca que a medição sustenta é a contagem de partículas** — e
   ela muda a aparência da home. É decisão de produto, não de engenharia, e
   está com a curva acima para ser tomada com número em vez de sensação.

Se a escolha for mexer na contagem, o alvo natural é **28 ou 20**: os dois
primeiros passos rendem 13 % e 15 % do estilo, e o de 20 é onde a ocupação
começa a ceder.

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
