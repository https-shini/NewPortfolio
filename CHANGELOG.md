# Changelog

Todas as mudanças relevantes deste projeto.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

> Gerado de `apps/web/src/shared/config/releaseNotes.ts` por
> `scripts/changelog.mjs`. Não editar à mão — as alterações se perdem
> na próxima geração, e há teste conferindo a sincronia.

## [2.0.0](https://gcruz.dev.br/release-notes/v2.0.0) — 2026-08-04

**gcruz.dev.br — a segunda geração**

O portfólio ganha domínio, identidade e estrutura próprios: mais rápido, mais acessível e pensado para crescer.

### Adicionado

- Domínio próprio gcruz.dev.br, com página de links e histórico de versões
- Site bilíngue completo, com idioma na URL e metadados por rota

### Aprimorado

- Acessibilidade sem violações em todas as rotas, temas e idiomas
- Layout sem rolagem horizontal de 320 a 1440 pixels

### Design

- Marca tipográfica <gcruz.dev/> unificada em cabeçalho, rodapé e menu
- Temas escuro e claro completos, derivados de um sistema de tokens
- Todos os ícones do site gerados a partir de um único desenho da marca

### Performance

- Orçamento de tamanho para JavaScript e CSS, verificado a cada mudança

### Arquitetura

- Interface em React e TypeScript, empacotada por Vite
- Código organizado em camadas: app, pages, widgets e shared

### Conteúdo

- Carreira, formação, projetos e recomendações com apresentação própria
- Projeto em destaque com galeria e detalhamento técnico

## [2.0.0-beta.5](https://gcruz.dev.br/release-notes/v2.0.0-beta.5) — 2026-08-03

**Central de links e navegação própria**

Uma página só para os links de contato, e um sistema de rotas que sustenta o site crescer.

### Adicionado

- Página /links, com cartões de contato, foto, stack e compartilhamento
- Roteamento próprio sobre a API de histórico, sem biblioteca externa

### Arquitetura

- Fonte única para todas as URLs públicas do site
- Páginas secundárias carregadas sob demanda

### Conteúdo

- Título, endereço canônico e imagem de compartilhamento por página

## [2.0.0-beta.4](https://gcruz.dev.br/release-notes/v2.0.0-beta.4) — 2026-07-31

**Acessível de ponta a ponta, e medido**

Acessibilidade e responsividade deixam de ser intenção e passam a ser verificadas automaticamente.

### Aprimorado

- Acessibilidade verificada automaticamente em cada rota, tema e idioma
- Contraste, foco visível e nomes acessíveis revisados em todo o site
- Alvos de toque confortáveis em telas pequenas

### Design

- Escala nomeada de pontos de quebra, aplicada a todos os componentes

### Performance

- Verificação de rolagem horizontal de 320 a 1440 pixels
- Preferência de movimento reduzido respeitada nas animações

## [2.0.0-beta.3](https://gcruz.dev.br/release-notes/v2.0.0-beta.3) — 2026-07-29

**Sistema de design e apresentação dos projetos**

Cor, espaçamento e tipografia ganham escala própria, e os projetos ganham lugar de destaque.

### Design

- Sistema de tokens para cor, espaçamento, tipografia, raio e sombra
- Tema claro completo, derivado do mesmo vocabulário do escuro
- Superfícies de vidro e tipografia com papéis definidos

### Conteúdo

- Projeto em destaque com galeria em tela cheia e detalhamento técnico
- Cartões de projeto com demonstração e repositório
- Carrossel de recomendações recebidas

## [2.0.0-beta.2](https://gcruz.dev.br/release-notes/v2.0.0-beta.2) — 2026-07-26

**Componentes reutilizáveis e carregamento mais leve**

Peças de interface deixam de ser repetidas, e o site passa a carregar em partes.

### Adicionado

- Janela sobreposta reutilizável, com foco preso, trava de rolagem e Escape

### Aprimorado

- Tema acompanha a preferência do sistema quando não há escolha salva

### Performance

- Código dividido entre bibliotecas de base e aplicação
- Telas secundárias carregadas apenas quando abertas

## [2.0.0-beta.1](https://gcruz.dev.br/release-notes/v2.0.0-beta.1) — 2026-07-23

**Nova base: React, TypeScript e testes**

O portfólio é reconstruído sobre uma base moderna, com tipos e verificação automática desde o primeiro dia.

### Adicionado

- Suíte de testes automatizados
- Integração contínua: lint, tipos, formato, testes e build

### Arquitetura

- Reconstrução em React e TypeScript, substituindo a base anterior
- Componentes organizados por camada e responsabilidade

## [1.0.0](https://gcruz.dev.br/release-notes/v1.0.0) — 2024-05-11

**bl4ck404.dev.br — o primeiro portfólio**

A primeira versão consolidada: um currículo online completo, com identidade própria e domínio próprio.

### Adicionado

- Primeiro portfólio publicado, sob domínio próprio
- Alternância entre tema claro e escuro
- Navegação dedicada para telas pequenas

### Design

- Estilos em camadas: normalização, base, utilitários e componentes

### Performance

- Carregamento adiado de imagens

### Conteúdo

- Seções de apresentação, trajetória, habilidades, projetos e contato

---

[Todas as versões](https://gcruz.dev.br/release-notes) · [Releases](https://github.com/https-shini/NewPortfolio/releases)
