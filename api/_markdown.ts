/* ─────────────────────────────────────────────────────────
   _markdown.ts — markdown → HTML seguro, sem dependências
   ─────────────────────────────────────────────────────────
   Converte o subconjunto de markdown que aparece no corpo de
   uma release do GitHub. Roda no servidor: o navegador recebe
   HTML pronto e não baixa nenhum parser.

   A SEGURANÇA VEM DA ORDEM: todo o texto é escapado ANTES de
   qualquer transformação. Depois disso, as únicas tags que
   existem na saída são as que este arquivo emite. Um `<script>`
   escrito no corpo da release chega ao navegador como texto
   visível, nunca como elemento — não há como injetar HTML.

   O prefixo `_` mantém o arquivo fora das rotas: a Vercel só
   publica como função os arquivos de `api/` que não começam
   com underscore.
───────────────────────────────────────────────────────── */

/** Escapa tudo que tem significado em HTML. Primeiro passo, sempre. */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Aceita só http(s) e caminhos internos. Bloqueia `javascript:`,
 * `data:` e afins, que seriam executáveis num href.
 */
function safeHref(href: string): string | null {
    const trimmed = href.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^\/[^/]/.test(trimmed)) return trimmed;
    if (/^#[\w-]+$/.test(trimmed)) return trimmed;
    return null;
}

/** Ênfase, código inline e links — aplicado sobre texto já escapado. */
function inline(text: string): string {
    return (
        text
            /* `código` */
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            /* **negrito** */
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            /* _itálico_ — evita capturar trechos com underscore no meio */
            .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?])/g, "$1<em>$2</em>")
            /* [texto](destino) */
            .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
                const safe = safeHref(String(href));
                if (!safe) return String(label);
                const external = /^https?:\/\//i.test(safe);
                const attrs = external
                    ? ' target="_blank" rel="noopener noreferrer"'
                    : "";
                return `<a href="${safe}"${attrs}>${label}</a>`;
            })
    );
}

/**
 * renderMarkdown — converte o corpo de uma release em HTML.
 *
 * Cobre o que o GitHub gera na prática: títulos, listas com e sem
 * ordem, blocos de código, citações, linhas horizontais e parágrafos.
 * O que não for reconhecido vira parágrafo — nunca some.
 */
export function renderMarkdown(markdown: string): string {
    if (!markdown?.trim()) return "";

    const lines = escapeHtml(markdown.replace(/\r\n/g, "\n")).split("\n");
    const out: string[] = [];

    let listTag: "ul" | "ol" | null = null;
    let paragraph: string[] = [];
    let inCode = false;
    let codeLines: string[] = [];

    const closeList = () => {
        if (listTag) {
            out.push(`</${listTag}>`);
            listTag = null;
        }
    };

    const closeParagraph = () => {
        if (paragraph.length > 0) {
            out.push(`<p>${inline(paragraph.join(" "))}</p>`);
            paragraph = [];
        }
    };

    const flush = () => {
        closeParagraph();
        closeList();
    };

    for (const line of lines) {
        /* Bloco de código: tudo dentro sai literal, sem inline(). */
        if (/^\s*```/.test(line)) {
            if (inCode) {
                out.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
                codeLines = [];
                inCode = false;
            } else {
                flush();
                inCode = true;
            }
            continue;
        }
        if (inCode) {
            codeLines.push(line);
            continue;
        }

        /* Linha em branco encerra parágrafo e lista. */
        if (!line.trim()) {
            flush();
            continue;
        }

        /* Título — de ## a ###### (# viraria h1, que a página já tem). */
        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            flush();
            const level = Math.min(Math.max(heading[1]!.length, 2), 4);
            out.push(`<h${level}>${inline(heading[2]!)}</h${level}>`);
            continue;
        }

        /* Linha horizontal. */
        if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
            flush();
            out.push("<hr />");
            continue;
        }

        /* Citação. O texto já passou pelo escape, então o marcador `>`
           chega aqui como `&gt;`. */
        const quote = line.match(/^\s*&gt;\s?(.*)$/);
        if (quote) {
            flush();
            out.push(`<blockquote>${inline(quote[1]!)}</blockquote>`);
            continue;
        }

        /* Item de lista, com ou sem ordem. */
        const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
        const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (bullet || ordered) {
            const wanted: "ul" | "ol" = bullet ? "ul" : "ol";
            closeParagraph();
            if (listTag !== wanted) {
                closeList();
                out.push(`<${wanted}>`);
                listTag = wanted;
            }
            const content = (bullet ?? ordered)![1]!;
            out.push(`<li>${inline(content)}</li>`);
            continue;
        }

        /* Qualquer outra coisa acumula no parágrafo corrente. */
        closeList();
        paragraph.push(line.trim());
    }

    /* Bloco de código sem fechamento no fim do texto. */
    if (inCode && codeLines.length > 0) {
        out.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
    }
    flush();

    return out.join("\n");
}
