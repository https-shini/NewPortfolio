import type { Localized } from "@/shared/lib/localized";

/* ─────────────────────────────────────────────────────────
   releaseNotes.ts — camada local do histórico de versões
   ─────────────────────────────────────────────────────────
   Este é um histórico CURADO, e não um registro de tudo que
   aconteceu. Ele é público, faz parte do portfólio, e conta uma
   coisa só: como o projeto amadureceu de bl4ck404.dev.br até
   gcruz.dev.br. Versões que descreviam caminhos abandonados
   saíram — quem lê quer entender o projeto de hoje, não
   arqueologia. Acrescentar uma entrada aqui é decisão
   editorial, não consequência automática de ter feito um
   commit.

   Cada versão tem três camadas:

   · resumo (`summary`): uma linha em linguagem corrente, que é
     o que aparece no card do índice — qualquer pessoa entende;
   · corpo (`body`): o texto da página da versão, onde cabem
     termos técnicos e visão de alto nível;
   · estruturada (`changes`): a lista categorizada — ver o
     comentário de ChangeType abaixo.

   O `featured` NÃO controla se o corpo aparece (ReleaseCard o
   renderiza sempre que existe); ele marca quem abre expandido
   no topo do índice, e só a entrada mais recente o leva.

   Este arquivo é também a LISTA DE PERMISSÃO do histórico: o
   GitHub manda em data e link, mas só para versões declaradas
   aqui — ver mergeReleaseNotes.ts.

   A versão do topo precisa casar com a do package.json
   (injetada como __APP_VERSION__); há teste garantindo isso.
───────────────────────────────────────────────────────── */

/* O vocabulário era o do Keep a Changelog — added / changed / fixed /
   removed —, que serve a um changelog de biblioteca: quem lê quer saber
   o que quebrou e o que sumiu. Este histórico tem outro leitor. Ele é
   público, faz parte do portfólio, e a pergunta que responde é como o
   projeto amadureceu.

   Daí as seis categorias abaixo: elas nomeiam eixos de evolução em vez
   de tipos de commit. `fixed` e `removed` saíram porque nenhuma entrada
   os usa — um histórico curado registra o avanço, e correção de bug
   antigo ou funcionalidade descontinuada não descrevem o projeto de
   hoje. */
export type ChangeType =
    | "added"
    | "improved"
    | "design"
    | "performance"
    | "architecture"
    | "content";

/** Ordem canônica de exibição das categorias. */
export const CHANGE_TYPES: ChangeType[] = [
    "added",
    "improved",
    "design",
    "performance",
    "architecture",
    "content",
];

/**
 * Mídia do corpo de um post.
 *
 * União discriminada de propósito: vídeo **exige** uma faixa de legendas
 * (`captions`, um arquivo .vtt). Assim o compilador impede que um vídeo
 * sem legenda chegue ao site, em vez de deixar a falta passar batido.
 */
export type ReleaseMedia =
    | {
          type: "image";
          /** Import de `assets/release-notes/*` ou caminho em `public/`. */
          src: string;
          /** Texto alternativo; vazio quando a imagem é decorativa. */
          alt?: Localized;
          caption?: Localized;
      }
    | {
          type: "video";
          src: string;
          /** Caminho do .vtt de legendas — obrigatório. */
          captions: string;
          caption?: Localized;
      };

export interface ReleaseLink {
    label: Localized;
    href: string;
}

export interface ReleaseEntry {
    /** SemVer, sem o prefixo "v". Casa com a tag da release. */
    version: string;
    /** ISO "YYYY-MM-DD". Na Fase 2 o `published_at` do GitHub tem prioridade. */
    date: string;
    /** Trata a entrada como post editorial completo. */
    featured?: boolean;
    /**
     * Obrigatório: toda versão tem página própria, e uma página precisa
     * de manchete. Nas releases vindas do GitHub o título é o `name` da
     * release, com a tag como reserva (ver api/release-notes.ts).
     */
    title: Localized;
    /** Uma linha, exibida no cabeçalho colapsado do histórico. */
    summary?: Localized;
    /** Imagem de topo do post — só faz sentido em `featured`. */
    cover?: string;
    /** Texto corrido; aceita `\n\n` entre parágrafos e `**ênfase**`. */
    body?: Localized;
    /** Galeria do corpo (antes/depois, vídeo). */
    media?: ReleaseMedia[];
    tags?: ReleaseTag[];
    changes?: Partial<Record<ChangeType, Localized[]>>;
    links?: ReleaseLink[];
}

/** Vocabulário fechado de tags — alimenta os chips de filtro. */
export type ReleaseTag = "design" | "feature" | "perf" | "a11y" | "fix";

/* ─────────────────────────────────────────────────────────
   As entradas — mais recente primeiro.

   Os marcos anteriores à primeira tag usam identificadores de
   pré-lançamento do SemVer (`2.0.0-beta.1`), que é exatamente
   o que a especificação prevê para versões que antecedem uma
   release. As datas vêm do histórico real do repositório.
───────────────────────────────────────────────────────── */
export const RELEASE_NOTES: ReleaseEntry[] = [
    {
        version: "2.0.0",
        date: "2026-08-04",
        featured: true,
        tags: ["design", "feature", "a11y", "perf"],
        title: {
            pt: "gcruz.dev.br — a segunda geração",
            en: "gcruz.dev.br — the second generation",
        },
        summary: {
            pt: "O portfólio ganha domínio, identidade e estrutura próprios: mais rápido, mais acessível e pensado para crescer.",
            en: "The portfolio gets its own domain, identity and structure: faster, more accessible and built to grow.",
        },
        body: {
            pt: "Esta é a versão que está no ar em **gcruz.dev.br**, e o ponto de chegada de tudo que as versões anteriores prepararam.\n\nO site deixou de ser uma página com seções e passou a ser uma aplicação com arquitetura: interface construída em **React com TypeScript**, empacotada por **Vite**, e organizada em camadas — `app`, `pages`, `widgets` e `shared` —, em que cada peça sabe do que depende e nada depende de tudo. É o que permite acrescentar uma página nova sem tocar nas existentes.\n\n**A identidade ficou própria.** A marca tipográfica `<gcruz.dev/>` é a mesma no cabeçalho, no rodapé e no menu, e dela saem todos os ícones do site — o favicon, o ícone de instalação, o do iOS — gerados a partir de um único desenho, para que nunca divirjam entre si. O tema escuro é o padrão, com um tema claro completo, e ambos vêm de um sistema de tokens: cor, espaçamento, tipografia e raio têm nome e escala, em vez de valores repetidos por aí.\n\n**A qualidade virou automação.** Cada mudança passa por tipos, lint, formato, testes e por auditorias que rodam num navegador de verdade: acessibilidade sem violações em todas as combinações de rota, tema e idioma; nenhuma rolagem horizontal de 320 a 1440 pixels; orçamento de tamanho de JavaScript e CSS que reprova o que passar do limite. O que não é medido não entra.\n\n**O conteúdo ganhou lugar.** Carreira, formação, projetos e recomendações têm apresentação própria, com um projeto em destaque que abre em galeria. Tudo bilíngue — português e inglês — com idioma na URL e metadados por rota, para que cada página seja compartilhável com título, descrição e imagem corretos.",
            en: "This is the version live at **gcruz.dev.br**, and the destination of everything the previous versions prepared.\n\nThe site stopped being a page with sections and became an application with an architecture: an interface built in **React with TypeScript**, bundled by **Vite**, and organised in layers — `app`, `pages`, `widgets` and `shared` — where every piece knows what it depends on and nothing depends on everything. That is what makes it possible to add a new page without touching the existing ones.\n\n**The identity became its own.** The typographic mark `<gcruz.dev/>` is the same in the header, the footer and the menu, and every icon on the site comes from it — the favicon, the install icon, the iOS one — generated from a single drawing so they can never drift apart. Dark is the default theme, with a complete light theme alongside it, and both come from a token system: colour, spacing, typography and radius have names and scales instead of values repeated around the codebase.\n\n**Quality became automation.** Every change goes through types, linting, formatting, tests, and audits that run in a real browser: accessibility with zero violations across every combination of route, theme and language; no horizontal scrolling from 320 to 1440 pixels; a size budget for JavaScript and CSS that fails anything over the limit. What is not measured does not ship.\n\n**The content got a place of its own.** Career, education, projects and recommendations each have their own presentation, with a featured project that opens in a gallery. Everything is bilingual — Portuguese and English — with the language in the URL and per-route metadata, so each page is shareable with the right title, description and image.",
        },
        changes: {
            added: [
                {
                    pt: "Domínio próprio gcruz.dev.br, com página de links e histórico de versões",
                    en: "Own domain gcruz.dev.br, with a link hub and a version history",
                },
                {
                    pt: "Site bilíngue completo, com idioma na URL e metadados por rota",
                    en: "Fully bilingual site, with the language in the URL and per-route metadata",
                },
            ],
            design: [
                {
                    pt: "Marca tipográfica <gcruz.dev/> unificada em cabeçalho, rodapé e menu",
                    en: "Typographic mark <gcruz.dev/> unified across header, footer and menu",
                },
                {
                    pt: "Temas escuro e claro completos, derivados de um sistema de tokens",
                    en: "Complete dark and light themes, derived from a token system",
                },
                {
                    pt: "Todos os ícones do site gerados a partir de um único desenho da marca",
                    en: "Every site icon generated from a single drawing of the mark",
                },
            ],
            architecture: [
                {
                    pt: "Interface em React e TypeScript, empacotada por Vite",
                    en: "Interface in React and TypeScript, bundled by Vite",
                },
                {
                    pt: "Código organizado em camadas: app, pages, widgets e shared",
                    en: "Code organised in layers: app, pages, widgets and shared",
                },
            ],
            performance: [
                {
                    pt: "Orçamento de tamanho para JavaScript e CSS, verificado a cada mudança",
                    en: "Size budget for JavaScript and CSS, checked on every change",
                },
            ],
            improved: [
                {
                    pt: "Acessibilidade sem violações em todas as rotas, temas e idiomas",
                    en: "Accessibility with zero violations across every route, theme and language",
                },
                {
                    pt: "Layout sem rolagem horizontal de 320 a 1440 pixels",
                    en: "Layout free of horizontal scrolling from 320 to 1440 pixels",
                },
            ],
            content: [
                {
                    pt: "Carreira, formação, projetos e recomendações com apresentação própria",
                    en: "Career, education, projects and recommendations with their own presentation",
                },
                {
                    pt: "Projeto em destaque com galeria e detalhamento técnico",
                    en: "Featured project with a gallery and technical detail",
                },
            ],
        },
        links: [
            {
                label: {
                    pt: "Abrir o site",
                    en: "Open the site",
                },
                href: "https://gcruz.dev.br",
            },
        ],
    },
    {
        version: "2.0.0-beta.5",
        date: "2026-08-03",
        tags: ["feature", "design"],
        title: {
            pt: "Central de links e navegação própria",
            en: "Link hub and in-house navigation",
        },
        summary: {
            pt: "Uma página só para os links de contato, e um sistema de rotas que sustenta o site crescer.",
            en: "A page dedicated to contact links, and a routing system that lets the site grow.",
        },
        body: {
            pt: "A última etapa antes do lançamento resolveu duas coisas que o site precisava para deixar de ser uma página só.\n\n**A central de links.** Nasceu a `/links`: uma página enxuta, pensada para ser aberta a partir da bio de uma rede social, reunindo portfólio, GitHub, LinkedIn e contato em cartões grandes, com foto, stack e um botão de compartilhar. Ela tem título, endereço canônico e imagem de compartilhamento próprios, então cai bem em qualquer lugar que se cole o link.\n\n**A navegação própria.** Até aqui o site era um endereço único. Passou a ter roteamento próprio, escrito sobre a API de histórico do navegador — sem biblioteca de rotas —, com cada página carregada sob demanda. Trocar de página não recarrega o site, e o botão de voltar funciona como se espera.\n\n**Uma fonte só para os endereços.** As URLs dos projetos estavam repetidas em quatro componentes diferentes, o que garantia que uma hora divergiriam. Agora vivem num lugar só, e todo componente que precisa delas consulta esse lugar.",
            en: "The last step before launch settled two things the site needed in order to stop being a single page.\n\n**The link hub.** `/links` was born: a lean page, designed to be opened from a social media bio, gathering portfolio, GitHub, LinkedIn and contact into large cards, with a photo, a stack and a share button. It has its own title, canonical address and share image, so it looks right wherever the link is pasted.\n\n**In-house navigation.** Until then the site was a single address. It gained its own routing, written on top of the browser's History API — no routing library — with each page loaded on demand. Changing pages does not reload the site, and the back button behaves as expected.\n\n**One source for the addresses.** Project URLs were duplicated across four different components, which guaranteed they would eventually drift. They now live in one place, and every component that needs them reads from it.",
        },
        changes: {
            added: [
                {
                    pt: "Página /links, com cartões de contato, foto, stack e compartilhamento",
                    en: "/links page, with contact cards, photo, stack and sharing",
                },
                {
                    pt: "Roteamento próprio sobre a API de histórico, sem biblioteca externa",
                    en: "In-house routing on top of the History API, with no external library",
                },
            ],
            architecture: [
                {
                    pt: "Fonte única para todas as URLs públicas do site",
                    en: "Single source for every public URL on the site",
                },
                {
                    pt: "Páginas secundárias carregadas sob demanda",
                    en: "Secondary pages loaded on demand",
                },
            ],
            content: [
                {
                    pt: "Título, endereço canônico e imagem de compartilhamento por página",
                    en: "Per-page title, canonical address and share image",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.4",
        date: "2026-07-31",
        tags: ["a11y", "perf"],
        title: {
            pt: "Acessível de ponta a ponta, e medido",
            en: "Accessible end to end, and measured",
        },
        summary: {
            pt: "Acessibilidade e responsividade deixam de ser intenção e passam a ser verificadas automaticamente.",
            en: "Accessibility and responsiveness stop being an intention and start being checked automatically.",
        },
        body: {
            pt: "Esta etapa trocou boas intenções por verificação. Todo site diz ser acessível e responsivo; poucos conseguem provar. Aqui isso passou a ser medido a cada mudança.\n\n**Acessibilidade.** Um navegador de verdade abre cada rota, em cada tema e em cada idioma, e roda uma bateria de regras de acessibilidade reconhecidas. Qualquer violação reprova a mudança. As correções que isso trouxe são as invisíveis e importantes: contraste de texto, nomes acessíveis em botões que só têm ícone, foco visível em tudo que recebe teclado, e regiões que anunciam mudanças para quem usa leitor de tela.\n\n**Responsividade.** Os pontos de quebra viraram uma escala nomeada, em vez de valores escolhidos caso a caso. E existe uma verificação que abre o site de 320 a 1440 pixels e reprova qualquer rolagem horizontal — o defeito de responsividade mais comum, e o mais fácil de não notar no monitor de quem desenvolve.\n\n**Toque e movimento.** Alvos de toque com tamanho confortável em telas pequenas, e respeito à preferência de movimento reduzido do sistema: quem pediu menos animação recebe menos animação.",
            en: "This step traded good intentions for verification. Every site claims to be accessible and responsive; few can prove it. Here that became measured on every change.\n\n**Accessibility.** A real browser opens each route, in each theme and each language, and runs a recognised battery of accessibility rules. Any violation fails the change. The fixes this brought are the invisible, important ones: text contrast, accessible names on icon-only buttons, visible focus on everything reachable by keyboard, and regions that announce updates to screen reader users.\n\n**Responsiveness.** Breakpoints became a named scale instead of values picked case by case. And a check opens the site from 320 to 1440 pixels and fails any horizontal scrolling — the most common responsive defect, and the easiest to miss on a developer's monitor.\n\n**Touch and motion.** Comfortably sized touch targets on small screens, and respect for the system's reduced-motion preference: whoever asked for less animation gets less animation.",
        },
        changes: {
            improved: [
                {
                    pt: "Acessibilidade verificada automaticamente em cada rota, tema e idioma",
                    en: "Accessibility automatically checked on every route, theme and language",
                },
                {
                    pt: "Contraste, foco visível e nomes acessíveis revisados em todo o site",
                    en: "Contrast, visible focus and accessible names reviewed across the site",
                },
                {
                    pt: "Alvos de toque confortáveis em telas pequenas",
                    en: "Comfortable touch targets on small screens",
                },
            ],
            design: [
                {
                    pt: "Escala nomeada de pontos de quebra, aplicada a todos os componentes",
                    en: "Named breakpoint scale, applied across every component",
                },
            ],
            performance: [
                {
                    pt: "Verificação de rolagem horizontal de 320 a 1440 pixels",
                    en: "Horizontal scrolling check from 320 to 1440 pixels",
                },
                {
                    pt: "Preferência de movimento reduzido respeitada nas animações",
                    en: "Reduced-motion preference respected across animations",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.3",
        date: "2026-07-29",
        tags: ["design", "feature"],
        title: {
            pt: "Sistema de design e apresentação dos projetos",
            en: "Design system and project presentation",
        },
        summary: {
            pt: "Cor, espaçamento e tipografia ganham escala própria, e os projetos ganham lugar de destaque.",
            en: "Colour, spacing and typography get their own scale, and the projects get a place to shine.",
        },
        body: {
            pt: "Com a base já organizada, esta etapa cuidou de como o site se parece e de como ele apresenta o trabalho.\n\n**O sistema de design.** Cor, espaçamento, tipografia, raio de borda e sombra passaram a ter nome e escala. Em vez de um valor escolhido em cada arquivo, existe um vocabulário: quem escreve um componente novo usa as mesmas medidas que todos os outros, e mudar o tema inteiro é mudar a definição, não caçar ocorrências. É o que tornou o tema claro possível sem duplicar folha de estilo.\n\n**A linguagem visual.** Superfícies de vidro com desfoque e borda translúcida, cantos generosos, e movimento sutil — o suficiente para dar vida sem atrapalhar a leitura. Tipografia com três famílias e papéis claros: uma de exibição para títulos, uma de texto para leitura e uma monoespaçada para tudo que é técnico.\n\n**Os projetos.** Ganharam apresentação de verdade: um projeto em destaque, com galeria de imagens que abre em tela cheia, descrição do problema, da solução e do resultado, e a lista de tecnologias. Os demais aparecem em cartões com demonstração e repositório. As recomendações recebidas ganharam carrossel próprio.",
            en: "With the foundation already organised, this step took care of how the site looks and how it presents the work.\n\n**The design system.** Colour, spacing, typography, border radius and shadow were given names and scales. Instead of a value picked in each file, there is a vocabulary: whoever writes a new component uses the same measurements as every other one, and changing the whole theme means changing a definition rather than hunting occurrences. That is what made the light theme possible without duplicating a stylesheet.\n\n**The visual language.** Glass surfaces with blur and a translucent border, generous corners, and subtle motion — enough to feel alive without getting in the way of reading. Typography with three families and clear roles: a display face for headings, a body face for reading, and a monospaced one for everything technical.\n\n**The projects.** They got a real presentation: a featured project, with an image gallery that opens full screen, a description of the problem, the solution and the outcome, and the list of technologies. The others appear as cards with a demo and a repository. Recommendations received got a carousel of their own.",
        },
        changes: {
            design: [
                {
                    pt: "Sistema de tokens para cor, espaçamento, tipografia, raio e sombra",
                    en: "Token system for colour, spacing, typography, radius and shadow",
                },
                {
                    pt: "Tema claro completo, derivado do mesmo vocabulário do escuro",
                    en: "Complete light theme, derived from the same vocabulary as the dark one",
                },
                {
                    pt: "Superfícies de vidro e tipografia com papéis definidos",
                    en: "Glass surfaces and typography with defined roles",
                },
            ],
            content: [
                {
                    pt: "Projeto em destaque com galeria em tela cheia e detalhamento técnico",
                    en: "Featured project with a full-screen gallery and technical detail",
                },
                {
                    pt: "Cartões de projeto com demonstração e repositório",
                    en: "Project cards with a demo and a repository",
                },
                {
                    pt: "Carrossel de recomendações recebidas",
                    en: "Carousel of recommendations received",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.2",
        date: "2026-07-26",
        tags: ["perf", "design"],
        title: {
            pt: "Componentes reutilizáveis e carregamento mais leve",
            en: "Reusable components and a lighter load",
        },
        summary: {
            pt: "Peças de interface deixam de ser repetidas, e o site passa a carregar em partes.",
            en: "Interface pieces stop being repeated, and the site starts loading in parts.",
        },
        body: {
            pt: "Com a base refatorada, apareceu o padrão que se repetia: várias telas precisavam de uma janela sobreposta, e cada uma resolvia à sua maneira.\n\n**A janela sobreposta virou uma peça só.** Um componente base que trata o que costuma ser esquecido: o foco fica preso dentro dela enquanto está aberta, a página atrás para de rolar, a tecla Escape fecha, e o conteúdo de trás fica inerte para quem usa leitor de tela. Quem precisa de uma janela nova herda tudo isso em vez de reimplementar — e de esquecer metade.\n\n**O carregamento ficou em partes.** O site era entregue num único bloco de código. Ele foi dividido: as bibliotecas de base de um lado, a aplicação do outro, e as telas secundárias só chegam quando alguém as abre. Quem entra na página inicial não paga pelo que não vai ver.\n\n**O tema voltou a ouvir o sistema.** Sem preferência salva, o site passou a seguir o modo claro ou escuro configurado no aparelho, em vez de assumir um.",
            en: "With the foundation refactored, the repeating pattern showed itself: several screens needed an overlay window, and each solved it its own way.\n\n**The overlay became a single piece.** A base component that handles what usually gets forgotten: focus stays trapped inside while it is open, the page behind stops scrolling, the Escape key closes it, and the content behind becomes inert for screen reader users. Anyone needing a new window inherits all of that instead of reimplementing it — and forgetting half.\n\n**Loading happens in parts.** The site was delivered as a single block of code. It was split: base libraries on one side, the application on the other, and secondary screens only arrive when someone opens them. Whoever lands on the home page does not pay for what they will not see.\n\n**The theme listens to the system again.** With no saved preference, the site follows the light or dark mode configured on the device instead of assuming one.",
        },
        changes: {
            added: [
                {
                    pt: "Janela sobreposta reutilizável, com foco preso, trava de rolagem e Escape",
                    en: "Reusable overlay window, with focus trap, scroll lock and Escape",
                },
            ],
            performance: [
                {
                    pt: "Código dividido entre bibliotecas de base e aplicação",
                    en: "Code split between base libraries and application",
                },
                {
                    pt: "Telas secundárias carregadas apenas quando abertas",
                    en: "Secondary screens loaded only when opened",
                },
            ],
            improved: [
                {
                    pt: "Tema acompanha a preferência do sistema quando não há escolha salva",
                    en: "Theme follows the system preference when no choice is saved",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.1",
        date: "2026-07-23",
        tags: ["feature", "a11y"],
        title: {
            pt: "Nova base: React, TypeScript e testes",
            en: "New foundation: React, TypeScript and tests",
        },
        summary: {
            pt: "O portfólio é reconstruído sobre uma base moderna, com tipos e verificação automática desde o primeiro dia.",
            en: "The portfolio is rebuilt on a modern foundation, with types and automated checks from day one.",
        },
        body: {
            pt: "O começo da segunda geração. A versão anterior tinha chegado ao limite do que dava para sustentar com HTML, CSS e JavaScript escritos à mão: cada seção nova significava repetir estrutura, e cada ajuste de estilo significava procurar onde mais aquilo aparecia.\n\n**A base mudou.** O site foi reconstruído em **React com TypeScript**. React porque a interface passa a ser feita de peças que se compõem, em vez de blocos de HTML repetidos; TypeScript porque o compilador passa a apontar o erro antes de a página abrir, e não depois de alguém encontrar.\n\n**Os componentes ganharam lugar.** Em vez de arquivos por assunto, uma organização por camada e responsabilidade: o que é de uma página fica com a página, o que é compartilhado fica no compartilhado, e a direção das dependências é sempre a mesma.\n\n**A verificação nasceu junto.** Suíte de testes automatizados e integração contínua desde esta versão: a cada mudança enviada, o projeto verifica lint, tipos, formatação, testes e build. Não é algo que se acrescenta quando o projeto cresce — é o que permite ele crescer.",
            en: "The start of the second generation. The previous version had reached the limit of what hand-written HTML, CSS and JavaScript could sustain: every new section meant repeating structure, and every style tweak meant hunting for wherever else it appeared.\n\n**The foundation changed.** The site was rebuilt in **React with TypeScript**. React because the interface becomes made of pieces that compose, instead of repeated blocks of HTML; TypeScript because the compiler points at the error before the page opens, rather than after someone finds it.\n\n**Components got a place.** Instead of files grouped by subject, an organisation by layer and responsibility: what belongs to a page stays with the page, what is shared stays in the shared layer, and dependencies always point the same way.\n\n**Verification was born with it.** An automated test suite and continuous integration from this version on: on every change pushed, the project checks linting, types, formatting, tests and build. It is not something added once a project grows — it is what lets it grow.",
        },
        changes: {
            architecture: [
                {
                    pt: "Reconstrução em React e TypeScript, substituindo a base anterior",
                    en: "Rebuilt in React and TypeScript, replacing the previous foundation",
                },
                {
                    pt: "Componentes organizados por camada e responsabilidade",
                    en: "Components organised by layer and responsibility",
                },
            ],
            added: [
                {
                    pt: "Suíte de testes automatizados",
                    en: "Automated test suite",
                },
                {
                    pt: "Integração contínua: lint, tipos, formato, testes e build",
                    en: "Continuous integration: linting, types, formatting, tests and build",
                },
            ],
        },
    },
    {
        version: "1.0.0",
        date: "2024-05-11",
        tags: ["design", "feature"],
        title: {
            pt: "bl4ck404.dev.br — o primeiro portfólio",
            en: "bl4ck404.dev.br — the first portfolio",
        },
        summary: {
            pt: "A primeira versão consolidada: um currículo online completo, com identidade própria e domínio próprio.",
            en: "The first consolidated version: a complete online résumé, with its own identity and its own domain.",
        },
        body: {
            pt: "O ponto de partida. Sob o domínio **bl4ck404.dev.br**, esta foi a primeira versão consolidada do portfólio — uma página única reunindo apresentação pessoal, trajetória, habilidades, projetos e formas de contato.\n\n**A construção.** Feita com **HTML, CSS e JavaScript**, servida pelo **Vite**, sem framework de interface. Os estilos foram organizados em camadas desde o início — normalização, base, utilitários e componentes —, o que já era uma decisão de estrutura, e não só de arquivo.\n\n**O que ela já resolvia.** Alternância entre tema claro e escuro, navegação própria para telas pequenas e carregamento adiado de imagens. Para uma página estática escrita à mão, é mais do que costuma existir.\n\n**O que ela deixou para a próxima.** A divisão em seções — início, sobre, trajetória, destaque, projetos e contato — se mostrou certa e sobreviveu inteira à reconstrução: é a mesma que organiza o site até hoje. Esta versão estabeleceu o esqueleto conceitual do portfólio; as seguintes trocaram a técnica embaixo dele sem precisar repensá-lo.",
            en: "The starting point. Under the domain **bl4ck404.dev.br**, this was the first consolidated version of the portfolio — a single page gathering a personal introduction, career path, skills, projects and ways to get in touch.\n\n**How it was built.** With **HTML, CSS and JavaScript**, served by **Vite**, with no interface framework. The styles were organised in layers from the start — normalisation, base, utilities and components — which was already a structural decision, not just a filing one.\n\n**What it already solved.** Light and dark theme switching, dedicated navigation for small screens, and deferred image loading. For a hand-written static page, that is more than usually exists.\n\n**What it handed to the next version.** The division into sections — home, about, career, featured, projects and contact — proved right and survived the rebuild intact: it is the same one organising the site today. This version established the conceptual skeleton of the portfolio; the ones that followed swapped the technique underneath without having to rethink it.",
        },
        changes: {
            added: [
                {
                    pt: "Primeiro portfólio publicado, sob domínio próprio",
                    en: "First portfolio published, under its own domain",
                },
                {
                    pt: "Alternância entre tema claro e escuro",
                    en: "Light and dark theme switching",
                },
                {
                    pt: "Navegação dedicada para telas pequenas",
                    en: "Dedicated navigation for small screens",
                },
            ],
            design: [
                {
                    pt: "Estilos em camadas: normalização, base, utilitários e componentes",
                    en: "Styles in layers: normalisation, base, utilities and components",
                },
            ],
            performance: [
                {
                    pt: "Carregamento adiado de imagens",
                    en: "Deferred image loading",
                },
            ],
            content: [
                {
                    pt: "Seções de apresentação, trajetória, habilidades, projetos e contato",
                    en: "Sections for introduction, career path, skills, projects and contact",
                },
            ],
        },
    },
];

/**
 * Versão corrente do site — a primeira entrada da lista.
 * O `package.json` continua sendo a fonte oficial (via __APP_VERSION__);
 * um teste garante que as duas não divergem.
 */
export function getCurrentVersion(): string {
    return RELEASE_NOTES[0]!.version;
}

/** Tags presentes nas entradas, na ordem em que aparecem. */
export function getUsedTags(entries: ReleaseEntry[] = RELEASE_NOTES) {
    const seen: ReleaseTag[] = [];
    entries.forEach((e) =>
        e.tags?.forEach((tag) => {
            if (!seen.includes(tag)) seen.push(tag);
        }),
    );
    return seen;
}
