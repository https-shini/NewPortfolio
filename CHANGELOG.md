# Changelog

Todas as mudanças relevantes deste projeto.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

> Gerado de `apps/web/src/shared/config/releaseNotes.ts` por
> `scripts/changelog.mjs`. Não editar à mão — as alterações se perdem
> na próxima geração, e há teste conferindo a sincronia.

## [2.1.0](https://gcruz.dev.br/release-notes/v2.1.0) — 2026-08-10

**O portfólio fora do navegador**

Primeira versão com instalador para Windows, macOS e Linux.

### Adicionado

- Aplicativo desktop em Electron para Windows, macOS e Linux
- Instaladores .exe, .dmg, AppImage e .deb publicados por tag
- Atualização automática a partir das releases do GitHub
- Página /downloads com detecção de plataforma e contagem de downloads
- Monorepo com npm workspaces: apps/web, apps/desktop e apps/mobile

### Modificado

- Rodapé reorganizado: âncoras e páginas em colunas separadas
- Fundo e iluminação fixos na rolagem; só as partículas se movem

### Corrigido

- Dois tokens inexistentes deixavam cartões e caixas sem borda nos dois temas
- Resposta da API de downloads passa a ser normalizada campo a campo

## [2.0.0](https://gcruz.dev.br/release-notes/v2.0.0) — 2026-08-04

**Segunda geração do portfólio**

Primeira versão publicada da reconstrução completa.

### Adicionado

- Design system com tokens em três níveis, tema claro e escuro
- Arquitetura em camadas: app, pages, widgets e shared
- Internacionalização completa em português e inglês
- Página /links: central de links no formato social tree
- Roteamento por History API, sem dependência externa
- Integração de contribuições do GitHub por função serverless

### Modificado

- Imagens migradas para WebP: de 8,6 MB para cerca de 224 KB
- Bundle dividido: vendor separado e modais sob demanda
- CSS convertido para mobile-first: 45 consultas por min-width
- Escala de breakpoints declarada: dez valores soltos viraram oito

### Corrigido

- Overflow horizontal eliminado de 320 px a 4K
- Alvos de toque de 44 px em dispositivos sem mouse
- Código morto no CSS: grade repetida, regra sem efeito e declaração duplicada

## [2.0.0-rc.1](https://gcruz.dev.br/release-notes/v2.0.0-rc.1) — 2026-08-03

**Central de links e roteamento próprio**

Central de links, roteamento próprio e correções de deploy.

### Adicionado

- Rota /links com título, canonical e Open Graph próprios
- Fonte única para todas as URLs públicas do site

### Corrigido

- Acesso direto a /links retornava 404 em produção
- Função serverless nunca chegava a ser compilada no deploy
- URLs de projeto duplicadas entre quatro componentes

## [2.0.0-beta.2](https://gcruz.dev.br/release-notes/v2.0.0-beta.2) — 2026-07-26

**Modal reutilizável e bundle dividido**

Modal reutilizável, carrossel de recomendações e bundle menor.

### Adicionado

- Modal base com foco preso, trava de rolagem e Escape
- Carrossel paginado nas recomendações

### Modificado

- Chunk único de 284 KB dividido em vendor e aplicação

### Corrigido

- Tema voltou a acompanhar o sistema sem preferência salva

## [2.0.0-beta.1](https://gcruz.dev.br/release-notes/v2.0.0-beta.1) — 2026-07-23

**Refatoração completa da base**

Refatoração completa unificada na branch principal.

### Adicionado

- Suíte de testes com Vitest e Testing Library
- Integração contínua: lint, tipos, formato, testes e build

### Modificado

- Componentes reorganizados por camada e responsabilidade

---

[Todas as versões](https://gcruz.dev.br/release-notes) · [Releases](https://github.com/https-shini/NewPortfolio/releases)
