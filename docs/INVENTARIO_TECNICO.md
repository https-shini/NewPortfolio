# Inventário técnico — NewPortfolio

> **Natureza:** documento **vivo** (atualizar quando a estrutura mudar).
> **Base:** leitura estática do repositório no commit `7080c1b` (branch `main`), em 2026-11-08.
> **Convenção:** **[E]** = encontrado no código · **[I]** = inferido a partir do código · **[R]** = recomendação.
> Nada aqui foi medido em execução nesta análise — ver §12.

---

## 1. Identificação

| Item           | Valor                                                                  | Fonte                                    |
| -------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| Nome           | `NewPortfolio` (raiz) · `portfolio-frontend` (workspace)               | `package.json`, `apps/web/package.json`  |
| Versão         | `2.0.0` (as duas `package.json` e a 1ª entrada de `releaseNotes.json`) | idem + `shared/config/releaseNotes.json` |
| Tipo           | SPA estática + funções serverless (Vercel)                             | `vercel.json`, `api/`                    |
| Produção       | `https://gcruz.dev.br`                                                 | `profile.ts`, `vite.config.ts`           |
| Licença        | MIT                                                                    | `LICENSE`                                |
| Gerenciador    | npm `11.6.2` (workspaces `apps/*`, `packages/*`)                       | `package.json`                           |
| Node suportado | `^22.22.1 \|\| ^24.11.1` (recomendado `24.11.1` em `.nvmrc`)           | `package.json`, `.nvmrc`                 |
| Histórico      | 51 commits; de 2026-08-31 a 2026-10-29 no histórico atual              | `git log`                                |
| Banco de dados | **Nenhum** [E]                                                         | —                                        |
| Autenticação   | **Nenhuma** no site (público) [E]; previews da Vercel exigem login [E] | `CONTRIBUTING.md`                        |

---

## 2. Linguagens e volume

| Linguagem / artefato        | Arquivos                | Linhas (aprox.) | Onde                                                         |
| --------------------------- | ----------------------- | --------------- | ------------------------------------------------------------ |
| TypeScript/TSX (sem testes) | —                       | 15.066          | `apps/web/src`                                               |
| Testes (Vitest)             | 53                      | 5.908           | 48 em `apps/web/src`, 5 em `api/`                            |
| TypeScript serverless       | 9 (+5 testes)           | ~1.000          | `api/`                                                       |
| CSS puro                    | 35                      | 14.162          | `apps/web/src/**/*.css`                                      |
| Scripts Node (`.mjs`)       | 21 (+`lib/browser.mjs`) | ~3.700          | `scripts/`                                                   |
| HTML de entrada             | 2                       | 560             | `apps/web/index.html`, `apps/web/projects/codex/readme.html` |
| JSON de conteúdo            | 2                       | 65 KB           | `translations.json` (34 KB), `releaseNotes.json` (31 KB)     |

---

## 3. Dependências

### 3.1 Runtime

| Pacote       | Versão    | Onde roda                 | Uso                          |
| ------------ | --------- | ------------------------- | ---------------------------- |
| `react`      | `^18.3.1` | navegador                 | UI                           |
| `react-dom`  | `^18.3.1` | navegador                 | renderização (`createRoot`)  |
| `@vercel/og` | `1.0.1`   | função `api/og.ts` (Node) | imagem Open Graph por versão |

### 3.2 Desenvolvimento (principais)

| Pacote                                                                        | Versão                           | Papel                                            |
| ----------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| `vite`                                                                        | `8.3.5` (fixa)                   | bundler (Rolldown), dev server, plugins próprios |
| `@vitejs/plugin-react`                                                        | `6.1.2` (fixa)                   | JSX automático                                   |
| `typescript`                                                                  | `^5.6.3` (web) · `^5.9.3` (raiz) | tipos; a raiz fixa 5.x para o builder da Vercel  |
| `vitest` · `jsdom`                                                            | `4.1.12` · `^29.1.1`             | testes de unidade/componente                     |
| `@testing-library/react` · `user-event` · `jest-dom`                          | `^16.3.2` · `^14.6.1` · `^6.9.1` | testes de componente                             |
| `eslint` · `typescript-eslint` · `jsx-a11y` · `react-hooks` · `react-refresh` | 9 · 8 · 6 · 7 · 0.5              | lint                                             |
| `prettier`                                                                    | `^3.9.5`                         | formatação                                       |
| `husky` · `lint-staged` · `@commitlint/*`                                     | 9 · 17 · 21                      | hooks de commit, Conventional Commits            |
| `playwright` · `axe-core`                                                     | `^1.62.1` · `^4.13.0`            | auditorias de navegador (a11y, e2e, perf)        |
| `@fontsource/jetbrains-mono`                                                  | `^5.3.0`                         | fonte mono autoalojada                           |
| `esbuild`                                                                     | `0.28.2` (fixa)                  | `cssMinify`                                      |

### 3.3 Recursos de terceiros carregados em execução

| Recurso                                   | Onde                                                    | Observação                                                              |
| ----------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Fontshare (Cabinet Grotesk, General Sans) | `index.html:96-110`, `projects/codex/readme.html:68-80` | CSS em `api.fontshare.com`, fontes em `cdn.fontshare.com`; fonte do LCP |
| API do GitHub                             | `api/github-stats.ts`, `api/_releases.ts`               | somente no servidor; token opcional                                     |
| Formspree (ou similar)                    | `ContactForm.tsx` via `VITE_FORM_ENDPOINT`              | **não configurado em produção** segundo `pages/Contact/index.tsx`       |
| Endpoint de newsletter                    | `NewsletterForm.tsx` via `VITE_NEWSLETTER_ENDPOINT`     | sem backend; degrada para `mailto:`                                     |
| `capsule-render`, `shields.io`            | somente no `README.md`                                  | não afeta o site                                                        |

---

## 4. Estrutura de diretórios

```
.
├── api/                       # Funções serverless (Vercel, runtime Node)
├── apps/web/                  # Única aplicação do monorepo (workspace)
│   ├── config/                # Código de build: 404.html, metadados, lastmod, documentos privados
│   ├── index.html             # Documento principal (SEO, JSON-LD, bootstrap de tema)
│   ├── projects/codex/        # Segundo documento HTML (página técnica do TCC Codex)
│   ├── public/                # Estáticos: ícones, manifest, OG, PDFs (3,1 MB), capturas do Codex
│   ├── src/
│   │   ├── app/               # Providers (Router, Theme, Lang) e tabela de rotas
│   │   ├── entradas/          # Bootstrap: fontes, CSS global, carga de traduções, montagem
│   │   ├── pages/             # 8 páginas
│   │   ├── widgets/           # 11 seções/blocos
│   │   ├── shared/            # config · hooks · lib · styles · ui
│   │   ├── assets/            # WebP e SVGs importados pelo bundle (884 KB)
│   │   └── test/setup.ts
│   ├── vite.config.ts         # Plugins próprios: site URL, sitemap/robots, 404, alias Codex, documentos privados
│   └── eslint.config.js · tsconfig.json
├── scripts/                   # 21 automações (auditorias Playwright, geração de ícones/imagens, CSP, changelog, verify)
├── docs/                      # guides/ (vivo) · reference/ (congelado) · estes documentos
├── .github/                   # CI, templates de issue e PR
├── .husky/                    # pre-commit (lint-staged) e commit-msg (commitlint)
├── vercel.json                # Rewrites, roteamento por user-agent, headers de segurança
├── tsconfig.api.json · eslint.config.api.js  # Tipos e lint das funções
└── CHANGELOG.md · CONTRIBUTING.md · CODEOWNERS · LICENSE
```

---

## 5. Módulos do frontend

### 5.1 Camada `app/`

| Arquivo                | Responsabilidade                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `App.tsx`              | `Providers` + `Routes`                                                                   |
| `providers.tsx`        | `RouterProvider` → `ThemeProvider` → `LangProvider`                                      |
| `RouterContext.tsx`    | Roteador próprio sobre History API (`path`, `navigate`, `isHome`), sem dependência       |
| `ThemeContext.tsx`     | Tema dark/light, persistência em `localStorage`, `prefers-color-scheme`, `theme-color`   |
| `LangContext.tsx`      | Idioma pt/en, `?lang=en` na URL, `t(key)`, persistência                                  |
| `routes.tsx`           | Mapa `path → página`; secundárias por `React.lazy`; uma instância de `AmbientBackground` |
| `releaseNotesRoute.ts` | Casamento de `/release-notes`, `/release-notes/page/N`, `/release-notes/vX.Y.Z`          |

### 5.2 Páginas (`pages/`)

| Página           | Rota(s)                                                                        | Carga    | Observação                                              |
| ---------------- | ------------------------------------------------------------------------------ | -------- | ------------------------------------------------------- |
| `Home`           | `/`                                                                            | síncrona | 8 seções por âncora + Header/Footer                     |
| `Links`          | `/links`                                                                       | lazy     | autônoma (sem Header/Footer)                            |
| `Contact`        | `/contato`                                                                     | lazy     | reutiliza o widget `Contact` com `headingLevel={1}`     |
| `ReleaseNotes`   | `/release-notes`, `/release-notes/page/N`                                      | lazy     | índice paginado de 4 em 4                               |
| `ReleaseNote`    | `/release-notes/vX.Y.Z`                                                        | lazy     | permalink por versão                                    |
| `Codex`          | `/projects/codex/readme.html`, `/projects/codex`, `/projects/codex/index.html` | lazy     | 810 linhas; também é um documento HTML próprio no build |
| `LinkedInNotice` | `/linkedin?to=…`                                                               | lazy     | aviso antes de abrir o perfil; anti open-redirect       |
| `NotFound`       | qualquer outra                                                                 | lazy     | também gerada como `dist/404.html` no build             |

### 5.3 Widgets (`widgets/`)

| Widget            | Linhas (tsx) | Testes de unidade   | Destaques                                        |
| ----------------- | ------------ | ------------------- | ------------------------------------------------ |
| `Header`          | 353          | sim                 | scroll spy, menu mobile com focus trap           |
| `Hero`            | 208          | sim                 | foto com `srcset`, CTAs, CV por idioma           |
| `About`           | 529          | sim                 | stats com count-up (`setInterval`), stack        |
| `Timeline`        | +components  | só dados/datas      | carreira derivada de datas ISO `YYYY-MM`         |
| `Formacoes`       | 220          | sim                 | filtros por aba, limite expansível               |
| `Featured`        | 511          | sim                 | carrossel com autoplay, lightbox lazy            |
| `Work`            | 197          | sim                 | grade de projetos                                |
| `Recommendations` | 247          | sim                 | carrossel paginado + modal lazy                  |
| `Contact`         | 381          | só `ContactForm`    | CTA de e-mail, formulário condicionado a env     |
| `Footer`          | 598          | só `NewsletterForm` | navegação, newsletter, badge de versão           |
| `ReleaseNotes`    | 288          | sim                 | accordion, filtro por tag, selo de sincronização |

### 5.4 `shared/`

| Pasta     | Conteúdo                                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `config/` | `profile.ts` (identidade), `links.ts` (URLs públicas), `routes.ts` (rotas, idioma na URL, `SECTION_IDS`), `constants.ts` (aliases, endpoints por env, chaves de storage), `linkedin.ts`, `releaseNotes.json` + `releaseNotes.ts`/`releaseNotesClient.ts`/`releaseNotesModel.ts`, `skillIcons.ts` |
| `hooks/`  | `useDocumentMeta`, `useFocusTrap`, `useGithubStats`, `useInertBackground`, `useLang`, `useLinkProps`, `useReducedMotion`, `useReleaseNotes`, `useRevealOnScroll`, `useRoute`, `useScrollLock`, `useScrollReveal`, `useTheme`                                                                     |
| `lib/`    | `translations.json` + `translations.ts` + `loadTranslations.ts`, `cache.ts` (sessionStorage com TTL), `mergeReleaseNotes.ts`, `richText.tsx`, `dateUtils.ts`, `academicDates.ts`, `mailto.ts`, `text.ts`, `localized.ts`, `smoothScroll.ts`, `highlightText.tsx`                                 |
| `styles/` | `tokens.css` → `globals.css` → `theme-patches.css` (ordem obrigatória)                                                                                                                                                                                                                           |
| `ui/`     | `Modal`, `Accordion`, `AmbientBackground` (+ `useAmbientMotion`), `LinkedInNotice`, `Logo`, `SkillIcon`, `ProfileLink`, `ScrollUtils`, `Icons.tsx` (64 ícones exportados)                                                                                                                        |

---

## 6. Funções serverless (`api/`)

| Rota pública              | Arquivo                                            | Entrada                               | Saída / cache                                                      | Dependência externa               |
| ------------------------- | -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| `/api/github-stats`       | `github-stats.ts`                                  | —                                     | `{commits, repos}` · `s-maxage=3600, swr=86400`                    | GitHub (Search + Users)           |
| `/api/release-notes`      | `release-notes.ts`                                 | —                                     | `{releases:[{version,date,title,html,url}]}` · 1h, ou 60s se vazio | GitHub Releases                   |
| `/feed.xml` → `/api/feed` | `feed.ts`                                          | —                                     | Atom (pt-BR) · 1h                                                  | GitHub Releases                   |
| `/api/crawler`            | `crawler.ts`                                       | `?path=` (via rewrite por user-agent) | HTML só com meta tags · 1h                                         | GitHub Releases (rotas de versão) |
| `/api/og`                 | `og.ts`                                            | `?v=X.Y.Z[-pre]` (validado por regex) | PNG 1200×630 · `max-age=3600, s-maxage=86400`                      | —                                 |
| `/api/csp-report`         | `csp-report.ts`                                    | POST `report-uri` / `report-to`       | 204; violações vão para o log                                      | —                                 |
| (privados, prefixo `_`)   | `_releases.ts`, `_releaseNotes.ts`, `_markdown.ts` | —                                     | busca compartilhada, dados editoriais, markdown → HTML seguro      | —                                 |

As funções importam código do frontend (`apps/web/src/shared/lib/mergeReleaseNotes.ts`, `releaseNotes.json`, `releaseNotesModel.ts`) por caminho relativo [E].

---

## 7. Roteamento na borda (`vercel.json`)

| Origem                                                                                  | Destino                            | Condição                                 |
| --------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------- |
| `/links`, `/release-notes`, `/release-notes/*`, `/contato`                              | `/api/crawler?path=…`              | user-agent de rede social/robô de prévia |
| `/links`, `/contato`, `/release-notes`, `/release-notes/*`, `/linkedin` (com e sem `/`) | `/index.html`                      | demais                                   |
| `/feed.xml`                                                                             | `/api/feed`                        | —                                        |
| `/projects/codex/readme.html` e `/projects/codex/`                                      | arquivos estáticos do build        | (gerados por `vite.config.ts`)           |
| demais                                                                                  | `dist/404.html` (padrão da Vercel) | —                                        |

**Headers globais [E]:** `Content-Security-Policy-Report-Only`, `Reporting-Endpoints`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` restritiva. `/assets/*` com `max-age=31536000, immutable`.

---

## 8. Build (`apps/web/vite.config.ts`)

| Plugin próprio           | O que faz                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `siteUrlHtmlPlugin`      | substitui `__SITE_URL__` e preenche metadados da home no HTML                                        |
| `sitemapPlugin`          | gera `dist/sitemap.xml` (lastmod via `git log`) e `dist/robots.txt`                                  |
| `notFoundPlugin`         | gera `dist/404.html` a partir do `index.html`                                                        |
| `codexPageAliasPlugin`   | copia `projects/codex/readme.html` para `projects/codex/index.html`                                  |
| `privateDocumentsPlugin` | bloqueia documentos privados do Codex no dev/preview e falha o build se existirem no `public`/`dist` |

Entradas: `index.html` (`main`) e `projects/codex/readme.html` (`codex`). Chunk `vendor` isolado para React. `__APP_VERSION__` injetado do `package.json`.

---

## 9. Variáveis de ambiente

| Variável                   | Escopo          | Obrigatória | Lida em                                                         | Efeito sem ela                               |
| -------------------------- | --------------- | ----------- | --------------------------------------------------------------- | -------------------------------------------- |
| `VITE_FORM_ENDPOINT`       | build/browser   | não         | `shared/config/constants.ts`                                    | `ContactForm` não renderiza                  |
| `VITE_NEWSLETTER_ENDPOINT` | build/browser   | não         | `shared/config/constants.ts`                                    | inscrição vira `mailto:`                     |
| `VITE_SITE_URL`            | build + funções | não         | `vite.config.ts`, `profile.ts`, `api/crawler.ts`, `api/feed.ts` | `https://gcruz.dev.br`                       |
| `GITHUB_TOKEN`             | servidor        | não         | `api/github-stats.ts`, `api/_releases.ts`                       | limite de 60 req/h; `commits` tende a `null` |
| `BASE_URL`                 | scripts         | não         | `scripts/lib/browser.mjs`                                       | auditorias sobem o próprio preview           |

---

## 10. Qualidade, testes e automação

| Porta                                           | Comando                                                             | No CI?                    | No `npm run verify`? |
| ----------------------------------------------- | ------------------------------------------------------------------- | ------------------------- | -------------------- |
| Auditoria de dependências                       | `npm audit --audit-level=low`                                       | sim                       | sim                  |
| Lint do frontend                                | `npm run lint`                                                      | sim                       | sim                  |
| Lint das funções                                | `npm run lint:api`                                                  | **não**                   | sim                  |
| Tipos do frontend                               | `npm run type-check`                                                | sim                       | sim                  |
| Tipos das funções                               | `npm run type-check:api`                                            | **não**                   | sim                  |
| Formatação                                      | `npm run format:check`                                              | sim                       | sim                  |
| Testes (Vitest)                                 | `npm test`                                                          | sim                       | sim                  |
| Ícones / imagens / changelog derivados          | `icones:check` · `imagens:check` · `changelog:check`                | sim                       | sim                  |
| Build                                           | `npm run build`                                                     | sim                       | sim                  |
| CSP × scripts inline                            | `npm run csp:check`                                                 | sim                       | sim                  |
| Orçamento de bundle                             | `npm run audit:bundle`                                              | sim                       | sim                  |
| a11y (axe), overflow, camadas, identidade       | `audit:a11y` · `audit:overflow` · `audit:layers` · `audit:identity` | sim                       | sim (`--browser`)    |
| E2E release notes, 404, LinkedIn, Codex, modais | `audit:*`                                                           | sim                       | sim (`--browser`)    |
| E2E `/contato`                                  | `npm run audit:contato`                                             | **não**                   | sim (`--browser`)    |
| Performance (CPU 4×)                            | `npm run audit:perf`                                                | não (manual)              | não                  |
| Geometria                                       | `node scripts/geometry.mjs`                                         | não (manual, por decisão) | não                  |

---

## 11. Integrações e serviços externos

| Serviço   | Tipo                                                         | Configuração                                 |
| --------- | ------------------------------------------------------------ | -------------------------------------------- |
| Vercel    | hospedagem, funções, CDN, previews por branch                | `vercel.json`; Root Directory = raiz do repo |
| GitHub    | releases e métricas; CI (Actions); planejamento (Project #3) | `GITHUB_TOKEN` server-only                   |
| Fontshare | fontes de terceiros                                          | `index.html`                                 |
| Formspree | previsto, não ativo                                          | `VITE_FORM_ENDPOINT`                         |

---

## 12. Limites deste inventário

- Nenhum comando de build, teste ou auditoria foi executado nesta análise (a instalação de dependências foi interrompida a pedido). Os números de linhas e arquivos vêm de contagem estática.
- Configurações do painel da Vercel (variáveis efetivas, HSTS, proteção de previews) não são visíveis no repositório; as afirmações sobre elas vêm de comentários do próprio código (`pages/Contact/index.tsx`, `CONTRIBUTING.md`).
