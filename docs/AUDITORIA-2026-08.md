# Auditoria técnica e de posicionamento — agosto de 2026

> **Escopo.** Auditoria completa do portfólio, cobrindo arquitetura, UX, performance, SEO,
> acessibilidade, segurança, conteúdo e posicionamento profissional.
>
> **Base.** `main` em `e044754`, com CI verde e deploy de produção em estado READY.
>
> **Método.** Toda constatação aponta arquivo e, quando aplicável, linha. As medições de
> performance vieram da execução de `npm run audit:perf`, `audit:bundle`, `audit:a11y` e
> `npm audit` — não de estimativa. O que não pôde ser medido está marcado como
> **"necessita de medição"** ou **"necessita de verificação"**, com a instrução de como
> obter o dado.
>
> **Natureza.** Documento de planejamento. Nenhuma alteração de código foi feita ao produzi-lo;
> o que ele contém é diagnóstico, priorização e roadmap para execução incremental.

---

## 1. Resumo executivo

- **A engenharia está muito acima da média de um portfólio júnior, e o posicionamento está
  muito abaixo do que o autor tem para mostrar.** Esse é o desequilíbrio central: o site
  prova competência técnica com rigor incomum e falha em comunicar o diferencial de carreira.
- **O diferencial mais raro do autor está enterrado.** Domínio de ERP fiscal — SIGO, eSocial,
  CNAB, homologação bancária, NF/RPS — aparece **só** em `widgets/Timeline/Timeline.data.ts:130`,
  dentro da descrição de um cargo, atrás de um acordeão. O herói vende "Full Stack Developer ·
  AI & Automation · Freelancer" (`shared/config/profile.ts:45`), que é o que todo mundo vende.
- **A vitrine freelance praticamente não existe.** Uma frase em
  `shared/lib/translations.ts:377` menciona "projetos avulsos e freelances". Não há serviços,
  processo, modelo de contratação, nem um único case com resultado. Para o público cliente, o
  site informa, mas não converte.
- **Três defeitos objetivos e baratos de corrigir:** o README cita `frontend/` **11 vezes** e
  esse diretório não existe (é `apps/web`); o `vercel.json` **não define nenhum header de
  segurança**; e `npm audit` acusa **2 vulnerabilidades altas** em `@vercel/og` → `sharp`.
- **A performance é boa em máquina rápida e apertada em celular modesto.** Medido: a home tem
  **TBT de 806 ms e 80,7 % de ocupação da thread principal durante a rolagem com CPU 4× mais
  lenta** — o limiar "bom" do TBT é 200 ms. O custo é de estilo, não de JavaScript.
- **O que já é excelente e não deve ser mexido:** acessibilidade em zero violações nas 16
  combinações de rota/tema/idioma, dependências de runtime reduzidas a `react` + `react-dom`,
  sanitização de HTML por construção em `api/_markdown.ts`, e sete portões de auditoria
  rodando no CI.
- **Cinco widgets não têm teste** — `About`, `Featured`, `Formacoes`, `Header`, `Work` —, e o
  `Header` é justamente o mais interativo do site.

**As três ações mais urgentes:** (1) reposicionar o herói e o Sobre em torno do domínio ERP
fiscal; (2) criar dois cases com problema → decisão → resultado; (3) corrigir README, headers
de segurança e as vulnerabilidades.

---

## 2. Estado atual do projeto

**Stack.** React 18.3 + TypeScript 5.6 + Vite 5.4. Testes em Vitest 4 com Testing Library.
Lint com ESLint 9 + `typescript-eslint` + `eslint-plugin-jsx-a11y`. Formatação com Prettier 3.

**Dependências de runtime.** `apps/web/package.json` declara exatamente duas: `react` e
`react-dom`. Na raiz, `@vercel/og` para a geração de imagem social. **Zero bibliotecas de UI,
de ícones, de roteamento, de estado ou de animação.**

**Arquitetura.** Monorepo com npm workspaces. `apps/web/src` em camadas — `app/`, `pages/`,
`widgets/`, `shared/` (`config`, `hooks`, `lib`, `styles`, `ui`). Roteamento próprio sobre a
History API (`app/RouterContext.tsx`), sem biblioteca.

**Páginas.** `Home`, `Links`, `ReleaseNotes`, `ReleaseNote` — quatro rotas.
**Widgets.** 11: About, Contact, Featured, Footer, Formacoes, Header, Hero, Recommendations,
ReleaseNotes, Timeline, Work.

**Serverless.** `api/` com cinco funções: `crawler.ts` (meta por rota para bots),
`feed.ts` (Atom), `github-stats.ts`, `og.ts` (imagem social), `release-notes.ts`.

**Infra.** Vercel com domínios `gcruz.dev.br` e `gcruzstack.com.br`; produção na `main`.
`.github/workflows/ci.yml` com dois jobs — qualidade (lint, tipos, formato, 299 testes,
ícones, build) e auditoria (a11y, overflow, camadas, identidade, notas, modais, bundle).

**Outros.** `backend/` contém **um único arquivo**: um README de uma linha dizendo
"Backend placeholder. Future implementation." `docs/` guarda baselines e o roadmap antigo.

---

## 3. Pontos fortes — ✅ preservar

| # | O que | Evidência |
| - | ----- | --------- |
| 1 | **Acessibilidade real, não declarada** | `npm run audit:a11y`: 16/16 combinações, zero violações. Roda no CI. |
| 2 | **Dependências mínimas** | `apps/web/package.json`: só `react` e `react-dom` em runtime. Superfície de ataque e de manutenção minúscula. |
| 3 | **Sanitização por construção** | `api/_markdown.ts:74` escapa TODO o HTML antes de processar; só emite tags que ele mesmo gera, e bloqueia `javascript:` (linha 30). O `dangerouslySetInnerHTML` de `ReleaseCard.tsx:90` é seguro por causa disso. |
| 4 | **Portões de qualidade automatizados** | Sete auditorias no CI, incluindo orçamento de bundle e verificação de rolagem horizontal — coisa que projeto sênior raramente tem. |
| 5 | **Design system próprio com tokens** | `shared/styles/tokens.css`: escalas nomeadas de cor, espaço, tipografia, raio, breakpoints. Tema claro e escuro derivados do mesmo vocabulário. |
| 6 | **Segredos tratados corretamente** | `GITHUB_TOKEN` só em `process.env` (servidor); nenhum `.env` versionado; `.gitignore` cobre as três variações. |
| 7 | **i18n completo e real** | PT/EN em todo o conteúdo, com idioma na URL e `hreflang`. |
| 8 | **SEO técnico bem feito** | Sitemap e robots gerados no build (`vite.config.ts:108`), canonical, Open Graph, JSON-LD `Person`, e meta por rota servida a bots via `api/crawler.ts`. |
| 9 | **Histórico de versões curado** | `/release-notes` com sete versões contando uma narrativa coerente. Raro num portfólio. |

---

## 4. Problemas encontrados

### Severidade Alta

**A1 · README descreve um repositório que não existe mais**
`README.md` cita `frontend/` **11 vezes**; o diretório é `apps/web/`. Diz "a raiz orquestra os
scripts e `frontend/` contém toda a aplicação" — falso desde a migração para monorepo. É o
primeiro arquivo que um recrutador técnico abre.
*Prioridade P1 · Impacto Alto · Esforço Baixo · Risco Baixo*

**A2 · Nenhum header de segurança configurado**
`vercel.json` não tem bloco `headers` (verificado: zero ocorrências). Faltam
`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` e `X-Frame-Options`. O site carrega scripts e fontes de terceiros
(Google Fonts, Fontshare, skillicons.dev), o que torna uma CSP mais valiosa, não menos.
*Prioridade P1 · Impacto Alto · Esforço Médio · Risco Médio* (CSP mal calibrada quebra fontes)

**A3 · Duas vulnerabilidades altas em dependência de runtime**
`npm audit --omit=dev`: `@vercel/og` 0.10.0–0.11.1 depende de versão vulnerável de `sharp`.
É dependência de produção, usada por `api/og.ts`.
*Prioridade P1 · Impacto Médio · Esforço Baixo · Risco Médio* (`--force` pode quebrar a API)

### Severidade Média

**M1 · Sitemap polui o índice com âncoras**
`apps/web/dist/sitemap.xml` lista 19 URLs, e **8 são fragmentos** (`/#inicio`, `/#sobre`,
`/#carreira`…). Buscadores não indexam fragmentos como URLs distintas; gerado em
`vite.config.ts:108`.
*Prioridade P2 · Impacto Médio · Esforço Baixo · Risco Baixo*

**M2 · Cinco widgets sem nenhum teste**
`About`, `Featured`, `Formacoes`, `Header`, `Work`. O `Header` é o mais interativo do site — e
esta sessão encontrou nele quatro defeitos reais em produção (o X não fechava o menu, o menu
ficava invisível sob `prefers-reduced-motion`, o foco não voltava ao fechar, e o logotipo
sobrepunha o primeiro item). **Todos escaparam porque não havia teste.**
*Prioridade P2 · Impacto Alto · Esforço Médio · Risco Baixo*

**M3 · Thread principal saturada em celular modesto**
Medido com `audit:perf`, CPU 4× mais lenta:

| Rota | FCP | TBT | Pior quadro | Ocupação na rolagem |
| ---- | --- | --- | ----------- | ------------------- |
| `/` | 1040 ms | **806 ms** | 558 ms | **80,7 %** |
| `/links` | 276 ms | 179 ms | 105 ms | 65,8 % |
| `/release-notes` | 296 ms | 195 ms | 92 ms | 72 % |

O custo é de **estilo** (828–911 ms), não de script — compatível com `backdrop-filter` (vidro)
somado ao `AmbientBackground`. Em CPU 1× a home fica em TBT 106 ms, confortável.
*Prioridade P2 · Impacto Alto · Esforço Médio · Risco Médio*

**M4 · `backend/` é andaime morto e versionado**
Único arquivo: `backend/README.md`, com "Backend placeholder. Future implementation." Num
repositório público, sinaliza intenção abandonada.
*Prioridade P2 · Impacto Baixo · Esforço Baixo · Risco Baixo*

### Severidade Baixa

**B1 · Chips de stack simulam interatividade que não têm**
`pages/Links/Links.css`: `.linktree__chip:hover` eleva e muda a borda, mas são `<li>` sem
link. Afordância falsa.
*Prioridade P3 · Impacto Baixo · Esforço Baixo · Risco Baixo*

**B2 · Orçamento de bundle com folga curta**
`audit:bundle`: JS em 117,9 KB de 125 KB. Folgou depois da curadoria do changelog, mas o teto
está próximo o bastante para reprovar a próxima funcionalidade média.
*Prioridade P3 · Impacto Baixo · Esforço Baixo · Risco Baixo*

### Necessita de verificação

- **Rate limiting e proteção antispam do endpoint de formulário.** `VITE_FORM_ENDPOINT` e
  `VITE_NEWSLETTER_ENDPOINT` apontam para serviço externo. O cliente faz honeypot
  (`ContactForm.tsx:74`) e validação de e-mail (linha 30), mas o que o servidor faz não é
  verificável daqui. *Como verificar:* enviar 20 requisições seguidas e observar se há 429.
- **Google Search Console e indexação real.** Não há evidência de verificação de propriedade.
  *Como verificar:* abrir o Search Console e conferir cobertura e consultas.
- **Core Web Vitals de campo (LCP, INP, CLS de usuários reais).** Não há RUM nem analytics no
  código (nenhuma ocorrência de `gtag`, `plausible`, `umami`, `posthog`).
  *Como verificar:* CrUX no PageSpeed Insights, ou instrumentar RUM.

---

## 5. Melhorias recomendadas — visão consolidada

| Balde | Itens |
| ----- | ----- |
| ✅ Já está bom | a11y, deps mínimas, sanitização, portões de CI, tokens, i18n, SEO técnico, changelog curado |
| 🔧 Refinamento | posicionamento do herói, apresentação dos projetos, custo de estilo na rolagem, sitemap, chips |
| ❌ Inadequado | README desatualizado, ausência de headers, vulnerabilidades, `backend/` morto |
| ➕ Faltando | cases com resultado, página de serviços, prova social de cliente, analytics, testes de 5 widgets |
| 💡 Nice to have | blog/notas técnicas, busca em projetos, modo de impressão do CV |

---

## 6. Melhorias em funcionalidades existentes

**6.1 · Herói reposicionado** — *P0 · Impacto Muito alto · Esforço Baixo*
`widgets/Hero/` + `shared/config/profile.ts:45`. Trocar "Full Stack Developer · AI &
Automation · Freelancer" por uma linha que una desenvolvimento **e** o domínio: o autor entende
de eSocial, CNAB, homologação bancária e emissão fiscal — assunto que a maioria dos
desenvolvedores evita. É o ativo mais escasso dele e está invisível nos primeiros 5 segundos.

**6.2 · Seção Projetos com resultado, não só stack** — *P1 · Impacto Alto · Esforço Médio*
`widgets/Work/Work.tsx` lista tecnologias por projeto. Falta a frase que importa: que problema
resolvia e o que mudou. Um cartão que diz "Node.js · WebSocket" informa; um que diz "chat em
tempo real para N usuários, com reconexão automática" convence.

**6.3 · Curadoria dos projetos exibidos** — *P1 · Impacto Alto · Esforço Baixo*
`shared/config/links.ts` expõe cinco projetos, entre eles `devlinksRocketseat` — projeto de
bootcamp. Ao lado do `AuthService`, ele puxa a percepção de senioridade para baixo. Recomendo
remover da vitrine principal ou marcá-lo explicitamente como exercício de curso.

**6.4 · Custo de estilo na rolagem** — *P2 · Impacto Alto · Esforço Médio*
Investigar `shared/ui/AmbientBackground/` e o uso de `backdrop-filter`. Caminhos a avaliar:
reduzir a densidade de partículas abaixo de um limiar de largura, trocar `backdrop-filter` por
fundo sólido translúcido em telas pequenas, e usar `content-visibility` nas seções fora da
dobra. **Medir antes e depois com `audit:perf`** — a suspeita é do custo de estilo, mas a
atribuição precisa ser confirmada.

**6.5 · Sitemap sem âncoras** — *P2 · Impacto Médio · Esforço Baixo*
`vite.config.ts:108`: manter as quatro rotas reais e as sete de versão; remover os oito
fragmentos.

**6.6 · Chips de stack** — *P3 · Impacto Baixo · Esforço Baixo*
Remover o `:hover` de elevação, ou transformá-los em filtros reais dos projetos.

---

## 7. Novas funcionalidades

**7.1 · Estudos de caso (2 a 3)** — *P0 · Impacto Muito alto · Esforço Alto · Risco Baixo*
- *Por que:* é a peça que falta para converter recrutador e cliente. Hoje o site prova que o
  autor **sabe construir**; não prova que ele **resolve problema de negócio**.
- *Problema que resolve:* a objeção silenciosa "ele já entregou algo que importou para alguém?"
- *Público:* recrutador e cliente.
- *Forma:* contexto → restrição → decisão técnica e o porquê → resultado. Um deles deveria ser
  do trabalho na Wise System, descrito sem violar confidencialidade — "reduzi o retrabalho na
  homologação CNAB" vale mais que qualquer projeto de estudo.

**7.2 · Analytics com respeito à privacidade** — *P1 · Impacto Alto · Esforço Baixo · Risco Baixo*
- *Por que:* hoje é impossível saber se alguém chega ao formulário. Nenhuma decisão de conteúdo
  é informada por dado.
- *Público:* o autor. É instrumento de trabalho.
- *Forma:* solução sem cookies (Plausible, Umami ou Vercel Analytics), medindo profundidade de
  rolagem, cliques em CTA e envios. Fica dentro do orçamento de bundle se for via script
  externo assíncrono. **Cuidado:** interage com a CSP de A2 — planejar juntos.

**7.3 · Testes para os cinco widgets sem cobertura** — *P1 · Impacto Alto · Esforço Médio*
Começar pelo `Header`, onde já se comprovou que a ausência de teste custou quatro defeitos em
produção.

**7.4 · Formulário com estado de erro verificável** — *P2 · Impacto Médio · Esforço Baixo*
`ContactForm.tsx` degrada para mailto sem endpoint. Falta o teste que prova que a falha de rede
é comunicada ao usuário — e não engolida.

---

## 8. Novas páginas

**8.1 · `/servicos`** — *P1 · Impacto Muito alto (público cliente) · Esforço Médio*
- *Por que:* o portfólio declara "disponível para freelances" numa frase e para por aí. Um
  cliente que chega não descobre o que pode contratar, como funciona, nem o que esperar.
- *Problema que resolve:* a objeção "não sei se ele faz o que eu preciso".
- *Conteúdo:* 3 a 4 serviços concretos (ex.: integração fiscal/bancária, automação de processo,
  aplicação web sob medida), o processo em etapas, o que o cliente precisa fornecer, e como
  começar. **Sem tabela de preços** — preço em portfólio júnior costuma fechar porta.
- *Público:* cliente freelance.

**8.2 · `/case/[slug]`** — *P1 · Impacto Muito alto · Esforço Alto*
- *Por que:* suporte para 7.1. A infraestrutura já existe: o roteamento próprio e o padrão de
  `pages/ReleaseNote/` (rota com parâmetro, meta por rota, navegação anterior/próximo) servem
  de molde direto.
- *Público:* recrutador, cliente e desenvolvedor.

**8.3 · O que NÃO criar**
Blog, página de "uses", timeline separada, galeria de certificados como página. O site já tem
quatro rotas para um autor com um projeto de destaque; multiplicar páginas dilui em vez de
somar. Certificados já vivem em `Formacoes`.

---

## 9. UX/UI

**Funciona bem.** Identidade coesa (marca `<gcruz.dev/>` em cabeçalho, rodapé e menu),
tipografia com três papéis claros, temas completos, movimento contido e `prefers-reduced-motion`
respeitado. A `/links` e o rodapé passaram por refinamento recente e estão consistentes.

**Fricções identificadas.**
1. **A home exige rolagem longa antes de qualquer prova.** Oito seções em sequência; o projeto
   de destaque vem depois de Sobre, Carreira e Formação. *P1 · Impacto Alto · Esforço Médio* —
   avaliar trazer o destaque para logo após o herói.
2. **Estados vazios e de erro não são visíveis nas auditorias.** `useGithubStats` e o hook de
   releases têm caminho de falha; não há evidência de que o estado de erro foi revisado
   visualmente. *Necessita de verificação* — abrir com a rede bloqueada.
3. **CTA único e genérico.** "Fale comigo" abre e-mail. Para o público cliente falta um caminho
   de menor atrito com contexto ("quero um orçamento" vs "quero conversar sobre uma vaga").
   *P2 · Impacto Médio · Esforço Baixo*
4. **Chips de stack com afordância falsa** (B1).

**Responsividade.** `audit:overflow` confirma zero rolagem horizontal em 20 combinações de
320 a 1440 px. A escala de breakpoints é nomeada em `tokens.css`. Sem achados.

---

## 10. Arquitetura e código

**Forte.** Camadas com direção de dependência clara; fonte única para URLs
(`shared/config/links.ts`) e identidade (`shared/config/profile.ts`); roteamento próprio enxuto;
i18n tipado — `TranslationKey` é união fechada, então chave inexistente não compila.

**A observar.**
- **`widgets/` tem 31 fontes e 7 testes.** A camada mais visível é a menos coberta.
- **`shared/` está saudável:** 19 testes para 36 fontes, e as peças críticas (merge, markdown,
  rotas, mailto) têm cobertura.
- **`ChangeType` e `ReleaseTag` divergiram.** Depois da curadoria, as categorias são
  `added/improved/design/performance/architecture/content` e as tags seguem
  `design/feature/perf/a11y/fix`. Dois vocabulários próximos e não coincidentes convidam a
  confusão. *P3 · Impacto Baixo · Esforço Baixo*
- **`docs/ROADMAP.md`** descreve um plano anterior à mudança de direção. *P3 — reconciliar ou
  remover.*

---

## 11. Performance

**Medido** (`npm run audit:perf`, mediana de 3, terceiros sem atraso) — ver tabela em M3.

**Bundle, medido** (`npm run audit:bundle`): JS 117,9 KB / 125 KB · vendor 44,2 KB / 50 KB ·
CSS 31,9 KB / 36 KB.

**Leitura.** Em CPU normal o site é rápido (FCP 416 ms na home). O problema aparece sob
throttling 4×, e é de **estilo**, não de JavaScript — o que aponta para `backdrop-filter` e o
fundo ambiente, não para o React. Fontes já saem do caminho crítico (`index.html` carrega
Google Fonts e Fontshare com `media="print"` e troca no `onload`).

**Necessita de medição:** LCP, INP e CLS de campo. Sem RUM, o dado de laboratório não substitui
o de usuário real. *Como medir:* PageSpeed Insights (CrUX) e, depois de 7.2, RUM próprio.

---

## 12. SEO

**Já bom.** Sitemap e robots gerados no build; canonical por rota; Open Graph completo com
imagem 1200×630; JSON-LD `Person` com `sameAs`, `knowsAbout` e `worksFor`; `hreflang` PT/EN;
imagem social dinâmica por versão (`api/og.ts`); Atom em `/feed.xml`; e — o detalhe que quase
ninguém faz numa SPA — **meta por rota servida a bots** via `api/crawler.ts`, com lista de
user-agents em `vercel.json`.

**A corrigir.**
- **M1 — âncoras no sitemap** (8 de 19 URLs).
- **`knowsAbout` do JSON-LD** (`index.html`) lista React, TypeScript, JavaScript, Node.js,
  Python, SQL, eSocial, SST. É onde o diferencial fiscal **já aparece** — e é justamente o que
  falta na parte visível do site. *Reforça a recomendação 6.1.*
- **Necessita de verificação:** propriedade no Search Console e cobertura de indexação.

---

## 13. Acessibilidade

**Medido hoje:** `audit:a11y` → **16/16 combinações sem violação**, nas quatro rotas × dois
temas × dois idiomas. Roda no CI a cada push.

**Além do axe.** `useFocusTrap`, `useScrollLock`, `useInertBackground` para overlays; região
`aria-live` nas páginas; `prefers-reduced-motion` respeitado; alvos de toque confortáveis
abaixo de 640 px; skip-link em todas as páginas.

**Limites honestos do que está medido.**
- O axe **não abre o menu mobile**, e foi exatamente ali que se esconderam quatro defeitos
  reais nesta sessão. *P2 — estender `audit:a11y` para estados interativos: menu aberto,
  modal aberto, formulário em erro.* *Impacto Alto · Esforço Médio*
- Teste com leitor de tela real (NVDA/VoiceOver) — **necessita de verificação**. Nenhuma
  ferramenta automática substitui.

---

## 14. Segurança

| Item | Estado | Evidência |
| ---- | ------ | --------- |
| Segredos no repositório | ✅ | Nenhum `.env` versionado; `.gitignore` cobre `.env`, `.env.local`, `.env.*.local` |
| Token no cliente | ✅ | `GITHUB_TOKEN` só em `process.env`, nunca em `import.meta.env` |
| XSS via HTML de terceiro | ✅ | `api/_markdown.ts:74` escapa tudo antes; só emite tags próprias; bloqueia `javascript:` (linha 30) |
| Validação de formulário | ✅ parcial | Honeypot + regex de e-mail em `ContactForm.tsx:30,74` |
| **Headers HTTP** | ❌ | `vercel.json` sem bloco `headers` — sem CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **Dependências** | ❌ | 2 vulnerabilidades altas: `@vercel/og` → `sharp` |
| Rate limiting | ⚠️ | Endpoint externo — **necessita de verificação** |

**Nota sobre a CSP.** O site consome `fonts.googleapis.com`, `fonts.gstatic.com`,
`api.fontshare.com`, `cdn.fontshare.com` e `skillicons.dev`. Uma CSP precisa listá-los ou o
site quebra. Recomendo entrar primeiro em `Content-Security-Policy-Report-Only`, observar, e só
então aplicar.

---

## 15. Posicionamento profissional

**A pergunta que importa:** um recrutador com 20 segundos entende o que torna este candidato
diferente dos outros 200?

**Hoje, não.** O que ele vê é "Full Stack Developer · AI & Automation · Freelancer" e uma bio
que diz "desenvolvendo soluções digitais que transformam desafios em oportunidades"
(`translations.ts`) — frase que serve para qualquer pessoa e por isso não serve para ninguém.

**O que está escondido e deveria estar na frente.** `Timeline.data.ts:130`: suporte ao SIGO com
foco em **Financeiro** (homologação bancária, remessa/retorno CNAB, conciliação) e
**Faturamento** (homologação de NF/RPS, correção de erros de emissão), com análise de causa
raiz e escalonamento técnico. Isso é conhecimento de domínio que leva anos para adquirir, que
quase nenhum desenvolvedor júnior tem, e que empresas de ERP, fintech e contabilidade pagam
para contratar.

**A narrativa mais forte disponível:** *desenvolvedor que já opera do lado de dentro de um ERP
fiscal — entende eSocial, CNAB e emissão de nota porque resolve esses problemas todo dia — e
que constrói software com rigor de engenharia.* O portfólio hoje conta a segunda metade e
omite a primeira.

**Sobre o `AI & Automation` no `roles`.** Hoje é rótulo sem item de vitrine que o acompanhe —
não há projeto de IA ou automação entre os cinco de `shared/config/links.ts`. Um eixo do
posicionamento sustentado por uma linha de perfil, e não por trabalho exibido, é o elo mais
fraco da narrativa: cada rótulo do herói deveria ter para onde apontar. **Ação:** dar lastro
de vitrine à alegação — um projeto, um script publicado, um case — ou concentrar o herói nos
eixos que já têm prova. *Prioridade P1 · Impacto Médio · Esforço Baixo* (ver T25).

---

## 16. Estratégia para freelancer

**Diagnóstico.** Como vitrine de freelance, o site está no começo. Um cliente que chega não
encontra: o que é oferecido, como funciona, quanto tempo leva, quem já contratou, nem um
caminho de contato com contexto comercial.

**As objeções que o site não responde hoje**

| Objeção do cliente | Onde o site responde | Ação |
| ------------------ | -------------------- | ---- |
| "Ele faz o que eu preciso?" | Em lugar nenhum | Página `/servicos` (8.1) |
| "Já entregou algo parecido?" | Projetos, sem resultado | Cases (7.1) |
| "Como é trabalhar com ele?" | Em lugar nenhum | Seção de processo em `/servicos` |
| "Alguém confia nele?" | `Recommendations` — mas são recomendações de LinkedIn, não de cliente | Depoimento de cliente após o primeiro projeto |
| "Como começo?" | "Fale comigo" → e-mail | CTA com contexto comercial |

**Sequência recomendada:** serviços → um case → CTA comercial → depoimento. Nessa ordem, porque
cada peça sustenta a seguinte, e o depoimento só existe depois do primeiro cliente.

---

## 17. Quick Wins — baixo esforço, alto impacto

| # | Ação | Impacto | Esforço | Onde |
| - | ---- | ------- | ------- | ---- |
| Q1 | Reescrever herói e bio em torno do domínio ERP fiscal | Muito alto | Baixo | `profile.ts:45`, `translations.ts` |
| Q2 | Corrigir o README (`frontend/` → `apps/web`) e documentar os scripts de auditoria | Alto | Baixo | `README.md` |
| Q3 | Remover as âncoras do sitemap | Médio | Baixo | `vite.config.ts:108` |
| Q4 | Remover `backend/` | Baixo | Baixo | `backend/` |
| Q5 | Tirar `devlinksRocketseat` da vitrine principal | Alto | Baixo | `shared/config/links.ts` |
| Q6 | Instalar analytics sem cookies | Alto | Baixo | `index.html` |
| Q7 | Resolver as 2 vulnerabilidades | Médio | Baixo | `package.json` (raiz) |
| Q8 | Remover o `:hover` falso dos chips | Baixo | Baixo | `Links.css` |

---

## 18. Melhorias de alto impacto

| # | Ação | Impacto | Esforço | Por quê |
| - | ---- | ------- | ------- | ------- |
| H1 | Dois a três estudos de caso com resultado | Muito alto | Alto | Única peça que converte os três públicos |
| H2 | Página `/servicos` | Muito alto | Médio | Abre o canal freelance, hoje inexistente |
| H3 | Headers de segurança com CSP | Alto | Médio | Lacuna objetiva; e é assunto de entrevista |
| H4 | Testes para os 5 widgets descobertos | Alto | Médio | Já custou 4 defeitos em produção |
| H5 | Reduzir custo de estilo na rolagem | Alto | Médio | TBT 806 ms em CPU 4× |
| H6 | Estender a11y a estados interativos | Alto | Médio | O ponto cego comprovado do axe |

---

## 19. Matriz Impacto × Esforço

| Melhoria | Impacto | Esforço | Risco | Prioridade |
| -------- | ------- | ------- | ----- | ---------- |
| Q1 · Herói e bio reposicionados | Muito alto | Baixo | Baixo | **P0** |
| H1 · Estudos de caso | Muito alto | Alto | Baixo | **P0** |
| Q2 · README corrigido | Alto | Baixo | Baixo | P1 |
| Q5 · Curadoria de projetos | Alto | Baixo | Baixo | P1 |
| Q6 · Analytics | Alto | Baixo | Baixo | P1 |
| Q7 · Vulnerabilidades | Médio | Baixo | Médio | P1 |
| H2 · Página `/servicos` | Muito alto | Médio | Baixo | P1 |
| H3 · Headers e CSP | Alto | Médio | Médio | P1 |
| H4 · Testes dos 5 widgets | Alto | Médio | Baixo | P2 |
| H6 · a11y em estados interativos | Alto | Médio | Baixo | P2 |
| H5 · Custo de estilo na rolagem | Alto | Médio | Médio | P2 |
| 6.2 · Projetos com resultado | Alto | Médio | Baixo | P2 |
| Q3 · Sitemap sem âncoras | Médio | Baixo | Baixo | P2 |
| 9.1 · Destaque acima na home | Alto | Médio | Médio | P2 |
| 9.3 · CTA com contexto comercial | Médio | Baixo | Baixo | P2 |
| Q4 · Remover `backend/` | Baixo | Baixo | Baixo | P3 |
| Q8 · Chips sem hover falso | Baixo | Baixo | Baixo | P3 |
| 10 · Reconciliar vocabulários e ROADMAP | Baixo | Baixo | Baixo | P3 |
| 8.2 · Rotas `/case/[slug]` | Muito alto | Alto | Médio | P2 |

---

## 20. Roadmap

**Fase 0 · Higiene** — *P1, curta.* README, `backend/`, sitemap, vulnerabilidades, chips.
Tudo objetivo, sem decisão de design. Deixa o repositório apresentável para quem for olhar
durante as fases seguintes.

**Fase 1 · Posicionamento** — *P0, a mais importante.* Herói, bio, curadoria de projetos, CTA.
Nenhuma linha de arquitetura muda; muda o que o site diz. **Maior retorno por hora do roadmap.**

**Fase 2 · Prova** — *P0/P1.* Os estudos de caso e a rota que os hospeda. É a fase longa, e é
a que transforma "sabe programar" em "resolve problema".

**Fase 3 · Canal freelance** — *P1.* `/servicos` com processo e CTA comercial. Depende da
Fase 2: serviço sem case é promessa sem lastro.

**Fase 4 · Instrumentação** — *P1.* Analytics, e então decisões de conteúdo informadas por
dado em vez de intuição. Pode andar em paralelo à Fase 2.

**Fase 5 · Robustez** — *P1/P2.* Headers e CSP, testes dos cinco widgets, a11y em estados
interativos. Trabalho de engenharia que também rende conversa em entrevista.

**Fase 6 · Performance** — *P2.* Custo de estilo na rolagem, com medição antes e depois.
Fica por último porque o site já é aceitável em CPU normal — é otimização, não correção.

---

## 21. Cronograma

Esforço em escala **Pequeno / Médio / Grande** — sem inventar precisão em horas, já que a
disponibilidade do autor (CLT + faculdade em ano de formatura) não é conhecida.

### Etapa 1 — Higiene · *Pequeno* · P1
- **Objetivo:** eliminar o que está objetivamente errado e é barato.
- **Tarefas:** T01, T02, T03, T04, T05.
- **Dependências:** nenhuma.
- **Resultado:** repositório sem informação falsa, sem andaime morto, sem vulnerabilidade
  conhecida, sitemap limpo.

### Etapa 2 — Posicionamento · *Pequeno a Médio* · P0
- **Objetivo:** que os primeiros 5 segundos comuniquem o diferencial de domínio.
- **Tarefas:** T06, T07, T08, T09.
- **Dependências:** nenhuma técnica. Depende de o autor **decidir a narrativa** — é trabalho de
  escrita, não de código.
- **Resultado:** herói, bio e vitrine alinhados ao ativo mais escasso do autor.

### Etapa 3 — Instrumentação · *Pequeno* · P1
- **Objetivo:** parar de decidir conteúdo às cegas.
- **Tarefas:** T10, T11.
- **Dependências:** T10 precisa ser planejado junto de T16 (CSP), ou a CSP bloqueia o script.
- **Resultado:** dados de rolagem, cliques em CTA e envios de formulário.

### Etapa 4 — Prova · *Grande* · P0
- **Objetivo:** demonstrar resolução de problema real.
- **Tarefas:** T12, T13, T14.
- **Dependências:** Etapa 2 (a narrativa define quais cases contar).
- **Resultado:** 2 a 3 cases publicados, com rota própria e meta por rota.

### Etapa 5 — Canal freelance · *Médio* · P1
- **Objetivo:** transformar visita em contato comercial.
- **Tarefas:** T15, T09.
- **Dependências:** Etapa 4.
- **Resultado:** `/servicos` com oferta, processo e caminho de contato.

### Etapa 6 — Robustez · *Médio* · P1/P2
- **Objetivo:** fechar as lacunas de segurança e teste.
- **Tarefas:** T16, T17, T18, T19.
- **Dependências:** T16 coordenado com T10.
- **Resultado:** headers aplicados, 5 widgets cobertos, a11y verificada em estados interativos.

### Etapa 7 — Performance · *Médio* · P2
- **Objetivo:** tornar a home confortável em celular modesto.
- **Tarefas:** T20, T21.
- **Dependências:** Etapa 6 (a CSP pode afetar carregamento de terceiros).
- **Resultado:** TBT da home em CPU 4× reduzido; alvo a definir **depois da medição de
  atribuição**, não antes.

---

## 22. Backlog

| ID | Tarefa | Categoria | Prior. | Impacto | Esforço | Dependências | Fase |
| -- | ------ | --------- | ------ | ------- | ------- | ------------ | ---- |
| T01 | Corrigir as 11 referências a `frontend/` no README e documentar os 8 scripts `audit:*` | Docs | P1 | Alto | Baixo | — | 0 |
| T02 | Remover o diretório `backend/` | Higiene | P3 | Baixo | Baixo | — | 0 |
| T03 | Remover as 8 URLs de âncora do sitemap em `vite.config.ts` | SEO | P2 | Médio | Baixo | — | 0 |
| T04 | Resolver as 2 vulnerabilidades altas de `@vercel/og`/`sharp` | Segurança | P1 | Médio | Baixo | — | 0 |
| T05 | Remover o `:hover` de elevação dos chips em `Links.css` | UX | P3 | Baixo | Baixo | — | 0 |
| T06 | Reescrever `roles` e bio do herói em torno do domínio ERP fiscal | Conteúdo | P0 | Muito alto | Baixo | — | 1 |
| T07 | Reescrever a seção Sobre conectando suporte em ERP a desenvolvimento | Conteúdo | P0 | Alto | Baixo | T06 | 1 |
| T08 | Tirar `devlinksRocketseat` da vitrine ou marcá-lo como exercício | Conteúdo | P1 | Alto | Baixo | — | 1 |
| T09 | Desdobrar o CTA em dois caminhos: oportunidade e orçamento | UX | P2 | Médio | Baixo | T15 | 1/5 |
| T10 | Instalar analytics sem cookies | Instrum. | P1 | Alto | Baixo | coordenar T16 | 3 |
| T11 | Definir os 5 eventos a medir (rolagem, CTA, CV, projeto, envio) | Instrum. | P1 | Médio | Baixo | T10 | 3 |
| T12 | Definir a estrutura de dados dos cases | Arquit. | P0 | Alto | Médio | T06 | 4 |
| T13 | Criar a rota `/case/[slug]` usando `pages/ReleaseNote/` como molde | Feature | P1 | Alto | Médio | T12 | 4 |
| T14 | Escrever 2 a 3 cases (contexto → decisão → resultado) | Conteúdo | P0 | Muito alto | Grande | T12 | 4 |
| T15 | Criar `/servicos` com 3–4 serviços e processo, sem tabela de preços | Feature | P1 | Muito alto | Médio | T14 | 5 |
| T16 | Adicionar `headers` ao `vercel.json`, com CSP em `Report-Only` primeiro | Segurança | P1 | Alto | Médio | T10 | 6 |
| T17 | Promover a CSP de `Report-Only` para aplicada | Segurança | P1 | Alto | Baixo | T16 | 6 |
| T18 | Escrever testes para `Header`, `Work`, `Featured`, `About`, `Formacoes` | Testes | P2 | Alto | Médio | — | 6 |
| T19 | Estender `audit:a11y` a menu aberto, modal aberto e formulário em erro | A11y | P2 | Alto | Médio | — | 6 |
| T20 | Medir e atribuir o custo de estilo na rolagem da home | Perf | P2 | Alto | Médio | — | 7 |
| T21 | Aplicar a correção que a medição indicar e comparar com a linha de base | Perf | P2 | Alto | Médio | T20 | 7 |
| T22 | Reconciliar `docs/ROADMAP.md` com a direção atual | Docs | P3 | Baixo | Baixo | — | 7 |
| T23 | Verificar o domínio no Google Search Console | SEO | P2 | Médio | Baixo | — | 3 |
| T24 | Verificar rate limiting do endpoint de formulário | Segurança | P2 | Médio | Baixo | — | 6 |
| T25 | Dar lastro de vitrine a "AI & Automation" (projeto/case), ou concentrar o herói nos eixos já provados | Conteúdo | P1 | Médio | Baixo | **bloqueia T06** | 1 |

---

## 23. Estado final desejado

**Estrutura.** Seis rotas: `/`, `/servicos`, `/case/[slug]`, `/links`, `/release-notes`,
`/release-notes/[versao]`. O `backend/` não existe mais. O README descreve o repositório que
de fato está lá.

**Posicionamento.** Em cinco segundos o visitante entende: desenvolvedor que opera dentro de um
ERP fiscal — eSocial, CNAB, emissão de nota — e constrói software com rigor de engenharia. O
diferencial deixa de estar no terceiro nível de profundidade e passa a ser a primeira coisa.

**Prova.** Dois a três cases com contexto, decisão e resultado, um deles ancorado na experiência
real na Wise System. A vitrine de projetos mostra o que cada um resolveu, não só com que
tecnologia foi feito.

**Canal comercial.** `/servicos` responde o que é oferecido e como funciona; o CTA distingue
recrutador de cliente.

**Qualidade técnica.** Zero violações de acessibilidade **inclusive em estados interativos**;
headers de segurança aplicados com CSP calibrada; zero vulnerabilidade conhecida; os 11 widgets
com teste; TBT da home em CPU 4× reduzido a um alvo definido por medição.

**Instrumentação.** Analytics sem cookies respondendo quantos chegam ao formulário, quantos
abrem um case e onde as pessoas abandonam — de modo que a próxima rodada de melhorias seja
guiada por dado.

**O que permanece intocado.** Arquitetura em camadas, dependências mínimas, design system,
i18n, os sete portões de CI e o histórico de versões curado. Nada disso precisa mudar.

---

## 24. O que evitar

- **Redesign visual.** A identidade está resolvida e coesa. Refazer o visual consumiria a
  energia que o posicionamento e os cases precisam. O problema deste portfólio **não é
  estético**.
- **Mais animação.** O movimento atual é contido e respeita `prefers-reduced-motion`. Mais
  animação piora o TBT já apertado em celular modesto.
- **Mais páginas que as justificadas.** Blog, "uses", changelog de blog, galeria de
  certificados. Quatro rotas para um autor com um projeto de destaque já é bastante.
- **Mais dependências.** Duas em runtime é um ativo real e um argumento de entrevista.
  Biblioteca de animação, de ícones ou de UI destruiria isso.
- **Barras de habilidade com porcentagem.** "React 90%" não significa nada e sinaliza
  inexperiência. A lista de chips atual está correta.
- **Métricas inventadas.** Não escrever "40% mais rápido" sem antes e depois medidos. Os
  números deste documento vieram de `audit:perf` e `audit:bundle`; os que não deu para medir
  estão marcados.
- **Tabela de preços em `/servicos`.** Preço público em portfólio júnior fecha porta e ancora
  para baixo. Preço se discute na conversa.
- **Rótulo sem item de vitrine que o acompanhe.** Cada eixo declarado no herói deveria ter para
  onde apontar — um projeto, um case, um artefato público. Rótulo é promessa; vitrine é prova.
  Vale para qualquer eixo novo que se queira acrescentar, e para o que já está lá (T25).
- **Otimizar performance antes de atribuir.** T20 vem antes de T21 de propósito.

---

## 25. Próximo passo recomendado

**Começar pela Etapa 2 (Posicionamento), não pela Etapa 1.**

A higiene é mais fácil e por isso tentadora, mas o item de maior retorno do roadmap inteiro é
**T06 — reescrever o herói**: esforço baixo, impacto muito alto, e nenhuma dependência técnica.
O que ele exige não é código, é decisão — o autor precisa escolher contar a história de que
entende de ERP fiscal **e** constrói software, em vez da história genérica de full stack.

Sugestão concreta para a próxima sessão: T06 + T07 + T08 num único lote de conteúdo, revisando
o texto em português e inglês, e medindo o resultado depois que T10 estiver no ar.

**T06 está bloqueado por T25, e o bloqueio é deliberado.** O herói tem três eixos e um deles
— "AI & Automation" — não tem item de vitrine que o acompanhe. Reescrever o herói antes de
resolver isso significa ou repetir um eixo sem prova, ou removê-lo sem que o autor tenha
decidido. Nenhuma das duas é escolha minha.

**O desbloqueio é uma pergunta só:** existe projeto, script publicado ou trabalho que sustente
"AI & Automation"? Se existir, ele vira item de vitrine e o eixo fica mais forte do que é hoje.
Se não existir, o herói se concentra em dois eixos com prova — e fica mais forte por ser
inteiramente verificável. Enquanto a resposta não vier, **T07 e T08 podem andar sozinhos**:
nenhum dos dois depende de T25.

**Enquanto isso, a Etapa 1 (Higiene) é o caminho desimpedido.** T01 a T05 não dependem de
decisão nenhuma e tiram do repositório o que está objetivamente errado.
