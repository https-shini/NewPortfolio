<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6&height=140&section=header&text=Portfolio%20v2&fontSize=42&fontColor=fff&animation=fadeIn&fontAlignY=55&desc=Guilherme%20Cruz%20·%20Desenvolvedor%20de%20Software&descAlignY=75&descAlign=50"/>

<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=26&duration=2500&pause=800&color=FF6B6B&center=true&vCenter=true&width=900&lines=⚛️+Portfólio+construído+com+React+%2B+TypeScript;🎨+Design+System+v2.0+com+tokens+CSS;🌐+Suporte+a+PT+e+EN+(i18n+completo);♿+Acessível+—+ARIA%2C+teclado+e+reduced+motion;🚀+Deploy+live+em+bl4ck404.dev.br" alt="Typing SVG" />

<br/>

[![Deploy](https://img.shields.io/badge/Deploy-Live-46e8b0?style=for-the-badge&logo=vercel&logoColor=white)](https://bl4ck404.dev.br)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Licença](https://img.shields.io/badge/Licença-MIT-ff6b6b?style=for-the-badge)](#licença)

</div>

---

## 📋 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Demonstração](#-demonstração)
- [Seções](#-seções)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Design System](#-design-system)
- [Funcionalidades](#-funcionalidades)
- [Como executar](#-como-executar)
- [Acessibilidade](#-acessibilidade)
- [Autor](#-autor)

---

## 💡 Sobre o projeto

Portfólio pessoal de **segunda geração** — reescrito do zero em **React + TypeScript + Vite**, evoluindo a versão anterior em HTML/CSS/JS puro. O projeto é uma SPA com arquitetura por features, design system próprio com tokens CSS, internacionalização completa (PT/EN) e sub-componentes memoizados para performance.

Cada seção foi construída como um módulo independente, com seus próprios arquivos `.tsx` e `.css`, facilitando manutenção e escalabilidade. O sistema de i18n via `useLang` adapta todos os textos ao idioma selecionado sem recarregar a página, e o sistema de tema persiste a preferência do usuário via `localStorage`.

---

## 🌐 Demonstração

> Acesse o portfólio em produção:

**[→ bl4ck404.dev.br](https://bl4ck404.dev.br)**

---

## 📄 Seções

| #   | Seção        | Descrição                                                                            |
| --- | ------------ | ------------------------------------------------------------------------------------ |
| 01  | **Hero**     | Apresentação com foto, status de disponibilidade, CTA e links sociais                |
| 02  | **About**    | Bio, 4 áreas de especialização, stats com count-up e tech stack de 16 ícones         |
| 03  | **Timeline** | Trajetória em tabs (Educação · Certificações · Experiência) com IntersectionObserver |
| 04  | **Featured** | Projeto em destaque (HomeMade Gourmet) com carrossel de slides e detail cards        |
| 05  | **Work**     | Grid de projetos com thumbnail, overlay de ações e badges de tecnologia              |
| 06  | **Contact**  | CTA de e-mail, links alternativos, perfil de contato e dados de disponibilidade      |
| —   | **Header**   | Navegação fixa com scroll spy, language pill, theme toggle e menu mobile             |
| —   | **Footer**   | Grid de 4 colunas com brand, nav, projetos, contato e barra inferior com CV          |

---

## 🛠 Tecnologias

| Tecnologia         | Versão | Uso                                                   |
| ------------------ | ------ | ----------------------------------------------------- |
| **React**          | 18     | Renderização de UI com hooks e memo                   |
| **TypeScript**     | 5      | Tipagem estrita em todos os componentes               |
| **Vite**           | 5      | Bundler, dev server e path aliases (`@/`)             |
| **CSS Modules**    | —      | Escopo de estilos por componente (`.css` por feature) |
| **skillicons.dev** | —      | Ícones de tecnologias na seção About                  |

> Zero dependências de UI externas — todos os componentes e ícones são do próprio design system.

---

## 🏗 Arquitetura

```
src/
│
├── features/                    # Módulos por feature (seção)
│   ├── hero/ui/Hero.tsx
│   ├── about/ui/About.tsx
│   ├── timeline/
│   │   ├── ui/Timeline.tsx
│   │   ├── Timeline.data.ts     # Dados estáticos centralizados
│   │   └── Timeline.types.ts    # Tipos: TimelineItem, TimelineCategory
│   ├── featured/ui/Featured.tsx
│   ├── work/
│   │   ├── ui/Work.tsx
│   │   └── Work.types.ts        # Tipos: WorkProject
│   ├── contact/ui/Contact.tsx
│   ├── header/ui/Header.tsx
│   └── footer/ui/Footer.tsx
│
└── shared/
    ├── hooks/
    │   ├── useLang.ts           # i18n: lang, t(), toggleLang()
    │   └── useTheme.ts          # Tema: theme, toggleTheme()
    ├── lib/
    │   ├── translations.ts      # Objeto Translations com todas as chaves i18n
    │   └── smoothScroll.ts      # scrollToSection() com suporte a reduced-motion
    ├── config/
    │   └── constants.ts         # AUTHOR_EMAIL, GITHUB_URL, LINKEDIN_URL
    └── ui/
        └── Icons.tsx            # Design system de ícones (SVG inline, sem lib externa)
```

**Padrões aplicados:**

- `React.memo` em todos os sub-componentes do Footer — evita re-renders desnecessários
- `useCallback` para handlers estáveis entre renders
- `IntersectionObserver` para reveal e scroll spy — sem listeners de scroll
- `TranslationKey` inferido via `Parameters<ReturnType<typeof useLang>["t"]>[0]` — tipagem automática das chaves i18n

---

## 🎨 Design System

O sistema de design é baseado em **tokens CSS** definidos no arquivo global. Suporta dois temas (dark padrão / light) com persistência via `localStorage`.

### Tokens principais

| Categoria           | Exemplos de variáveis                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| **Cores**           | `--color-brand`, `--color-accent`, `--color-bg`, `--color-surface-1/2/3` |
| **Tipografia**      | `--font-display` (Syne), `--font-mono` (JetBrains Mono), `--font-body`   |
| **Escala de texto** | `--text-2xs` → `--text-7xl`                                              |
| **Espaçamento**     | `--space-1` → `--space-16`                                               |
| **Bordas**          | `--radius-sm` → `--radius-2xl`, `--radius-full`                          |
| **Sombras**         | `--shadow-md`, `--shadow-xl`, `--shadow-card-hover`                      |
| **Transições**      | `--transition-fast`, `--transition-base`, `--transition-slow`            |
| **Z-index**         | `--z-header`, `--z-drawer`                                               |

### Componentes utilitários globais

| Classe                                                                                   | Descrição                                              |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `.btn`, `.btn--primary`, `.btn--outline`, `.btn--sm`, `.btn--lg`                         | Sistema de botões                                      |
| `.badge`, `.badge--brand`, `.badge--accent`, `.badge--neutral`                           | Tags de tecnologia                                     |
| `.section`, `.section-header`, `.section-title`, `.section-eyebrow`, `.section-subtitle` | Layout padrão de seção                                 |
| `.container`                                                                             | Wrapper com max-width e gutter responsivo              |
| `.social-link`                                                                           | Links de redes sociais com ícone                       |
| `[data-reveal]`                                                                          | Animação de entrada ao scroll via IntersectionObserver |

---

## ✨ Funcionalidades

**Navegação e UX**

- Header fixo com blur + `backdrop-filter` ao rolar
- Scroll spy com `IntersectionObserver` — link ativo atualiza automaticamente
- Smooth scroll para seções via `scrollToSection()` com `requestAnimationFrame`
- Menu mobile com focus trap, fechamento por `Escape` e scroll lock no body

**Tema e Idioma**

- Toggle dark/light com persistência via `localStorage`
- Alternância PT/EN com animação na language pill (`is-switching`)
- Todos os textos via `t()` do `useLang` — zero strings hardcoded nos componentes

**Animações**

- Count-up animado nos stat cards do About (ease-out cúbico, 1200ms)
- Carrossel automático no Featured com pause ao hover/foco, swipe touch e teclado
- Timeline cards revelados com stagger por `IntersectionObserver`
- Ponto pulsante no logo (footer e header) com `@keyframes`
- Coração pulsante no footer com duplo batimento orgânico
- Respeito total a `prefers-reduced-motion`

**SEO / ATS-friendly**

- `<address>` semântico no footer e no contact para indexação de recrutadores
- E-mail e LinkedIn visíveis como texto puro (não apenas em ícones)
- `mailto:` com `subject` e `body` pré-preenchidos e adaptados ao idioma

**Performance**

- Imagens com `loading="lazy"` (exceto avatar do hero: `fetchpriority="high"`)
- Sub-componentes memoizados com `React.memo` onde há props estáveis
- Dados estáticos (nav, projetos, timeline) fora dos componentes — sem recriação a cada render

---

## 🚀 Como executar

```bash
# 1. Clone o repositório
git clone https://github.com/https-shini/portfolio.git
cd portfolio

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
# http://localhost:5173
```

**Build para produção:**

```bash
npm run build
npm run preview   # prévia local do build
```

**Path aliases configurados no Vite:**

```ts
// vite.config.ts
resolve: {
  alias: { "@": "/src" }
}
```

---

## ♿ Acessibilidade

| Recurso               | Implementação                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semântica HTML        | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<address>`, `<footer>`, `<time>`                                                                |
| ARIA                  | `aria-label`, `aria-labelledby`, `aria-hidden`, `aria-expanded`, `aria-selected`, `aria-controls`, `aria-modal`, `role` em todos os elementos interativos |
| Navegação por teclado | Tab, Shift+Tab, Escape (fecha menu mobile), Arrow keys (tabs da timeline), Home/End                                                                       |
| Focus trap            | Menu mobile captura o foco e impede navegação fora do drawer                                                                                              |
| Focus visível         | `:focus-visible` com outline brand em todos os elementos interativos                                                                                      |
| Carrossel acessível   | `role="region"`, `aria-roledescription="carrossel"`, dots com `aria-selected`                                                                             |
| Movimento reduzido    | `@media (prefers-reduced-motion: reduce)` remove todas as animações e transições                                                                          |
| Contraste             | Tokens de cor calibrados para contraste adequado em ambos os temas                                                                                        |

---

## 📁 Projetos em destaque

### ⭐ HomeMade Gourmet _(Featured)_

TCC desenvolvido na ETEC Vila Formosa (2022). Sistema de receitas com recomendação personalizada, cálculo automático de calorias e painel administrativo completo. Aprovado com louvor.

`HTML5` `CSS3` `JavaScript` `PHP` `MySQL` `Figma`

[![Demo](https://img.shields.io/badge/Demo-Live-46e8b0?style=flat-square)](https://https-shini.github.io/homemade-gourmet/)
[![Repo](https://img.shields.io/badge/Repositório-GitHub-181717?style=flat-square&logo=github)](https://github.com/https-shini/homemade-gourmet)

---

### 💬 Web Chat

Chat em tempo real com WebSocket e suporte a múltiplas salas.

`Node.js` `JavaScript` `WebSocket`

[![Demo](https://img.shields.io/badge/Demo-Live-46e8b0?style=flat-square)](https://chat-frontend-g42t.onrender.com)
[![Repo](https://img.shields.io/badge/Repositório-GitHub-181717?style=flat-square&logo=github)](https://github.com/https-shini/web-chat)

---

### 🔐 Auth Service

Serviço de autenticação com JWT, gerenciamento de usuários e rotas protegidas.

`Node.js` `TypeScript` `JWT`

[![Repo](https://img.shields.io/badge/Repositório-GitHub-181717?style=flat-square&logo=github)](https://github.com/https-shini/AuthService)

---

### 💰 Controle Financeiro

Dashboard para gestão financeira pessoal com controle de entradas, saídas e saldo em tempo real.

`React` `JavaScript` `CSS3`

[![Demo](https://img.shields.io/badge/Demo-Live-46e8b0?style=flat-square)](https://financas-reactjs.vercel.app)
[![Repo](https://img.shields.io/badge/Repositório-GitHub-181717?style=flat-square&logo=github)](https://github.com/https-shini/financas-reactjs)

---

## 👤 Autor

<div align="center">

**Guilherme de Souza Cruz**
Desenvolvedor de Software · Estudante de Ciência da Computação
São Paulo, SP — Brasil

[![Portfolio](https://img.shields.io/badge/Portfolio-311DB4?style=for-the-badge)](https://bl4ck404.dev.br)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-3E79E0?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/oguilherme-cruz)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contact@bl4ck404.dev.br)
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
