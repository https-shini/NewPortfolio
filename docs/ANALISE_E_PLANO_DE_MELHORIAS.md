# Análise técnica e plano de melhorias — NewPortfolio

> **Data:** 2026-11-08 · **Base:** commit `7080c1b` (`main`) · **Tipo:** auditoria estática do repositório
> **Documentos irmãos:** [`ROADMAP_DE_IMPLEMENTACAO.md`](ROADMAP_DE_IMPLEMENTACAO.md) · [`INVENTARIO_TECNICO.md`](INVENTARIO_TECNICO.md)
> **Antecessor:** [`reference/AUDITORIA-2026-08.md`](reference/AUDITORIA-2026-08.md) (backlog T01–T33, Project #3). Este documento **não o substitui**: reavalia o estado atual, marca o que daquele backlog já foi entregue e acrescenta o que é novo.

**Legenda de evidência**

| Marca   | Significado                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------ |
| **[E]** | Encontrado no código — arquivo e linha citados                                                   |
| **[I]** | Inferido a partir do código, **não executado**; precisa de confirmação no navegador ou na Vercel |
| **[R]** | Recomendação                                                                                     |

> **Limite desta análise.** Nenhum build, teste ou auditoria foi executado: a instalação de dependências foi interrompida a pedido do autor, e a primeira etapa não deve alterar o projeto. Tudo o que depende de execução está marcado **[I]** e listado em §13.

---

## Sumário

1. [Resumo executivo](#1-resumo-executivo)
2. [Visão geral do projeto](#2-visão-geral-do-projeto)
3. [Arquitetura atual](#3-arquitetura-atual)
4. [Stack tecnológica](#4-stack-tecnológica)
5. [Mapeamento dos módulos](#5-mapeamento-dos-módulos)
6. [Funcionalidades identificadas](#6-funcionalidades-identificadas)
7. [Diagnóstico técnico](#7-diagnóstico-técnico)
8. [Problemas encontrados](#8-problemas-encontrados)
9. [Débitos técnicos](#9-débitos-técnicos)
10. [Melhorias recomendadas](#10-melhorias-recomendadas)
11. [Novas funcionalidades sugeridas](#11-novas-funcionalidades-sugeridas)
12. [Atualizações tecnológicas](#12-atualizações-tecnológicas)
13. [Riscos identificados e pontos para validação humana](#13-riscos-identificados-e-pontos-para-validação-humana)
14. [Dependências entre melhorias](#14-dependências-entre-melhorias)
15. [Recomendações estratégicas](#15-recomendações-estratégicas)
16. [Conclusão técnica](#16-conclusão-técnica)

---

## 1. Resumo executivo

O NewPortfolio é um portfólio pessoal bilíngue (pt-BR/en) em **React 18 + TypeScript + Vite 8**, publicado na Vercel com seis funções serverless. A base é **madura para o porte do projeto**: arquitetura em camadas respeitada, duas dependências de runtime no cliente, design system próprio, 53 arquivos de teste, e uma bateria incomum de auditorias de navegador (axe, overflow, E2E, orçamento de bundle, CSP) amarrada ao CI.

O que esta auditoria encontrou é menos "falta de engenharia" e mais **lacunas nas bordas**: entre o que o `verify` local roda e o que o CI roda, entre a CSP em modo relatório e a CSP aplicada, entre os comentários e o código depois da consolidação de outubro.

**Os cinco achados de maior peso**

| #   | Achado                                                                                                                                                                       | Prioridade | Evidência                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------ |
| 1   | A página **`/contato` provavelmente renderiza todo o conteúdo invisível** (`opacity: 0`): a seção inteira tem `data-reveal` e a página não chama o hook que revela           | Crítica    | [E] código · [I] efeito visual |
| 2   | **Sem `ErrorBoundary`** e com `localStorage` sem proteção no `LangContext`: armazenamento bloqueado ou chunk ausente após deploy derrubam a aplicação inteira em tela vazia  | Crítica    | [E]                            |
| 3   | O CI **não roda** `lint:api`, `type-check:api` nem `audit:contato`, apesar de o último commit dizer que as lacunas foram fechadas (elas foram fechadas só no `verify` local) | Alta       | [E]                            |
| 4   | **Promover a CSP para aplicada (T17) quebraria o site hoje**: `onload` inline no carregamento de fontes e `connect-src 'self'` bloqueando o endpoint do formulário           | Alta       | [E]                            |
| 5   | **Falhas da API do GitHub são cacheadas por 1 h** no CDN e por 1 h no `sessionStorage`, e as chamadas não têm timeout                                                        | Alta       | [E]                            |

**Números:** 31 problemas catalogados (§8), 30 melhorias propostas (§10), **51 tarefas** no roadmap em 8 fases. Do backlog de agosto, **T01, T02, T04 (indício), T16, T18 e T22 estão entregues**; T03, T05, T10, T17, T19 seguem abertos e foram reincorporados.

---

## 2. Visão geral do projeto

| Aspecto          | Descrição                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Propósito        | Portfólio profissional de Guilherme Cruz: apresentação, carreira, formação, projetos, recomendações, contato                                                                |
| Público          | Recrutadores, clientes de freelance, comunidade técnica                                                                                                                     |
| Produção         | `https://gcruz.dev.br` (Vercel)                                                                                                                                             |
| Escopo funcional | Home com 8 seções · `/links` (link-in-bio) · `/contato` · notas de versão (índice, paginação, permalink, feed Atom) · página técnica do TCC Codex · aviso de LinkedIn · 404 |
| Persistência     | Nenhum banco. Estado do visitante em `localStorage` (tema, idioma) e `sessionStorage` (cache de API). Conteúdo editorial versionado em JSON/TS                              |
| Autenticação     | Nenhuma — site público. Previews da Vercel protegidos por SSO (segundo `CONTRIBUTING.md`)                                                                                   |
| Estado           | Em produção, versão `2.0.0`, manutenção ativa (último commit em 2026-10-29)                                                                                                 |

---

## 3. Arquitetura atual

### 3.1 Visão em camadas [E]

```
┌────────────────────────────── Navegador ──────────────────────────────┐
│ index.html  ─ bootstrap de tema (inline) · JSON-LD · fontes Fontshare │
│   └─ main.tsx → entradas/comum.tsx                                    │
│        ├─ fetch translations.json  (antes de renderizar)              │
│        └─ <App> = Providers(Router → Theme → Lang) + Routes           │
│              ├─ pages/   (Home síncrona; demais via React.lazy)       │
│              ├─ widgets/ (seções; dados bilíngues co-locados)         │
│              └─ shared/  (config · hooks · lib · styles · ui)         │
└───────────────┬───────────────────────────────────────────────────────┘
                │ fetch /api/*  (mesma origem)
┌───────────────▼────────────── Vercel ─────────────────────────────────┐
│ vercel.json: rewrites SPA · roteamento por user-agent · headers       │
│ api/ (Node): github-stats · release-notes · feed · crawler · og ·     │
│              csp-report  ── importam apps/web/src/shared/* por caminho│
└───────────────┬───────────────────────────────────────────────────────┘
                │ HTTPS (token opcional, só no servidor)
          api.github.com
```

### 3.2 Regras de dependência entre camadas [E]

- `app → pages → widgets → shared` — nenhuma importação no sentido inverso foi encontrada.
- `shared/config/routes.ts` é **deliberadamente sem dependências**, para servir tanto ao `vite.config.ts` (build) quanto ao app.
- As funções em `api/` **importam do frontend** (`mergeReleaseNotes.ts`, `releaseNotes.json`, `releaseNotesModel.ts`). É acoplamento intencional para não duplicar a regra de fusão, mas significa que uma mudança em `apps/web/src/shared/lib/mergeReleaseNotes.ts` altera o comportamento do servidor.

### 3.3 Decisões arquiteturais registradas no código (preservar)

| Decisão                                                                | Onde está justificada                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Roteador próprio, sem `react-router`                                   | `app/RouterContext.tsx`                                             |
| Sem pré-renderização/hidratação (revertida por medição: TBT 20→200 ms) | `entradas/comum.tsx:48-55`, `docs/reference/PERFORMANCE-2026-08.md` |
| Markdown → HTML no servidor, escapando antes de transformar            | `api/_markdown.ts`                                                  |
| Crawler HTML por user-agent em vez de SSR                              | `api/crawler.ts`                                                    |
| CSP primeiro em `Report-Only`                                          | `vercel.json`, `api/csp-report.ts`                                  |
| `api/` e `vercel.json` na raiz (Root Directory)                        | `README.md`, `api/github-stats.ts`                                  |

---

## 4. Stack tecnológica

| Camada    | Tecnologia                                                | Versão                     | Avaliação                                              |
| --------- | --------------------------------------------------------- | -------------------------- | ------------------------------------------------------ |
| UI        | React + ReactDOM                                          | 18.3                       | Adequada; ver §12 sobre React 19                       |
| Linguagem | TypeScript (`strict`)                                     | 5.x                        | Adequada; raiz fixa 5.x por causa do builder da Vercel |
| Build     | Vite (Rolldown, `minify: "oxc"`)                          | 8.3.5 (fixa)               | Atual                                                  |
| Estilo    | CSS puro com tokens (3 níveis)                            | —                          | Coeso; 14 mil linhas em 35 arquivos                    |
| Testes    | Vitest + RTL + jsdom; Playwright + axe-core               | 4.1 / 16 / 29; 1.62 / 4.13 | Forte                                                  |
| Qualidade | ESLint 9 flat, Prettier 3, Husky, lint-staged, commitlint | 9 / 3 / 9 / 17 / 21        | Forte                                                  |
| Servidor  | Vercel Functions (Node), `@vercel/og`                     | og 1.0.1                   | Adequado                                               |
| CI        | GitHub Actions, 2 jobs (`check` e `audit`)                | —                          | Bom, com lacunas (P-04, P-22)                          |

Detalhamento completo em [`INVENTARIO_TECNICO.md`](INVENTARIO_TECNICO.md).

---

## 5. Mapeamento dos módulos

| Módulo                    | Responsabilidade                                                  | Depende de                                  | Acoplamento / observação                                                       |
| ------------------------- | ----------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `app/RouterContext`       | caminho atual, `navigate`, `popstate`                             | `shared/config/routes`                      | baixo                                                                          |
| `app/ThemeContext`        | tema e persistência                                               | `constants`                                 | duplica lógica do script inline do `index.html` (necessário para evitar flash) |
| `app/LangContext`         | idioma, `t()`, `?lang=`                                           | `translations`, `routes`                    | depende de `TRANSLATIONS` mutado em tempo de carga (P-13)                      |
| `app/routes`              | mapa de rotas, `AmbientBackground` único                          | todas as páginas                            | cadeia de ternários; cresce linearmente com rotas                              |
| `entradas/comum`          | fontes, CSS global, carga de traduções, montagem                  | `loadTranslations`, `App`                   | cascata de rede antes do 1º render (P-07)                                      |
| `pages/*`                 | composição por rota + `useDocumentMeta`                           | widgets, hooks                              | `Contact` reaproveita o widget sem o hook de revelação (P-01)                  |
| `widgets/*`               | seções da home                                                    | `shared/*`                                  | 3 mecanismos de i18n convivendo (P-11)                                         |
| `shared/config`           | fontes únicas (perfil, links, rotas, releases)                    | —                                           | identidade **repetida** em `api/` e HTML (P-10)                                |
| `shared/hooks`            | comportamento reutilizável                                        | `shared/lib`                                | dois hooks de revelação quase iguais (P-12)                                    |
| `shared/lib`              | utilitários puros                                                 | —                                           | bem testado                                                                    |
| `shared/ui`               | componentes-base (Modal, Accordion, Icons…)                       | hooks                                       | bem testado (Modal, Accordion)                                                 |
| `api/_releases`           | busca de releases (compartilhada)                                 | `_markdown`, GitHub                         | sem timeout (P-06)                                                             |
| `api/crawler`, `api/feed` | meta tags / Atom                                                  | `_releases`, `mergeReleaseNotes` (frontend) | `esc()` duplicado; identidade hardcoded                                        |
| `api/github-stats`        | métricas do perfil                                                | GitHub                                      | cacheia falhas (P-05)                                                          |
| `apps/web/config/*`       | geração de 404, metadados, lastmod, guarda de documentos privados | `git`, FS                                   | bem isolado e testado                                                          |
| `scripts/*`               | auditorias e geradores                                            | Playwright, `dist/`                         | 21 scripts; `audit:contato` fora do CI (P-04)                                  |

**Gargalos identificados:** (a) a carga sequencial `JS → translations.json → render` no caminho crítico [I]; (b) chamadas síncronas ao GitHub dentro de `crawler` e `feed` sem timeout [E]; (c) custo de estilo na rolagem da home, já medido em agosto (`AUDITORIA-2026-08` M3) e tratado em `ROLAGEM-2026-09.md`.

---

## 6. Funcionalidades identificadas

| Funcionalidade                           | Situação                                 | Evidência                                                                                         |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Home com 8 seções e scroll spy           | Implementada                             | `pages/Home`, `widgets/Header`                                                                    |
| Tema dark/light sem flash                | Implementada                             | `index.html:149-165`, `ThemeContext.tsx`                                                          |
| i18n pt/en com `?lang=en` compartilhável | Implementada                             | `LangContext.tsx`, `routes.ts:withLang`                                                           |
| `/links` autônoma com compartilhamento   | Implementada                             | `pages/Links`                                                                                     |
| `/contato` com endereço próprio          | Implementada; **visibilidade suspeita**  | `pages/Contact` (P-01)                                                                            |
| Formulário de contato                    | **Código pronto, desligado em produção** | `ContactForm.tsx`; `pages/Contact/index.tsx` afirma que `VITE_FORM_ENDPOINT` não está configurada |
| Newsletter                               | Somente `mailto:` (sem backend)          | `NewsletterForm.tsx`, `.env.example`                                                              |
| Notas de versão (GitHub + local)         | Implementada                             | `useReleaseNotes`, `mergeReleaseNotes`, `api/release-notes`                                       |
| Feed Atom                                | Implementada                             | `api/feed.ts`, rewrite `/feed.xml`                                                                |
| Cartões de compartilhamento por rota     | Implementada (somente pt)                | `api/crawler.ts`, `api/og.ts`                                                                     |
| Métricas do GitHub                       | Implementada, com fallback               | `useGithubStats`, `api/github-stats.ts`                                                           |
| Página técnica do Codex                  | Implementada                             | `pages/Codex`, `projects/codex/readme.html`                                                       |
| Aviso antes do LinkedIn                  | Implementada (temporária por natureza)   | `shared/config/linkedin.ts`, `pages/LinkedInNotice`                                               |
| 404 bilíngue, também sem JS              | Implementada                             | `pages/NotFound`, `config/notFound.ts`                                                            |
| Sitemap/robots gerados no build          | Implementada                             | `vite.config.ts:sitemapPlugin`                                                                    |
| Coleta de violações de CSP               | Implementada (log)                       | `api/csp-report.ts`                                                                               |
| Analytics / RUM / monitoramento de erros | **Não existe**                           | nenhuma ocorrência de `plausible`, `umami`, `gtag`, `@vercel/analytics`                           |

### Regras de negócio relevantes [E]

| Regra                                                                                    | Onde                                     |
| ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| Só versões declaradas em `releaseNotes.json` aparecem no histórico; o GitHub complementa | `mergeReleaseNotes.ts`, `README`         |
| GitHub manda em `version`, `date`, `url`; o local sobrepõe título, corpo, mídia, tags…   | `mergeReleaseNotes.ts`                   |
| Versão do site = `package.json`; um teste garante igualdade com `releaseNotes.json[0]`   | `vite.config.ts`, `releaseNotes.test.ts` |
| Português é o idioma padrão e implícito; `?lang=pt` nunca é emitido                      | `routes.ts:withLang`                     |
| O destino do aviso do LinkedIn só aceita o próprio perfil (anti open-redirect)           | `linkedin.ts:isOwnLinkedInProfile`       |
| Documentos privados do TCC nunca podem chegar ao `dist/`                                 | `config/privateDocuments.ts`             |
| Datas de carreira em ISO `YYYY-MM`, durações derivadas                                   | `Timeline.data.ts`, `careerDates.ts`     |

---

## 7. Diagnóstico técnico

Notas de 1 (crítico) a 5 (excelente), relativas a um site pessoal desse porte.

| Dimensão                       | Nota | Síntese                                                                                              |
| ------------------------------ | ---- | ---------------------------------------------------------------------------------------------------- |
| Organização e modularização    | 4    | Camadas claras; componentes grandes em 4 arquivos (P-26)                                             |
| Separação de responsabilidades | 4    | Config centralizada; identidade ainda repetida fora de `shared/config` (P-10)                        |
| Reutilização                   | 3    | Duplicações pontuais (P-12) e três mecanismos de i18n (P-11)                                         |
| Legibilidade                   | 4    | Comentários extensos e úteis; parte deles desatualizada após a consolidação (P-08)                   |
| Performance                    | 3    | Muito trabalho de medição já feito; cascata de traduções e fonte de terceiros no LCP (P-07, P-21)    |
| Segurança                      | 4    | Headers, escape no servidor, anti open-redirect, token só no servidor; CSP ainda não aplicada (P-03) |
| Banco de dados                 | n/a  | Não há banco (ver §7.1)                                                                              |
| UX/UI e acessibilidade         | 4    | axe no CI, reduced motion, focus trap; `/contato` suspeita (P-01); fallback vazio no lazy (P-02)     |
| Qualidade e confiabilidade     | 3    | Testes fortes; sem ErrorBoundary, sem observabilidade, portões do CI incompletos (P-02, P-04, P-28)  |
| Documentação                   | 3    | Abundante; README desatualizado em vários pontos (P-14) — corrigido nesta entrega                    |

### 7.1 Banco de dados

**Não há banco de dados** [E]. Não existem modelos, migrações, índices ou backups a avaliar. O "armazenamento" do projeto é:

| Dado                                            | Onde vive                                            | Integridade                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Conteúdo editorial (textos, carreira, releases) | arquivos versionados no Git (`*.json`, `*.data.ts`)  | testes de consistência (`staticContent.test.ts`, `releaseNotes.test.ts`, `Timeline.data.test.ts`) |
| Preferências do visitante                       | `localStorage` (`portfolio-theme`, `portfolio-lang`) | valores validados na leitura (`isLang`, tema)                                                     |
| Cache de API                                    | `sessionStorage` com TTL                             | tolerante a falha (`cache.ts`)                                                                    |
| Releases publicadas                             | GitHub Releases                                      | fonte externa, cache de CDN                                                                       |

O **backup** é o próprio Git (GitHub). **[R]** Não introduzir banco enquanto as necessidades couberem em arquivos; quando o contato/newsletter tiverem backend (MEL-15/16), preferir um serviço gerenciado (provedor de formulário ou e-mail transacional) a um banco próprio, e documentar retenção e base legal (LGPD).

---

## 8. Problemas encontrados

### 8.1 Tabela-resumo

| ID   | Problema                                                                                  | Área              | Prioridade | Complexidade | Evidência |
| ---- | ----------------------------------------------------------------------------------------- | ----------------- | ---------- | ------------ | --------- |
| P-01 | `/contato` com conteúdo em `opacity: 0` sem revelação                                     | UX/Funcional      | Crítica    | Baixa        | [E]+[I]   |
| P-02 | Sem `ErrorBoundary`; falha de chunk lazy ou de render = tela vazia                        | Confiabilidade    | Crítica    | Baixa        | [E]       |
| P-03 | CSP não pode ser aplicada sem quebrar fontes e formulário                                 | Segurança         | Alta       | Média        | [E]       |
| P-04 | CI não roda `lint:api`, `type-check:api`, `audit:contato`                                 | Qualidade         | Alta       | Baixa        | [E]       |
| P-05 | Falhas do GitHub cacheadas 1 h no CDN e 1 h no navegador                                  | Confiabilidade    | Alta       | Baixa        | [E]       |
| P-06 | `fetch` ao GitHub sem timeout nas funções                                                 | Performance/Custo | Alta       | Baixa        | [E]       |
| P-07 | Traduções carregadas em cascata antes do 1º render                                        | Performance       | Alta       | Média        | [E]+[I]   |
| P-08 | Comentários, `.gitignore` e documentos órfãos da arquitetura anterior                     | Manutenção        | Média      | Baixa        | [E]       |
| P-09 | Sitemap ainda lista 8 URLs de âncora (`/#secao`)                                          | SEO               | Média      | Baixa        | [E]       |
| P-10 | Identidade hardcoded em 6+ lugares fora de `profile.ts`                                   | Arquitetura       | Média      | Média        | [E]       |
| P-11 | Três mecanismos de i18n; ~100 textos inline por ternário                                  | Arquitetura       | Média      | Média        | [E]       |
| P-12 | Código duplicado (hooks de revelação, `getUsedTags`, `esc`, reduced motion, tipos Vercel) | Arquitetura       | Média      | Baixa        | [E]       |
| P-13 | Singletons mutáveis de módulo (`TRANSLATIONS`, `RELEASE_NOTES`)                           | Arquitetura       | Baixa      | Média        | [E]       |
| P-14 | README desatualizado (testes, rotas, roadmap, e-mail divergente)                          | Documentação      | Média      | Baixa        | [E]       |
| P-15 | `/api/csp-report` sem limite de tamanho e com log de texto do cliente                     | Segurança         | Baixa      | Baixa        | [E]       |
| P-16 | Crawler responde só em pt-BR, embora o sitemap anuncie `hreflang=en`                      | SEO               | Baixa      | Baixa        | [E]       |
| P-17 | Newsletter sem backend, "inscrição" por `mailto:`                                         | Produto/LGPD      | Média      | Média        | [E]       |
| P-18 | Formulário sem `maxLength` e sem foco no primeiro erro                                    | UX                | Baixa      | Baixa        | [E]       |
| P-19 | `navigate()` descarta o fragmento (`#…`) do destino                                       | Funcional         | Baixa      | Baixa        | [E]       |
| P-20 | Feed Atom quebra inteiro (500) com uma data inválida                                      | Confiabilidade    | Baixa      | Baixa        | [E]       |
| P-21 | Fonte do LCP depende de terceiro (Fontshare)                                              | Performance/Seg.  | Média      | Média        | [E]       |
| P-22 | Workflow sem `permissions:` mínimas e sem `timeout-minutes`                               | Segurança (CI)    | Baixa      | Baixa        | [E]       |
| P-23 | Script inline de tema lê `localStorage` sem `try/catch`                                   | Confiabilidade    | Baixa      | Baixa        | [E]       |
| P-24 | `useScrollReveal` só observa o que existe no mount                                        | UX                | Média      | Baixa        | [E]+[I]   |
| P-25 | `app/routes.test.ts` e `app/routes.test.tsx` coexistem                                    | Manutenção        | Baixa      | Baixa        | [E]       |
| P-26 | Componentes grandes (Codex 810, Footer 598, About 529, Featured 511 linhas)               | Manutenção        | Baixa      | Média        | [E]       |
| P-27 | HTML de release injetado com `dangerouslySetInnerHTML` sem segunda barreira no cliente    | Segurança         | Baixa      | Média        | [E]       |
| P-28 | Nenhuma observabilidade (analytics, RUM, erros de cliente)                                | Qualidade         | Média      | Média        | [E]       |
| P-29 | `.linktree__chip:hover` ainda simula interatividade (T05 aberto)                          | UX                | Baixa      | Baixa        | [E]       |
| P-30 | Fallback `null` nas 6 rotas lazy: tela em branco durante o carregamento                   | UX                | Baixa      | Baixa        | [E]       |
| P-31 | Teste de E2E considera visível um elemento com `opacity: 0`                               | Qualidade         | Alta       | Baixa        | [E]+[I]   |

### 8.2 Detalhamento

#### P-01 · `/contato` provavelmente exibe a página sem conteúdo — **Crítica**

- **Localização:** `apps/web/src/pages/Contact/index.tsx`, `apps/web/src/widgets/Contact/Contact.tsx:117,153,285`, `apps/web/src/shared/styles/globals.css:620-631`.
- **Evidência [E]:** a `<section id="contato">` inteira tem `data-reveal` (linha 117). `globals.css` aplica `opacity: 0; transform: translateY(24px)` a `[data-reveal]` e só remove com `.is-visible`. Quem adiciona `.is-visible` é `useScrollReveal` (chamado **apenas** em `pages/Home/index.tsx`) ou `useRevealOnScroll` (não usado pelo `Contact`). `ContactPage` chama `useReducedMotion`, `useDocumentMeta` — **não** `useScrollReveal`. Nenhuma regra CSS de `.contact-page` sobrepõe a opacidade.
- **Efeito [I]:** ao abrir `/contato` (direto ou pelo rodapé), Header e Footer aparecem e o miolo fica transparente. Precisa de confirmação visual (§13).
- **Por que escapou:** `scripts/e2e-contato.mjs` não roda no CI (P-04) e, mesmo no `verify`, verificações de visibilidade do Playwright tratam `opacity: 0` como visível (P-31).
- **Impacto:** página indexada e linkada no rodapé entregando tela vazia; perda direta de contatos.
- **Solução [R]:** chamar `useScrollReveal()` em `ContactPage` (mesmo padrão da Home) **ou** fazer o hook ser responsabilidade do próprio widget. Acrescentar asserção de opacidade computada no E2E.
- **Complexidade:** baixa.

#### P-02 · Sem `ErrorBoundary`; qualquer erro de render derruba o app — **Crítica**

- **Localização:** `app/App.tsx`, `app/routes.tsx` (6 × `<Suspense fallback={null}>`), `app/LangContext.tsx:57,128`.
- **Evidência [E]:** nenhuma ocorrência de `ErrorBoundary`/`componentDidCatch`/`getDerivedStateFromError` em `src/`. `LangContext` lê e grava `localStorage` sem `try/catch` — ao contrário de `ThemeContext` e `cache.ts`, que tratam a exceção. O `catch` de `entradas/comum.tsx` cobre só a carga das traduções.
- **Cenários [I]:** (a) navegador com armazenamento bloqueado (políticas corporativas, iframes, alguns modos privados) → `SecurityError` na inicialização do `LangProvider` → React desmonta tudo; (b) após um deploy, uma aba aberta pede um chunk com hash antigo que não existe mais → o `lazy()` rejeita → tela em branco sem mensagem.
- **Impacto:** perda total da página para o visitante, sem caminho de recuperação.
- **Solução [R]:** `try/catch` em `LangContext` (ler e gravar); um `ErrorBoundary` na raiz com mensagem bilíngue e botão "recarregar"; para falhas de chunk, recarregar a página uma única vez (guardando um marcador em `sessionStorage`).
- **Complexidade:** baixa.

#### P-03 · A CSP não pode ser promovida a aplicada sem quebrar o site — **Alta**

- **Localização:** `vercel.json` (header `Content-Security-Policy-Report-Only`), `apps/web/index.html:102`, `apps/web/projects/codex/readme.html:74`, `scripts/csp.mjs`, `shared/config/constants.ts`.
- **Evidência [E]:**
    1. As folhas do Fontshare carregam com `onload="this.media = 'all'"`. Atributos de evento inline **não** são autorizados por hash em `script-src` sem `'unsafe-hashes'`; com a CSP aplicada, a folha ficaria em `media="print"` e as fontes nunca seriam usadas.
    2. `connect-src 'self'`, mas `ContactForm` e `NewsletterForm` fazem `fetch` para `VITE_FORM_ENDPOINT` / `VITE_NEWSLETTER_ENDPOINT` (Formspree ou outro domínio). Ao ligar o formulário com a CSP aplicada, todo envio falharia.
    3. `scripts/csp.mjs` só calcula hashes de `<script>` inline; não detecta atributos `on*`, então o `csp:check` não acusa (1).
- **Impacto:** o item T17 do backlog ("promover a CSP") quebraria tipografia e formulário; hoje o modo relatório deve estar registrando violações de (1) em `api/csp-report` [I].
- **Solução [R]:** trocar o `onload` por um carregamento sem atributo inline (script externo pequeno, ou `<link rel="preload" as="style">` + folha comum, ou autoalojar as fontes — MEL-26); incluir o domínio do endpoint em `connect-src` gerado a partir da env no build/CI; estender `csp.mjs` para reprovar atributos `on*`.
- **Complexidade:** média.

#### P-04 · Portões existentes fora do CI — **Alta**

- **Localização:** `.github/workflows/ci.yml`, `scripts/verify.mjs:22,24,50`.
- **Evidência [E]:** `verify.mjs` executa `lint:api`, `type-check:api` e `audit:contato`; o `ci.yml` não executa nenhum dos três. O commit `7080c1b` descreve "registra ambos no verify" — e o fluxo do projeto vai direto para `main` (`CONTRIBUTING.md`), então o CI é a única barreira compartilhada.
- **Impacto:** regressões de tipo nas funções e a regressão da rota `/contato` (que motivou o próprio `audit:contato`) podem voltar sem que nenhum portão reprove.
- **Solução [R]:** adicionar os três passos ao CI (dois no job `check`, um no job `audit`).
- **Complexidade:** baixa.

#### P-05 · Falhas do GitHub ficam cacheadas — **Alta**

- **Localização:** `api/github-stats.ts:72-77`, `apps/web/src/shared/hooks/useGithubStats.ts:39-44`.
- **Evidência [E]:** a função responde `200 {commits:null, repos:null}` com `s-maxage=3600, stale-while-revalidate=86400` mesmo quando as duas chamadas falharam (só o `catch` de exceção omite o header). No cliente, `useGithubStats` grava em `sessionStorage` qualquer JSON recebido, inclusive os nulos. `api/release-notes.ts` já resolve isso (cache de 60 s quando vazio) — o padrão existe, só não foi aplicado aqui.
- **Impacto:** uma oscilação de rate limit vira até 1 h (CDN) + 1 h (aba) de métricas em fallback.
- **Solução [R]:** cache curto quando algum campo vier `null`; não gravar no `sessionStorage` quando ambos forem `null`.
- **Complexidade:** baixa.

#### P-06 · Chamadas ao GitHub sem timeout — **Alta**

- **Localização:** `api/_releases.ts:50`, `api/github-stats.ts:51-57`.
- **Evidência [E]:** `fetch` sem `AbortSignal.timeout`. `crawler.ts` e `feed.ts` aguardam `fetchGithubReleases()` antes de responder.
- **Impacto:** lentidão do GitHub vira lentidão (ou timeout da plataforma) do cartão de compartilhamento e do feed, e custo de execução maior.
- **Solução [R]:** `signal: AbortSignal.timeout(3000)` (valor a calibrar), tratado pelo `catch` existente.
- **Complexidade:** baixa.

#### P-07 · Cascata de rede antes da primeira pintura — **Alta (a confirmar por medição)**

- **Localização:** `apps/web/src/entradas/comum.tsx:61`, `shared/lib/loadTranslations.ts`.
- **Evidência [E]:** a renderização só começa depois de `fetch(translations.json)` (34 KB), cuja URL só é conhecida depois que o JS principal é baixado e executado. Não há `<link rel="preload">` para esse JSON no `index.html`.
- **Impacto [I]:** um RTT extra no caminho crítico do FCP/LCP em rede móvel. A equipe já mostrou que mede antes de mexer (`PERFORMANCE-2026-08.md`), então isso deve ser **medido**, não presumido.
- **Solução [R]:** plugin de build que injete `<link rel="preload" as="fetch" crossorigin href="/assets/…translations-[hash].json">` no `index.html`; comparar com `audit:perf` antes/depois.
- **Complexidade:** média.

#### P-08 · Resíduos da arquitetura anterior — **Média**

- **Evidência [E]:**
    - `entradas/comum.tsx:5` e `main.tsx:2-3` explicam "uma entrada por rota" e citam `rotaHtmlPlugin` em `vite.config.ts` — o plugin **não existe**; há só as entradas `main` e `codex`.
    - `.gitignore` ignora `apps/web/contato.html`, `links.html`, `release-notes.html`, `.prerender/`, `apps/desktop/release/`, `apps/mobile/android|ios/` — nada disso existe no repositório.
    - `LangContext.tsx:48-51` e `ThemeContext.tsx` falam de "pré-renderização da home", revertida (`comum.tsx:48`).
    - `scripts/qr.diff.md` documenta `scripts/qr.mjs`, que não existe.
- **Impacto:** quem lê o código (pessoa ou agente) é induzido a erro — a própria auditoria quase o foi.
- **Solução [R]:** atualizar ou remover os trechos; decidir se `qr.diff.md` vai para `docs/reference/` ou sai.
- **Complexidade:** baixa.

#### P-09 · Âncoras no sitemap (T03 do backlog, ainda aberto) — **Média**

- **Localização:** `apps/web/vite.config.ts:170` (laço sobre `SECTION_IDS`).
- **Evidência [E]:** 8 entradas `/#<id>`, cada uma com `hreflang`. Fragmentos não são URLs distintas para buscadores.
- **Solução [R]:** remover o laço e ajustar o teste/auditoria que conte entradas, se houver.
- **Complexidade:** baixa.

#### P-10 · Identidade repetida fora da fonte única — **Média**

- **Evidência [E]:** `GITHUB_USER = "https-shini"` em `api/github-stats.ts:39` e `api/_releases.ts:13`; `AUTHOR = "Guilherme Cruz"` e `SITE_URL` em `api/crawler.ts:36-38` e `api/feed.ts:33-34`; descrições de SEO repetidas em `crawler.ts`, `pages/Home/index.tsx` e `index.html`; JSON-LD com empregador e tecnologias em `index.html:112-147`. O comentário de `github-stats.ts` admite: "Se mudar lá, mude aqui".
- **Agravante:** `README.md` (autor) usa `contato.guilhermescruz@gmail.com`; `profile.ts` usa `contato@gcruz.dev.br`.
- **Solução [R]:** extrair um módulo puro (sem `import.meta.env`), por exemplo `shared/config/identity.ts`, consumido por `profile.ts`, `api/*` (já importam do frontend) e pelo plugin de HTML; teste que compare o JSON-LD com esse módulo.
- **Complexidade:** média.

#### P-11 · i18n em três mecanismos — **Média**

- **Evidência [E]:** (1) chaves tipadas `t("…")` de `translations.json`; (2) objetos `Localized {pt, en}` em `*.data.ts`; (3) ternários inline `lang === "pt" ? … : …` / `tr(pt, en)` — 31 em `pages/Codex/index.tsx`, 13 em `Footer.tsx`, 10 em `RecommendationModal.tsx`, 9 em `Featured.tsx`, em 16 arquivos (100 ocorrências no total). O README afirmava "zero strings hardcoded".
- **Impacto:** traduções espalhadas; um terceiro idioma exigiria tocar dezenas de componentes; textos inline não passam pelos testes de completude bilíngue.
- **Solução [R]:** regra: texto de UI → chave em `translations.json`; conteúdo → `Localized`. Migrar por arquivo, começando por Codex e Footer. Regra de lint (`no-restricted-syntax` para `lang === "pt"`) após a migração.
- **Complexidade:** média.

#### P-12 · Duplicações — **Média**

| Duplicação                                  | Locais                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Hooks de revelação quase idênticos          | `shared/hooks/useScrollReveal.ts` × `useRevealOnScroll.ts`                                   |
| Leitura de `prefers-reduced-motion`         | 10 ocorrências de `matchMedia("(prefers-reduced-motion…")` com `useReducedMotion` disponível |
| `getUsedTags` com implementações diferentes | `shared/config/releaseNotes.ts:18` × `releaseNotesClient.ts:30`                              |
| Escape de XML/HTML                          | `api/crawler.ts:40` × `api/feed.ts:37` (e `_markdown.ts:20`, com aspas simples)              |
| Tipos `VercelRequest`/`VercelResponse`      | redeclarados em 6 arquivos de `api/`                                                         |
| Bloco de cabeçalhos/token do GitHub         | `api/github-stats.ts` × `api/_releases.ts`                                                   |

- **Solução [R]:** `api/_http.ts` (tipos, `esc`, `githubHeaders()`), um único `getUsedTags` em `releaseNotesModel.ts`, um hook de reduced motion que devolva o booleano.
- **Complexidade:** baixa.

#### P-13 · Estado global mutável — **Baixa**

- **Evidência [E]:** `TRANSLATIONS` e `RELEASE_NOTES` (cliente) são preenchidos por mutação após `fetch` (`initializeTranslations`, `RELEASE_NOTES.splice(...)`); componentes leem o módulo diretamente.
- **Impacto:** ordem de carga implícita; testes precisam inicializar o módulo; risco em futuras mudanças (ex.: SSR).
- **Solução [R]:** manter (custo/benefício baixo hoje), mas documentar o contrato e expor leitura via contexto quando houver motivo de mexer.

#### P-14 · README desatualizado — **Média** (tratado nesta entrega)

- **Evidência [E]:** "245 testes em 29 arquivos" (há 53 arquivos de teste); roadmap com "Testes E2E com Playwright" e "Deploy preview por PR" (já existem) e "Backend próprio (`backend/`)" (pasta removida); tabela de rotas sem `/contato`, `/linkedin` e `/projects/codex/…`; `providers.tsx` descrito sem `ThemeProvider`; "zero strings hardcoded" (ver P-11); "Commitlint 20+" (é 21); e-mail divergente (P-10); o passo "declare a entrada em `releaseNotes.ts`" quando os dados vivem em `releaseNotes.json`.
- **Solução:** README reescrito nesta entrega, conferido contra os arquivos.

#### P-15 · Endpoint de relatório de CSP aberto — **Baixa**

- **Localização:** `api/csp-report.ts`.
- **Evidência [E]:** aceita qualquer POST, grava até 500 caracteres do corpo bruto em log e uma linha por violação sem limite de quantidade num array `report-to`.
- **Impacto:** poluição de log e custo de invocação sob abuso; quebras de linha no conteúdo podem forjar linhas de log.
- **Solução [R]:** limitar número de violações por requisição, remover `\r\n` dos campos, recusar corpos acima de alguns KB; rate limit na borda (firewall da Vercel) se houver abuso.

#### P-16 · Crawler monolíngue — **Baixa**

- **Evidência [E]:** `api/crawler.ts` gera `lang="pt-BR"` e textos em pt sempre; o rewrite não repassa `?lang=en`; o sitemap anuncia variantes `?lang=en`.
- **Solução [R]:** repassar a query no rewrite e escolher título/descrição pelo idioma (os textos já existem em `translations.json`/`releaseNotes.json`).

#### P-17 · Newsletter sem backend — **Média (decisão de produto)**

- **Evidência [E]:** sem `VITE_NEWSLETTER_ENDPOINT`, a "inscrição" abre o cliente de e-mail (`NewsletterForm.tsx:74-81`). O próprio `.env.example` exige double opt-in e descadastro para um backend.
- **Impacto:** expectativa de inscrição que não é gerida; tratamento de dados pessoais sem registro de consentimento.
- **Solução [R]:** decidir entre (a) integrar um provedor com double opt-in e política de privacidade, ou (b) remover o bloco até haver conteúdo para enviar.

#### P-18 · Feedback do formulário — **Baixa**

- **Evidência [E]:** `ContactForm.tsx` não define `maxLength`; ao falhar a validação, o foco não vai para o primeiro campo inválido (só mensagens com `aria-describedby`).
- **Solução [R]:** `maxLength` coerente com o backend; `focus()` no primeiro erro; contador para a mensagem.

#### P-19 · `navigate()` perde o fragmento — **Baixa**

- **Evidência [E]:** `RouterContext.tsx` monta o histórico com `destination.pathname + destination.search`. Hoje nenhum chamador passa `#…` (verificado), então o efeito é latente.
- **Solução [R]:** preservar `destination.hash` e rolar até o alvo, com teste.

#### P-20 · Feed frágil a datas — **Baixa**

- **Evidência [E]:** `api/feed.ts:46-48` — `new Date(date).toISOString()` lança `RangeError` com data inválida; não há `try/catch` no handler.
- **Solução [R]:** validar e pular a entrada inválida (com `console.warn`).

#### P-21 · Fonte do LCP em terceiro — **Média**

- **Evidência [E]:** Cabinet Grotesk/General Sans vêm do Fontshare (`index.html:96-110`); o próprio comentário registra que a fonte do herói (LCP) depende de terceiro e que autoalojar exige conferir a licença ITF.
- **Impacto:** LCP sujeito a outro domínio; CSP precisa liberar dois hosts; privacidade (IP do visitante enviado a terceiro).
- **Solução [R]:** validar a licença (humano) e autoalojar em WOFF2 com subset latino (MEL-26).

#### P-22 · Endurecimento do workflow — **Baixa**

- **Evidência [E]:** `.github/workflows/ci.yml` sem bloco `permissions:` nem `timeout-minutes`.
- **Solução [R]:** `permissions: contents: read` no topo; `timeout-minutes` por job.

#### P-23 · Script inline de tema sem proteção — **Baixa**

- **Evidência [E]:** `index.html:151` e `projects/codex/readme.html:89` chamam `localStorage.getItem` sem `try/catch`. Se lançar, o script para; o React corrige depois, mas com flash de tema.
- **Solução [R]:** envolver em `try/catch`. **Atenção:** muda o hash da CSP — rodar `node scripts/csp.mjs` e atualizar `vercel.json` no mesmo commit.

#### P-24 · Revelação só no mount — **Média**

- **Evidência [E]:** `useScrollReveal` faz um único `querySelectorAll("[data-reveal]")` no `useEffect` de montagem da Home. Elementos com `data-reveal` que entrem depois (troca de aba em `Formacoes`, conteúdo condicional) não são observados [I].
- **Solução [R]:** unificar com `useRevealOnScroll` (ref por elemento) ou usar `MutationObserver`; resolve P-01 e P-12 juntos.

#### P-25 · Dois arquivos de teste de rotas — **Baixa**

- **Evidência [E]:** `app/routes.test.ts` e `app/routes.test.tsx` lado a lado (provável resíduo do merge `bc10058` "estado com conflitos").
- **Solução [R]:** verificar sobreposição e consolidar.

#### P-26 · Componentes extensos — **Baixa**

- **Evidência [E]:** `pages/Codex/index.tsx` (810 linhas, conteúdo inline), `Footer.tsx` (598), `About.tsx` (529), `Featured.tsx` (511).
- **Solução [R]:** extrair dados para `*.data.ts` e subcomponentes **quando o arquivo for tocado por outro motivo** — refatoração isolada tem custo maior que benefício aqui.

#### P-27 · `dangerouslySetInnerHTML` com uma única barreira — **Baixa**

- **Evidência [E]:** `ReleaseCard.tsx:142` injeta `entry.html`, que vem de `/api/release-notes` (escapado em `_markdown.ts`, com testes de segurança) e é guardado em `sessionStorage`.
- **Impacto:** baixo enquanto a CSP e o escape no servidor existirem. A barreira única depende de `_markdown.ts` continuar correto.
- **Solução [R]:** manter os testes de `_markdown`; quando a CSP for aplicada, avaliar `require-trusted-types-for 'script'` em modo relatório.

#### P-28 · Sem observabilidade — **Média**

- **Evidência [E]:** nenhum analytics/RUM; erros de cliente só no `console`; funções logam com `console.warn/error`.
- **Impacto:** P-01 e P-02 só são descobertos por inspeção manual; decisões de produto (T10/T11 do backlog) sem dado.
- **Solução [R]:** analytics sem cookies (decisão humana sobre provedor), Web Vitals de campo, e um coletor mínimo de erros do cliente (pode reutilizar o padrão de `api/csp-report.ts`).

#### P-29 · Chips com hover sem ação (T05) — **Baixa**

- **Evidência [E]:** `pages/Links/Links.css:265` mantém `.linktree__chip:hover`.

#### P-30 · Fallback vazio no carregamento lazy — **Baixa**

- **Evidência [E]:** 6 × `<Suspense fallback={null}>` em `app/routes.tsx`. Em rede lenta, navegar para `/release-notes` mostra só o fundo.
- **Solução [R]:** fallback leve (container com `min-height` e indicador discreto respeitando reduced motion), medindo CLS.

#### P-31 · E2E não detecta conteúdo transparente — **Alta**

- **Evidência [E]/[I]:** os scripts E2E verificam presença/visibilidade via Playwright, cuja noção de "visível" não considera `opacity: 0`. É a razão provável de P-01 não ter sido detectado mesmo localmente.
- **Solução [R]:** helper em `scripts/lib/browser.mjs` que verifique `getComputedStyle(el).opacity` do conteúdo principal após o carregamento, usado por todas as auditorias de rota.

---

## 9. Débitos técnicos

| ID   | Débito                                                            | Origem                                 | Custo de carregar                   | Ação sugerida |
| ---- | ----------------------------------------------------------------- | -------------------------------------- | ----------------------------------- | ------------- |
| DT-1 | Comentários e configurações da arquitetura multi-entrada removida | consolidação de out/2026               | induz a erro de leitura             | MEL-12        |
| DT-2 | Três mecanismos de i18n                                           | crescimento orgânico                   | tradução espalhada                  | MEL-11        |
| DT-3 | Identidade e textos de SEO repetidos (web, api, HTML)             | funções sem acesso a `import.meta.env` | divergência silenciosa              | MEL-09        |
| DT-4 | Hooks/utilitários duplicados                                      | evolução incremental                   | correções aplicadas de um lado só   | MEL-10        |
| DT-5 | Portões só locais (`verify`) e não no CI                          | fluxo direto na `main`                 | regressão sem barreira              | MEL-04        |
| DT-6 | CSP em relatório sem caminho viável para aplicada                 | calibração pendente                    | proteção XSS só nominal             | MEL-05        |
| DT-7 | Componentes grandes com conteúdo inline (Codex)                   | página escrita de uma vez              | edição de conteúdo exige editar TSX | MEL-13        |
| DT-8 | Singletons mutáveis de dados                                      | carga de JSON fora do bundle           | ordem de inicialização implícita    | documentar    |
| DT-9 | Formulário e newsletter dependentes de serviço não configurado    | backend adiado (issue #45)             | funcionalidade aparente sem efeito  | MEL-15/16     |

---

## 10. Melhorias recomendadas

> Cada melhoria tem um ID estável (`MEL-NN`) referenciado no roadmap. "Critérios de aceite" são verificáveis por comando, teste ou inspeção objetiva.

### 10.1 Críticas

#### MEL-01 · Revelar o conteúdo de `/contato`

| Campo                     | Conteúdo                                                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoria                 | Crítica                                                                                                                                                                                                                       |
| Problema                  | P-01 — seção inteira com `data-reveal` sem hook que a revele                                                                                                                                                                  |
| Situação atual            | `ContactPage` não chama `useScrollReveal`                                                                                                                                                                                     |
| Resultado esperado        | Conteúdo de `/contato` visível (opacidade 1) em acesso direto e via rodapé, com e sem reduced motion                                                                                                                          |
| Proposta                  | Chamar `useScrollReveal()` em `pages/Contact/index.tsx` (correção mínima); depois, na MEL-10, mover a responsabilidade para o widget                                                                                          |
| Arquivos                  | `pages/Contact/index.tsx`, `scripts/e2e-contato.mjs`                                                                                                                                                                          |
| Dependências              | — (o helper de opacidade da MEL-04 protege contra regressão)                                                                                                                                                                  |
| Complexidade / Prioridade | Baixa / **Crítica**                                                                                                                                                                                                           |
| Riscos                    | Mínimos; confirmar visualmente antes, para registrar o defeito                                                                                                                                                                |
| Critérios de aceite       | (1) `audit:contato` verifica `opacity === "1"` no `#contato` nos 2 temas × 2 idiomas; (2) teste de unidade de `ContactPage` confirma `is-visible` com `IntersectionObserver` simulado; (3) captura antes/depois anexada ao PR |

#### MEL-02 · Acesso resiliente a armazenamento

| Campo                     | Conteúdo                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Categoria                 | Crítica                                                                                                                                                                  |
| Problema                  | P-02 (parte), P-23                                                                                                                                                       |
| Situação atual            | `LangContext.tsx:57,128` e scripts inline sem `try/catch`                                                                                                                |
| Resultado esperado        | App funciona (sem persistência) com `localStorage` indisponível                                                                                                          |
| Proposta                  | Envolver leitura/gravação em `try/catch` (ou helper `safeStorage` em `shared/lib`), aplicado a `LangContext`; atualizar os dois scripts inline e regenerar o hash da CSP |
| Arquivos                  | `app/LangContext.tsx`, `index.html`, `projects/codex/readme.html`, `vercel.json`, `shared/lib/`                                                                          |
| Dependências              | —                                                                                                                                                                        |
| Complexidade / Prioridade | Baixa / **Crítica**                                                                                                                                                      |
| Riscos                    | Mudar o script inline altera o hash: esquecer o `vercel.json` faz o tema abrir errado quando a CSP for aplicada (o `csp:check` do CI pega)                               |
| Critérios de aceite       | (1) teste de `LangContext` com `localStorage` que lança em `getItem` e `setItem` passa; (2) `npm run csp:check` verde; (3) `audit:a11y` sem regressão                    |

#### MEL-03 · `ErrorBoundary` e recuperação de chunk

| Campo                     | Conteúdo                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Categoria                 | Crítica                                                                                                                                                                                          |
| Problema                  | P-02                                                                                                                                                                                             |
| Situação atual            | Erro de render ou de `import()` desmonta a árvore                                                                                                                                                |
| Resultado esperado        | Mensagem bilíngue com ação de recarregar; erro de chunk recarrega uma vez automaticamente                                                                                                        |
| Proposta                  | `shared/ui/ErrorBoundary` (classe) envolvendo `<Routes>` em `App.tsx`; wrapper `lazyWithRetry` em `routes.tsx` que, em erro de import, recarrega a página uma vez (marcador em `sessionStorage`) |
| Arquivos                  | `app/App.tsx`, `app/routes.tsx`, `shared/ui/ErrorBoundary/*`, `translations.json`                                                                                                                |
| Dependências              | MEL-02 (para não depender de `localStorage` no fallback)                                                                                                                                         |
| Complexidade / Prioridade | Baixa / **Crítica**                                                                                                                                                                              |
| Riscos                    | Laço de recarga se o marcador falhar — limitar a 1 tentativa e cair na mensagem                                                                                                                  |
| Critérios de aceite       | (1) teste: componente que lança exibe o fallback com botão; (2) teste: `import()` rejeitado dispara 1 recarga e depois o fallback; (3) orçamento de bundle respeitado                            |

### 10.2 Alta prioridade

#### MEL-04 · Completar os portões do CI

| Campo                     | Conteúdo                                                                                                                                                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoria                 | Alta                                                                                                                                                                                                                                                                   |
| Problema                  | P-04, P-31                                                                                                                                                                                                                                                             |
| Situação atual            | `lint:api`, `type-check:api`, `audit:contato` só no `verify`; E2E não checa opacidade                                                                                                                                                                                  |
| Resultado esperado        | CI = `verify --browser` (exceto ferramentas manuais declaradas)                                                                                                                                                                                                        |
| Proposta                  | Adicionar os passos ao `ci.yml`; criar helper `assertOpaque(page, selector)` em `scripts/lib/browser.mjs` e usá-lo em `e2e-contato`, `e2e-not-found`, `e2e-release-notes`, `e2e-codex`; teste que compare a lista de scripts do `verify.mjs` com os passos do `ci.yml` |
| Arquivos                  | `.github/workflows/ci.yml`, `scripts/lib/browser.mjs`, `scripts/e2e-*.mjs`                                                                                                                                                                                             |
| Dependências              | MEL-01 (senão o CI fica vermelho — o que é desejado, mas planejar a ordem)                                                                                                                                                                                             |
| Complexidade / Prioridade | Baixa / Alta                                                                                                                                                                                                                                                           |
| Riscos                    | Aumento do tempo de CI (estimado em < 1 min)                                                                                                                                                                                                                           |
| Critérios de aceite       | (1) os três comandos aparecem no log do CI; (2) introduzir um erro de tipo em `api/_markdown.ts` reprova o CI; (3) remover `useScrollReveal` de `ContactPage` reprova `audit:contato`                                                                                  |

#### MEL-05 · CSP pronta para modo aplicado

| Campo                     | Conteúdo                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoria                 | Alta (segurança)                                                                                                                                                                                                                                                                                                                                                                                                       |
| Problema                  | P-03                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Situação atual            | `onload` inline; `connect-src 'self'`; `csp.mjs` cego a `on*`                                                                                                                                                                                                                                                                                                                                                          |
| Resultado esperado        | Zero violações nos relatórios por um período combinado, e então T17 (aplicar) sem quebra                                                                                                                                                                                                                                                                                                                               |
| Proposta                  | (1) Remover `onload` inline (MEL-26 resolve por completo; alternativa: script externo de 3 linhas). (2) Acrescentar a origem de `VITE_FORM_ENDPOINT`/`VITE_NEWSLETTER_ENDPOINT` a `connect-src` — como o `vercel.json` é estático, `csp.mjs --check` deve falhar se a env estiver definida e a origem ausente. (3) `csp.mjs` reprova atributos `on*` em HTML do `dist/`. (4) Ler os logs de `/api/csp-report` (humano) |
| Arquivos                  | `apps/web/index.html`, `projects/codex/readme.html`, `vercel.json`, `scripts/csp.mjs`                                                                                                                                                                                                                                                                                                                                  |
| Dependências              | MEL-26 (opcional), MEL-15 (define a origem do formulário)                                                                                                                                                                                                                                                                                                                                                              |
| Complexidade / Prioridade | Média / Alta                                                                                                                                                                                                                                                                                                                                                                                                           |
| Riscos                    | Fonte deixar de carregar (FOUT permanente) se a troca do `onload` for malfeita — validar com `audit:identity` e captura                                                                                                                                                                                                                                                                                                |
| Critérios de aceite       | (1) `grep -E ' on[a-z]+=' apps/web/dist/**/*.html` vazio; (2) `csp:check` cobre handlers inline; (3) 7 dias sem violações relevantes nos logs; (4) após trocar o header para `Content-Security-Policy`, todas as auditorias de navegador passam                                                                                                                                                                        |

#### MEL-06 · Não cachear falhas do GitHub

| Campo                     | Conteúdo                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoria                 | Alta                                                                                                                                                          |
| Problema                  | P-05                                                                                                                                                          |
| Proposta                  | Em `github-stats.ts`, `s-maxage=60` quando `commits` ou `repos` for `null`; em `useGithubStats`, só gravar cache se houver ao menos um valor não nulo         |
| Arquivos                  | `api/github-stats.ts`, `shared/hooks/useGithubStats.ts`, testes                                                                                               |
| Dependências              | MEL-07 (mesmo arquivo; fazer junto)                                                                                                                           |
| Complexidade / Prioridade | Baixa / Alta                                                                                                                                                  |
| Riscos                    | Mais invocações sob falha prolongada (limitadas pelo cache de 60 s)                                                                                           |
| Critérios de aceite       | (1) novo `api/github-stats.test.ts` cobre: sucesso → 3600; falha parcial → 60; exceção → sem cache longo; (2) teste de hook: resposta com nulos não é gravada |

#### MEL-07 · Timeouts nas chamadas externas

| Campo                     | Conteúdo                                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Categoria                 | Alta                                                                                                                                   |
| Problema                  | P-06                                                                                                                                   |
| Proposta                  | Helper `githubFetch(url)` em `api/_http.ts` com `AbortSignal.timeout(3000)` e cabeçalhos; usado por `_releases.ts` e `github-stats.ts` |
| Dependências              | MEL-10 (cria `_http.ts`) — pode vir antes, criando o arquivo aqui                                                                      |
| Complexidade / Prioridade | Baixa / Alta                                                                                                                           |
| Riscos                    | Timeout curto demais gera falso "indisponível" — começar em 3 s e observar logs                                                        |
| Critérios de aceite       | Teste com `fetch` que nunca resolve termina dentro do limite e devolve lista vazia/nulos                                               |

#### MEL-08 · Remover a cascata de traduções (guiado por medição)

| Campo                     | Conteúdo                                                                                                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categoria                 | Alta (performance)                                                                                                                                                                                                                  |
| Problema                  | P-07                                                                                                                                                                                                                                |
| Proposta                  | Medir com `audit:perf` (linha de base); plugin que injete `<link rel="preload" as="fetch" crossorigin>` para o `translations-[hash].json`; medir de novo. Alternativa a avaliar: embutir só o idioma padrão no bundle               |
| Arquivos                  | `apps/web/vite.config.ts`, `index.html` (gerado), `docs/reference/` (registro da medição)                                                                                                                                           |
| Dependências              | —                                                                                                                                                                                                                                   |
| Complexidade / Prioridade | Média / Alta                                                                                                                                                                                                                        |
| Riscos                    | Preload com `crossorigin` divergente do `fetch` gera download duplo — conferir na aba Network                                                                                                                                       |
| Critérios de aceite       | (1) FCP/LCP do `audit:perf` não pioram e melhoram em pelo menos uma das rotas medidas; (2) uma única requisição ao JSON; (3) se não houver ganho, a mudança é revertida e o resultado registrado (como no `PERFORMANCE-2026-08.md`) |

### 10.3 Estruturais

#### MEL-09 · Fonte única de identidade para web, funções e HTML

| Campo                     | Conteúdo                                                                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema                  | P-10, P-14 (e-mail)                                                                                                                                                                                                        |
| Proposta                  | `shared/config/identity.ts` puro (nome, usuário GitHub, repositório, domínio padrão, descrições de SEO pt/en); `profile.ts` passa a derivar dele; `api/*` importam dele; o plugin de HTML preenche o JSON-LD a partir dele |
| Arquivos                  | `shared/config/profile.ts`, `api/github-stats.ts`, `api/_releases.ts`, `api/crawler.ts`, `api/feed.ts`, `index.html`, `apps/web/config/homeMetadata.ts`, `vite.config.ts`                                                  |
| Dependências              | —                                                                                                                                                                                                                          |
| Complexidade / Prioridade | Média / Média                                                                                                                                                                                                              |
| Riscos                    | Import de `apps/web` pelas funções precisa continuar compatível com o builder da Vercel (já acontece com `mergeReleaseNotes`)                                                                                              |
| Critérios de aceite       | `grep -rn '"https-shini"\|"Guilherme Cruz"' api apps/web/index.html` retorna só `identity.ts`/placeholders; `type-check:api` e testes de `crawler`/`feed` verdes; e-mail do autor decidido e único                         |

#### MEL-10 · Consolidar duplicações

| Campo                     | Conteúdo                                                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Problema                  | P-12, P-24                                                                                                                                                                                                                                                                                                   |
| Proposta                  | (a) um hook de revelação baseado em ref (`useRevealOnScroll`) e remoção de `useScrollReveal`, com cada widget responsável pela própria revelação; (b) `useReducedMotion` devolvendo `boolean` e substituindo os `matchMedia` avulsos; (c) um `getUsedTags`; (d) `api/_http.ts` com tipos, `esc` e cabeçalhos |
| Dependências              | MEL-01 (correção mínima antes), MEL-04 (proteção)                                                                                                                                                                                                                                                            |
| Complexidade / Prioridade | Baixa-média / Média                                                                                                                                                                                                                                                                                          |
| Riscos                    | Mudança visual de timing do reveal — comparar com `scripts/geometry.mjs` e `audit:identity`                                                                                                                                                                                                                  |
| Critérios de aceite       | Arquivos duplicados removidos; `grep -c 'prefers-reduced-motion' src/**/*.tsx` só no hook; todas as auditorias verdes                                                                                                                                                                                        |

#### MEL-11 · Unificar a internacionalização

| Campo                     | Conteúdo                                                                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Problema                  | P-11                                                                                                                                                                                                                     |
| Proposta                  | Migrar ternários inline para chaves (`translations.json`) ou `Localized` (dados), arquivo por arquivo: Codex → Footer → RecommendationModal → Featured → demais. Depois, regra de lint que proíba `lang === "pt"` em JSX |
| Dependências              | —                                                                                                                                                                                                                        |
| Complexidade / Prioridade | Média / Média                                                                                                                                                                                                            |
| Riscos                    | Chaves faltando em um idioma — os testes de completude existentes (`staticContent.test.ts`) devem cobrir as novas                                                                                                        |
| Critérios de aceite       | `grep -rc 'lang === "pt"' src --include=*.tsx` = 0 fora de `LangContext`; testes de completude bilíngue verdes                                                                                                           |

#### MEL-12 · Limpar resíduos

| Campo                     | Conteúdo                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema                  | P-08, P-25                                                                                                                                                                            |
| Proposta                  | Corrigir comentários de `comum.tsx`/`main.tsx`/`LangContext`/`ThemeContext`; podar `.gitignore`; mover ou remover `scripts/qr.diff.md`; consolidar `routes.test.ts`/`.tsx`            |
| Complexidade / Prioridade | Baixa / Média                                                                                                                                                                         |
| Critérios de aceite       | Nenhuma referência a `rotaHtmlPlugin`, `prerender`, `qr.mjs`, `apps/desktop`, `apps/mobile` fora de `docs/reference/` e `CHANGELOG.md`; contagem de testes inalterada após consolidar |

#### MEL-13 · Decompor componentes grandes (oportunista)

| Campo                     | Conteúdo                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Problema                  | P-26                                                                                                               |
| Proposta                  | Ao tocar `Codex`, extrair conteúdo para `Codex.data.ts` (pareia com MEL-11); `Footer` em subcomponentes por coluna |
| Complexidade / Prioridade | Média / Baixa                                                                                                      |
| Critérios de aceite       | Nenhum arquivo de componente > 400 linhas entre os tocados; snapshot de geometria inalterado                       |

#### MEL-14 · Endurecer o workflow

| Campo                     | Conteúdo                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Problema                  | P-22                                                                                        |
| Proposta                  | `permissions: { contents: read }`, `timeout-minutes` por job; avaliar fixar actions por SHA |
| Complexidade / Prioridade | Baixa / Baixa                                                                               |
| Critérios de aceite       | CI verde com as permissões reduzidas                                                        |

### 10.4 Funcionais

#### MEL-15 · Backend de contato (`api/contact.ts`)

| Campo                     | Conteúdo                                                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema                  | DT-9; formulário desligado em produção; referência à issue #45 em `pages/Contact/index.tsx`                                                                                                                                   |
| Proposta                  | Função própria que valide (nome, e-mail, tamanho), aplique honeypot e limite por IP, e entregue via provedor de e-mail transacional ou Formspree no servidor (segredo server-only). Mantém `connect-src 'self'`               |
| Dependências              | Decisão humana sobre provedor; MEL-07 (timeouts)                                                                                                                                                                              |
| Complexidade / Prioridade | Média / Média                                                                                                                                                                                                                 |
| Riscos                    | Spam; custo; LGPD (texto de privacidade)                                                                                                                                                                                      |
| Critérios de aceite       | Testes de validação/limite; 20 envios seguidos do mesmo IP recebem 429 a partir do limite; formulário visível em `/contato` e na home; `audit:a11y` cobre o estado de erro (fecha a lacuna descrita em `scripts/a11y.mjs:66`) |

#### MEL-16 · Decidir a newsletter

| Campo                     | Conteúdo                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Problema                  | P-17                                                                                                                        |
| Proposta                  | (a) provedor com double opt-in + descadastro + aviso de privacidade; ou (b) remover o bloco do rodapé até haver conteúdo    |
| Complexidade / Prioridade | Média / Média                                                                                                               |
| Critérios de aceite       | Decisão registrada; em (a) inscrição real confirmada por e-mail; em (b) testes e textos do bloco removidos sem chaves órfãs |

#### MEL-17 · Sitemap sem âncoras (T03)

| Campo                     | Conteúdo                                                                |
| ------------------------- | ----------------------------------------------------------------------- |
| Problema                  | P-09                                                                    |
| Proposta                  | Remover o laço `SECTION_IDS` do `sitemapPlugin`                         |
| Complexidade / Prioridade | Baixa / Média                                                           |
| Critérios de aceite       | `dist/sitemap.xml` sem `#`; contagem de `<url>` = rotas reais + versões |

#### MEL-18 · Cartões de compartilhamento bilíngues

| Campo                     | Conteúdo                                                                        |
| ------------------------- | ------------------------------------------------------------------------------- |
| Problema                  | P-16                                                                            |
| Proposta                  | Repassar `lang` no rewrite de crawler e escolher textos/`og:locale` por idioma  |
| Dependências              | MEL-09                                                                          |
| Complexidade / Prioridade | Baixa / Baixa                                                                   |
| Critérios de aceite       | `crawler.test.ts` cobre `?lang=en` com título/descrição em inglês e `lang="en"` |

#### MEL-19 · Feed tolerante a dados ruins

| Campo                     | Conteúdo                                                   |
| ------------------------- | ---------------------------------------------------------- |
| Problema                  | P-20                                                       |
| Proposta                  | Validar datas e descartar entradas inválidas com aviso     |
| Complexidade / Prioridade | Baixa / Baixa                                              |
| Critérios de aceite       | `feed.test.ts` com data inválida devolve 200 sem a entrada |

#### MEL-20 · Endurecer `/api/csp-report`

| Campo                     | Conteúdo                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| Problema                  | P-15                                                                                               |
| Proposta                  | Limite de tamanho do corpo, de violações por requisição (ex.: 20) e saneamento de quebras de linha |
| Complexidade / Prioridade | Baixa / Baixa                                                                                      |
| Critérios de aceite       | `csp-report.test.ts` cobre corpo grande, array longo e campos com `\n`                             |

### 10.5 Visuais / UX

#### MEL-21 · Formulário com feedback completo

| Campo                     | Conteúdo                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Problema                  | P-18                                                                                                     |
| Proposta                  | Foco no primeiro campo inválido, `maxLength`, contador na mensagem, preservação do texto em erro de rede |
| Dependências              | MEL-15 (limites do backend)                                                                              |
| Complexidade / Prioridade | Baixa / Baixa                                                                                            |
| Critérios de aceite       | Testes de `ContactForm` cobrem foco e limites; axe sem violações no estado de erro                       |

#### MEL-22 · Fallback de carregamento das rotas lazy

| Campo                     | Conteúdo                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| Problema                  | P-30                                                                                               |
| Proposta                  | Componente `RouteFallback` com altura mínima e indicador discreto (sem animação em reduced motion) |
| Complexidade / Prioridade | Baixa / Baixa                                                                                      |
| Critérios de aceite       | Com rede estrangulada, a navegação mostra o fallback; CLS medido não piora                         |

#### MEL-23 · axe em estados interativos (T19)

| Campo                     | Conteúdo                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Proposta                  | Estender `audit:a11y` a menu mobile aberto, modais abertos, formulário com erro, accordion expandido |
| Dependências              | MEL-15 para o estado de formulário                                                                   |
| Complexidade / Prioridade | Média / Média                                                                                        |
| Critérios de aceite       | Novos estados no `a11y-baseline.json` com zero violações                                             |

#### MEL-24 · Remover afordância falsa dos chips (T05)

| Campo                     | Conteúdo                                                                        |
| ------------------------- | ------------------------------------------------------------------------------- |
| Problema                  | P-29                                                                            |
| Proposta                  | Retirar elevação/borda no `:hover` de `.linktree__chip`                         |
| Complexidade / Prioridade | Baixa / Baixa                                                                   |
| Critérios de aceite       | `audit:identity` atualizado intencionalmente; sem `:hover` em `.linktree__chip` |

#### MEL-25 · Navegação para âncoras via roteador

| Campo                     | Conteúdo                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| Problema                  | P-19                                                                |
| Proposta                  | `navigate()` preserva `hash` e rola até o alvo após a troca de rota |
| Complexidade / Prioridade | Baixa / Baixa                                                       |
| Critérios de aceite       | `RouterContext.test.tsx` cobre `navigate("/#contato")`              |

### 10.6 Tecnológicas

#### MEL-26 · Autoalojar as fontes do Fontshare

| Campo                     | Conteúdo                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema                  | P-21, parte de P-03                                                                                                                                                                       |
| Proposta                  | Após validar a licença ITF (humano), baixar WOFF2 dos pesos usados, subset latino, servir de `/assets/fonts`, `font-display: swap`, `preload` da fonte do LCP; remover `fontshare` da CSP |
| Dependências              | Validação de licença                                                                                                                                                                      |
| Complexidade / Prioridade | Média / Média                                                                                                                                                                             |
| Riscos                    | Licença; aumento do orçamento de bundle (fontes não contam como JS, mas conferir `audit:bundle`)                                                                                          |
| Critérios de aceite       | Nenhuma requisição a `fontshare.com`; CSP sem os dois hosts; LCP de `audit:perf` igual ou melhor; `audit:identity` sem regressão                                                          |

#### MEL-27 · Atualizações automatizadas e controladas

| Campo                     | Conteúdo                                                                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proposta                  | Dependabot (ou Renovate) semanal agrupado por ecossistema, com o CI completo como portão; exceções para pacotes fixados por decisão (`vite`, `@vitejs/plugin-react`, `esbuild`, `typescript` 5.x na raiz) |
| Complexidade / Prioridade | Baixa / Média                                                                                                                                                                                             |
| Riscos                    | Ruído de PRs; atualizações que passam no CI mas mudam visual — por isso `audit:identity` e `audit:layers`                                                                                                 |
| Critérios de aceite       | Arquivo de configuração versionado; primeiro ciclo de PRs mergeado pelo fluxo local do `CONTRIBUTING.md`                                                                                                  |

#### MEL-28 · Avaliar React 19 (sem pressa)

| Campo                     | Conteúdo                                                                                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proposta                  | Abrir branch de avaliação quando houver motivo concreto (ex.: biblioteca exigir, ou recurso como `useActionState` para o formulário). Hoje o ganho é baixo e o custo inclui tipos, testes e `StrictMode` |
| Complexidade / Prioridade | Média / Baixa                                                                                                                                                                                            |
| Critérios de aceite       | Relatório de avaliação com bundle, `audit:perf` e testes antes/depois; decisão registrada                                                                                                                |

### 10.7 Futuras / estratégicas

#### MEL-29 · Observabilidade mínima

| Campo                     | Conteúdo                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Problema                  | P-28; backlog T10/T11                                                                                                       |
| Proposta                  | Analytics sem cookies (provedor a decidir), Web Vitals de campo e endpoint `api/client-error` para erros do `ErrorBoundary` |
| Dependências              | MEL-03, MEL-05 (CSP precisa liberar o provedor)                                                                             |
| Complexidade / Prioridade | Média / Média                                                                                                               |
| Critérios de aceite       | Eventos dos 5 marcos do T11 visíveis no painel; erros do cliente chegando ao log                                            |

#### MEL-30 · Cases e serviços (T12–T15)

| Campo                     | Conteúdo                                                                                                                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proposta                  | Seguir o plano do backlog de agosto: modelo de dados de cases, rota `/case/[slug]` a partir do molde de `pages/ReleaseNote`, `/servicos`. Cada nova rota exige: `ROUTES`, caso em `routes.tsx`, rewrite em `vercel.json`, entrada no sitemap, metadados no crawler e auditoria E2E |
| Dependências              | MEL-09, MEL-11, MEL-04                                                                                                                                                                                                                                                             |
| Complexidade / Prioridade | Alta / Média                                                                                                                                                                                                                                                                       |
| Critérios de aceite       | Checklist de rota nova (acima) cumprido e coberto por teste                                                                                                                                                                                                                        |

---

## 11. Novas funcionalidades sugeridas

Somente funcionalidades com valor demonstrável para o objetivo do site (gerar oportunidades), coerentes com a direção registrada em `AUDITORIA-2026-08.md` §23–24 (que desaconselha blog, mais animação e mais dependências).

| ID    | Funcionalidade                                      | Valor                                          | Relação           |
| ----- | --------------------------------------------------- | ---------------------------------------------- | ----------------- |
| NF-01 | Formulário de contato funcional com backend próprio | canal direto sem abrir cliente de e-mail       | MEL-15            |
| NF-02 | Páginas de estudo de caso (`/case/[slug]`)          | prova de competência além da lista de projetos | MEL-30, T12–T14   |
| NF-03 | Página de serviços (`/servicos`)                    | canal comercial para freelance                 | MEL-30, T15       |
| NF-04 | Painel de métricas próprias (analytics sem cookies) | decisões guiadas por dado                      | MEL-29, T10–T11   |
| NF-05 | Cartões de compartilhamento em inglês               | alcance internacional do `?lang=en`            | MEL-18            |
| NF-06 | Demo do "tradutor fiscal" (T27–T33)                 | lastro do eixo "AI & Automation" do herói      | backlog existente |

---

## 12. Atualizações tecnológicas

| Item                          | Situação atual                         | Recomendação                                      | Justificativa                                                                |
| ----------------------------- | -------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| React 18 → 19                 | 18.3                                   | **Não agora** (MEL-28)                            | Sem necessidade funcional; risco > ganho                                     |
| TypeScript 5.x                | 5.x (raiz fixa por motivo documentado) | **Manter 5.x** até o builder da Vercel suportar 7 | Quebra documentada no README (`readFile` undefined)                          |
| Vite / plugin-react / esbuild | versões fixas                          | Atualizar via MEL-27, um por vez                  | São fixados de propósito; cada salto passa por `audit:bundle` e `audit:perf` |
| `@vercel/og`                  | 1.0.1                                  | Manter; confirmar `npm audit` limpo (humano/CI)   | A vulnerabilidade de agosto era na faixa 0.10–0.11                           |
| Fontes Fontshare              | remotas                                | Autoalojar (MEL-26)                               | LCP, CSP, privacidade                                                        |
| Roteador próprio              | ~90 linhas                             | **Manter**                                        | Poucas rotas estáticas; dependência zero é um ativo                          |
| Dependabot/Renovate           | ausente                                | Adotar (MEL-27)                                   | Atualizações previsíveis em vez de saltos grandes                            |

---

## 13. Riscos identificados e pontos para validação humana

### 13.1 Riscos

| Risco                                                        | Probabilidade | Impacto | Mitigação                                                     |
| ------------------------------------------------------------ | ------------- | ------- | ------------------------------------------------------------- |
| `/contato` invisível em produção (P-01)                      | Alta [I]      | Alto    | MEL-01 imediatamente após confirmação                         |
| Tela branca por chunk ausente após deploy (P-02)             | Média         | Alto    | MEL-03                                                        |
| Aplicar a CSP sem MEL-05 quebrar fontes e formulário         | Alta se feito | Alto    | MEL-05 é pré-requisito explícito de T17                       |
| Regressão em `api/` sem portão no CI                         | Média         | Médio   | MEL-04                                                        |
| Métricas presas em fallback por 1–2 h                        | Média         | Baixo   | MEL-06                                                        |
| Hash da CSP desatualizado após mexer no script inline        | Média         | Médio   | `csp:check` já no CI — manter                                 |
| Refatorações de i18n/reveal mudarem o visual                 | Média         | Médio   | `audit:identity`, `audit:layers`, `geometry.mjs` antes/depois |
| Coleta de dados pessoais sem base legal (newsletter/contato) | Média         | Médio   | MEL-15/16 com aviso de privacidade                            |

### 13.2 Pontos que dependem de validação humana

1. **Confirmar P-01 no navegador:** abrir `https://gcruz.dev.br/contato` e verificar se o conteúdo aparece.
2. **Executar as portas** (não executadas nesta análise): `npm ci --include=dev && npm run verify -- --browser`, incluindo `npm audit`.
3. **Variáveis efetivas na Vercel:** `VITE_FORM_ENDPOINT` está mesmo ausente (como afirma `pages/Contact/index.tsx`)? `GITHUB_TOKEN` está presente?
4. **Logs de `/api/csp-report`:** quais violações estão chegando (espera-se a do `onload` inline).
5. **E-mail oficial do autor:** `contato@gcruz.dev.br` (`profile.ts`) ou `contato.guilhermescruz@gmail.com` (README antigo). O novo README usa o do `profile.ts`.
6. **Licença ITF** das fontes Cabinet Grotesk e General Sans para autoalojamento (MEL-26).
7. **Aviso do LinkedIn:** a "indisponibilidade temporária durante a verificação de identidade" ainda vale? Se não, o fluxo pode ser desligado sem remover o código (flag).
8. **Newsletter:** manter com backend ou remover (MEL-16).
9. **Provedor de analytics** sem cookies e texto de privacidade (MEL-29).
10. **HSTS:** a Vercel aplica por padrão em domínios próprios; confirmar o header em produção antes de decidir declará-lo no `vercel.json`.
11. **Fluxo de branches:** o `CONTRIBUTING.md` define commits diretos na `main`; o roadmap recomenda PR para as fases 1–3 (ver estratégia). Decisão do autor.

---

## 14. Dependências entre melhorias

```
MEL-02 ──► MEL-03 ──► MEL-29
MEL-01 ──► MEL-04 ──► MEL-10 ──► MEL-30
              │
MEL-07 ──► MEL-06
MEL-26 ─┐
MEL-15 ─┼─► MEL-05 ──► (T17: aplicar CSP) ──► MEL-29
        └─► MEL-21, MEL-23
MEL-09 ──► MEL-18
MEL-09 ─┐
MEL-11 ─┴─► MEL-13, MEL-30
MEL-08, MEL-12, MEL-14, MEL-17, MEL-19, MEL-20, MEL-22, MEL-24, MEL-25, MEL-27: independentes
```

| Melhoria | Depende de                    | Bloqueia                        |
| -------- | ----------------------------- | ------------------------------- |
| MEL-01   | —                             | MEL-04 (verde), MEL-10          |
| MEL-02   | —                             | MEL-03                          |
| MEL-03   | MEL-02                        | MEL-29                          |
| MEL-04   | MEL-01                        | MEL-10, MEL-30                  |
| MEL-05   | MEL-26 ou alternativa; MEL-15 | aplicar CSP, MEL-29             |
| MEL-06   | MEL-07                        | —                               |
| MEL-09   | —                             | MEL-18, MEL-30                  |
| MEL-11   | —                             | MEL-13, MEL-30                  |
| MEL-15   | decisão humana                | MEL-05 (origem), MEL-21, MEL-23 |

---

## 15. Recomendações estratégicas

1. **Corrigir antes de evoluir.** As três críticas (MEL-01 a 03) custam horas e eliminam os únicos cenários de "página vazia" encontrados.
2. **Fechar a distância entre `verify` e CI.** O projeto já tem as ferramentas certas; o risco está no que roda só na máquina do autor. Regra: todo script novo em `verify.mjs` entra no `ci.yml` no mesmo commit (um teste pode garantir isso).
3. **Tratar a CSP como projeto, não como chave.** Report-Only → corrigir violações → aplicar. MEL-05 é a ponte que falta.
4. **Medir antes de otimizar** — manter a cultura de `PERFORMANCE-2026-08.md`. MEL-08 e MEL-26 só entram com antes/depois de `audit:perf`.
5. **Preservar o que é diferencial:** duas dependências de runtime, roteador próprio, design system, auditorias versionadas, histórico de versões curado. Nenhuma recomendação deste documento troca essas escolhas.
6. **Refatorar de forma oportunista.** P-11, P-12 e P-26 são reais, mas se pagam melhor quando o arquivo já vai ser tocado por uma funcionalidade.
7. **Toda rota nova segue um checklist único** (MEL-30): `ROUTES` → `routes.tsx` → `vercel.json` (SPA + crawler) → sitemap → `crawler.ts` → `useDocumentMeta` → E2E no CI. A regressão de `/contato` (commit `7080c1b`) e a de agora (P-01) vieram de passos esquecidos dessa lista.

---

## 16. Conclusão técnica

O projeto está **acima da média** em engenharia para um portfólio: arquitetura coerente, decisões justificadas no código, testes e auditorias de navegador que muitos produtos comerciais não têm. As fragilidades encontradas estão concentradas em **robustez de borda** (erros sem tratamento, cache de falhas, ausência de timeout), **lacunas de portão** (CI × `verify`, E2E cego a opacidade) e **resíduos de documentação** após a consolidação de outubro.

Nenhum problema exige mudança de arquitetura. O caminho recomendado é: Fase 1 (críticas + portões) em poucas horas, Fase 2–3 para fundação e performance com medição, e só então funcionalidades novas — cada uma pelo checklist de rota e com critérios de aceite verificáveis, conforme o [`ROADMAP_DE_IMPLEMENTACAO.md`](ROADMAP_DE_IMPLEMENTACAO.md).
