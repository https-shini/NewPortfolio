# Changelog

Todas as mudanças relevantes deste projeto.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

> Gerado de `apps/web/src/shared/config/releaseNotes.ts` por
> `scripts/changelog.mjs`. Não editar à mão — as alterações se perdem
> na próxima geração, e há teste conferindo a sincronia.

## [2.4.0](https://gcruz.dev.br/release-notes/v2.4.0) — 2026-08-12

**De volta a ser só um site**

A distribuição como aplicativo sai de cena enquanto o projeto muda de direção.

### Modificado

- A geração de ícones passa a servir só ao site, a partir da mesma marca

### Removido

- Aplicativo desktop (Electron) e aplicativo Android (Capacitor)
- Página /downloads e as funções que listavam e entregavam instaladores
- Canal de atualização automática e a publicação de release por tag
- QR code do rodapé, que apontava para a página de downloads

## [2.3.0](https://gcruz.dev.br/release-notes/v2.3.0) — 2026-08-10

**A escolha volta a ser de quem baixa**

Downloads sem recomendação, atualização dentro do app e identidade própria.

### Adicionado

- Atualização verificada, baixada e aplicada dentro do aplicativo
- Aviso claro quando a instalação não sabe se atualizar sozinha
- Ícones gerados de uma fonte só, para todas as plataformas

### Modificado

- Downloads sem detecção de sistema: os quatro em pé de igualdade
- Aplicativo e instalador com a marca do projeto, não com foto pessoal
- Executável renomeado para a identidade do produto
- Telas do instalador e janela do .dmg no tema do projeto

### Corrigido

- A atualização automática nunca funcionou: o updater era carregado errado
- Falhas de atualização viravam silêncio em vez de mensagem

## [2.2.0](https://gcruz.dev.br/release-notes/v2.2.0) — 2026-08-10

**Distribuição que não depende do repositório**

O download passa a sair do próprio site, com o repositório fechado.

### Adicionado

- Download servido pelo próprio site, com o repositório privado
- Canal de atualização automática independente do GitHub

### Modificado

- Instaladores nomeados por sistema e arquitetura, sem espaços
- Notas da versão e histórico abrem no site, não no GitHub
- Ícone próprio no aplicativo instalado, no lugar do genérico

### Corrigido

- Chamadas de API dentro do aplicativo recebiam HTML no lugar de dados
- Rotas de versão não carregavam ao recarregar dentro do aplicativo
- Links para o GitHub apontavam para um repositório inexistente
- A release publicava o build do site junto dos instaladores

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
