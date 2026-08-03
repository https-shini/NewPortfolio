<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6&height=140&section=header&text=Portfolio%20v2&fontSize=42&fontColor=fff&animation=fadeIn&fontAlignY=55&desc=Guilherme%20Cruz%20·%20Desenvolvedor%20de%20Software&descAlignY=75&descAlign=50"/>

<div align="center">

[![Deploy](https://img.shields.io/badge/Deploy-Live-46e8b0?style=for-the-badge&logo=vercel&logoColor=white)](https://gcruz.dev.br)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)
[![Licença](https://img.shields.io/badge/Licença-MIT-ff6b6b?style=for-the-badge)](#-licença)

</div>

---

## 📋 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Demonstração](#-demonstração)
- [Páginas e rotas](#-páginas-e-rotas)
- [Seções](#-seções)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Design System](#-design-system)
- [Funcionalidades](#-funcionalidades)
- [Como executar](#-como-executar)
- [Scripts](#-scripts)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Como adicionar um link](#-como-adicionar-um-link)
- [Testes](#-testes)
- [Qualidade e CI](#-qualidade-e-ci)
- [Acessibilidade](#-acessibilidade)
- [Roadmap](#-roadmap)
- [Contribuição](#-contribuição)
- [Autor](#-autor)
- [Licença](#-licença)

---

## 💡 Sobre o projeto

Portfólio pessoal de **segunda geração** — SPA construída em **React 18 + TypeScript 5 + Vite 5**, evoluindo a versão anterior em HTML/CSS/JS puro. O projeto tem arquitetura por camadas (app → pages → widgets → shared), design system próprio com tokens CSS, internacionalização completa (PT-BR/EN), tema dark/light persistente e **zero dependências de UI externas** — todos os componentes e os 60+ ícones SVG são do próprio design system.

O repositório é um monorepo simples: a raiz orquestra os scripts e `frontend/` contém toda a aplicação — incluindo `frontend/api/`, uma **Vercel Serverless Function** que alimenta as métricas do GitHub sem expor token ao browser. A pasta `backend/` segue reservada para uma API própria no futuro.

---

## 🌐 Demonstração

> Acesse o portfólio em produção:

**[→ gcruz.dev.br](https://gcruz.dev.br/)**

---

## 🧭 Páginas e rotas

| Rota     | Página      | Conteúdo                                                              |
| -------- | ----------- | --------------------------------------------------------------------- |
| `/`      | `HomePage`  | Portfólio completo — as seções abaixo, navegadas por âncora           |
| `/links` | `LinksPage` | **Social tree** (link-in-bio): perfil, stack e links públicos         |

O roteamento é próprio, sobre a History API (`app/RouterContext.tsx`), sem
`react-router-dom` — o projeto mantém apenas `react` e `react-dom` em runtime.
Os pathnames vivem em `shared/config/routes.ts` e o mapeamento rota → página em
`app/routes.tsx`, com as páginas secundárias carregadas por `React.lazy`.
Cada página declara o próprio título, descrição e canonical via `useDocumentMeta`.

A `/links` é **autônoma**: não usa o header nem o rodapé do site, e traz os
próprios controles de tema e idioma. Por isso **não aparece no menu principal** —
chega-se a ela pelo card "Redes Sociais" da seção Contato e pelo link no rodapé.
O acesso direto por URL (`gcruz.dev.br/links`) funciona normalmente — é assim que
a página é compartilhada.

> **Deploy — atenção ao Root Directory.** O `vercel.json` fica na **raiz do
> repositório**, não em `frontend/`: o Root Directory do projeto na Vercel é a
> raiz, e um `vercel.json` dentro de `frontend/` é simplesmente ignorado. Ele
> reescreve `/links` para `index.html`; sem isso o acesso direto retorna 404.
> Ao criar uma rota nova, acrescente-a ali também.
>
> Pela mesma razão, as funções serverless precisam viver em `api/` na raiz do
> repositório. Hoje elas estão em `frontend/api/`, e por isso
> `/api/github-stats` responde 404 em produção (o front cai no fallback).

---

## 📄 Seções

| #   | Seção               | Descrição                                                                              |
| --- | ------------------- | -------------------------------------------------------------------------------------- |
| 01  | **Hero**            | Apresentação com foto, status de disponibilidade, CTAs (projetos + CV) e links sociais |
| 02  | **About**           | Bio, 4 áreas de especialização, stats com count-up e tech stack de 16 ícones           |
| 03  | **Timeline**        | Carreira por empresa com trilha de posições, acordeão de detalhes e stats gerais       |
| 04  | **Formações**       | Educação + certificações com filtros (tabs), limite expansível e cards com stagger     |
| 05  | **Featured**        | Projeto em destaque (AuthService) com carrossel, lightbox, endpoints e arquitetura     |
| 06  | **Work**            | Grid de projetos com thumbnail local (WebP), badges de tecnologia e ações              |
| 07  | **Recommendations** | Depoimentos em carrossel paginado (2 por página · 1 no mobile) com modal de leitura    |
| 08  | **Contact**         | CTA de e-mail, formulário com validação (via env), links e perfil ATS-friendly         |
| —   | **Links**           | Página `/links`: social tree autônoma, fora do menu (ver *Páginas e rotas*)             |
| —   | **Header**          | Navegação fixa com scroll spy, language pill, theme toggle e menu mobile               |
| —   | **Footer**          | Grid de 4 colunas com brand, nav, projetos, contato e barra inferior com CV            |

---

## 🛠 Tecnologias

| Tecnologia              | Versão | Uso                                                |
| ----------------------- | ------ | -------------------------------------------------- |
| **React**               | 18     | Renderização de UI com hooks e memo                |
| **TypeScript**          | 5      | Tipagem estrita em todos os componentes            |
| **Vite**                | 5      | Bundler, dev server e path aliases (`@/`)          |
| **Vitest + RTL**        | 4 / 16 | Testes unitários e de componentes (jsdom)          |
| **ESLint 9 (flat)**     | 9      | Lint com typescript-eslint, react-hooks e jsx-a11y |
| **Prettier**            | 3      | Formatação padronizada                             |
| **Husky + lint-staged** | 9 / 16 | Hooks de pre-commit (lint + format)                |
| **Commitlint**          | 20+    | Conventional Commits obrigatórios                  |
| **CSS puro (tokens)**   | —      | Design system próprio, um `.css` por widget        |
| **skillicons.dev**      | —      | Ícones de tecnologias na seção About               |

---

## 🏗 Arquitetura

```
frontend/
│
├── public/                      # Assets estáticos publicados na raiz do site
│   ├── favicon.svg · favicon.ico · apple-touch-icon.png
│   ├── icon-192.png · icon-512.png · manifest.webmanifest
│   ├── robots.txt · sitemap.xml · og-preview.jpg
│   └── docs/                    # Currículo e certificados (PDF)
│
└── src/
    ├── app/                     # Camada de aplicação
    │   ├── App.tsx              # Composição raiz (Providers + Routes)
    │   ├── providers.tsx        # RouterProvider + LangProvider
    │   ├── routes.tsx           # Mapeamento rota → página (lazy nas secundárias)
    │   ├── LangContext.tsx      # Contexto de idioma: lang, t(), toggleLang()
    │   └── RouterContext.tsx    # Rota via History API: path, navigate(), isHome
    │
    ├── pages/
    │   ├── Home/                # Portfólio completo (/)
    │   └── Links/               # Social tree (/links) — autônoma
    │       ├── index.tsx · Links.css
    │       └── components/      # LinkCard, ParticleField (exclusivos da página)
    │
    ├── widgets/                 # Um módulo por seção (tsx + css co-locados)
    │   ├── Header/  Hero/  About/  Timeline/  Formacoes/
    │   ├── Featured/  Work/  Recommendations/  Contact/  Footer/
    │   └── <Widget>/
    │       ├── <Widget>.tsx · <Widget>.css
    │       ├── <Widget>.data.ts     # Dados estáticos bilíngues
    │       ├── <Widget>.types.ts    # Tipos do domínio
    │       └── components/          # Sub-componentes do widget
    │
    ├── shared/
    │   ├── config/
    │   │   ├── profile.ts       # ✨ Fonte única de identidade (nome, e-mail, redes)
    │   │   ├── links.ts         # ✨ Fonte única das URLs públicas e dos projetos
    │   │   ├── routes.ts        # Pathnames das páginas
    │   │   └── constants.ts     # SECTION_IDS, chaves de storage, aliases do perfil
    │   ├── hooks/               # useLang, useTheme, useRoute, useLinkProps, useDocumentMeta…
    │   ├── lib/                 # translations, localized, richText, dateUtils, mailto…
    │   ├── styles/              # tokens.css → globals.css → theme-patches.css
    │   └── ui/                  # Modal/ (base reutilizável), Icons.tsx, ScrollUtils
    │
    ├── assets/                  # Imagens otimizadas (WebP) importadas pelo bundle
    │   └── skills/              # Ícones de stack da /links (skill-icons, MIT — ver CREDITS.md)
    └── test/setup.ts            # Setup do Vitest (jsdom + stubs)
```

**Padrões aplicados:**

- **Fonte única de verdade** — identidade em `profile.ts`, seções em `SECTION_IDS`, textos em `translations.ts`
- `React.memo` + `useCallback` nos sub-componentes com props estáveis
- `IntersectionObserver` para reveal e scroll spy — sem listeners de scroll
- i18n em duas camadas: chaves tipadas (`TranslationKey`) para UI e `Localized {pt, en}` para dados
- Datas de carreira em ISO `YYYY-MM` — período/duração derivados e auto-atualizáveis

---

## 🎨 Design System

Tokens CSS em três níveis — primitivos (`--_*`), semânticos dark (`:root`) e overrides light (`body.light-mode`) — com persistência do tema via `localStorage` e sincronização com o SO.

| Categoria           | Exemplos de variáveis                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| **Cores**           | `--color-brand`, `--color-accent`, `--color-bg`, `--color-surface-1/2/3` |
| **Tipografia**      | `--font-display` (Clash Display), `--font-mono` (JetBrains Mono)         |
| **Escala de texto** | `--text-2xs` → `--text-7xl`                                              |
| **Espaçamento**     | `--space-1` → `--space-16`                                               |
| **Bordas**          | `--radius-sm` → `--radius-2xl`, `--radius-full`                          |
| **Sombras**         | `--shadow-md`, `--shadow-xl`, `--shadow-card-hover`                      |
| **Transições**      | `--transition-fast`, `--transition-base`, `--transition-slow`            |

Utilitários globais: `.btn`, `.badge`, `.section*`, `.container`, `.social-link`, `[data-reveal]`.

---

## ✨ Funcionalidades

**Navegação e UX**

- Header fixo com blur ao rolar e scroll spy via `IntersectionObserver`
- Menu mobile com focus trap, `Escape` e scroll lock
- Smooth scroll com foco programático na seção de destino

**Tema e Idioma**

- Dark/light com persistência, sync com o SO e `theme-color` dinâmico
- PT-BR/EN sem recarregar a página — zero strings hardcoded

**Contato**

- Formulário com validação completa, estados de loading/sucesso/erro, honeypot anti-spam e endpoint configurável por env
- Fallback automático para mailto quando o endpoint não está configurado

**SEO**

- Meta tags completas (canonical, Open Graph, Twitter Cards), JSON-LD (`Person`), sitemap, robots.txt, favicons e manifest PWA

**Performance**

- Todas as imagens locais em **WebP** (hero: 8,3 MB → 89 KB) com `loading="lazy"` e `fetchpriority="high"` no avatar
- **Code splitting**: `vendor` (React) em chunk próprio — cache preservado entre deploys — e modais (`FeaturedLightbox`, `RecommendationModal`) carregados sob demanda via `React.lazy`, tirando ~14 KB de CSS do caminho crítico
- Carrossel pausa em `visibilitychange`; dados estáticos fora dos componentes

---

## 🚀 Como executar

```bash
# 1. Clone o repositório
git clone https://github.com/https-shini/NewPortfolio.git
cd NewPortfolio

# 2. Instale as dependências (raiz + frontend)
npm run install:all

# 3. (Opcional) Configure as variáveis de ambiente
cp frontend/.env.example frontend/.env.local

# 4. Inicie o servidor de desenvolvimento
npm run dev            # http://localhost:5173
```

**Build para produção:**

```bash
npm run build          # type-check + build otimizado em frontend/dist
npm run preview        # prévia local do build (porta 4173)
```

---

## 📜 Scripts

Todos os scripts funcionam na raiz (delegam ao frontend):

| Script                 | Descrição                          |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Dev server com HMR (porta 5173)    |
| `npm run build`        | `tsc --noEmit` + build de produção |
| `npm run preview`      | Prévia do build (porta 4173)       |
| `npm run type-check`   | Verificação de tipos sem emitir    |
| `npm run lint`         | ESLint em `src/`                   |
| `npm run lint:fix`     | ESLint com auto-fix                |
| `npm run format`       | Prettier (write)                   |
| `npm run format:check` | Prettier (check — usado no CI)     |
| `npm run test`         | Vitest (run único)                 |
| `npm run test:watch`   | Vitest em watch mode               |

---

## 🔐 Variáveis de ambiente

Definidas em `frontend/.env.local` (ver `frontend/.env.example`):

| Variável             | Obrigatória | Descrição                                                                                                                                                                   |
| -------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_FORM_ENDPOINT` | Não         | Endpoint do formulário de contato (Formspree ou similar). Sem ela, a seção Contato mantém apenas o fluxo de e-mail.                                                         |
| `VITE_SITE_URL`      | Não         | Domínio canônico injetado no `index.html` no build (canonical, Open Graph, JSON-LD). Default: `https://gcruz.dev.br`.                                                       |
| `GITHUB_TOKEN`       | Não         | **Server-only** (sem prefixo `VITE_`, configurado na Vercel). Usado por `/api/github-stats` para as métricas do GitHub; sem ela, o card de commits usa o valor de fallback. |

> Variáveis com prefixo `VITE_` são expostas ao browser — nunca coloque segredos.

---

## 🔗 Como adicionar um link

Toda URL pública do site mora em **`frontend/src/shared/config/links.ts`**. É o
único arquivo a tocar: nem a página `/links`, nem o Footer, nem o Contato têm
URL escrita à mão.

### 1. Acrescente um item a `TREE_LINKS`

```ts
{
    id: "instagram",                          // único; key do React e dos testes
    kind: "social",                           // "primary" (card) ou "social" (ícone)
    label: { pt: "Instagram", en: "Instagram" },
    href: "https://instagram.com/seu-usuario",
    icon: IconInstagram,                      // componente de shared/ui/Icons
    external: true,                           // false só para mailto e rotas internas
}
```

- **`primary`** vira um card grande empilhado. Aceita `sublabel` — o handle em
  fonte mono exibido sob o rótulo.
- **`social`** vira um botão compacto na linha de ícones, abaixo dos cards.

Pronto: a página se adapta sozinha. Nenhum JSX de layout precisa mudar, e o
`PRIMARY_LINKS` / `SOCIAL_LINKS` faz a partição.

### 2. Se o link já existe em outro lugar, reaproveite

Nunca reescreva uma URL que o projeto já conhece:

- perfis, e-mail, site e currículo → `PROFILE` (`shared/config/profile.ts`)
- projetos próprios → `PROJECT_URLS`, no topo do mesmo `links.ts`
- rotas internas → `ROUTES` (`shared/config/routes.ts`)

```ts
href: PROFILE.social.github.url;         // ✅
href: "https://github.com/https-shini";  // ❌ duplica a fonte
```

### 3. Ícone

Use qualquer export de `shared/ui/Icons.tsx` — são 65 SVGs inline. Para um novo,
desenhe-o lá com os componentes-base `F` (preenchido) ou `S` (contorno), seguindo
os existentes, e importe-o em `links.ts`.

### 4. Chip de tecnologia (opcional)

Os chips de stack da `/links` usam SVGs locais em `src/assets/skills/`, com
variante por tema. Para incluir um: adicione `<nome>-dark.svg` e
`<nome>-light.svg` (ou um único arquivo, quando não houver variante), registre
os créditos em `CREDITS.md` e acrescente a entrada em `TECH_STACK`
(`pages/Links/index.tsx`).

### 5. Verifique

```bash
npm test   # links.test.ts valida ids únicos, URLs sem duplicata,
           # derivação de PROFILE e coerência do campo `external`
```

---

## 🧪 Testes

Suíte com **Vitest + React Testing Library** (ambiente jsdom) — **106 testes em 16 arquivos**:

- **Utils** — `dateUtils`, `academicDates`, `text`, `richText`, `mailto`, `careerDates`
- **Config** — `links` (ids únicos, URLs sem duplicata, derivação de `PROFILE`, coerência de `external`, `linkKind`)
- **Hooks** — `useTheme` (persistência, `prefers-color-scheme`, DOM), `useGithubStats` (cache e fallback)
- **Contexto** — `LangContext` (idioma inicial, toggle, persistência), `RouterContext` (navigate, popstate, normalização)
- **UI base** — `Modal` (Esc, overlay, focus-trap, restauração de foco, scroll-lock)
- **Componentes** — `Hero`, `ContactForm` (validação, envio, erros), `Recommendations` (paginação do carrossel)
- **Páginas** — `LinksPage` (perfil, `rel` seguro nos externos, mailto sem nova aba, share nativo vs. clipboard, SEO da rota)

```bash
npm run test          # run único (CI)
npm run test:watch    # watch mode
```

---

## ✅ Qualidade e CI

- **ESLint 9** (flat config) com `typescript-eslint`, `react-hooks`, `react-refresh` e `jsx-a11y`
- **Prettier** + **EditorConfig** para estilo consistente
- **Husky + lint-staged** — formatação automática no pre-commit
- **Commitlint** — Conventional Commits obrigatórios (`feat:`, `fix:`, `docs:`…)
- **GitHub Actions** (`.github/workflows/ci.yml`) — lint → type-check → format check → testes → build a cada push/PR; o pipeline falha se qualquer etapa falhar

---

## ♿ Acessibilidade

| Recurso               | Implementação                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Semântica HTML        | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<address>`, `<footer>`, `<time>` |
| ARIA                  | `aria-label`, `aria-labelledby`, `aria-expanded`, `aria-modal`, `aria-live` e afins        |
| Navegação por teclado | Tab/Shift+Tab, Escape, setas nos carrosséis, foco visível em tudo                          |
| Focus trap            | Menu mobile e modais capturam o foco                                                       |
| Formulário            | Labels reais, `aria-invalid`, `aria-describedby` por erro, status com `role="status"`      |
| Movimento reduzido    | `prefers-reduced-motion` remove animações e autoplay                                       |
| Lint de a11y          | `eslint-plugin-jsx-a11y` no CI                                                             |

---

## 🗺 Roadmap

- [ ] Backend próprio para o formulário de contato (`backend/`)
- [ ] Testes E2E com Playwright
- [ ] Página de estudo de caso por projeto
- [ ] Blog técnico integrado
- [ ] Deploy preview automático por PR

---

## 🤝 Contribuição

Este é um projeto pessoal, mas sugestões são bem-vindas:

1. Abra uma issue descrevendo a melhoria
2. Fork + branch a partir de `main`
3. Commits no padrão Conventional Commits (validados pelo commitlint)
4. Abra um PR — o CI precisa passar (lint, tipos, testes, build)

---

## 👤 Autor

<div align="center">

**Guilherme de Souza Cruz**
Desenvolvedor de Software · Estudante de Ciência da Computação
São Paulo, SP — Brasil

[![Portfolio](https://img.shields.io/badge/Portfolio-311DB4?style=for-the-badge)](https://gcruz.dev.br)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-3E79E0?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/oguilherme-cruz)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contato.guilhermescruz@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/https-shini)

</div>

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais informações.

---

<div align="center">

_Feito com ♥ em São Paulo — React + TypeScript + muito café_

</div>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6&height=100&section=footer"/>
