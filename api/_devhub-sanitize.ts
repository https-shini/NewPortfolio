/* ─────────────────────────────────────────────────────────
   _devhub-sanitize.ts — allowlist de HTML para READMEs
   ─────────────────────────────────────────────────────────
   O `_markdown.ts` das notas de versão é seguro por uma regra
   só: escapa TODO o texto antes de qualquer transformação, e
   por isso as únicas tags da saída são as que ele emite. É uma
   garantia forte e barata — e incompatível com README, que em
   repositório de portfólio é metade HTML (banner centralizado,
   badges, capturas de tela).

   Este módulo troca a garantia, não a abandona. A regra aqui é:

       NADA do texto de entrada é copiado para dentro de uma tag.

   O sanitizador não "remove o que é perigoso" — essa abordagem
   perde para a primeira variação que ninguém previu. Ele lê a
   entrada, descarta a forma original e REESCREVE cada tag a
   partir de um nome que está na allowlist e de atributos cujos
   valores passaram por validação própria. O que sai são bytes
   gerados aqui; o que não foi reconhecido vira texto escapado.

   É a mesma filosofia do `_markdown.ts` — a saída é construída,
   não aprovada — aplicada a um conjunto de tags em vez de a
   nenhuma.

   ── O que não entra, de jeito nenhum ────────────────────

   · tag fora da allowlist          → vira texto escapado
   · script/style/iframe/svg/...    → somem com o conteúdo junto
   · qualquer atributo `on*`        → nunca é lido
   · atributo fora da allowlist     → nunca é lido
   · `javascript:`, `data:`, `vbscript:` e companhia → descartados,
     inclusive escritos com entidade (`java&#115;cript:`) ou com
     caractere de controle no meio (`java\tscript:`)
   · comentário, doctype, CDATA     → descartados

   ── Sem dependência ─────────────────────────────────────

   Avaliei trazer um sanitizador pronto. Para um sanitizador de
   propósito geral — que precisa sobreviver a mXSS, a confusão
   de namespace entre SVG e MathML e às peculiaridades de cada
   parser — eu recomendaria um. Aqui o escopo é outro: a
   allowlist tem 36 tags, nenhuma delas com conteúdo de
   namespace estrangeiro, e a reconstrução total elimina a
   classe inteira de ataques que explora o que o filtro deixou
   passar da string original. O projeto segue com uma única
   dependência de servidor, e o `dependencies.test.ts` continua
   valendo sem alteração.
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   A allowlist
   ─────────────────────────────────────────────────────────
   Pequena de propósito, e cada entrada está aqui porque
   aparece em README de verdade. Atributo que não serve à
   apresentação não entra — `id` e `style` ficaram de fora:
   o primeiro colide com os âncoras da própria página, o
   segundo é superfície de ataque por si só.
───────────────────────────────────────────────────────── */

const ATRIBUTOS_COMUNS = ["align", "title"] as const;

const PERMITIDOS: Record<string, readonly string[]> = {
    /* Estrutura e texto */
    p: ATRIBUTOS_COMUNS,
    div: ATRIBUTOS_COMUNS,
    span: ["title", "class"],
    br: [],
    hr: [],
    h1: ATRIBUTOS_COMUNS,
    h2: ATRIBUTOS_COMUNS,
    h3: ATRIBUTOS_COMUNS,
    h4: ATRIBUTOS_COMUNS,
    h5: ATRIBUTOS_COMUNS,
    h6: ATRIBUTOS_COMUNS,
    blockquote: ATRIBUTOS_COMUNS,

    /* Ênfase */
    strong: ["title"],
    b: ["title"],
    em: ["title"],
    i: ["title"],
    del: ["title"],
    sub: [],
    sup: [],

    /* Listas */
    ul: ATRIBUTOS_COMUNS,
    ol: ["align", "title", "start"],
    li: ATRIBUTOS_COMUNS,

    /* Código — `class` sobrevive para o destaque de sintaxe */
    code: ["class"],
    pre: ["class"],
    kbd: [],
    samp: [],

    /* Mídia e navegação */
    a: ["href", "title", "align"],
    img: ["src", "alt", "title", "width", "height", "align"],

    /* Tabelas */
    table: ATRIBUTOS_COMUNS,
    thead: ATRIBUTOS_COMUNS,
    tbody: ATRIBUTOS_COMUNS,
    tr: ATRIBUTOS_COMUNS,
    th: ["align", "title", "colspan", "rowspan"],
    td: ["align", "title", "colspan", "rowspan"],

    /* Blocos recolhíveis — comuns em README longo */
    details: [],
    summary: [],
};

/** Tags sem conteúdo: não abrem escopo e não precisam de fechamento. */
const VAZIAS = new Set(["br", "hr", "img"]);

/**
 * Tags cujo CONTEÚDO também é descartado.
 *
 * Para as demais tags recusadas basta remover a marcação e manter o
 * texto — ele é inofensivo depois de escapado. Aqui não: o conteúdo de
 * um `<script>` É o ataque, e o de `<style>` carrega `expression()` e
 * `url(javascript:)` em navegadores antigos. `svg` e `math` entram pelo
 * mesmo motivo que fazem sanitizadores genéricos sofrerem — dentro
 * deles as regras de parsing mudam, e uma tag que parecia texto volta a
 * ser elemento.
 */
const DESCARTA_CONTEUDO = new Set([
    "script",
    "style",
    "iframe",
    "frame",
    "frameset",
    "object",
    "embed",
    "applet",
    "noscript",
    "noembed",
    "template",
    "svg",
    "math",
    "textarea",
    "title",
    "xmp",
    "plaintext",
]);

/* ─────────────────────────────────────────────────────────
   Escape e entidades
───────────────────────────────────────────────────────── */

/**
 * Escapa texto para fora de atributo.
 *
 * `&` só vira `&amp;` quando NÃO abre uma entidade válida — assim o
 * `&amp;` que o conversor de markdown já produziu não vira `&amp;amp;`
 * na tela.
 */
export function escaparTexto(texto: string): string {
    return texto
        .replace(
            /&(?!#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]{1,31};)/g,
            "&amp;",
        )
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/** Escapa para dentro de atributo, onde aspas também encerram o valor. */
function escaparAtributo(valor: string): string {
    return valor
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

const NOMEADAS: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    tab: "\t",
    newline: "\n",
    colon: ":",
    sol: "/",
};

/**
 * Decodifica entidades ANTES de julgar uma URL.
 *
 * Sem isto, `href="java&#115;cript:alert(1)"` passaria pela conferência
 * de esquema — o texto não começa com `javascript:` — e só viraria
 * `javascript:` no navegador, que decodifica o atributo ao lê-lo. A
 * conferência precisa enxergar o mesmo que o navegador vai enxergar.
 *
 * Repete até estabilizar, com teto: `&amp;#106;` decodifica em duas
 * voltas, e o teto evita girar numa entrada construída para isso.
 */
function decodificar(valor: string): string {
    let atual = valor;
    for (let volta = 0; volta < 4; volta++) {
        const anterior = atual;
        atual = atual.replace(
            /&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]{1,31});?/g,
            (inteiro, corpo: string) => {
                if (corpo[0] === "#") {
                    const hex = corpo[1] === "x" || corpo[1] === "X";
                    const n = parseInt(corpo.slice(hex ? 2 : 1), hex ? 16 : 10);
                    return Number.isFinite(n) && n > 0 && n <= 0x10ffff
                        ? String.fromCodePoint(n)
                        : inteiro;
                }
                return NOMEADAS[corpo.toLowerCase()] ?? inteiro;
            },
        );
        if (atual === anterior) break;
    }
    return atual;
}

/* ─────────────────────────────────────────────────────────
   URLs
───────────────────────────────────────────────────────── */

/** Esquemas que podem aparecer num `href`. Nada além destes. */
const ESQUEMAS_LINK = new Set(["http:", "https:", "mailto:"]);

/**
 * Normaliza uma URL para julgamento: decodifica entidades e remove
 * caracteres de controle e espaços, que o navegador ignora ao resolver
 * o esquema — `java\tscript:` e `java\nscript:` executam.
 */
function normalizarUrl(bruto: string): string {
    /* eslint-disable-next-line no-control-regex */
    return decodificar(bruto).replace(/[\u0000- \u007f-\u00a0]/g, "");
}

/** O esquema declarado, em minúsculas, ou `null` se a URL for relativa. */
function esquemaDe(url: string): string | null {
    const m = /^([a-zA-Z][a-zA-Z0-9+.-]*:)/.exec(url);
    return m ? m[1]!.toLowerCase() : null;
}

/**
 * Prepara um caminho relativo para virar sufixo de URL do GitHub.
 *
 * Tira o `./` e as barras iniciais, e descarta `../`: um README pode
 * escrevê-lo, mas o resultado apontaria para fora da árvore do
 * repositório, que não é o que o link quis dizer.
 */
function limparCaminho(url: string): string {
    return url
        .replace(/^\/+/, "")
        .replace(/^(?:\.\/)+/, "")
        .replace(/(?:^|\/)\.\.(?=\/|$)/g, "")
        .replace(/^\/+/, "");
}

export interface Origem {
    owner: string;
    repo: string;
    /** Referência de árvore; `HEAD` segue o branch padrão sozinho. */
    ref?: string;
}

/**
 * `href` seguro, ou `null` para o link ser descartado.
 *
 * Caminho relativo é reescrito para o repositório no GitHub: num README
 * `[licença](./LICENSE)` aponta para um arquivo do repositório, e sem a
 * reescrita viraria um link para uma página do portfólio que não existe.
 */
export function hrefSeguro(bruto: string, origem: Origem): string | null {
    const url = normalizarUrl(bruto);
    if (!url) return null;

    /* Âncora dentro do próprio README. */
    if (url.startsWith("#")) return url;

    const esquema = esquemaDe(url);
    if (esquema) return ESQUEMAS_LINK.has(esquema) ? url : null;

    /* `//host/x` herda o esquema da página; é http(s) na prática, mas
       deixá-lo passar permitiria apontar para fora com uma forma que não
       se parece com URL absoluta. Vira caminho do repositório. */
    return `https://github.com/${origem.owner}/${origem.repo}/blob/${origem.ref ?? "HEAD"}/${limparCaminho(url)}`;
}

/**
 * `src` seguro para imagem, ou `null`.
 *
 * Mais estrito que `hrefSeguro`: só http(s). `data:` fica de fora mesmo
 * para imagem — um `data:image/svg+xml` carrega SVG, e SVG carrega
 * script. O ganho (ícone embutido raro em README) não paga o risco.
 */
export function srcSeguro(bruto: string, origem: Origem): string | null {
    const url = normalizarUrl(bruto);
    if (!url || url.startsWith("#")) return null;

    const esquema = esquemaDe(url);
    if (esquema) {
        return esquema === "http:" || esquema === "https:" ? url : null;
    }

    /* Relativo → o arquivo cru no GitHub, que é o que faz a captura de
       tela do README realmente aparecer na página. */
    return `https://raw.githubusercontent.com/${origem.owner}/${origem.repo}/${origem.ref ?? "HEAD"}/${limparCaminho(url)}`;
}

/* ─────────────────────────────────────────────────────────
   Validação dos demais atributos
───────────────────────────────────────────────────────── */

const ALINHAMENTOS = new Set(["left", "right", "center", "justify"]);

/** `width="100%"`, `width="640"` — porcentagem ou pixels, nada mais. */
const DIMENSAO = /^\d{1,5}(%|px)?$/;

/** Classe de destaque de sintaxe e afins: sem aspas, chaves ou espaço duplo. */
const CLASSE = /^[a-zA-Z0-9_ -]{1,120}$/;

/**
 * Devolve o valor aceito para o atributo, ou `null` para descartá-lo.
 *
 * Todo atributo passa por aqui. O `default` recusa — um atributo novo na
 * allowlist sem regra de valor correspondente é descartado em vez de
 * aceito em branco.
 */
function valorDeAtributo(
    tag: string,
    nome: string,
    bruto: string,
    origem: Origem,
): string | null {
    switch (nome) {
        case "href":
            return hrefSeguro(bruto, origem);
        case "src":
            return srcSeguro(bruto, origem);
        case "align": {
            const v = decodificar(bruto).trim().toLowerCase();
            return ALINHAMENTOS.has(v) ? v : null;
        }
        case "width":
        case "height": {
            const v = decodificar(bruto).trim();
            return DIMENSAO.test(v) ? v : null;
        }
        case "colspan":
        case "rowspan":
        case "start": {
            const v = decodificar(bruto).trim();
            return /^\d{1,4}$/.test(v) ? v : null;
        }
        case "class": {
            const v = decodificar(bruto).trim();
            return CLASSE.test(v) ? v : null;
        }
        case "alt":
        case "title": {
            /* Texto livre, mas limitado: um `title` de dez mil caracteres
               não informa ninguém e só serve para inchar a página. */
            const v = decodificar(bruto).slice(0, 300);
            return v;
        }
        default:
            /* Atributo listado sem regra aqui — recusa, e o teste de
               cobertura abaixo garante que isso não aconteça em silêncio. */
            void tag;
            return null;
    }
}

/* ─────────────────────────────────────────────────────────
   O sanitizador
───────────────────────────────────────────────────────── */

/**
 * Uma tag, com os atributos ainda crus.
 *
 * Sem espaço entre `<` e o nome — a especificação não o permite, e o
 * navegador trata `< b` como texto. O regex já aceitou esse espaço, e o
 * efeito era pior do que parece: `a < b e b > c` virava uma tag `<b>`
 * com `e b` de atributo, e o texto do meio sumia. Ser mais permissivo
 * que o parser de destino é sempre defeito — aqui custou conteúdo, e na
 * direção contrária custaria segurança.
 */
const TAG = /^<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/;

const ATRIBUTO =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function reconstruirAtributos(
    tag: string,
    crus: string,
    origem: Origem,
): string {
    const permitidos = PERMITIDOS[tag]!;
    if (permitidos.length === 0) return "";

    const saida: string[] = [];
    const vistos = new Set<string>();

    ATRIBUTO.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ATRIBUTO.exec(crus)) !== null) {
        const nome = m[1]!.toLowerCase();

        /* A conferência explícita de `on*` é redundante — nenhum handler
           está na allowlist — e fica porque a allowlist muda com o tempo
           e esta linha não deve mudar junto. */
        if (nome.startsWith("on")) continue;
        if (!permitidos.includes(nome)) continue;
        /* Atributo repetido: vale o primeiro. Deixar os dois produziria
           marcação ambígua, que é terreno de mXSS. */
        if (vistos.has(nome)) continue;

        const bruto = m[2] ?? m[3] ?? m[4] ?? "";
        const valor = valorDeAtributo(tag, nome, bruto, origem);
        if (valor === null) continue;

        vistos.add(nome);
        saida.push(`${nome}="${escaparAtributo(valor)}"`);
    }

    return saida.length ? ` ${saida.join(" ")}` : "";
}

/** Pula até o fechamento da tag cujo conteúdo é descartado. */
function pularConteudo(html: string, desde: number, tag: string): number {
    const fecha = new RegExp(`<\\s*/\\s*${tag}\\s*>`, "i");
    const resto = html.slice(desde);
    const m = fecha.exec(resto);
    /* Sem fechamento, o resto do documento vai junto: é o comportamento
       certo para `<script>` sem `</script>`, onde tudo o que vem depois
       seria corpo do script. */
    return m ? desde + m.index + m[0].length : html.length;
}

/**
 * Reescreve `html` mantendo apenas o que está na allowlist.
 *
 * Tudo o que não for reconhecido vira texto escapado — e não some —,
 * para que o README continue legível e quem o escreveu veja o que
 * aconteceu em vez de encontrar um buraco.
 */
export function sanitizar(html: string, origem: Origem): string {
    const saida: string[] = [];
    const pilha: string[] = [];
    let i = 0;

    while (i < html.length) {
        const menor = html.indexOf("<", i);

        if (menor === -1) {
            saida.push(escaparTexto(html.slice(i)));
            break;
        }

        if (menor > i) saida.push(escaparTexto(html.slice(i, menor)));

        const resto = html.slice(menor);

        /* Comentário: descartado inteiro. `<!--[if IE]>` e companhia
           tiravam proveito de parsers que os tratavam como texto. */
        if (resto.startsWith("<!--")) {
            const fim = html.indexOf("-->", menor + 4);
            i = fim === -1 ? html.length : fim + 3;
            continue;
        }

        /* Doctype, CDATA, instrução de processamento. */
        if (resto.startsWith("<!") || resto.startsWith("<?")) {
            const fim = html.indexOf(">", menor);
            i = fim === -1 ? html.length : fim + 1;
            continue;
        }

        const m = TAG.exec(resto);
        if (!m) {
            /* Um `<` que não abre tag é texto — `a < b` continua legível. */
            saida.push("&lt;");
            i = menor + 1;
            continue;
        }

        const fechando = m[1] === "/";
        const tag = m[2]!.toLowerCase();
        const avanco = menor + m[0].length;

        if (DESCARTA_CONTEUDO.has(tag)) {
            i = fechando ? avanco : pularConteudo(html, avanco, tag);
            continue;
        }

        if (!(tag in PERMITIDOS)) {
            /* Tag fora da lista: a marcação some, o conteúdo fica. */
            i = avanco;
            continue;
        }

        if (fechando) {
            /* Fechamento sem abertura correspondente é descartado — emiti-lo
               fecharia uma tag da página, não do README. */
            const pos = pilha.lastIndexOf(tag);
            if (pos !== -1) {
                /* Fecha o que ficou aberto por dentro, para não entregar
                   marcação cruzada ao navegador. */
                for (let k = pilha.length - 1; k >= pos; k--) {
                    saida.push(`</${pilha[k]}>`);
                }
                pilha.length = pos;
            }
            i = avanco;
            continue;
        }

        saida.push(`<${tag}${reconstruirAtributos(tag, m[3] ?? "", origem)}>`);
        if (!VAZIAS.has(tag)) pilha.push(tag);
        i = avanco;
    }

    /* O que o README deixou aberto, fechamos — senão o resto da página
       entra para dentro do último elemento. */
    for (let k = pilha.length - 1; k >= 0; k--) saida.push(`</${pilha[k]}>`);

    return saida.join("");
}

/** Exposto para o teste conferir que a allowlist e as regras casam. */
export const _interno = { PERMITIDOS, DESCARTA_CONTEUDO, VAZIAS };
