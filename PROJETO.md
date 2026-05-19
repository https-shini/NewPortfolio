# NewPortfolio v2.0 — Documentação Técnica

> Documento gerado em 21/04/2026 para revisão, auditoria e planejamento de melhorias.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
3. [Configuração & Build](#3-configuração--build)
4. [Camada Shared](#4-camada-shared)
5. [Widgets — Seções da Página](#5-widgets--seções-da-página)
6. [Sistema de i18n](#6-sistema-de-i18n)
7. [Sistema de Temas](#7-sistema-de-temas)
8. [Dados do Portfólio](#8-dados-do-portfólio)
9. [Acessibilidade](#9-acessibilidade)
10. [Problemas Conhecidos & O Que Melhorar](#10-problemas-conhecidos--o-que-melhorar)
11. [Checklist de Revisão](#11-checklist-de-revisão)

---

## 1. Visão Geral

| Item | Detalhe |
|---|---|
| **Framework** | React 18 + TypeScript 5 (strict mode) |
| **Bundler** | Vite 5 |
| **Estilo** | CSS Modules + CSS Custom Properties (design tokens) |
| **Roteamento** | Nenhum — SPA single-page estática |
| **i18n** | Português / Inglês (localStorage) |
| **Temas** | Dark (padrão) / Light |
| **Deploy** | Estático (dist/) — pronto para GitHub Pages, Netlify, Vercel |
| **Backend** | Nenhum ativo. Formulário de contato aponta para Formspree (não configurado) |

A página é composta por **9 widgets** renderizados em sequência dentro de `<main>`:

```
Header → Hero → About → Timeline → Featured → Work → Recommendations → Contact → Footer
```

---

## 2. Estrutura de Pastas

```
frontend/src/
│
├── app/
│   ├── App.tsx              — Raiz: <Providers> + <Routes>
│   ├── providers.tsx        — Wrapper de contextos (atualmente vazio, extensível)
│   └── routes.tsx           — Renderiza apenas <HomePage> (sem roteador externo)
│
├── pages/
│   └── Home/
│       └── index.tsx        — Página principal; inicializa useScrollReveal e useReducedMotion
│
├── widgets/                 — Uma pasta por seção da página
│   ├── Header/
│   ├── Hero/
│   ├── About/
│   ├── Timeline/
│   │   ├── hooks/
│   │   │   ├── useRevealOnScroll.ts   ← hook compartilhado (criado na refatoração)
│   │   │   └── useTimelineFilter.ts  ← hook legado (não usado pelo novo layout)
│   │   ├── components/
│   │   │   ├── ExperienceSection.tsx / .css
│   │   │   ├── ExperienceCard.tsx / .css
│   │   │   ├── EducationAndCertificationsSection.tsx / .css
│   │   │   ├── EducationCard.tsx / .css
│   │   │   ├── TimelineCard.tsx / .css     ← componentes legados
│   │   │   ├── TimelineItemCompact.tsx / .css  ← componentes legados
│   │   │   └── TimelineModal.tsx / .css    ← componente legado
│   │   ├── Timeline.tsx
│   │   ├── Timeline.css
│   │   ├── Timeline.types.ts
│   │   └── Timeline.data.ts
│   ├── Featured/
│   ├── Work/
│   ├── Recommendations/
│   │   ├── components/
│   │   │   ├── RecommendationCard.tsx / .css
│   │   │   ├── RecommendationModal.tsx / .css
│   │   │   └── CarouselControls.tsx / .css
│   │   ├── Recommendations.tsx
│   │   ├── Recommendations.css
│   │   ├── Recommendations.types.ts
│   │   └── Recommendations.data.ts
│   ├── Contact/
│   └── Footer/
│
├── features/
│   └── contact/
│       ├── api/index.ts             — Endpoint do Formspree (não configurado)
│       ├── model/useContactForm.ts  — Estado do formulário
│       └── ui/ContactForm.tsx       — Componente do formulário
│
├── shared/
│   ├── hooks/
│   │   ├── useLang.ts          — i18n (PT/EN)
│   │   ├── useTheme.ts         — Dark/Light
│   │   ├── useScrollReveal.ts  — Observer global [data-reveal]
│   │   └── useReducedMotion.ts — Acessibilidade de movimento
│   ├── lib/
│   │   ├── translations.ts     — Todas as strings PT/EN + tipo TranslationKey
│   │   ├── dateUtils.ts        — Cálculo de duração e formatação de datas
│   │   ├── smoothScroll.ts     — Scroll suave com foco acessível
│   │   ├── announce.ts         — Anúncio para leitores de tela (aria-live)
│   │   └── highlightText.tsx   — Marca termos de busca em texto
│   ├── ui/
│   │   └── Icons.tsx           — 70+ ícones SVG como componentes React
│   ├── config/
│   │   └── constants.ts        — Email, URLs, chaves de localStorage
│   └── styles/
│       ├── tokens.css          — Design system completo (CSS custom properties)
│       ├── globals.css         — Reset + classes utilitárias
│       └── theme-patches.css   — Overrides do modo claro (body.light-mode)
│
└── services/
    └── api.ts                  — Configuração de chamadas de API
```

---

## 3. Configuração & Build

### `vite.config.ts`
- Alias `@` → `src/` (use `@/shared/hooks/useLang` em vez de caminhos relativos)
- Dev: porta **5173**, abre automaticamente no browser
- Build: organiza assets em subpastas (`assets/js/`, `assets/css/`, `assets/img/`, `assets/fonts/`)
- CSS code splitting ativo
- Minificação com esbuild, target ES2020

### `tsconfig.json`
- **strict: true** — TypeScript estrito
- Path alias `@/*` → `src/*`
- Sem emissão de arquivos (Vite transpila)
- `noUnusedLocals: false` — variáveis não usadas não geram erro (flexibilidade)

### Scripts disponíveis
```bash
cd frontend

npm run dev      # Servidor de desenvolvimento em localhost:5173
npm run build    # Type-check + build de produção em dist/
npm run preview  # Serve a build de produção em localhost:4173
```

---

## 4. Camada Shared

### Hooks

#### `useLang()` — i18n
```
Retorna: { lang, toggleLang, t }
- lang: 'pt' | 'en'
- toggleLang(): alterna idioma e persiste em localStorage
- t(key: TranslationKey): string — busca a string no idioma atual
```
- Fallback: localStorage → `navigator.language` → português
- Atualiza `<html lang>` automaticamente

#### `useTheme()` — Tema
```
Retorna: { theme, toggleTheme, setTheme }
- Aplica: data-theme no <html>, body.dark-mode / body.light-mode
- Sincroniza com prefers-color-scheme quando não há preferência salva
```

#### `useScrollReveal()` — Animação de entrada
- Observa todos os elementos `[data-reveal]` da página
- Adiciona classe `is-visible` quando entram na viewport
- Respeitando `prefers-reduced-motion`

#### `useReducedMotion()` — Acessibilidade
- Detecta `prefers-reduced-motion: reduce`
- Adiciona/remove classe `reduce-motion` no `<body>`
- CSS usa isso para desativar animações globalmente

### Utilitários (`shared/lib/`)

| Arquivo | Função principal |
|---|---|
| `translations.ts` | 80+ strings PT/EN + tipo `TranslationKey` |
| `dateUtils.ts` | `calculateDuration()` e `formatMonthYear()` |
| `smoothScroll.ts` | `scrollToSection(id)` com foco acessível |
| `announce.ts` | `announce(msg)` para aria-live polite/assertive |
| `highlightText.tsx` | Envolve matches em `<mark>` para busca |

### `constants.ts` — Valores que você precisa configurar
```typescript
export const AUTHOR_EMAIL  = 'contato.guilhermescruz@gmail.com';
export const GITHUB_URL    = 'https://github.com/https-shini';
export const LINKEDIN_URL  = 'https://linkedin.com/in/oguilherme-cruz';
export const FORM_ENDPOINT = 'https://formspree.io/f/CONFIGURE'; // ← PENDENTE
export const THEME_KEY     = 'portfolio-theme';
export const LANG_KEY      = 'portfolio-lang';
```

### `Icons.tsx` — Biblioteca de ícones
70+ componentes SVG organizados por categoria:
- **Tema**: Sun, Moon
- **Social/Brand**: GitHub, LinkedIn, Twitter, Instagram, DEV.to, Gmail
- **Navegação**: Chevrons, Arrows, Menu, Close
- **Dev**: Code, Terminal, GitBranch, GitCommit, GitPullRequest
- **Infra**: CPU, Database, Server, Layers, Package, Wifi
- **Portfolio**: Location, Briefcase, GraduationCap, Badge, ExternalLink, Download...
- Todos aceitam: `className`, `width`, `height`, `aria-hidden`, `aria-label`

---

## 5. Widgets — Seções da Página

### `Header`
- Barra de navegação sticky com scroll sentinel (ativa ao passar de 80px)
- Detecta seção ativa via IntersectionObserver
- Menu mobile com focus trap + body scroll lock
- Botões: toggle de tema (Sol/Lua), toggle de idioma (PT/EN), links de navegação
- Scroll suave para seções ao clicar nos links

---

### `Hero`
- Seção de introdução com avatar, cargo, descrição e CTAs
- CTA primário: "Ver projetos" (scroll para #work)
- CTA secundário: Download do CV (link externo hardcoded)
- Ícones sociais: GitHub, LinkedIn, Gmail
- Background decorativo: grid + glow (aria-hidden)

---

### `About`
- Bio em prosa + 4 cards de especialidade (Frontend, Backend, Database, Quality)
- Grid de estatísticas com animação count-up (0 → valor em 1200ms)
- Estatísticas: Formação (3 anos), Semestre (7º), Commits (100+), Estudando (5+ anos)
- Grid de tech stack: 16 tecnologias com ícones
- Layout: sidebar sticky no desktop

---

### `Timeline`
Layout de **duas colunas** side-by-side no desktop (≥961px), empilhado no mobile.

**Coluna esquerda — ExperienceSection:**
- Linha vertical com dots coloridos por status
- Cards com stagger delay de 100ms
- Status: active (verde) / done (azul) / planned (cinza)

**Coluna direita — EducationAndCertificationsSection:**
- Duas sub-seções: Formação (grid 2 col) e Certificações (grid 2 col)
- Cards com stagger delay de 80ms
- Certificados com link externo

**Arquivos de dados** em `Timeline.data.ts`:
- 2 experiências (Analista atual + Estagiário anterior — Wise System)
- 2 formações (UNICSUL em andamento + ETEC concluída)
- 5 certificações (Cisco, CC50, Rocketseat, Data Modeling, Qualidade de Software)

**Componentes legados ainda presentes** (não usados pelo layout atual):
- `TimelineCard.tsx`, `TimelineItemCompact.tsx`, `TimelineModal.tsx`
- `hooks/useTimelineFilter.ts`

---

### `Featured`
- Carrossel manual do projeto TCC (HomeMade Gourmet)
- 4 slides: Visão Geral, Receitas, Calorias, Painel Admin
- Auto-advance a cada 4,5 segundos (pausa se aba oculta)
- Navegação: botões de seta, dots, swipe (48px threshold), teclado (←→)
- Tech stack: HTML5, CSS3, JS, PHP, MySQL, Figma
- Detalhes: 3 cards (Desafio, Solução, Resultado)
- CTAs: Live demo + GitHub repo

---

### `Work`
- Grid de 3 projetos:
  - **Web Chat** (Node.js, JavaScript, WebSocket)
  - **Auth Service** (Node.js, TypeScript, JWT)
  - **Controle Financeiro** (React, JavaScript, CSS3)
- Cada card: screenshot, título, descrição, badges de tech, botões Demo e Repo
- CTA ao final: "Ver todos no GitHub"

---

### `Recommendations`
- Carrossel de 4 depoimentos (1 visível no mobile, 2 no desktop)
- Depoentes: Ana Lima (Tech Lead, Wise System), Prof. Carlos Mendes (UNICSUL), Ricardo Souza (dev colega), Fernanda Castro (coordenadora ETEC)
- Click/Enter abre modal com texto completo
- Modal: focus trap, Esc para fechar, retorna foco ao botão de origem
- Touch swipe + teclado (←→)

---

### `Contact`
- Layout duas colunas: esquerda (CTA + botão de email), direita (dados + disponibilidade)
- Botão de email: abre mailto pré-preenchido (sujeito/corpo i18n)
- Badge de disponibilidade: "Disponível para oportunidades" (role=status)
- Links: LinkedIn, GitHub, Email com ícones

---

### `Footer`
- 4 colunas: Marca + Navegação + Projetos + Contato
- Sub-componentes memoizados: FooterBrand, FooterNavCol, FooterContact, FooterBottom
- `<address>` semântico no bloco de contato
- Copyright com `<time>`, link de download do CV, "feito com ♥"

---

## 6. Sistema de i18n

**Como funciona:**
1. Na montagem: verifica `localStorage['portfolio-lang']`
2. Se não encontrar: verifica `navigator.language` (começa com 'en' → inglês, senão → português)
3. `t(key)`: busca no idioma atual → fallback para PT → fallback para a própria chave

**Fluxo de troca:**
- Usuário clica no botão PT/EN no Header
- `toggleLang()` salva no localStorage e atualiza `<html lang="...">`
- Todos os componentes que chamam `useLang()` re-renderizam automaticamente

**Chaves de tradução por seção:**

| Prefixo | Strings |
|---|---|
| `nav.*` | home, about, career, featured, work, contact |
| `hero.*` | greeting, role, sub, desc, status, cta.work, cta.cv, badge, scroll |
| `about.*` | title, bio (4 parágrafos), goal.title, goal.text |
| `timeline.*` | title, sub, tab.edu, tab.cert, tab.exp, exp.title, edu.title |
| `featured.*` | badge, desc, btn.live, btn.repo, detail.* |
| `work.*` | title, sub, more |
| `contact.*` | title, sub, hook, send, sending, sent, cta.*, meta.* |
| `rec.*` | title, sub |
| `footer.*` | tagline, nav, projects, contact, location, made, rights |

---

## 7. Sistema de Temas

**Tokens CSS** definidos em `tokens.css` (camada `:root` = dark mode padrão):

| Token | Valor Dark | Função |
|---|---|---|
| `--color-brand` | #e11d48 (Crimson 600) | Cor principal (vermelho) |
| `--color-accent` | #6366f1 (Indigo 500) | Cor secundária (azul/roxo) |
| `--color-bg` | #070d19 | Fundo da página |
| `--color-surface-1` | #0b1120 | Cards, painéis |
| `--color-surface-2` | #0f172a | Cards com hover |
| `--color-text-1` | #f8fafc | Títulos (AAA) |
| `--color-text-2` | #e2e8f0 | Corpo de texto |
| `--color-text-3` | #94a3b8 | Texto secundário |
| `--color-text-4` | #475569 | Texto muted |
| `--color-success` | verde | Status "ativo" |

**Light mode:** overrides em `theme-patches.css` via `body.light-mode { ... }`

**Troca de tema:**
1. `applyTheme()` define `data-theme` no `<html>`, `color-scheme`, e classes no `<body>`
2. CSS responde automaticamente via custom properties
3. Salvo em `localStorage['portfolio-theme']`
4. Sincroniza com `prefers-color-scheme` apenas quando não há preferência salva

---

## 8. Dados do Portfólio

### Experiências (`category: 'exp'`)

| # | Cargo | Empresa | Período | Status |
|---|---|---|---|---|
| 1 | Analista de Suporte Técnico (Helpdesk) | Wise System | Jan 2026 – Presente | Atual |
| 2 | Estagiário de Suporte Técnico (Helpdesk) | Wise System | Abr 2025 – Dez 2025 | Concluído |

### Formação (`category: 'edu'`)

| # | Curso | Instituição | Período | Status |
|---|---|---|---|---|
| 1 | Bacharelado em Ciência da Computação | UNICSUL | 2023 – 2026 | Em andamento |
| 2 | Técnico em Desenvolvimento de Sistemas | ETEC | 2020 – 2022 | Concluído |

### Certificações (`category: 'cert'`)

| # | Certificado | Emissor | Data |
|---|---|---|---|
| 1 | Cisco Cybersecurity | Cisco | Abr 2026 |
| 2 | CS50 (Introduction to Computer Science) | Harvard | Dez 2024 |
| 3 | Discover | Rocketseat | Mar 2024 |
| 4 | Modelagem de Dados | Bradesco | 2023 |
| 5 | Qualidade de Software | iEstudar | Nov 2022 |

### Projetos (`Work`)

| Projeto | Tech | Links |
|---|---|---|
| Web Chat | Node.js, JavaScript, WebSocket | demo + repo |
| Auth Service | Node.js, TypeScript, JWT | demo + repo |
| Controle Financeiro | React, JavaScript, CSS3 | demo + repo |

### Recomendações (`Recommendations`)

| Pessoa | Cargo | Contexto |
|---|---|---|
| Ana Lima | Tech Lead | Wise System — relação profissional direta |
| Prof. Carlos Mendes | Professor | UNICSUL — perspectiva acadêmica |
| Ricardo Souza | Desenvolvedor | Wise System — colega de equipe |
| Fernanda Castro | Coordenadora | ETEC — TCC aprovado com louvor |

---

## 9. Acessibilidade

Funcionalidades implementadas:

- **Skip link**: "Ir para o conteúdo principal" (visível no foco)
- **Landmarks semânticos**: `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>`, `<address>`
- **ARIA labels**: todos os botões e regiões interativas têm `aria-label` ou `aria-labelledby`
- **Focus trap**: modal de Recommendations + menu mobile no Header
- **Retorno de foco**: modal retorna foco ao elemento que o abriu
- **Escape**: fecha modais e menu mobile
- **Teclado completo**: Tab, Shift+Tab, Enter, Espaço, Escape, ←→ onde aplicável
- **Reduced motion**: `useReducedMotion()` + `@media (prefers-reduced-motion)` em todos os CSS
- **Aria-live**: região global para anúncios de screen readers
- **Elementos decorativos**: `aria-hidden="true"` em ícones, backgrounds, glows
- **`<time>`**: datas semânticas com atributo `dateTime`
- **`role="status"`**: badge de disponibilidade no Contact

---

## 10. Problemas Conhecidos & O Que Melhorar

### 🔴 Crítico / Funcional

#### 1. Formulário de contato não funciona
**Arquivo:** `frontend/src/shared/config/constants.ts` (linha 4)
```typescript
export const FORM_ENDPOINT = 'https://formspree.io/f/CONFIGURE'; // ← placeholder
```
**Problema:** O endpoint do Formspree não está configurado. Enviar o formulário vai falhar.
**Solução:** Criar conta em formspree.io, criar um form, substituir `CONFIGURE` pelo ID real.

#### 2. Componentes legados do Timeline ainda existem
**Arquivos:**
- `widgets/Timeline/components/TimelineCard.tsx` + `.css`
- `widgets/Timeline/components/TimelineItemCompact.tsx` + `.css`
- `widgets/Timeline/components/TimelineModal.tsx` + `.css`
- `widgets/Timeline/hooks/useTimelineFilter.ts`

**Problema:** São do layout antigo, não são importados em lugar nenhum — dead code puro.
**Solução:** Deletar todos esses arquivos. Verifique antes com `grep -r "TimelineCard\|TimelineItemCompact\|TimelineModal\|useTimelineFilter" src/`.

---

### 🟡 Importante / Dados

#### 3. URL do CV hardcoded no Hero
**Arquivo:** `widgets/Hero/Hero.tsx`
```tsx
href="https://https-shini.github.io/portfolio/docs/curriculo.pdf"
```
**Problema:** URL aponta para o portfólio antigo, não para o novo. Se o domínio mudar, quebra.
**Solução:** Mover para `constants.ts` como `CV_URL` e usar `import { CV_URL } from '@/shared/config/constants'`.

#### 4. Recomendações com dados fictícios
**Arquivo:** `widgets/Recommendations/Recommendations.data.ts`
**Problema:** Os 4 depoimentos são pessoas reais? Os textos são reais ou placeholder?
**Ação:** Revisar se os textos refletem depoimentos reais. Se necessário, solicitar aprovação das pessoas antes de publicar.

#### 5. Projetos do Work com imagens placeholder
**Arquivo:** `widgets/Work/Work.tsx`
**Problema:** As imagens dos projetos (work01.png, work02.png, work03.png) parecem ser placeholders.
**Ação:** Substituir por screenshots reais dos projetos funcionando.

#### 6. Links de projetos no Work
**Arquivo:** `widgets/Work/Work.tsx`
**Ação:** Verificar se os links de `demoUrl` e `repoUrl` de cada projeto apontam para URLs reais e funcionando.

#### 7. Slides do Featured com imagens reais?
**Arquivo:** `widgets/Featured/Featured.tsx`
**Ação:** Verificar se os 4 slides do carrossel do HomeMade Gourmet têm screenshots reais do projeto.

---

### 🟠 Técnico / Arquitetura

#### 8. `useRevealOnScroll` em `RecommendationCard` não usa o hook compartilhado
**Arquivo:** `widgets/Recommendations/components/RecommendationCard.tsx`
**Problema:** Implementa `IntersectionObserver` inline com `useEffect` (código duplicado), em vez de usar o `useRevealOnScroll` do Timeline.
**Solução:** O hook está em `widgets/Timeline/hooks/` — para reutilização real, deveria ser movido para `shared/hooks/useRevealOnScroll.ts`.

#### 9. Hook `useRevealOnScroll` está na pasta errada
**Arquivo atual:** `widgets/Timeline/hooks/useRevealOnScroll.ts`
**Problema:** Está acoplado ao widget Timeline, mas é genérico o suficiente para ser compartilhado.
**Solução:** Mover para `shared/hooks/useRevealOnScroll.ts` e atualizar os imports em `ExperienceCard.tsx` e `EducationCard.tsx`.

#### 10. `providers.tsx` está vazio
**Arquivo:** `app/providers.tsx`
**Situação:** Apenas renderiza `{children}` sem nenhum contexto.
**Nota:** Não é um bug, mas se futuramente precisar de contextos globais (ex: Toast, Query Client), é aqui que entram.

#### 11. `features/contact/` possivelmente não integrado
**Arquivos:** `features/contact/ui/ContactForm.tsx`, `model/useContactForm.ts`
**Dúvida:** O widget `Contact/Contact.tsx` usa esses arquivos ou reimplementa tudo internamente?
**Ação:** Verificar se o ContactForm da pasta `features/` é de fato usado na seção Contact, ou se é dead code também.

---

### 🟢 Melhorias de Qualidade (não urgente)

#### 12. Eyebrow "Trajetória" hardcoded no Timeline
**Arquivo:** `widgets/Timeline/Timeline.tsx`
```tsx
<span className="section-eyebrow">Trajetória</span>
```
**Problema:** Não usa `t()` — aparecerá em português mesmo com idioma em inglês.
**Solução:** Adicionar chave `"timeline.eyebrow"` nas translations e usar `t('timeline.eyebrow')`.

#### 13. Eyebrows hardcoded nas seções do Timeline
**Arquivos:** `ExperienceSection.tsx` e `EducationAndCertificationsSection.tsx`
```tsx
{lang === 'pt' ? 'Profissional' : 'Career'}
{lang === 'pt' ? 'Acadêmico' : 'Academic'}
```
**Situação:** Funciona, mas é padrão inconsistente com o restante que usa `t()`.
**Solução (opcional):** Adicionar `"timeline.exp.eyebrow"` e `"timeline.edu.eyebrow"` nas translations.

#### 14. Labels de tags no EducationCard
**Arquivo:** `widgets/Timeline/components/EducationCard.tsx`
```tsx
aria-label={lang === 'pt' ? 'Tags' : 'Tags'}
```
**Problema:** Ambos os valores são iguais ("Tags"). A condição não faz nada.
**Solução:** Remover a ternária e usar apenas `aria-label="Tags"`, ou traduzir de fato.

#### 15. `noUnusedLocals: false` no tsconfig
**Situação:** TypeScript não avisa sobre variáveis/imports não usados.
**Trade-off:** Facilita desenvolvimento, mas pode acumular dead code.
**Sugestão:** Ao finalizar o projeto, ativar `"noUnusedLocals": true` e limpar warnings.

#### 16. Sem testes automatizados
**Situação:** Não há pasta `__tests__/`, `*.test.tsx`, nem configuração de Vitest/Jest.
**Impacto:** Refatorações futuras não têm rede de segurança.
**Sugestão:** Ao menos testes unitários para `useLang`, `useTheme`, `dateUtils`.

---

## 11. Checklist de Revisão

Use esta lista antes de publicar o portfólio:

### Dados & Conteúdo
- [ ] Configurar endpoint real do Formspree em `constants.ts`
- [ ] Testar envio do formulário de contato
- [ ] Corrigir/mover URL do CV para `constants.ts`
- [ ] Confirmar se os links dos projetos (demo + repo) estão funcionando
- [ ] Substituir imagens placeholder dos projetos por screenshots reais
- [ ] Verificar se os slides do carrossel (Featured) têm imagens reais
- [ ] Revisar e confirmar textos das Recomendações com as pessoas citadas
- [ ] Verificar se todos os links de certificados (`certUrl`) estão corretos

### Código & Arquitetura
- [ ] Deletar componentes legados do Timeline (`TimelineCard`, `TimelineItemCompact`, `TimelineModal`, `useTimelineFilter`)
- [ ] Verificar se `features/contact/` é usado ou é dead code
- [ ] Mover `useRevealOnScroll` para `shared/hooks/` e atualizar imports
- [ ] Refatorar `RecommendationCard` para usar o hook compartilhado
- [ ] Adicionar `"timeline.eyebrow"` nas translations (PT/EN)
- [ ] Corrigir `aria-label` duplicado no `EducationCard`

### Qualidade Visual
- [ ] Testar em mobile (375px, 390px, 414px)
- [ ] Testar em tablet (768px, 960px)
- [ ] Testar em desktop (1280px, 1440px, 1920px)
- [ ] Testar modo claro em todas as seções
- [ ] Testar com `prefers-reduced-motion: reduce` ativo
- [ ] Verificar contraste de texto no modo claro (WCAG AA)

### Acessibilidade
- [ ] Navegar a página inteira só com teclado (Tab, Enter, Esc)
- [ ] Testar com leitor de tela (NVDA ou VoiceOver)
- [ ] Verificar que todos os modais têm focus trap funcionando
- [ ] Verificar retorno de foco ao fechar modais

### Performance
- [ ] Rodar `npm run build` e verificar tamanho dos chunks
- [ ] Verificar se imagens estão otimizadas (use WebP quando possível)
- [ ] Testar no Lighthouse (Performance, Acessibilidade, SEO, Best Practices)

### Deploy
- [ ] Configurar domínio customizado (se aplicável)
- [ ] Verificar `sitemap.xml` com URLs corretas
- [ ] Adicionar `robots.txt` se não existir
- [ ] Configurar variáveis de ambiente de produção

---

*Documentação gerada automaticamente via análise estática do codebase.*
*Atualizar manualmente conforme o projeto evolui.*
