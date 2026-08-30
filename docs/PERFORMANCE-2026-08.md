# Performance da home — registro de decisão, agosto de 2026

Quatro capturas do PageSpeed sobre `https://gcruz.dev.br/`, entre 29 e 30 de
agosto. Este documento existe para que ninguém refaça o que já foi medido — em
particular, para que ninguém repita as três tentativas que **pioraram** ou não
mudaram nada.

## Onde chegamos

|                         | 29/08 manhã | 29/08 tarde | 29/08 noite | **30/08**    |
| ----------------------- | ----------- | ----------- | ----------- | ------------ |
|                         | base        | pré-render  | reversão    | **final**    |
| **Celular**             |             |             |             |              |
| Desempenho              | 86          | 81          | 86          | **89**       |
| FCP                     | 2,9 s       | 3,2 s       | 2,9 s       | **2,9 s**    |
| LCP                     | 3,0 s       | 3,4 s       | 3,0 s       | **2,9 s**    |
| TBT                     | 20 ms       | 200 ms      | 40 ms       | **50 ms**    |
| Speed Index             | 5,0 s       | 4,0 s       | 4,9 s       | **3,0 s**    |
| Atraso de render do LCP | 1.950 ms    | 2.670 ms    | —           | **1.190 ms** |
| Caminho crítico         | 763 ms      | —           | 991 ms      | **649 ms**   |
| **Computador**          |             |             |             |              |
| Desempenho              | 99          | 99          | 95          | **99**       |
| Speed Index             | 1,2 s       | 1,2 s       | 1,8 s       | **1,0 s**    |
| Atraso de render do LCP | 1.610 ms    | 2.370 ms    | —           | **1.060 ms** |
| Caminho crítico         | 996 ms      | 1.173 ms    | —           | **394 ms**   |
| TBT                     | 0 ms        | 0 ms        | 100 ms      | **0 ms**     |

Acessibilidade, Práticas recomendadas e SEO em 100 nas quatro. CLS 0 nas quatro.
Navegação agêntica passou de 1/2 para **2/2** na terceira.

## O que funcionou

### `content-visibility: auto` nas seções abaixo da dobra

O achado central, e ele começou por uma leitura errada minha. Eu vinha dizendo
que o tempo até a pintura era "baixar e executar o JavaScript". A decomposição
da main thread do próprio relatório sempre disse o contrário:

```
Style & Layout    1.279 ms   ← domina
Script Evaluation   241 ms   ← 5× menor
```

Medindo o DOM a 412×823: a home monta **1.325 elementos** e apenas **95** —
cabeçalho e hero — cabem na primeira tela. Os outros 1.230 recebiam cálculo de
estilo e layout antes da primeira pintura sem que ninguém pudesse vê-los.

A/B local (mesma build, CPU 4×, rede 1,6 Mbps/150 ms, 5 amostras por lado):

|     | FCP      | LCP      | TBT    |
| --- | -------- | -------- | ------ |
| sem | 1.836 ms | 1.836 ms | 875 ms |
| com | 1.588 ms | 1.588 ms | 505 ms |

Faixas separadas nas três. Em produção: Speed Index do celular de 4,9 s para
3,0 s, e o atraso de render do LCP caiu ~55% nas duas plataformas.

Ver `apps/web/src/shared/styles/globals.css`, seção 17.

### `crossorigin` no preconnect do Fontshare

`api.fontshare.com` serve a **folha**, buscada por `<link rel="stylesheet">`
comum, que não é requisição CORS. Com `crossorigin`, o preconnect abria a
conexão em modo CORS e a folha não a reaproveitava — o Lighthouse acusava
"pré-conexão não usada". O par do Google sempre esteve certo: `googleapis`
(CSS) sem o atributo, `gstatic` (fontes) com ele.

Latência do caminho crítico do desktop: **996 ms → 394 ms**.

### Navegação agêntica 1/2 → 2/2

`<div role="list">` com `<article role="listitem">` virou `<ul>`/`<li>` nativo
em `widgets/Featured/Featured.tsx`.

## O que foi medido e REPROVADO — não repetir

| tentativa                                                       | medição                                                                                               | veredito               |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| **Pré-renderizar a home** com `react-dom/server` + hidratação   | produção: 86→**81**, TBT 20→200 ms                                                                    | revertido em `51b0735` |
| Desligar a animação `gradient-shift` do `.hero__role`           | 752 ms contra 720 ms sem mexer                                                                        | sem efeito             |
| Desligar todas as transições (`transition: all`, 6 ocorrências) | 724 ms contra 720 ms                                                                                  | sem efeito             |
| Emitir o CSS antes do `<script>` no `<head>`                    | 1.636 contra 1.596 ms, faixas sobrepostas em 7 amostras; CSS pronto no mesmo instante (741 vs 748 ms) | sem efeito             |
| Desligar `backdrop-filter` e `filter: blur`                     | 1.592 contra 1.608 ms                                                                                 | sem efeito             |
| Variantes de imagem para as miniaturas (`sharp` + srcset)       | mesmos 218,5 KB; bundle estourou o orçamento (125,1/125 KB)                                           | piorou                 |

Sobre a pré-renderização, a lição de método vale mais que o resultado: o A/B que
me convenceu mediu **só o FCP**, a métrica que eu esperava melhorar. TBT e LCP
não foram medidos, e era neles que a mudança cobrava.

Sobre as imagens: as variantes de 0,7–1,9 KB ficaram abaixo do
`assetsInlineLimit` do Vite e viraram base64 no JS. A causa raiz é o carrossel
renderizar os quatro slides, o que baixa as quatro capturas de qualquer jeito —
a miniatura pequena seria um download **a mais**. Cortar de verdade exige mudar
o carregamento do carrossel.

## Duas armadilhas de medição que o `content-visibility` cria

Ambas descobertas na prática, ambas já tratadas:

1. **`getComputedStyle` mente em subárvore pulada.** O navegador não computa o
   estilo do que está fora da tela, e a leitura devolve valor de antes da
   cascata do tema. Isso deixou o `audit:identity` **não determinístico** —
   passava aqui e reprovava no CI. Corrigido em `61baacb`: o arranjo traz cada
   superfície para a tela antes de ler, sempre partindo do topo (o cabeçalho
   muda de aparência com a rolagem). A base **não** foi regravada, e é isso que
   prova que a aparência nunca mudou.
2. **Captura de página inteira sai em branco.** O `fullPage` do Playwright não
   força a renderização das seções adiadas. Não é o que o usuário vê. Nenhum
   arranjo do projeto usa `fullPage` hoje; quem escrever o próximo precisa rolar
   antes.

## O que sobrou, e por que paramos

O alvo era 95+ nas duas plataformas. O desktop está em 99; o celular, em 89.

O que separa o celular dos 95 é o tempo entre o CSS chegar (~745 ms medidos) e a
primeira pintura — baixar, interpretar e executar ~94 KB gzip de JavaScript e
montar a árvore. As alavancas baratas acabaram:

- CSS: **101,4 KB avaliados, 100% usados**. Não há folha morta para extrair.
- Seletores: 1.577 regras, só 35 com três ou mais níveis de descendência. Limpo.
- Forced reflow: os quatro pontos que leem geometria já agrupam as leituras
  antes das escritas (ver `useAmbientMotion.ts:134`).
- Divisão por rota: os dados das notas de versão já estão só no pedaço lazy.

Sobra a alavanca arquitetural — mandar HTML pronto —, e ela já mostrou custo.
Uma variante não testada: pré-renderizar **apenas** cabeçalho e hero (95
elementos, contra os 1.325 da tentativa anterior), agora que o resto está adiado
por `content-visibility`. Muito menos DOM para hidratar. Fica registrada como
hipótese, não como recomendação — e quem tentar deve medir **FCP, LCP e TBT**.

## Nota sobre variância

Duas conclusões desta série vieram de execução única e uma delas estava errada
(o "desktop 99→95" era variância: voltou a 99 sozinho na captura seguinte). A
contagem de "animações não compostas" oscilou entre celular e desktop em quatro
capturas **sem o código mudar**, e o próprio relatório classifica o item como
diagnóstico que não afeta a nota.

Antes de agir sobre uma diferença, tire mediana de três execuções, e espere
alguns minutos depois do deploy — o cache de borda da Vercel vinha `MISS` logo
após publicar.

## Semrush Site Audit — diagnóstico

O rastreio de 29/08 rodou com **`JS rendering: Disabled`** e acusou quatro
avisos: página sem h1, baixa proporção texto-HTML, poucas palavras, e apenas um
link interno de entrada.

É **um problema visto de quatro ângulos**: sem JavaScript, toda rota do site
entrega `<div id="root"></div>` e nada mais. Existe um `api/crawler.ts` que
serve HTML pronto por user-agent, mas a lista cobre só redes sociais —
`SemrushBot` não está nela.

O Google renderiza JavaScript, e o SEO do PageSpeed está em 100. O primeiro
passo é reavaliar com JS ligado no painel do Semrush; o que sobrar depois disso
é que merece conserto.

Pendente e sem contrapartida: `llms.txt` não existe.
