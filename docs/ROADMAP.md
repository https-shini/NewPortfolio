# Roadmap das 15 melhorias

Três fases encadeadas. A fase 1 cria o arranjo de auditoria, a fase 2 o
transforma em regra automática, e a fase 3 constrói coisa nova sobre uma base
que já se defende sozinha.

| Fase | Itens | Tema | Depende de |
| --- | --- | --- | --- |
| **1** | 1–5 | Consertar o que está quebrado | — |
| **2** | 6–10 | Proteger o que já funciona | fase 1 (o ferramental nasce nela) |
| **3** | 11–15 | Estender a ideia | fase 2 (o CI vira a rede de segurança) |

---

## ⚠ Decisões pendentes — bloqueiam parte da execução

Assumo os padrões abaixo, **exceto o nº 2**: como você quer ser descrito
profissionalmente é fato sobre você, não decisão técnica.

| # | Decisão | Padrão assumido |
| --- | --- | --- |
| 1 | Escopo do texto: 5 chaves vivas ou só o rodapé? | 5 chaves |
| 2 | **Como se posicionar** — a bio diz "Júnior em transição, hoje Analista de Suporte"; o hero diz "Full Stack" | **nenhum — bloqueia o item 2** |
| 3 | Remover as 4 chaves de tradução mortas? | remover |
| 4 | Versionar axe-core + Playwright como devDeps? | versionar |

Os itens 1, 3, 4 e 5 podem começar sem essas respostas. O item 2 não.

---

## Três correções ao meu próprio levantamento

Explorando o código para planejar, descobri que **três coisas que eu te disse
estavam erradas**. Registro aqui porque mudam o escopo:

1. **O item 5 já está praticamente feito.** Eu li `frontend/public/sitemap.xml`
   (11 URLs) e não a saída do build. O plugin já injeta as páginas de versão.
2. **O item 2 é muito maior que o rodapé.** São 5 chaves vivas, não 1.
3. **O idioma já persiste** (item 15). Não "reinicia a cada visita" — mas
   encontrei um bug real de `lang` no lugar.

---

# FASE 1 · Consertar o que está quebrado

## Item 1 · Violações de acessibilidade em `/` e `/links`

> **Ressalva:** quando reportei "contraste, `dlitem` e `aria-allowed-role`", eu
> tinha acabado de rodar a auditoria — mas **o log não ficou salvo**. Os que
> sobraram no scratchpad cobrem só as rotas de release notes. A lista exata
> precisa ser **remedida antes de corrigir**, não reconstruída da minha memória.

### `dlitem` — causa localizada com certeza

`frontend/src/widgets/Contact/Contact.tsx:297-320`:

```
<dl class="contact__profile-data">
  └ <div class="contact__data-row">         ← 1º wrapper
      ├ <div class="contact__data-icon">
      └ <div class="contact__data-content">  ← 2º wrapper
          ├ <dt>   ← inválido aqui
          └ <dd>
```

A especificação permite **um** `<div>` agrupador dentro de `<dl>` envolvendo o
par `dt`/`dd`. Aqui são **dois níveis**. Como o Contato fica na home, isto
aparece em `/`.

**Correção:** achatar para um nível — `contact__data-row` vira o único wrapper e
recebe `dt`/`dd` diretamente; ícone e conteúdo posicionados por grid. Mudança de
marcação com risco visual: entra no diff de geometria.

`RecommendationModal.tsx:123-137` também tem `<dl>`, mas com filhos diretos —
está correto, não muda.

### `aria-allowed-role` — candidatos, não confirmados

Os 25 `role=` que examinei são **legítimos**: `role="listitem"` em `<span>`
dentro de `role="list"` (`Featured.tsx:471-475`, `:628-634`) é permitido, porque
`<span>` não tem papel implícito. Preciso da medição para saber qual dispara.

### Contraste

Padrão já conhecido: `--color-text-4` rende 2.56:1 no escuro e reprova AA;
`--color-brand` puro em texto também reprova, e o token certo é
`--color-brand-text`. Ambos já corrigidos no rodapé e nos logos. A auditoria dirá
se sobrou consumidor.

### Execução

1. **Versionar o ferramental** (`scripts/a11y.mjs`), com axe-core e Playwright
   como devDependencies — sem isto, correção às cegas.
2. **Registrar a linha de base** commitada.
3. **Corrigir por classe de violação**, um commit cada.
4. **Remedir** e provar a diferença.

Sem o "antes" registrado, "consertei" é afirmação, não prova.

---

## Item 2 · Texto de posicionamento — 5 chaves, não 1

Tudo em `frontend/src/shared/lib/translations.ts`, PT e EN no mesmo módulo.

### Vivas (renderizadas hoje)

| Chave | Onde aparece | Texto atual (PT) |
| --- | --- | --- |
| `footer.tagline` | rodapé de **toda** página · `Footer.tsx:124` | "**Desenvolvedor Júnior em transição**, com prática real em React, Node.js…" |
| `about.bio` | Sobre · `About.tsx:386` | "…**Júnior em transição de carreira**, hoje atuando como Analista de Suporte Técnico…" |
| `about.goal.body` | Sobre · `About.tsx:450` | "Busco minha **primeira oportunidade** como **Júnior** ou **Estagiário**…" |
| `contact.cta.lead` | Contato · `Contact.tsx:163` | "Estou pronto para **iniciar minha trajetória** como **Júnior** ou **Estagiário**…" |
| `career.aside.seniority` | Carreira · `CareerStats.tsx:114` | "Júnior" |

Referência canônica já em uso: `hero.role` = "Desenvolvedor Full Stack";
`index.html:87` com `"jobTitle": "Desenvolvedor Full Stack"`.

### Mortas (zero consumidores em `src/`)

`hero.badge`, `about.bio.p1`, `about.bio.p4`, `about.goal.text` — 8 strings,
sobras da migração `about.bio.p1..p4` → `about.bio`.

### Condução

**Não escrevo este texto sozinho.** Preparo um rascunho das 10 strings, mostro, e
só aplico com seu aval. Duas restrições técnicas:

- `footer.tagline` renderiza como texto puro (`Footer.tsx:124`), **sem** parser
  de ênfase — `**negrito**` sairia literal. As outras quatro aceitam.
- `Footer.css:435-437` limita a tagline a `max-width: 280px` num breakpoint;
  texto mais longo muda a altura do rodapé.

Fora de escopo: o cargo de quem escreveu as recomendações
(`Recommendations.data.ts:74-75`) é texto de terceiro.

---

## Item 3 · Publicar a `v2.0.0` — destravou

As ferramentas do GitHub voltaram a responder: o repositório está com **zero
releases e zero tags**.

> **Correção ao que eu disse antes:** hoje `/api/release-notes` devolve lista
> vazia **independentemente do token**, porque não há release para buscar. O
> token não destrava as notas de versão — a tag destrava.

O que o `GITHUB_TOKEN` realmente muda (`api/release-notes.ts:60-88`): o limite
passa de 60 para 5.000 req/h. A função **não** falha sem ele; só cai para lista
vazia se o GitHub responder não-OK, isto é, sob rate limit. Onde pesa de verdade
é no `/api/github-stats`, em que a Search API barra sem autenticação e o card de
commits cai no fallback.

1. Criar a tag `v2.0.0` e publicar a release com o corpo pronto em
   `docs/release-v2.0.0.md`.
2. Confirmar que a serverless passa a devolvê-la e que o selo de sincronização
   muda de estado.
3. **`GITHUB_TOKEN` continua com você** — painel da Vercel, escopo `public_repo`.

**Ordem importa:** publicar antes dos itens de sitemap, porque a data real passa
a alimentar o `<lastmod>`.

---

## Item 4 · `lastmod` do sitemap escrito à mão

As 11 URLs de `frontend/public/sitemap.xml` têm data fixa — home e as 8 âncoras
congeladas em `2026-07-17`.

**Abordagem:** estender o plugin que já existe. `closeBundle` é o hook certo —
`public/` só é copiado para `dist/` ao final, então `generateBundle` não
enxergaria o arquivo.

Derivar do git, a única fonte que não mente. Viabilidade validada:

```
frontend/src/pages/Home         → 2026-08-03
frontend/src/pages/Links        → 2026-08-05
frontend/src/pages/ReleaseNotes → 2026-08-04
```

**Mapa rota → caminhos observados** (data = a mais recente entre eles):

| Rota | Caminhos |
| --- | --- |
| `/` | `pages/Home`, `widgets`, `shared/lib/translations.ts` |
| `/links` | `pages/Links`, `shared/config/links*` |
| `/release-notes` | `pages/ReleaseNotes`, `shared/config/releaseNotes.ts` |
| âncoras `/#secao` | o widget da seção |

**Cuidados:**

- **Fallback obrigatório:** no CI, `actions/checkout` usa `fetch-depth: 1` e
  `git log` do arquivo volta vazio. Sem git, manter a data que já está no XML —
  nunca emitir data vazia.
- Unificar o domínio: o sitemap estático usa literal, o plugin usa `SITE_URL`
  (`vite.config.ts:20`). O `robots.txt` tem o mesmo problema e não é alcançado
  por `transformIndexHtml`.
- O plugin falha em silêncio (`.catch(() => null); if (!xml) return;`). Se
  `public/sitemap.xml` sumir, o build passa verde sem sitemap.

---

## Item 5 · Páginas de versão no sitemap — quase tudo já feito

> **Minha sugestão estava errada.** Li `public/sitemap.xml` (11 URLs) e não a
> saída do build. O `releaseNotesSitemapPlugin` (`vite.config.ts:45-72`) já
> injeta uma URL por versão no `closeBundle`, e o `dist/sitemap.xml` sai com
> **15 URLs**.

**O que falta é pequeno:**

- `/release-notes/page/N` sem entrada — mas com 4 versões e paginação de 50 em
  50, **não existe página 2**. Só passa a valer quando o histórico crescer.
- `entry.date` vai cru para `<lastmod>` sem validação; `version` entra sem escape
  de XML. Hoje inócuo, mas é suposição não verificada.
- As 8 âncoras duplicam `SECTION_IDS` (`shared/config/constants.ts:43-52`) à mão.
  **Obstáculo:** `constants.ts` importa `import.meta.env`, que quebra fora do
  Vite. O caminho limpo é mover `SECTION_IDS` para `routes.ts`, que não tem
  import nenhum.

---

# FASE 2 · Proteger o que já funciona

A fase 1 corrige defeitos; esta impede que voltem. Hoje toda a prova de qualidade
do projeto é **artesanal e efêmera**.

## Item 6 · Versionar os arranjos de auditoria

> **Levantei o inventário: são 64 arquivos `.mjs` no scratchpad.** Isso muda o
> recorte — a maioria é descartável, escrita para responder uma pergunta e nunca
> mais usada (`hero-fit2.mjs`, `debug320.mjs`, `shot.mjs`…). Versionar os 64
> seria transformar lixo de investigação em dívida de manutenção.

**Só seis merecem virar código do projeto:**

| Arranjo | Linhas | O que prova |
| --- | --- | --- |
| `geometry.mjs` | 244 | Diff de geometria — 92.820 caixas em 288 cenários |
| `verify.mjs` | 170 | 26 verificações do índice de release notes |
| `audit2.mjs` | 154 | axe-core + alvos de toque em 11 perfis |
| `modais.mjs` | 153 | Modais rolam por dentro em tela deitada |
| `scrolllock.mjs` | 122 | Trava de rolagem e restauração de posição |
| `versionpage.mjs` | 113 | 28 verificações da página de versão |

Estrutura proposta:

```
scripts/
  lib/browser.mjs        ← launch compartilhado
  a11y.mjs               ← ex-audit2
  geometry.mjs           ← captura e compara
  e2e-release-notes.mjs  ← ex-verify + versionpage
  e2e-modals.mjs         ← ex-modais + scrolllock
  README.md              ← como rodar e como ler a saída
```

**Adaptação real, não copiar e colar:**

- Todos apontam para `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  caminho deste contêiner.
- Todos presumem um preview em `localhost:4173` já de pé.
- `geometry.mjs` compara contra uma base gerada à mão; precisa de comando
  explícito para gravá-la.
- Vários têm caminhos e valores fixos da sessão em que nasceram.

Na prática o item 6 **começa** na fase 1 (item 1) e se completa aqui.

---

## Item 7 · Axe no CI

O `.github/workflows/ci.yml` roda lint, type-check, format:check, test e build.
Nenhuma verificação de acessibilidade.

- **Desenho:** job separado, consumindo o artefato de build que o CI já publica —
  sem buildar duas vezes.
- **Escopo:** 4 rotas × 2 temas = 8 combinações, um viewport. A matriz de 11
  perfis fica manual — num PR ela custa minutos.
- **Critério:** falha em `serious` e `critical`; `moderate` vira aviso
  (`page-has-heading-one` não vale barrar um PR).
- Cachear o browser do Playwright por versão (~1 min de instalação).

---

## Item 8 · Orçamento de bundle no CI

Estado atual medido:

| Chunk | gzip | Teto proposto |
| --- | --- | --- |
| `vendor` (react + react-dom) | 44,2 KB | 50 KB |
| `index` (aplicação) | 45,7 KB | — |
| `ReleaseCard` (lazy) | 4,8 KB | — |
| **Total JS** | **106,5 KB** | **125 KB** |

Folga de ~15%, para o orçamento pegar tendência e não oscilação.

**A parte que importa mais que o número:** um teste que falha se `package.json`
ganhar **qualquer** dependência de runtime além de `react` e `react-dom`. O
tamanho é sintoma; a decisão que moldou o projeto foi a contagem de dependências.
Essa asserção cabe no Vitest, sem CI novo — é a mais barata das duas.

---

## Item 9 · Diff de geometria no CI

O mais caro e o de retorno menos óbvio. Recorte: 3 rotas × 5 larguras × 1 tema,
contra uma base commitada.

> **O problema honesto:** a base precisa ser regravada a cada mudança visual
> legítima, e um PR que muda layout de propósito vai falhar por construção. Sem
> disciplina de regravar, o job vira ruído que todo mundo ignora — pior que não
> ter. Só vale com o compromisso "mudou layout → regrava a base no mesmo PR".

**Alternativa que cobre 80% do valor:** manter só a asserção de **zero overflow
horizontal** em 4 rotas × 5 larguras. É o defeito que mais dói, não precisa de
base, e nunca dá falso positivo.

---

## Item 10 · Intermitência do `scrolllock`

A posição de rolagem restaura com até 2px de desvio, às vezes, ao fechar o
lightbox. Confirmei que existe igual no código pré-refatoração — não é regressão.

**Hipótese a testar:** o `Modal` grava `window.scrollY` e restaura ao desmontar.
Se a leitura acontecer depois de o `overflow: hidden` já ter sido aplicado ao
`body`, a barra de rolagem some, o layout reflui e o valor lido já é o de depois.
Desvio pequeno e não determinístico combina com isso.

**Não corrigir antes de reproduzir** — um "conserto" de intermitência sem causa
entendida costuma só mudar a frequência. Instrumentar 20 aberturas seguidas e
comparar gravado × restaurado.

---

## Ordem sugerida da fase 2

| # | Trabalho | Por quê nesta ordem |
| --- | --- | --- |
| 1 | Item 6 — versionar os seis arranjos | tudo o mais depende deles |
| 2 | Item 8a — asserção de dependências de runtime | mais barato, valor imediato |
| 3 | Item 7 — axe no CI | usa o arranjo do passo 1 |
| 4 | Item 8b — teto de tamanho | precisa do CI já ajustado |
| 5 | Item 10 — investigar o `scrolllock` | independente, sem pressa |
| 6 | Item 9 — geometria no CI | decidir antes se o fluxo de base é viável |

---

# FASE 3 · Estender a ideia

## Item 11 · Feed RSS/Atom

**A decisão de arquitetura vem antes do código.** A lista de versões é a **fusão**
de duas fontes — releases do GitHub e a camada editorial local
(`mergeReleaseNotes.ts`). Dois caminhos incompatíveis:

| Abordagem | Vantagem | Custo |
| --- | --- | --- |
| **Serverless** `api/feed.xml` | Reflete o merge real; release publicada só no GitHub entra sem tocar em código | Mais uma função; precisa de cache de CDN |
| **Build-time**, no `closeBundle` | Estático, zero runtime, mesmo molde do sitemap | **Perde releases publicadas depois do último deploy** — quebra a promessa central |

**Recomendo a serverless.** O build-time contradiz a razão de o sistema existir.
Reaproveita `mergeReleaseNotes` e `renderMarkdown` (`api/_markdown.ts`), então o
corpo é pequeno. Rota via `vercel.json`, que já tem os rewrites.

Formato **Atom**, mais estrito que RSS 2.0 e melhor definido para conteúdo com
HTML. `<link rel="alternate" type="application/atom+xml">` no `index.html`.

---

## Item 12 · `CHANGELOG.md` na raiz

Hoje há um arquivo por versão em `docs/`, e só `release-v2.0.0.md` existe. Um
índice único no padrão Keep a Changelog é o que se procura primeiro num
repositório.

**Recomendo gerar** do `RELEASE_NOTES`, com o arquivo marcado como derivado e um
teste que falha se dessincronizar — continua sendo markdown para quem lê, sem
virar segunda fonte de verdade.

---

## Item 13 · Code span no `renderRich`

`frontend/src/shared/lib/richText.tsx:10-21` — o split é `/(\*\*[^*]+\*\*)/g`,
só negrito. Crase sai literal, como aconteceu comigo ao escrever as notas da v2.

Estender para `` `código` `` emitindo `<code>`, tratando a precedência (crase
dentro de negrito e vice-versa) e cobrindo com teste.

**Efeito colateral a checar:** `renderRich` também serve About e Contato —
textos existentes com crase passariam a renderizar diferente.

---

## Item 14 · OG image por versão

O mais caro da fase 3, e o único que exige dependência nova.

| Abordagem | Custo |
| --- | --- |
| `@vercel/og` (Satori) | Dependência nova, mas só no servidor — não entra no bundle do cliente |
| SVG → PNG no build | Sem dependência de runtime, mas só cobre versões conhecidas no build |

> **Obstáculo maior que a geração:** meta tags Open Graph são lidas por crawlers
> **sem executar JavaScript**. Como o site é uma SPA com `index.html` único, o
> LinkedIn vai ler sempre a mesma tag, qualquer que seja a URL. Gerar a imagem
> não basta — é preciso servir HTML com a meta certa por rota, via middleware ou
> detecção de crawler.

**Se a fase 3 tiver que perder um item, é este.**

---

## Item 15 · Idioma na URL

> **Correção à minha própria sugestão: o idioma JÁ persiste.** Eu disse que
> "reinicia a cada visita" — errado. `app/LangContext.tsx:10` lê o
> `localStorage` e `:31` grava na troca. O que me confundiu foi a linha 12: sem
> preferência salva, ele segue o `navigator.language`, e o Chromium headless dos
> meus testes abre em inglês.

**O que é verdade:** não dá para compartilhar um link em inglês. E, investigando,
achei **um bug real**:

```ts
// LangContext.tsx:32 — dentro de toggleLang, só na TROCA
document.documentElement.setAttribute("lang", next);
```

O atributo `lang` é ajustado **apenas quando o usuário troca o idioma**. Na carga
inicial nunca é, e `index.html` declara `lang="pt-BR"` fixo. Um visitante com
navegador em inglês vê **conteúdo em inglês num documento declarado como
português**: leitor de tela usa a voz errada e o Google indexa errado. É
violação do critério 3.1.1 do WCAG.

**Duas correções, de tamanhos bem diferentes:**

1. **Barata e imediata** — ajustar `document.documentElement.lang` na
   inicialização, não só na troca. **Deveria entrar já na fase 1**, junto das
   outras correções de a11y.
2. **Maior** — idioma na URL (`/en/...` ou `?lang=en`), com `hreflang` no sitemap
   e meta tags por idioma. Mexe no roteador próprio, no sitemap e no
   `index.html`, hoje monolíngue PT.

---

# Verificação

Cada critério é medido, não afirmado:

- [ ] axe-core: **0 violações** em `/`, `/links`, `/release-notes` e
      `/release-notes/v2.0.0`, nos dois temas e dois idiomas
- [ ] Contagem de violações **antes** registrada, para provar a diferença
- [ ] `grep` por "Júnior", "Junior", "Estagiário", "em transição", "transition"
      retorna só o que foi decidido manter
- [ ] Nenhuma chave morta sobrando (grep de cada uma em `src/` = 0 consumidores)
- [ ] `dist/sitemap.xml` sem nenhuma data de `2026-07-17` remanescente
- [ ] Todo `<lastmod>` casa com `git log -1 --format=%cs` do caminho correspondente
- [ ] `dist/sitemap.xml` e `dist/robots.txt` com o mesmo domínio de `SITE_URL`
- [ ] XML válido, sem entidade não escapada
- [ ] Release `v2.0.0` publicada e `/api/release-notes` devolvendo-a
- [ ] 245 testes, type-check, lint, `format:check` e build limpos
- [ ] `verify.mjs` 26/26 e `versionpage.mjs` 28/28
- [ ] Deploy `READY` com as duas lambdas

---

# Fora de escopo das três fases

- Reescrever o autor dos 108 commits antigos para a forma curta do nome.
- Purgar do GitHub os 5 commits órfãos que ainda resolvem por SHA direto —
  depende de chamado ao suporte.
- Backend próprio na pasta `backend/`, hoje reservada.
