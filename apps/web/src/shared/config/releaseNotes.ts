import type { Localized } from "@/shared/lib/localized";

/* ─────────────────────────────────────────────────────────
   releaseNotes.ts — camada local do histórico de versões
   ─────────────────────────────────────────────────────────
   Cada versão tem duas camadas:

   · estruturada (sempre): a lista categorizada no padrão
     Keep a Changelog — added / changed / fixed / removed;
   · editorial (opcional, só quando `featured`): capa, título,
     texto corrido e mídia, virando um pequeno estudo de caso.

   Na Fase 2 este arquivo passa a ser uma *sobreposição*: o
   GitHub manda em versão, data e links, e o que estiver aqui
   sobrepõe título, corpo, mídia e destaque — é o que preserva
   o bilíngue, já que o corpo de uma release do GitHub é
   monolíngue.

   A versão do topo precisa casar com a do package.json
   (injetada como __APP_VERSION__); há teste garantindo isso.
───────────────────────────────────────────────────────── */

export type ChangeType = "added" | "changed" | "fixed" | "removed";

/** Ordem canônica de exibição das categorias. */
export const CHANGE_TYPES: ChangeType[] = [
    "added",
    "changed",
    "fixed",
    "removed",
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
        version: "2.5.2",
        date: "2026-08-13",
        featured: true,
        tags: ["design"],
        title: {
            pt: "Uma frase antes dos links, e as colunas no lugar",
            en: "A line before the links, and the columns settled",
        },
        summary: {
            pt: "A lista de links ganha uma apresentação, e a coluna da direita para de pender.",
            en: "The link list gets an introduction, and the right column stops sinking.",
        },
        body: {
            pt: 'Duas correções pequenas na `/links`, das que só aparecem depois que o resto está pronto.\n\n**A lista começava sem apresentação.** Depois da bio e dos chips de stack, os cartões surgiam direto — faltava a frase que faz a passagem de "quem é" para "onde falar comigo". Ela entra acima da lista, e fica **fora** da região de navegação: o `nav` já se nomeia sozinho, e uma frase corrida como primeiro conteúdo de uma landmark seria lida como se fizesse parte dos links.\n\nO espaçamento abaixo dela é subtraído, não somado. A coluna já separa seus blocos por 32px, distância boa entre a lista e os botões — dois pesos parecidos —, mas demais entre a frase e a lista que ela apresenta: nessa distância a frase perde o vínculo com o que introduz. Ficou em 16px, medido, em todas as larguras.\n\n**As duas colunas não têm a mesma altura.** No desktop elas nasciam coladas no topo, e como a da identidade é mais alta, toda a sobra da direita ficava embaixo — a composição pendia. Agora a coluna dos links se centraliza verticalmente em relação à outra. Com a frase nova, a diferença caiu de 54px para 14px, e o deslocamento é de 7px: um assentamento fino, não um salto. O topo do primeiro cartão continua praticamente na linha do avatar.',
            en: 'Two small corrections on `/links` — the kind that only surface once everything else is done.\n\n**The list began with no introduction.** After the bio and the stack chips, the cards appeared straight away — missing the line that carries you from "who this is" to "where to reach them". It goes above the list, and stays **outside** the navigation region: the `nav` already names itself, and a running sentence as the first content of a landmark would be read as if it were part of the links.\n\nThe spacing below it is subtracted, not added. The column already separates its blocks by 32px, a good distance between the list and the buttons — two similar weights — but too much between the line and the list it introduces: at that distance the line loses its bond with what follows. It settled at 16px, measured, at every width.\n\n**The two columns are not the same height.** On desktop they both started flush at the top, and since the identity column is taller, all the slack on the right piled up at the bottom — the composition leaned. The links column now centres itself vertically against the other. With the new line, the difference fell from 54px to 14px and the shift is 7px: a fine settling, not a jump. The top of the first card still sits practically on the avatar\'s line.',
        },
        changes: {
            added: [
                {
                    pt: "Mensagem introdutória acima da lista de links, nos dois idiomas",
                    en: "Introductory line above the link list, in both languages",
                },
            ],
            changed: [
                {
                    pt: "No desktop, a coluna dos links se centraliza verticalmente em relação à identidade",
                    en: "On desktop, the links column centres vertically against the identity column",
                },
            ],
        },
    },
    {
        version: "2.5.1",
        date: "2026-08-13",
        tags: ["design", "a11y"],
        title: {
            pt: "O bloco de identidade da /links, refeito",
            en: "The /links identity block, reworked",
        },
        summary: {
            pt: "Centralizado, com ritmo vertical de verdade — e a disponibilidade finalmente aparece.",
            en: "Centred, with an actual vertical rhythm — and the availability status finally shows.",
        },
        body: {
            pt: "Quando a `/links` ganhou a casca do site e as duas colunas do desktop, o bloco de identidade foi **movido** para a coluna nova, mas nunca redesenhado para ela. Esta versão faz esse trabalho.\n\n**O ritmo.** As margens eram 20 · 8 · 12 · 16 · 16 pixels — quase equidistantes. Sem agrupamento, o nome e o handle, que são uma coisa só, ficavam tão separados quanto a bio e os chips, que não são. Agora são três tempos: 8px cola o handle no nome, e 20 e 24 abrem os grupos seguintes.\n\n**A disponibilidade era informação morta.** O ponto verde na borda do avatar tinha o rótulo preso num atributo `title`, no mesmo elemento marcado como `aria-hidden`. Ou seja: invisível para quem enxerga e mudo para leitor de tela. A tradução existia em português e inglês e não chegava a ninguém. Virou uma pill acima do nome, com o texto visível — e o ponto, agora dentro dela, mantém a pulsação.\n\n**Um acento por nível.** O handle era crimson, o separador dos papéis também era crimson, e o status era verde: três acentos disputando, nenhum nível com o seu. O separador virou pontuação neutra e o crimson ficou só no handle.\n\n**Detalhes que só aparecem medindo.** A bio tinha 34 caracteres de largura máxima dentro de uma coluna de 520px — um bloco estreito sobrando espaço dos dois lados. Os seis chips de stack quebravam 4+2, que lê como acidente; agora quebram 3+3. E o separador entre os papéis, que no celular sobrava órfão no fim da primeira linha, passou a viajar junto com o papel seguinte.",
            en: "When `/links` got the site shell and the desktop's two columns, the identity block was **moved** into the new column but never redesigned for it. This version does that work.\n\n**The rhythm.** The margins were 20 · 8 · 12 · 16 · 16 pixels — near-equidistant. With no grouping, the name and the handle, which are one thing, sat as far apart as the bio and the chips, which are not. Now there are three beats: 8px binds the handle to the name, and 20 and 24 open the following groups.\n\n**The availability was dead information.** The green dot on the avatar's edge carried its label in a `title` attribute, on the very element marked `aria-hidden`. That is: invisible to sighted users and mute to screen readers. The translation existed in both languages and reached nobody. It became a pill above the name, with visible text — and the dot, now inside it, keeps its pulse.\n\n**One accent per level.** The handle was crimson, the role separator was also crimson, and the status was green: three accents competing, no level owning one. The separator became neutral punctuation and crimson stayed with the handle alone.\n\n**Details that only show up when measured.** The bio was capped at 34 characters inside a 520px column — a narrow block with space to spare on both sides. The six stack chips wrapped 4+2, which reads as an accident; now they wrap 3+3. And the role separator, which on mobile was orphaned at the end of the first line, now travels with the role that follows it.",
        },
        changes: {
            changed: [
                {
                    pt: "O bloco de identidade fica centralizado também no desktop, dentro da própria coluna",
                    en: "The identity block is centred on desktop too, inside its own column",
                },
                {
                    pt: "Ritmo vertical agrupado, avatar e nome maiores no desktop, bio mais larga e legível",
                    en: "Grouped vertical rhythm, larger avatar and name on desktop, wider and more readable bio",
                },
                {
                    pt: "Os chips de stack quebram 3+3 em vez de 4+2",
                    en: "The stack chips wrap 3+3 instead of 4+2",
                },
            ],
            fixed: [
                {
                    pt: "O status de disponibilidade não era exibido nem anunciado; agora é texto visível",
                    en: "The availability status was neither shown nor announced; it is now visible text",
                },
                {
                    pt: "O separador entre os papéis deixa de sobrar órfão quando a linha quebra no celular",
                    en: "The role separator no longer dangles at a line break on mobile",
                },
            ],
        },
    },
    {
        version: "2.5.0",
        date: "2026-08-13",
        tags: ["design", "a11y"],
        title: {
            pt: "A página de links entra no site",
            en: "The links page joins the site",
        },
        summary: {
            pt: "A /links deixa de ser uma ilha: passa a usar o mesmo cabeçalho e rodapé das outras páginas.",
            en: "The /links page stops being an island: it now uses the same header and footer as every other page.",
        },
        body: {
            pt: "A `/links` era a única rota sem a casca do site. Em vez do cabeçalho e do rodapé que a home e as notas de versão usam, ela tinha dois botões flutuantes num canto e um rodapé escrito só para ela. Quem chegava de uma bio do Instagram via uma página bonita e sem nenhuma porta para o resto do portfólio.\n\nAgora ela monta o mesmo cabeçalho e o mesmo rodapé. Isso não foi colar dois componentes por cima do que existia — três coisas precisavam mudar junto.\n\n**A largura.** O corpo tinha 480px de máximo em qualquer tela, enquanto o cabeçalho e o rodapé ocupam a medida inteira do site. Num monitor, a navegação de oito itens se estendia por cima de uma tira estreita sem relação com ela. A partir de 900px o corpo passa a ter duas colunas — identidade à esquerda, links e ações à direita — encostadas nas mesmas margens do logotipo e do rodapé. Abaixo disso nada muda: continua a coluna única, que é como a página é de fato aberta.\n\n**A repetição.** GitHub, LinkedIn e e-mail apareceriam nos cartões e outra vez nos ícones do rodapé; nome, domínio e copyright apareceriam duas vezes na mesma tela. Saíram os controles flutuantes, a linha de redes secundárias e o rodapé próprio da página — tudo o que eles diziam já é dito pelo rodapé do site.\n\n**O cartão do portfólio.** Ele abria uma aba nova para `gcruz.dev.br` — o mesmo endereço em que o visitante já está, agora que o cabeçalho existe. Virou navegação interna, sem recarregar nada. O domínio continua visível embaixo do título, porque é a única linha da página que informa onde ele está.",
            en: "The `/links` route was the only one without the site's shell. Instead of the header and footer used by the home page and the release notes, it had two floating buttons in a corner and a footer written just for it. Anyone arriving from an Instagram bio saw a nice page with no door to the rest of the portfolio.\n\nIt now mounts the same header and the same footer. This was not a matter of pasting two components on top of what was there — three things had to change with it.\n\n**Width.** The body was capped at 480px on any screen, while the header and footer span the site's full measure. On a monitor, an eight-item navigation stretched above a narrow strip unrelated to it. From 900px up the body becomes two columns — identity on the left, links and actions on the right — flush with the same margins as the logo and the footer. Below that nothing changes: still the single column, which is how the page is actually opened.\n\n**Repetition.** GitHub, LinkedIn and email would appear in the cards and again in the footer icons; name, domain and copyright would appear twice on one screen. Out went the floating controls, the secondary social row and the page's own footer — everything they said is already said by the site footer.\n\n**The portfolio card.** It opened a new tab to `gcruz.dev.br` — the very address the visitor is already on, now that the header exists. It became internal navigation, with no reload. The domain stays visible under the title, because it is the only line on the page that says where they are.",
        },
        changes: {
            changed: [
                {
                    pt: "A /links passa a usar o cabeçalho e o rodapé do site, como as demais rotas",
                    en: "The /links page now uses the site header and footer, like every other route",
                },
                {
                    pt: "No desktop o corpo da /links ganha duas colunas, alinhadas à medida do site",
                    en: "On desktop the /links body gains two columns, aligned to the site's measure",
                },
                {
                    pt: "O cartão do portfólio virou rota interna, em vez de abrir uma aba nova para o mesmo domínio",
                    en: "The portfolio card became an internal route instead of opening a new tab to the same domain",
                },
            ],
            removed: [
                {
                    pt: "Controles flutuantes de idioma e tema da /links — o cabeçalho carrega os dois",
                    en: "The floating language and theme controls on /links — the header carries both",
                },
                {
                    pt: "Rodapé próprio da /links, que repetia nome, domínio, e-mail e copyright",
                    en: "The /links page's own footer, which repeated name, domain, email and copyright",
                },
            ],
        },
    },
    {
        version: "2.4.0",
        date: "2026-08-12",
        tags: ["design"],
        title: {
            pt: "De volta a ser só um site",
            en: "Back to being just a website",
        },
        summary: {
            pt: "A distribuição como aplicativo sai de cena enquanto o projeto muda de direção.",
            en: "App distribution steps aside while the project changes direction.",
        },
        body: {
            pt: "As três versões anteriores construíram uma coisa só: transformar o portfólio em aplicativo instalável, com página de downloads, atualização automática e instaladores para quatro sistemas. Esta versão remove tudo isso.\n\nNão é conserto de nada — o que existia funcionava. É mudança de direção: há ideias novas para o projeto, e carregar um aplicativo desktop enquanto elas não estão definidas custa atenção a cada mudança no site. Um portfólio que também é app precisa que toda alteração seja pensada duas vezes, e agora esse custo não está sendo pago por nada.\n\nSaíram os dois aplicativos, a página de downloads, as funções que listavam e entregavam os instaladores, o canal de atualização e o fluxo que publicava tudo isso a cada versão. O site volta a ser o que era: um portfólio no navegador.\n\nO que **fica**: a marca `<gcruz.dev/>` e os ícones que saem dela, o menu móvel refeito, e as notas das versões 2.1 a 2.3 — elas descrevem coisas que existiram de verdade, e reescrever o passado para combinar com o presente seria falsificar o registro.\n\nA remoção foi feita num commit único, de propósito: se a ideia voltar, o caminho de volta é desfazer um commit, não recompor sete.",
            en: "The three previous versions built one single thing: turning the portfolio into an installable application, with a downloads page, automatic updates and installers for four systems. This version removes all of it.\n\nNothing here is a fix — what existed worked. It is a change of direction: there are new ideas for the project, and carrying a desktop application while they are undefined costs attention on every change to the site. A portfolio that is also an app needs every alteration thought through twice, and right now that cost buys nothing.\n\nOut go both applications, the downloads page, the functions that listed and delivered the installers, the update channel and the pipeline that published all of it on every version. The site goes back to what it was: a portfolio in the browser.\n\nWhat **stays**: the `<gcruz.dev/>` mark and the icons derived from it, the reworked mobile menu, and the notes for 2.1 through 2.3 — they describe things that genuinely existed, and rewriting the past to match the present would falsify the record.\n\nThe removal is a single commit, on purpose: if the idea comes back, the way back is undoing one commit, not reassembling seven.",
        },
        changes: {
            removed: [
                {
                    pt: "Aplicativo desktop (Electron) e aplicativo Android (Capacitor)",
                    en: "Desktop application (Electron) and Android application (Capacitor)",
                },
                {
                    pt: "Página /downloads e as funções que listavam e entregavam instaladores",
                    en: "The /downloads page and the functions that listed and served installers",
                },
                {
                    pt: "Canal de atualização automática e a publicação de release por tag",
                    en: "The automatic update channel and tag-triggered release publishing",
                },
                {
                    pt: "QR code do rodapé, que apontava para a página de downloads",
                    en: "The footer QR code, which pointed at the downloads page",
                },
            ],
            changed: [
                {
                    pt: "A geração de ícones passa a servir só ao site, a partir da mesma marca",
                    en: "Icon generation now serves the site alone, from the same mark",
                },
            ],
        },
    },
    {
        version: "2.3.0",
        date: "2026-08-10",
        tags: ["design", "feature", "fix"],
        title: {
            pt: "A escolha volta a ser de quem baixa",
            en: "The choice goes back to whoever downloads",
        },
        summary: {
            pt: "Downloads sem recomendação, atualização dentro do app e identidade própria.",
            en: "Downloads with no recommendation, in-app updates and an identity of its own.",
        },
        body: {
            pt: "A página de downloads adivinhava o seu sistema pelo navegador e punha um cartão grande no topo dizendo **\u201cpara o seu sistema\u201d**. Parecia atencioso e era presunçoso: a detecção por user-agent erra com frequência, e mesmo quando acerta transfere para a interface uma decisão que é de quem baixa.\n\nAgora os quatro sistemas aparecem em pé de igualdade — mesmo cartão, mesmo tamanho, ordem fixa. Duas pessoas em máquinas diferentes veem exatamente a mesma tela.\n\nDentro do aplicativo, a mesma página passa a mostrar o estado da atualização e a resolvê-la ali: verificar, baixar e reiniciar sem sair para lugar nenhum. O download **não** começa sozinho — baixar mais de cem megabytes sem perguntar é o tipo de coisa que acontece numa rede móvel sem querer.\n\nA revisão do processo de atualização encontrou algo que valia por si: **ela nunca havia funcionado**. O `electron-updater` é CommonJS, e a forma como era carregado devolvia um objeto vazio; a primeira linha a usá-lo falhava. Como o erro caía num tratamento vazio, nada aparecia em lugar nenhum — nem no aplicativo, nem no log de quem publicou. Foi corrigido, e todo caminho de falha passou a virar estado visível em vez de silêncio.\n\nHá ainda um limite honesto: no Linux só a versão AppImage sabe se atualizar sozinha. Quem instala pelo pacote Debian vê isso escrito na própria página, com a lista de downloads logo abaixo, em vez de um \u201cverificando\u201d que nunca termina.\n\nPor fim, o aplicativo deixou de se chamar pelo nome de uma pessoa e de usar uma foto como ícone. O produto tem marca própria — a mesma do site — e ela agora vale do ícone do executável às telas do instalador.",
            en: "The downloads page used to guess your system from the browser and put a large card at the top saying **\u201cfor your system\u201d**. It looked considerate and was presumptuous: user-agent detection is often wrong, and even when right it hands the interface a decision that belongs to whoever is downloading.\n\nNow the four systems appear as equals — same card, same size, fixed order. Two people on different machines see exactly the same screen.\n\nInside the application, that same page now shows the update state and resolves it right there: check, download and restart without leaving. The download does **not** start on its own — pulling a hundred-plus megabytes unasked is the kind of thing that happens on mobile data by accident.\n\nReviewing the update path turned up something worth the trip on its own: **it had never worked**. `electron-updater` is CommonJS, and the way it was being loaded returned an empty object; the first line to use it failed. Because the error fell into an empty handler, nothing surfaced anywhere — not in the app, not in the publisher's log. It is fixed, and every failure path now becomes visible state instead of silence.\n\nThere is an honest limit left: on Linux only the AppImage build can update itself. Anyone installing the Debian package reads that on the page itself, with the download list right below, instead of a \u201cchecking\u201d that never ends.\n\nFinally, the application stopped going by a person's name and using a photo as its icon. The product has a mark of its own — the same one the site uses — and it now holds from the executable icon through the installer screens.",
        },
        changes: {
            added: [
                {
                    pt: "Atualização verificada, baixada e aplicada dentro do aplicativo",
                    en: "Updates checked, downloaded and applied inside the app",
                },
                {
                    pt: "Aviso claro quando a instalação não sabe se atualizar sozinha",
                    en: "A clear notice when an install cannot update itself",
                },
                {
                    pt: "Ícones gerados de uma fonte só, para todas as plataformas",
                    en: "Icons generated from a single source, for every platform",
                },
            ],
            changed: [
                {
                    pt: "Downloads sem detecção de sistema: os quatro em pé de igualdade",
                    en: "Downloads with no system detection: all four presented equally",
                },
                {
                    pt: "Aplicativo e instalador com a marca do projeto, não com foto pessoal",
                    en: "App and installer carry the project mark, not a personal photo",
                },
                {
                    pt: "Executável renomeado para a identidade do produto",
                    en: "Executable renamed to the product identity",
                },
                {
                    pt: "Telas do instalador e janela do .dmg no tema do projeto",
                    en: "Installer screens and .dmg window in the project theme",
                },
            ],
            fixed: [
                {
                    pt: "A atualização automática nunca funcionou: o updater era carregado errado",
                    en: "Auto-update never worked: the updater was being loaded incorrectly",
                },
                {
                    pt: "Falhas de atualização viravam silêncio em vez de mensagem",
                    en: "Update failures became silence instead of a message",
                },
            ],
        },
    },
    {
        version: "2.2.0",
        date: "2026-08-10",
        tags: ["feature", "fix"],
        title: {
            pt: "Distribuição que não depende do repositório",
            en: "Distribution that doesn't depend on the repository",
        },
        summary: {
            pt: "O download passa a sair do próprio site, com o repositório fechado.",
            en: "Downloads now come from the site itself, with the repository closed.",
        },
        body: {
            pt: "O repositório deste projeto vai deixar de ser público, e a versão anterior não sobreviveria a isso. Os links de download vinham do `browser_download_url` que o GitHub devolve em cada arquivo — um endereço que só é anônimo enquanto o repositório está aberto. Fechado o repositório, todo botão da página de downloads passaria a responder 404, sem aviso.\n\nAgora existe uma porta própria. O servidor faz o que o visitante não pode: pede o arquivo à API do GitHub com um token e recebe de volta um endereço assinado, válido por poucos minutos, para o qual o navegador é encaminhado. O arquivo continua vindo da infraestrutura do GitHub; o que deixou de ser necessário é o repositório estar aberto. O token nunca sai do servidor.\n\nA mesma porta serve a **atualização automática**. Ela lia as releases do GitHub, o que um aplicativo instalado não consegue fazer num repositório privado — não há como embutir um token num programa distribuído. O app passa a consultar o próprio site.\n\nDois defeitos apareceram na revisão do aplicativo desktop, e nenhum dos dois aparecia em desenvolvimento. As chamadas de API dentro do app caíam no mesmo caminho das páginas e recebiam HTML onde o código esperava dados — a tela de downloads mostrava erro dentro do aplicativo enquanto funcionava no navegador. E as rotas de versão, como `/release-notes/v2.1.0`, eram confundidas com pedido de arquivo por causa do ponto no número: recarregar a página estando nelas não carregava nada.\n\nOs instaladores também mudaram de nome. Antes traziam espaços, que viravam código na URL e eram trocados por pontos ao publicar — o suficiente para a atualização automática procurar um arquivo que não existia. Agora o nome traz sistema e arquitetura, e é o mesmo do começo ao fim.",
            en: "This project's repository is going private, and the previous version would not survive that. Download links came from the `browser_download_url` that GitHub returns for each file — an address that is only anonymous while the repository is open. Once closed, every button on the downloads page would answer 404, with no warning.\n\nThere is a door of its own now. The server does what the visitor cannot: it asks GitHub's API for the file using a token and gets back a signed address, valid for a few minutes, which the browser is forwarded to. The file still comes from GitHub's infrastructure; what stopped being necessary is the repository being open. The token never leaves the server.\n\nThe same door serves **automatic updates**. They used to read GitHub releases, which an installed application cannot do on a private repository — there is no way to embed a token in a distributed program. The app now asks the site instead.\n\nTwo defects surfaced while reviewing the desktop app, and neither showed up in development. API calls inside the app fell through the same path as pages and received HTML where the code expected data — the downloads screen showed an error inside the application while working in the browser. And version routes like `/release-notes/v2.1.0` were mistaken for file requests because of the dot in the number: reloading while on one of them loaded nothing.\n\nThe installers were renamed too. They used to carry spaces, which became escape codes in the URL and were swapped for dots on publish — enough for automatic updates to look for a file that did not exist. The name now carries system and architecture, and is the same from end to end.",
        },
        changes: {
            added: [
                {
                    pt: "Download servido pelo próprio site, com o repositório privado",
                    en: "Downloads served by the site itself, with a private repository",
                },
                {
                    pt: "Canal de atualização automática independente do GitHub",
                    en: "Automatic update channel independent from GitHub",
                },
            ],
            changed: [
                {
                    pt: "Instaladores nomeados por sistema e arquitetura, sem espaços",
                    en: "Installers named by system and architecture, without spaces",
                },
                {
                    pt: "Notas da versão e histórico abrem no site, não no GitHub",
                    en: "Release notes and history open on the site, not on GitHub",
                },
                {
                    pt: "Ícone próprio no aplicativo instalado, no lugar do genérico",
                    en: "Own icon on the installed app, replacing the generic one",
                },
            ],
            fixed: [
                {
                    pt: "Chamadas de API dentro do aplicativo recebiam HTML no lugar de dados",
                    en: "API calls inside the app received HTML instead of data",
                },
                {
                    pt: "Rotas de versão não carregavam ao recarregar dentro do aplicativo",
                    en: "Version routes failed to load on reload inside the app",
                },
                {
                    pt: "Links para o GitHub apontavam para um repositório inexistente",
                    en: "GitHub links pointed at a repository that does not exist",
                },
                {
                    pt: "A release publicava o build do site junto dos instaladores",
                    en: "The release published the site build alongside the installers",
                },
            ],
        },
    },
    {
        version: "2.1.0",
        date: "2026-08-10",
        tags: ["feature"],
        title: {
            pt: "O portfólio fora do navegador",
            en: "The portfolio outside the browser",
        },
        summary: {
            pt: "Primeira versão com instalador para Windows, macOS e Linux.",
            en: "First version with an installer for Windows, macOS and Linux.",
        },
        body: {
            pt: "Esta versão publica o portfólio como **aplicativo instalável**, no mesmo modelo de distribuição que o Discord usa: o instalador sai de uma release do GitHub e o próprio app cuida da atualização daí em diante.\n\nO desktop é **Electron**, e a interface é exatamente a mesma do site — não há uma segunda base de código. O `dist/` produzido por `apps/web` é copiado para dentro do pacote e servido por um **protocolo próprio, `app://`**. Isso não é detalhe de implementação: servir de `file://` quebraria a History API, que é o roteamento inteiro do site, e abrir uma porta HTTP local só para servir arquivos do próprio disco seria expor um servidor sem necessidade. O protocolo próprio resolve os dois de uma vez, com `contextIsolation` ligado e `nodeIntegration` desligado.\n\nA página **/downloads** foi reorganizada em torno disso. A lista de instaladores não está escrita no código: vem das releases do GitHub por uma função serverless. É o que impede a página de continuar oferecendo a versão passada depois que outra é publicada — link de download velho é pior que link ausente, porque funciona e entrega o errado.\n\nA plataforma detectada pelo navegador ganha um cartão próprio no topo, e as demais seguem logo abaixo. A detecção **promove, nunca esconde**: ela erra, e uma página que oculta as outras opções ao errar deixa a pessoa sem saída.\n\nOs instaladores **ainda não são assinados digitalmente**. O Windows e o macOS vão mostrar um aviso de editor não reconhecido na primeira execução. É esperado, e a página diz isso em vez de deixar a pessoa descobrir sozinha.",
            en: "This version ships the portfolio as an **installable app**, following the same distribution model Discord uses: the installer comes from a GitHub release, and the app handles updates from there on.\n\nThe desktop build is **Electron**, and the interface is exactly the same as the website — there is no second codebase. The `dist/` produced by `apps/web` is copied into the package and served through a **custom `app://` protocol**. That is not an implementation detail: serving from `file://` would break the History API, which is the site's entire routing, and opening a local HTTP port just to serve files from your own disk would expose a server for no reason. The custom protocol solves both at once, with `contextIsolation` on and `nodeIntegration` off.\n\nThe **/downloads** page was reorganized around it. The installer list is not written in the code: it comes from GitHub releases through a serverless function. That is what stops the page from offering the previous version after a new one ships — a stale download link is worse than a missing one, because it works and hands over the wrong thing.\n\nThe platform detected from the browser gets its own card at the top, with the others right below. Detection **promotes, never hides**: it gets things wrong, and a page that hides the alternatives when it does leaves you with no way out.\n\nThe installers are **not yet digitally signed**. Windows and macOS will show an unrecognized-publisher warning on first run. That is expected, and the page says so instead of letting you find out on your own.",
        },
        changes: {
            added: [
                {
                    pt: "Aplicativo desktop em Electron para Windows, macOS e Linux",
                    en: "Electron desktop app for Windows, macOS and Linux",
                },
                {
                    pt: "Instaladores .exe, .dmg, AppImage e .deb publicados por tag",
                    en: "Installers .exe, .dmg, AppImage and .deb published by tag",
                },
                {
                    pt: "Atualização automática a partir das releases do GitHub",
                    en: "Automatic updates from GitHub releases",
                },
                {
                    pt: "Página /downloads com detecção de plataforma e contagem de downloads",
                    en: "/downloads page with platform detection and download counts",
                },
                {
                    pt: "Monorepo com npm workspaces: apps/web, apps/desktop e apps/mobile",
                    en: "Monorepo with npm workspaces: apps/web, apps/desktop and apps/mobile",
                },
            ],
            changed: [
                {
                    pt: "Rodapé reorganizado: âncoras e páginas em colunas separadas",
                    en: "Reorganized footer: anchors and pages in separate columns",
                },
                {
                    pt: "Fundo e iluminação fixos na rolagem; só as partículas se movem",
                    en: "Background and lighting fixed on scroll; only particles move",
                },
            ],
            fixed: [
                {
                    pt: "Dois tokens inexistentes deixavam cartões e caixas sem borda nos dois temas",
                    en: "Two non-existent tokens left cards and boxes with no border in both themes",
                },
                {
                    pt: "Resposta da API de downloads passa a ser normalizada campo a campo",
                    en: "The downloads API response is now normalized field by field",
                },
            ],
        },
    },
    {
        version: "2.0.0",
        date: "2026-08-04",
        tags: ["design", "feature"],
        title: {
            pt: "Segunda geração do portfólio",
            en: "Second generation of the portfolio",
        },
        summary: {
            pt: "Primeira versão publicada da reconstrução completa.",
            en: "First published version of the full rebuild.",
        },
        body: {
            pt: "Esta é a primeira versão marcada do portfólio reconstruído. A versão anterior era **HTML, CSS e JavaScript puro**; esta é uma aplicação **React com TypeScript**, organizada em camadas e apoiada num design system próprio.\n\nA decisão que mais moldou o resto foi manter **apenas duas dependências de runtime** — React e ReactDOM. Todo o resto é do projeto: os tokens de estilo, os 65 ícones, o modal acessível, o roteamento e a internacionalização. Isso mantém o bundle previsível e o código sob controle.\n\nCada número exibido no site é **derivado, nunca digitado**: semestre da graduação, anos de experiência e datas de carreira saem de marcos em ISO e se atualizam sozinhos com o tempo.\n\nO CSS nasceu desktop-first e foi convertido por inteiro: **nenhuma** das consultas de largura usava min-width, e hoje são 45. Uma refatoração de aparência não tem teste que a cubra, então a garantia veio de um **diff de geometria** — um arranjo que mede a caixa de cada elemento em 288 combinações de rota, largura e tema, calibrado contra o próprio código sem mudança antes de servir de prova. As únicas diferenças que apareceram foram as duas faixas de breakpoint fundidas de propósito.",
            en: "This is the first tagged version of the rebuilt portfolio. The previous one was **plain HTML, CSS and JavaScript**; this is a **React and TypeScript** application, organized in layers and backed by its own design system.\n\nThe decision that shaped everything else was keeping **only two runtime dependencies** — React and ReactDOM. Everything else belongs to the project: the style tokens, the 65 icons, the accessible modal, the routing and the internationalization. That keeps the bundle predictable and the code under control.\n\nEvery number the site shows is **derived, never typed**: current semester, years of experience and career dates all come from ISO milestones and keep themselves up to date.\n\nThe CSS started out desktop-first and was converted end to end: **none** of the width queries used min-width, and today 45 do. A refactor of appearance has no test that covers it, so the guarantee came from a **geometry diff** — a harness that measures every element's box across 288 combinations of route, width and theme, calibrated against the unchanged code before it was trusted as proof. The only differences it reported were the two breakpoint ranges merged on purpose.",
        },
        changes: {
            added: [
                {
                    pt: "Design system com tokens em três níveis, tema claro e escuro",
                    en: "Design system with three-tier tokens, light and dark themes",
                },
                {
                    pt: "Arquitetura em camadas: app, pages, widgets e shared",
                    en: "Layered architecture: app, pages, widgets and shared",
                },
                {
                    pt: "Internacionalização completa em português e inglês",
                    en: "Full internationalization in Portuguese and English",
                },
                {
                    pt: "Página /links: central de links no formato social tree",
                    en: "/links page: link hub in social tree format",
                },
                {
                    pt: "Roteamento por History API, sem dependência externa",
                    en: "History API routing, with no external dependency",
                },
                {
                    pt: "Integração de contribuições do GitHub por função serverless",
                    en: "GitHub contribution stats via a serverless function",
                },
            ],
            changed: [
                {
                    pt: "Imagens migradas para WebP: de 8,6 MB para cerca de 224 KB",
                    en: "Images migrated to WebP: from 8.6 MB down to about 224 KB",
                },
                {
                    pt: "Bundle dividido: vendor separado e modais sob demanda",
                    en: "Split bundle: separate vendor chunk and on-demand modals",
                },
                {
                    pt: "CSS convertido para mobile-first: 45 consultas por min-width",
                    en: "CSS converted to mobile-first: 45 min-width queries",
                },
                {
                    pt: "Escala de breakpoints declarada: dez valores soltos viraram oito",
                    en: "Declared breakpoint scale: ten loose values became eight",
                },
            ],
            fixed: [
                {
                    pt: "Overflow horizontal eliminado de 320 px a 4K",
                    en: "Horizontal overflow eliminated from 320 px to 4K",
                },
                {
                    pt: "Alvos de toque de 44 px em dispositivos sem mouse",
                    en: "44 px touch targets on pointer-coarse devices",
                },
                {
                    pt: "Código morto no CSS: grade repetida, regra sem efeito e declaração duplicada",
                    en: "Dead CSS: repeated grid, no-op rule and duplicated declaration",
                },
            ],
        },
        links: [
            {
                label: { pt: "Ver a central de links", en: "See the link hub" },
                href: "/links",
            },
        ],
    },
    {
        version: "2.0.0-rc.1",
        date: "2026-08-03",
        tags: ["feature", "fix"],
        title: {
            pt: "Central de links e roteamento próprio",
            en: "Link hub and in-house routing",
        },
        summary: {
            pt: "Central de links, roteamento próprio e correções de deploy.",
            en: "Link hub, in-house routing and deploy fixes.",
        },
        changes: {
            added: [
                {
                    pt: "Rota /links com título, canonical e Open Graph próprios",
                    en: "/links route with its own title, canonical and Open Graph",
                },
                {
                    pt: "Fonte única para todas as URLs públicas do site",
                    en: "Single source for every public URL on the site",
                },
            ],
            fixed: [
                {
                    pt: "Acesso direto a /links retornava 404 em produção",
                    en: "Direct access to /links returned 404 in production",
                },
                {
                    pt: "Função serverless nunca chegava a ser compilada no deploy",
                    en: "Serverless function was never compiled during deploy",
                },
                {
                    pt: "URLs de projeto duplicadas entre quatro componentes",
                    en: "Project URLs duplicated across four components",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.2",
        date: "2026-07-26",
        tags: ["perf", "design"],
        title: {
            pt: "Modal reutilizável e bundle dividido",
            en: "Reusable modal and a split bundle",
        },
        summary: {
            pt: "Modal reutilizável, carrossel de recomendações e bundle menor.",
            en: "Reusable modal, recommendations carousel and a smaller bundle.",
        },
        changes: {
            added: [
                {
                    pt: "Modal base com foco preso, trava de rolagem e Escape",
                    en: "Base modal with focus trap, scroll lock and Escape",
                },
                {
                    pt: "Carrossel paginado nas recomendações",
                    en: "Paginated carousel in the recommendations section",
                },
            ],
            changed: [
                {
                    pt: "Chunk único de 284 KB dividido em vendor e aplicação",
                    en: "Single 284 KB chunk split into vendor and application",
                },
            ],
            fixed: [
                {
                    pt: "Tema voltou a acompanhar o sistema sem preferência salva",
                    en: "Theme follows the system again when no preference is saved",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.1",
        date: "2026-07-23",
        tags: ["design", "a11y"],
        title: {
            pt: "Refatoração completa da base",
            en: "Full refactor of the codebase",
        },
        summary: {
            pt: "Refatoração completa unificada na branch principal.",
            en: "Full refactor unified into the main branch.",
        },
        changes: {
            added: [
                {
                    pt: "Suíte de testes com Vitest e Testing Library",
                    en: "Test suite with Vitest and Testing Library",
                },
                {
                    pt: "Integração contínua: lint, tipos, formato, testes e build",
                    en: "Continuous integration: lint, types, format, tests and build",
                },
            ],
            changed: [
                {
                    pt: "Componentes reorganizados por camada e responsabilidade",
                    en: "Components reorganized by layer and responsibility",
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
