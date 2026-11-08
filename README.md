<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6&height=140&section=header&text=Portfolio%20v2&fontSize=42&fontColor=fff&animation=fadeIn&fontAlignY=55&desc=Guilherme%20Cruz%20·%20Desenvolvedor%20de%20Software&descAlignY=75&descAlign=50"/>

<div align="center">

[![Deploy](https://img.shields.io/badge/Deploy-Live-46e8b0?style=for-the-badge&logo=vercel&logoColor=white)](https://gcruz.dev.br)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)
[![Licença](https://img.shields.io/badge/Licença-MIT-ff6b6b?style=for-the-badge)](#-licença)

</div>

---

## 📋 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Status atual](#-status-atual)
- [Funcionalidades](#-funcionalidades)
- [Páginas e rotas](#-páginas-e-rotas)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e execução local](#-instalação-e-execução-local)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Scripts](#-scripts)
- [Testes e auditorias](#-testes-e-auditorias)
- [Build](#-build)
- [Deploy](#-deploy)
- [Integrações](#-integrações)
- [Como adicionar um link](#-como-adicionar-um-link)
- [Como publicar uma versão](#-como-publicar-uma-versão)
- [Design system e acessibilidade](#-design-system-e-acessibilidade)
- [Documentação complementar](#-documentação-complementar)
- [Roadmap resumido](#-roadmap-resumido)
- [Contribuição](#-contribuição)
- [Autor](#-autor)
- [Licença](#-licença)

---

## 💡 Sobre o projeto

Portfólio pessoal de **segunda geração** de Guilherme Cruz — uma SPA em **React 18 + TypeScript 5 + Vite 8**, bilíngue (pt-BR/en), com tema claro/escuro, design system próprio em CSS puro e **apenas duas dependências de runtime no navegador** (`react` e `react-dom`). Roteamento, i18n, modais, ícones e ícones de stack são do próprio projeto.

**Objetivo:** apresentar trajetória, formação, projetos e recomendações, e abrir canais de contato para oportunidades de trabalho e freelance.

O repositório é um monorepo npm simples:

- `apps/web/` — a aplicação;
- `api/` — funções serverless da Vercel (métricas do GitHub, notas de versão, feed Atom, HTML para rastreadores, imagens Open Graph, coleta de violações de CSP);
- `scripts/` — automações de qualidade (auditorias com Playwright e axe-core, geradores de ícones/imagens/changelog, verificação completa).

**Produção:** [gcruz.dev.br](https://gcruz.dev.br/)

---

## 📌 Status atual

| Item                  | Situação                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Versão                | `2.0.0` (em produção)                                                                                                                                                          |
| Manutenção            | Ativa                                                                                                                                                                          |
| CI                    | GitHub Actions em todo push e PR para `main` (`.github/workflows/ci.yml`)                                                                                                      |
| CSP                   | Em modo `Report-Only`, ainda não aplicada                                                                                                                                      |
| Formulário de contato | Código pronto; só aparece quando `VITE_FORM_ENDPOINT` está configurada                                                                                                         |
| Pontos em aberto      | Diagnóstico e plano em [`docs/ANALISE_E_PLANO_DE_MELHORIAS.md`](docs/ANALISE_E_PLANO_DE_MELHORIAS.md) e [`docs/ROADMAP_DE_IMPLEMENTACAO.md`](docs/ROADMAP_DE_IMPLEMENTACAO.md) |

---

## ✨ Funcionalidades

**Conteúdo**

- Home com oito seções navegáveis por âncora: Início, Sobre, Carreira, Formações, Destaque (TCC Codex), Projetos, Recomendações e Contato.
- Página técnica do TCC Codex, com capturas e galeria.
- `/links` — página de links (link-in-bio) autônoma, com controles próprios de tema e idioma e compartilhamento nativo/clipboard.
- `/contato` — a seção de contato com endereço próprio.

**Notas de versão**

- Índice em `/release-notes` com a versão mais recente aberta, histórico em accordion paginado de 4 em 4 e filtro por tema.
- Uma página por versão (`/release-notes/v2.0.0`), com navegação entre versões.
- Duas camadas de dados: releases do GitHub (via função serverless) + camada editorial bilíngue local; sem rede, a camada local sustenta a página e um selo informa o estado.
- Feed Atom em `/feed.xml`.

**Experiência**

- Tema claro/escuro persistente, sincronizado com o sistema e sem flash na carga.
- Português/inglês sem recarregar; `?lang=en` em qualquer rota gera um link compartilhável no idioma.
- Header fixo com scroll spy, menu mobile com focus trap, modais com fundo inerte e trava de rolagem.
- `prefers-reduced-motion` respeitado (animações e autoplay desligados).
- Aviso antes de abrir o perfil do LinkedIn (`/linkedin`), com validação do destino contra redirecionamento aberto.
- Página 404 bilíngue, também gerada como `dist/404.html` com conteúdo básico sem JavaScript.

**SEO e compartilhamento**

- Título, descrição e canonical por página (`useDocumentMeta`), JSON-LD `Person`, sitemap e robots gerados no build, `hreflang` pt/en.
- Rastreadores de redes sociais recebem HTML com as meta tags certas de cada rota (`api/crawler`), e cada versão tem imagem Open Graph própria (`api/og`).

**Contato**

- CTA de e-mail e caminhos alternativos (LinkedIn, GitHub, `/links`).
- Formulário com validação, honeypot e estados de envio — ativo apenas com `VITE_FORM_ENDPOINT`.
- Inscrição no rodapé: envia para `VITE_NEWSLETTER_ENDPOINT` quando configurada; sem ela, abre um e-mail preenchido.

---

## 🧭 Páginas e rotas

| Rota                                                 | Página / destino     | Observação                             |
| ---------------------------------------------------- | -------------------- | -------------------------------------- |
| `/`                                                  | `HomePage`           | carregada de forma síncrona            |
| `/links`                                             | `LinksPage`          | autônoma, fora do menu principal       |
| `/contato`                                           | `ContactPage`        | reutiliza o widget `Contact`           |
| `/projetos`                                          | `ProjectsPage`       | acervo de repositórios (`/api/devhub`) |
| `/projetos/<repositório>`                            | `ProjectPage`        | uma página por repositório             |
| `/release-notes`                                     | `ReleaseNotesPage`   | índice                                 |
| `/release-notes/page/N`                              | `ReleaseNotesPage`   | páginas seguintes do histórico         |
| `/release-notes/vX.Y.Z`                              | `ReleaseNotePage`    | uma versão                             |
| `/projects/codex/readme.html` (e `/projects/codex/`) | `CodexPage`          | documento HTML próprio no build        |
| `/linkedin?to=…`                                     | `LinkedInNoticePage` | aviso antes do LinkedIn                |
| qualquer outra                                       | `NotFoundPage`       | `noindex, follow`                      |
| `/feed.xml`                                          | `api/feed`           | reescrita no `vercel.json`             |

O roteamento é próprio, sobre a History API (`app/RouterContext.tsx`). Os pathnames vivem em `shared/config/routes.ts`, o mapa rota → página em `app/routes.tsx` (páginas secundárias via `React.lazy`) e os construtores de URL das notas de versão (`releaseNotePath`, `releaseNotesPagePath`) em `routes.ts` — nenhuma URL é montada à mão.

> **Rota nova exige quatro lugares:** `ROUTES` em `shared/config/routes.ts`, o caso em `app/routes.tsx`, a reescrita em `vercel.json` (e a reescrita por user-agent, se a rota tiver cartão próprio em `api/crawler.ts`) e a entrada no sitemap em `apps/web/vite.config.ts`. Sem a reescrita, o acesso direto devolve 404.

---

## 🛠 Tecnologias

| Tecnologia                                                   | Versão         | Uso                                                 |
| ------------------------------------------------------------ | -------------- | --------------------------------------------------- |
| React / ReactDOM                                             | 18.3           | UI                                                  |
| TypeScript                                                   | 5.x (`strict`) | tipagem do app e das funções                        |
| Vite (Rolldown)                                              | 8.3.5          | bundler, dev server e plugins próprios de build     |
| CSS puro com tokens                                          | —              | design system; um `.css` por componente             |
| Vitest + Testing Library + jsdom                             | 4 / 16 / 29    | testes de unidade e de componente                   |
| Playwright + axe-core                                        | 1.62 / 4.13    | auditorias de navegador (a11y, E2E, overflow, perf) |
| ESLint 9 (flat) + typescript-eslint + jsx-a11y + react-hooks | 9 / 8 / 6 / 7  | lint                                                |
| Prettier                                                     | 3              | formatação                                          |
| Husky + lint-staged + commitlint                             | 9 / 17 / 21    | formatação no pre-commit e Conventional Commits     |
| `@vercel/og`                                                 | 1.0.1          | imagens Open Graph na função `api/og`               |
| `@fontsource/jetbrains-mono`                                 | 5              | fonte mono servida do próprio domínio               |

Fontes Cabinet Grotesk e General Sans vêm do Fontshare. Os ícones de stack são SVGs locais (`src/assets/skills/`, fork MIT de skill-icons — ver `CREDITS.md`).

---

## 🏗 Arquitetura

```
.
├── api/                         # Funções serverless (Vercel, Node)
│   ├── github-stats.ts          #   métricas do perfil (token só no servidor)
│   ├── devhub.ts                #   repositórios e README para /projetos (operações fechadas)
│   ├── release-notes.ts         #   releases do GitHub já em HTML seguro
│   ├── feed.ts                  #   Atom das notas de versão
│   ├── crawler.ts               #   HTML com meta tags para rastreadores
│   ├── og.ts                    #   imagem Open Graph por versão
│   ├── csp-report.ts            #   recebe relatórios de violação da CSP
│   ├── _github.ts · _github-repos.ts   # único acesso ao GitHub: token, transporte, cache, paginação
│   ├── _devhub-markdown.ts · _devhub-sanitize.ts   # README → HTML com allowlist
│   └── _releases.ts · _releaseNotes.ts · _markdown.ts   # privados (prefixo _)
├── apps/web/
│   ├── index.html               # documento principal (SEO, JSON-LD, bootstrap de tema)
│   ├── projects/codex/readme.html  # segundo documento (página do Codex)
│   ├── config/                  # código de build: 404, metadados, lastmod, documentos privados
│   ├── public/                  # favicons, manifest, imagem OG, PDFs (currículo e certificados)
│   ├── vite.config.ts           # plugins: URL do site, sitemap/robots, 404, alias do Codex, guarda de privados
│   └── src/
│       ├── main.tsx · entradas/comum.tsx   # fontes, CSS global, carga das traduções, montagem
│       ├── app/                 # App, providers (Router → Theme → Lang), routes
│       ├── pages/               # Home, Links, Contact, ReleaseNotes, ReleaseNote, Codex, LinkedInNotice, NotFound
│       ├── widgets/             # Header, Hero, About, Timeline, Formacoes, Featured, Work,
│       │                        # Recommendations, Contact, Footer, ReleaseNotes
│       ├── shared/
│       │   ├── config/          # profile.ts, links.ts, routes.ts, constants.ts, releaseNotes.json…
│       │   ├── hooks/           # useLang, useTheme, useRoute, useDocumentMeta, useReleaseNotes…
│       │   ├── lib/             # translations.json, cache, mergeReleaseNotes, richText, dateUtils…
│       │   ├── styles/          # tokens.css → globals.css → theme-patches.css
│       │   └── ui/              # Modal, Accordion, AmbientBackground, Icons, SkillIcon, Logo…
│       └── assets/              # WebP e SVG importados pelo bundle
├── scripts/                     # auditorias e geradores (ver scripts/README.md)
├── docs/                        # guides/ (vivo), reference/ (congelado), análise e roadmap
└── vercel.json                  # rewrites, roteamento por user-agent, headers de segurança
```

**Princípios aplicados**

- Camadas `app → pages → widgets → shared`, sem dependência no sentido inverso.
- Fonte única de dados: identidade em `profile.ts`, URLs em `links.ts`, rotas em `routes.ts`, textos de interface em `translations.json` (chaves tipadas em `translations.ts`), histórico de versões em `releaseNotes.json`.
- i18n em duas camadas: chaves tipadas para a interface e objetos `Localized { pt, en }` para dados. Parte dos componentes ainda usa textos inline por idioma — a unificação está no roadmap.
- `IntersectionObserver` para reveal e scroll spy; datas de carreira em ISO `YYYY-MM`, com períodos derivados.
- As funções importam a regra de fusão das notas de versão do próprio frontend (`shared/lib/mergeReleaseNotes.ts`), para que cliente e servidor nunca divirjam.

---

## 📦 Pré-requisitos

- **Node.js** `^22.22.1` ou `^24.11.1` (recomendado: `24.11.1`, em `.nvmrc`).
- **npm** `11.6.2` ou superior.
- **Git** — o build consulta o histórico para o `<lastmod>` do sitemap.
- Para as auditorias de navegador: Chromium do Playwright (`npx playwright install chromium`).

---

## 🚀 Instalação e execução local

```bash
git clone https://github.com/https-shini/NewPortfolio.git
```

```bash
cd NewPortfolio
```

```bash
npm ci --include=dev
```

```bash
cp apps/web/.env.example apps/web/.env.local
```

```bash
npm run dev
```

O servidor de desenvolvimento sobe em `http://localhost:5173`. As funções de `api/` **não** rodam no `vite dev`; sem elas, as métricas do GitHub e as releases remotas caem nos valores locais de reserva, como acontece em produção quando a rede falha.

---

## 🔐 Variáveis de ambiente

Arquivo local: `apps/web/.env.local` (modelo em `apps/web/.env.example`). Em produção, no painel da Vercel.

| Variável                   | Escopo               | Obrigatória | Para que serve                                                                                                                                                                   |
| -------------------------- | -------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_FORM_ENDPOINT`       | build (navegador)    | não         | Endpoint do formulário de contato. Sem ela, o formulário não é exibido e fica o fluxo de e-mail.                                                                                 |
| `VITE_NEWSLETTER_ENDPOINT` | build (navegador)    | não         | Recebe `POST { email, lang, source }`. Sem ela, a inscrição abre um e-mail preenchido.                                                                                           |
| `VITE_SITE_URL`            | build e funções      | não         | Domínio canônico (canonical, Open Graph, JSON-LD, sitemap, feed, crawler). Padrão: `https://gcruz.dev.br`.                                                                       |
| `GITHUB_TOKEN`             | **somente servidor** | não         | Token fine-grained somente leitura, lido só em `api/_github.ts` e usado por `/api/github-stats`, `/api/release-notes` e `/api/devhub`. Sem ele, a API pública limita a 60 req/h. |

> Tudo com prefixo `VITE_` é embutido no JavaScript enviado ao navegador — **nunca** coloque segredos nessas variáveis. `GITHUB_TOKEN` só deve existir no painel da Vercel.

---

## 📜 Scripts

Todos rodam a partir da raiz.

**Desenvolvimento e qualidade**

| Script                         | Descrição                                             |
| ------------------------------ | ----------------------------------------------------- |
| `npm run dev`                  | servidor de desenvolvimento (porta 5173)              |
| `npm run build`                | `tsc --noEmit` + build de produção em `apps/web/dist` |
| `npm run preview`              | serve o build (porta 4173)                            |
| `npm run type-check`           | tipos do app                                          |
| `npm run type-check:api`       | tipos das funções (`tsconfig.api.json`)               |
| `npm run lint`                 | ESLint em `apps/web/src`, sem warnings                |
| `npm run lint:api`             | ESLint em `api/`                                      |
| `npm run lint:fix`             | ESLint com correção automática                        |
| `npm run format`               | Prettier (escrita)                                    |
| `npm run format:check`         | Prettier (verificação)                                |
| `npm test`                     | Vitest, execução única                                |
| `npm run test:watch`           | Vitest em modo watch                                  |
| `npm run verify`               | todas as portas não visuais em sequência (ver abaixo) |
| `npm run clean` · `clean:dist` | remove artefatos de build                             |

**Artefatos derivados (gerar / conferir)**

| Script                                  | Descrição                                                    |
| --------------------------------------- | ------------------------------------------------------------ |
| `npm run icones` · `icones:check`       | ícones da marca a partir de `scripts/marca/`                 |
| `npm run imagens` · `imagens:check`     | variantes responsivas em `src/assets/gerado/`                |
| `npm run changelog` · `changelog:check` | `CHANGELOG.md` a partir de `releaseNotes.json`               |
| `npm run csp:check`                     | hash dos scripts inline × CSP do `vercel.json` (exige build) |

---

## 🧪 Testes e auditorias

**Testes de unidade e componente** — Vitest + Testing Library em jsdom: 48 arquivos em `apps/web/src` e 5 em `api/` (a suíte inclui as funções, configurada em `vite.config.ts`). Cobrem utilitários, configuração (links, rotas, release notes, conteúdo estático), hooks, contextos, componentes-base (Modal, Accordion), widgets, páginas e a conversão de markdown das funções, incluindo seus casos de segurança.

```bash
npm test
```

**Auditorias de navegador** — rodam contra o `dist/` (faça `npm run build` antes); sobem o preview sozinhas, ou usam o servidor indicado em `BASE_URL`.

| Script                        | O que verifica                                                               |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `npm run audit:a11y`          | axe-core por rota, tema e idioma, contra `docs/reference/a11y-baseline.json` |
| `npm run audit:overflow`      | rolagem horizontal em várias larguras                                        |
| `npm run audit:layers`        | camadas da atmosfera de fundo                                                |
| `npm run audit:identity`      | identidade visual das superfícies, contra a base gravada                     |
| `npm run audit:release-notes` | índice e página de versão de ponta a ponta                                   |
| `npm run audit:not-found`     | 404, recuperação, idioma e conteúdo sem JavaScript                           |
| `npm run audit:linkedin`      | aviso antes do LinkedIn                                                      |
| `npm run audit:codex`         | página do Codex (Full HD, galeria, acessibilidade)                           |
| `npm run audit:contato`       | rota `/contato` e o caminho até ela                                          |
| `npm run audit:modals`        | trava de rolagem, fundo inerte, diálogo em paisagem                          |
| `npm run audit:bundle`        | tetos de tamanho do bundle                                                   |
| `npm run audit:perf`          | FCP/TBT com CPU estrangulada (manual, fora do CI)                            |

**Verificação completa** (o que o autor roda antes de cada push):

```bash
npx playwright install chromium
```

```bash
npm run verify -- --browser
```

Sem `--browser`, `verify` executa lint (app e funções), tipos (app e funções), formatação, testes, artefatos derivados, build, CSP, orçamento de bundle e `npm audit`. Detalhes de cada auditoria em [`scripts/README.md`](scripts/README.md).

**CI** (`.github/workflows/ci.yml`): o job `check` roda auditoria de dependências, lint, tipos, formatação, testes, artefatos derivados, build e CSP; o job `audit` baixa o build e roda as auditorias de navegador. Hoje `lint:api`, `type-check:api` e `audit:contato` rodam no `verify`, mas ainda não no CI — ver tarefas F1-07 e F1-08 do roadmap.

---

## 🏭 Build

```bash
npm run build
```

Gera `apps/web/dist/` com:

- `index.html` e `projects/codex/readme.html` (+ cópia em `projects/codex/index.html`);
- `404.html` derivado do `index.html`;
- `sitemap.xml` (datas do `git log`) e `robots.txt`;
- assets com hash em `assets/js`, `assets/css`, `assets/img`, `assets/fonts`, com React isolado num chunk `vendor`.

O build **falha** se encontrar documentos privados do TCC em `public/projects/codex` ou no `dist/` (`apps/web/config/privateDocuments.ts`).

---

## ☁️ Deploy

Hospedado na **Vercel**, com integração ao GitHub:

| Configuração     | Valor (de `vercel.json`)                     |
| ---------------- | -------------------------------------------- |
| Root Directory   | raiz do repositório                          |
| Install command  | `npx --yes npm@11.6.2 ci --include=dev`      |
| Build command    | `npm run build`                              |
| Output directory | `apps/web/dist`                              |
| Funções          | `api/*.ts` (arquivos com `_` não viram rota) |

- **Produção:** cada push na `main` publica em `gcruz.dev.br`.
- **Previews:** cada branch enviada ganha um deployment próprio; os links de preview exigem login na Vercel (só o domínio próprio é público).
- **Variáveis:** configurar em _Settings → Environment Variables_ (ver tabela acima).
- **Rollback:** promover o deployment anterior no painel da Vercel e, em seguida, reverter o commit.

> **Atenção ao Root Directory.** `vercel.json` e `api/` precisam ficar na **raiz** — um `vercel.json` dentro de `apps/web/` é ignorado, e funções fora de `api/` na raiz não são publicadas.
>
> **TypeScript 5.x na raiz.** O builder das funções usa a `typescript` do `node_modules` da raiz. Sem a dependência direta, a versão 7 trazida por transitividade quebra o deploy (`Cannot read properties of undefined (reading 'readFile')`). Por isso `typescript` também é devDependency da raiz.

---

## 🔌 Integrações

| Integração                             | Uso                                                                                                                                        | Configuração                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| GitHub REST API                        | releases (`/api/release-notes`, `/feed.xml`, `/api/crawler`), métricas (`/api/github-stats`) e repositórios de `/projetos` (`/api/devhub`) | `GITHUB_TOKEN` (opcional)                   |
| Vercel                                 | hospedagem, funções, CDN, previews, headers                                                                                                | `vercel.json`                               |
| Fontshare                              | fontes Cabinet Grotesk e General Sans                                                                                                      | `apps/web/index.html`                       |
| Serviço de formulário (ex.: Formspree) | envio do formulário de contato                                                                                                             | `VITE_FORM_ENDPOINT` (não configurada hoje) |
| Serviço de newsletter                  | inscrição no rodapé                                                                                                                        | `VITE_NEWSLETTER_ENDPOINT` (opcional)       |
| GitHub Actions                         | CI                                                                                                                                         | `.github/workflows/ci.yml`                  |
| GitHub Projects                        | planejamento ([Project #3](https://github.com/users/https-shini/projects/3))                                                               | `docs/guides/github-project.md`             |

Segurança na borda (`vercel.json`): `Content-Security-Policy-Report-Only` com relatório em `/api/csp-report`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e `Permissions-Policy`.

---

## 🔗 Como adicionar um link

Toda URL pública vive em **`apps/web/src/shared/config/links.ts`**. A página `/links`, o rodapé e o contato leem de lá.

1. **Acrescente um item a `TREE_LINKS`:**

    ```ts
    {
        id: "instagram",                     // único; key do React e dos testes
        kind: "social",                      // "primary" (card) ou "social" (ícone)
        label: { pt: "Instagram", en: "Instagram" },
        href: "https://instagram.com/seu-usuario",
        icon: IconInstagram,                 // componente de shared/ui/Icons.tsx
        external: true,                      // false só para mailto e rotas internas
    }
    ```

    `primary` vira um card (aceita `sublabel`); `social` vira um botão compacto. `PRIMARY_LINKS` e `SOCIAL_LINKS` fazem a partição.

2. **Reaproveite o que já existe:** perfis, e-mail, site e currículo vêm de `PROFILE` (`shared/config/profile.ts`); projetos, de `PROJECT_URLS`; rotas internas, de `ROUTES`.

3. **Ícone:** use um export de `shared/ui/Icons.tsx` ou desenhe um novo lá, com os componentes-base existentes.

4. **Chip de tecnologia (opcional):** adicione o SVG (com variantes `-Dark`/`-Light` quando houver) em `src/assets/skills/`, registre em `shared/config/skillIcons.ts` e nos créditos (`CREDITS.md`) e inclua em `TECH_STACK` (`pages/Links/index.tsx`).

5. **Verifique:** `npm test` (`links.test.ts` valida ids únicos, URLs sem duplicata e coerência de `external`).

---

## 🚢 Como publicar uma versão

O histórico de `/release-notes` tem **duas camadas**: o arquivo local decide **quais** versões aparecem; o GitHub complementa data, link e corpo.

1. Atualize a versão em `package.json` **e** `apps/web/package.json`.
2. Declare a entrada no topo de `apps/web/src/shared/config/releaseNotes.json`:

    ```json
    {
        "version": "2.1.0",
        "date": "2026-09-01",
        "featured": true,
        "title": { "pt": "…", "en": "…" },
        "summary": { "pt": "…", "en": "…" },
        "tags": ["design", "a11y"],
        "changes": { "added": [{ "pt": "Novo recurso", "en": "New feature" }] }
    }
    ```

3. Regenere e confira o changelog:

    ```bash
    npm run changelog
    ```

    ```bash
    npm run changelog:check
    ```

4. Faça o commit, crie a tag e publique a release no GitHub com o corpo em markdown.

A precedência é fixa e testada em `shared/lib/mergeReleaseNotes.ts`: o **GitHub manda** em `version`, `date` e `url`; o **local sobrepõe** `title`, `summary`, `body`, `media`, `tags`, `featured`, `changes` e `links`. Um `body` local substitui o HTML do GitHub. A versão exibida no rodapé vem do `package.json` (injetada como `__APP_VERSION__`), e um teste garante que ela é igual à primeira entrada de `releaseNotes.json`.

---

## 🎨 Design system e acessibilidade

Tokens CSS em três níveis — primitivos (`--_*`), semânticos do tema escuro (`:root`) e ajustes do tema claro (`body.light-mode`) — em `shared/styles/tokens.css`, `globals.css` e `theme-patches.css`, nessa ordem.

| Categoria  | Exemplos                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| Cores      | `--color-brand`, `--color-brand-text`, `--color-bg`, `--color-surface-1/2/3` |
| Tipografia | `--font-display` (Cabinet Grotesk), `--font-mono` (JetBrains Mono)           |
| Escalas    | `--text-2xs` → `--text-7xl`, `--space-1` → `--space-16`, `--radius-*`        |
| Layout     | `--layout-max` (1200px → 1440px → até 1720px), `--measure`, `--measure-wide` |
| Movimento  | `--transition-fast/base/slow`                                                |

**Largura do conteúdo.** Um padrão para o site inteiro, com Full HD (1920×1080) como referência de composição: `--layout-max` vale 1200px até 1439px, 1440px a partir de 1440px e `min(1720px, 92vw)` a partir de 1600px — em 1920 sobram ~100px de margem de cada lado. Header, seções e rodapé leem o mesmo token, então ficam alinhados. Parágrafos não acompanham o container: têm teto em `--measure` (68ch) ou `--measure-wide` (82ch).

**Acessibilidade:** HTML semântico, ARIA nos componentes interativos, navegação por teclado, focus trap no menu e nos modais, `prefers-reduced-motion`, alvos de toque mínimos, um `h1` por página, `eslint-plugin-jsx-a11y` no lint e axe-core no CI.

> Para texto na cor da marca, use `--color-brand-text` (passa AA nos dois temas); `--color-brand` é para preenchimentos, bordas e ícones. `--color-text-4` não serve para texto no tema escuro.

---

## 📚 Documentação complementar

| Documento                                                                      | Conteúdo                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [`docs/ANALISE_E_PLANO_DE_MELHORIAS.md`](docs/ANALISE_E_PLANO_DE_MELHORIAS.md) | diagnóstico, problemas com evidência e melhorias propostas          |
| [`docs/ROADMAP_DE_IMPLEMENTACAO.md`](docs/ROADMAP_DE_IMPLEMENTACAO.md)         | tarefas em 8 fases, critérios de conclusão e estratégia de execução |
| [`docs/INVENTARIO_TECNICO.md`](docs/INVENTARIO_TECNICO.md)                     | tecnologias, módulos, dependências, funções, variáveis e portões    |
| [`docs/README.md`](docs/README.md)                                             | organização da pasta `docs/` (guias vivos × referências congeladas) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                                           | fluxo de trabalho, portões do CI, merge local, autoria              |
| [`scripts/README.md`](scripts/README.md)                                       | o que cada automação mede e por quê                                 |
| [`CHANGELOG.md`](CHANGELOG.md)                                                 | histórico de versões (gerado)                                       |

---

## 🗺 Roadmap resumido

Detalhes, dependências e critérios em [`docs/ROADMAP_DE_IMPLEMENTACAO.md`](docs/ROADMAP_DE_IMPLEMENTACAO.md).

- [ ] **Fase 1 — Correções críticas:** conteúdo de `/contato` visível, `ErrorBoundary` e recuperação de chunk, `localStorage` resiliente, portões faltantes no CI, timeouts e cache de falhas nas funções.
- [ ] **Fase 2 — Fundação:** limpeza de resíduos, utilitários comuns das funções, fonte única de identidade, i18n unificado.
- [ ] **Fase 3 — Performance:** preload das traduções e fontes autoalojadas, sempre com medição antes/depois.
- [ ] **Fase 4 — Funcionalidades:** backend de contato, decisão sobre a newsletter, sitemap sem âncoras, cartões bilíngues.
- [ ] **Fase 5 — UX e acessibilidade:** feedback do formulário, fallback das rotas lazy, axe em estados interativos.
- [ ] **Fase 6 — Plataforma:** CSP aplicada, atualizações automatizadas de dependências.
- [ ] **Fase 7 — Validação:** testes dos módulos sem cobertura, validação em produção.
- [ ] **Fase 8 — Evolução:** analytics sem cookies, estudos de caso e página de serviços.

---

## 🤝 Contribuição

Projeto pessoal; sugestões são bem-vindas.

1. Abra uma issue (há modelos para bug, feature e tarefa).
2. Faça um fork e uma branch a partir de `main`.
3. Use Conventional Commits (validados pelo commitlint).
4. Rode `npm run verify -- --browser` e abra um PR.

O fluxo interno do autor (commits diretos na `main`, merge local com squash, regras de autoria) está em [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 👤 Autor

<div align="center">

**Guilherme Cruz**
Desenvolvedor de Software · Estudante de Ciência da Computação
São Paulo, SP — Brasil

[![Portfolio](https://img.shields.io/badge/Portfolio-311DB4?style=for-the-badge)](https://gcruz.dev.br)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-3E79E0?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/oguilherme-cruz)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contato@gcruz.dev.br)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/https-shini)

</div>

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE).

---

<div align="center">

_Feito com ♥ em São Paulo — React + TypeScript + muito café_

</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6&height=100&section=footer"/>
