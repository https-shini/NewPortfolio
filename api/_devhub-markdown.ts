import {
    escaparTexto,
    hrefSeguro,
    sanitizar,
    srcSeguro,
    type Origem,
} from "./_devhub-sanitize.js";

/* ─────────────────────────────────────────────────────────
   _devhub-markdown.ts — README do GitHub → HTML seguro
   ─────────────────────────────────────────────────────────
   Duas etapas, nesta ordem, e a separação é o ponto:

       README → markdown → HTML (com o HTML do autor intacto)
              → sanitizar() → HTML seguro

   Este arquivo NÃO é responsável pela segurança. Ele converte, e
   pode converter mal sem que isso vire vulnerabilidade: o que
   sair daqui passa inteiro pelo sanitizador, que reescreve cada
   tag a partir da allowlist e escapa o que não reconhece.

   Essa divisão é deliberada. A alternativa — um conversor que
   também decide o que é seguro — faria cada regra nova de
   formatação ser também uma decisão de segurança, e é assim que
   se perde o controle de um conversor com o tempo.

   O `_markdown.ts` das notas de versão continua intocado: lá a
   entrada é o corpo de uma release escrita por mim, o HTML do
   autor não interessa, e escapar tudo antes de transformar é a
   garantia mais forte disponível. Aqui a entrada é README de
   portfólio, que é metade HTML — banner, badges, capturas —, e
   escapá-lo transformava a página numa listagem de marcação.
───────────────────────────────────────────────────────── */

/** Uma linha que começa um bloco de HTML do autor. */
const ABRE_HTML = /^\s*<\/?[a-zA-Z][a-zA-Z0-9:-]*(\s|\/?>)/;

/* ─────────────────────────────────────────────────────────
   Inline
───────────────────────────────────────────────────────── */

/**
 * Converte o que vive dentro de uma linha.
 *
 * O texto NÃO é escapado aqui: o HTML que o autor escreveu precisa
 * atravessar para o sanitizador decidir. Só o conteúdo de código é
 * escapado, e por um motivo que não é de segurança — dentro de
 * `<code>`, `<div>` deve ser lido como exemplo, não aplicado.
 */
function inline(texto: string, origem: Origem): string {
    const marcadores: string[] = [];

    /* Código primeiro: o que estiver dentro de crases não deve sofrer
       nenhuma outra transformação. Sai de cena como marcador e volta no
       fim, já convertido. */
    let s = texto.replace(/(`+)([\s\S]*?)\1/g, (_, _cercas, codigo: string) => {
        marcadores.push(`<code>${escaparTexto(codigo)}</code>`);
        return `\u0000${marcadores.length - 1}\u0000`;
    });

    /* Imagem antes de link: a sintaxe de imagem contém a de link. */
    s = s.replace(
        /!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+"([^"]*)")?\s*\)/g,
        (inteiro, alt: string, src: string, title?: string) => {
            const url = srcSeguro(src, origem);
            if (!url) return escaparTexto(alt);
            const t = title ? ` title="${escaparTexto(title)}"` : "";
            return `<img src="${url}" alt="${escaparTexto(alt)}"${t} />`;
        },
    );

    s = s.replace(
        /\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+"([^"]*)")?\s*\)/g,
        (inteiro, rotulo: string, href: string, title?: string) => {
            const url = hrefSeguro(href, origem);
            if (!url) return rotulo;
            const t = title ? ` title="${escaparTexto(title)}"` : "";
            return `<a href="${url}"${t}>${rotulo}</a>`;
        },
    );

    /* Autolink `<https://exemplo>`. Fica antes das ênfases para que o
       sanitizador não precise lidar com uma tag inventada. */
    s = s.replace(/<(https?:\/\/[^\s<>"]+)>/g, (inteiro, url: string) => {
        const seguro = hrefSeguro(url, origem);
        return seguro
            ? `<a href="${seguro}">${escaparTexto(url)}</a>`
            : inteiro;
    });

    s = s
        .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^\w*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
        .replace(/__([^_]+)__/g, "<strong>$1</strong>")
        .replace(/(^|[^\w_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>")
        .replace(/~~([^~]+)~~/g, "<del>$1</del>");

    /* O NUL é a sentinela dos marcadores: não aparece em texto real. */
    // eslint-disable-next-line no-control-regex
    return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => marcadores[+i]!);
}

/* ─────────────────────────────────────────────────────────
   Blocos
───────────────────────────────────────────────────────── */

interface Estado {
    saida: string[];
    paragrafo: string[];
    lista: "ul" | "ol" | null;
    citacao: boolean;
}

function fecharParagrafo(e: Estado, origem: Origem): void {
    if (e.paragrafo.length) {
        e.saida.push(`<p>${inline(e.paragrafo.join(" "), origem)}</p>`);
        e.paragrafo = [];
    }
}

function fecharLista(e: Estado): void {
    if (e.lista) {
        e.saida.push(`</${e.lista}>`);
        e.lista = null;
    }
}

function fecharCitacao(e: Estado): void {
    if (e.citacao) {
        e.saida.push("</blockquote>");
        e.citacao = false;
    }
}

function fecharTudo(e: Estado, origem: Origem): void {
    fecharParagrafo(e, origem);
    fecharLista(e);
    fecharCitacao(e);
}

/** Tabela do GFM: cabeçalho, linha de alinhamento, corpo. */
function tentarTabela(
    linhas: string[],
    i: number,
    origem: Origem,
): { html: string; consumidas: number } | null {
    const cabecalho = linhas[i];
    const separador = linhas[i + 1];
    if (!cabecalho?.includes("|") || !separador) return null;
    if (!/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(separador)) return null;

    const celulas = (linha: string) =>
        linha
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim());

    const alinhamentos = celulas(separador).map((c) =>
        c.startsWith(":") && c.endsWith(":")
            ? "center"
            : c.endsWith(":")
              ? "right"
              : c.startsWith(":")
                ? "left"
                : null,
    );

    const td = (valor: string, j: number, tag: "th" | "td") => {
        const a = alinhamentos[j];
        return `<${tag}${a ? ` align="${a}"` : ""}>${inline(valor, origem)}</${tag}>`;
    };

    const partes = [
        "<table><thead><tr>",
        ...celulas(cabecalho).map((c, j) => td(c, j, "th")),
        "</tr></thead><tbody>",
    ];

    let j = i + 2;
    for (; j < linhas.length; j++) {
        const linha = linhas[j]!;
        if (!linha.includes("|") || !linha.trim()) break;
        partes.push(
            "<tr>",
            ...celulas(linha).map((c, k) => td(c, k, "td")),
            "</tr>",
        );
    }

    partes.push("</tbody></table>");
    return { html: partes.join(""), consumidas: j - i };
}

/**
 * Converte o markdown, preservando o HTML do autor.
 *
 * O resultado NÃO é seguro — é `renderReadme` quem o entrega ao
 * sanitizador. Exportado só para o teste poder observar as duas etapas
 * separadamente.
 */
export function converter(markdown: string, origem: Origem): string {
    const linhas = markdown.replace(/\r\n?/g, "\n").split("\n");
    const e: Estado = { saida: [], paragrafo: [], lista: null, citacao: false };

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i]!;

        /* Bloco de código cercado. */
        const cerca = /^\s*```+\s*([a-zA-Z0-9+#-]*)/.exec(linha);
        if (cerca) {
            fecharTudo(e, origem);
            const corpo: string[] = [];
            let j = i + 1;
            for (; j < linhas.length && !/^\s*```+\s*$/.test(linhas[j]!); j++) {
                corpo.push(linhas[j]!);
            }
            const lang = cerca[1]
                ? ` class="language-${cerca[1].toLowerCase()}"`
                : "";
            e.saida.push(
                `<pre><code${lang}>${escaparTexto(corpo.join("\n"))}</code></pre>`,
            );
            i = j;
            continue;
        }

        if (!linha.trim()) {
            fecharParagrafo(e, origem);
            fecharLista(e);
            fecharCitacao(e);
            continue;
        }

        /* Bloco de HTML do autor: atravessa cru até a primeira linha em
           branco — é a regra do CommonMark, e é a que o GitHub aplica.

           O bloco inteiro, e não linha a linha. A diferença aparece em

               <p align="center">
               Sistema ... <br/>
               </p>

           onde tratar cada linha isoladamente fazia o texto do meio virar
           um `<p>` próprio, aninhado dentro do `<p align="center">`. O
           navegador resolve o aninhamento inválido fechando o primeiro, e
           o resultado era a descrição perdendo a centralização.

           Que o bloco termine na linha em branco também é o que mantém

               <div align="center">

               [![badge](...)](...)

               </div>

           funcionando: ali o autor QUER markdown no meio, e a linha em
           branco é exatamente o sinal que ele usou para pedir isso.

           Dentro do bloco não há conversão: `width=100%` e `src="a_b_c"`
           seriam destruídos por ênfase e escape. O sanitizador adiante
           cuida do que o bloco carrega. */
        if (ABRE_HTML.test(linha)) {
            fecharTudo(e, origem);
            let j = i;
            for (; j < linhas.length && linhas[j]!.trim(); j++) {
                e.saida.push(linhas[j]!);
            }
            i = j - 1;
            continue;
        }

        /* Título — rebaixado para h2..h4: a página do projeto já tem o
           seu h1, e dois h1 quebram a hierarquia de navegação. */
        const titulo = /^\s*(#{1,6})\s+(.*)$/.exec(linha);
        if (titulo) {
            fecharTudo(e, origem);
            const nivel = Math.min(Math.max(titulo[1]!.length, 2), 4);
            e.saida.push(
                `<h${nivel}>${inline(titulo[2]!.replace(/\s*#+\s*$/, ""), origem)}</h${nivel}>`,
            );
            continue;
        }

        if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(linha)) {
            fecharTudo(e, origem);
            e.saida.push("<hr />");
            continue;
        }

        const citacao = /^\s*>\s?(.*)$/.exec(linha);
        if (citacao) {
            fecharParagrafo(e, origem);
            fecharLista(e);
            if (!e.citacao) {
                e.saida.push("<blockquote>");
                e.citacao = true;
            }
            e.saida.push(`<p>${inline(citacao[1]!, origem)}</p>`);
            continue;
        }
        fecharCitacao(e);

        const tabela = tentarTabela(linhas, i, origem);
        if (tabela) {
            fecharTudo(e, origem);
            e.saida.push(tabela.html);
            i += tabela.consumidas - 1;
            continue;
        }

        const item = /^\s*(?:([-*+])|(\d{1,9})[.)])\s+(.*)$/.exec(linha);
        if (item) {
            fecharParagrafo(e, origem);
            const tipo = item[1] ? "ul" : "ol";
            if (e.lista !== tipo) {
                fecharLista(e);
                e.saida.push(`<${tipo}>`);
                e.lista = tipo;
            }
            e.saida.push(`<li>${inline(item[3]!, origem)}</li>`);
            continue;
        }
        fecharLista(e);

        e.paragrafo.push(linha.trim());
    }

    fecharTudo(e, origem);
    return e.saida.join("\n");
}

/**
 * README → HTML seguro para o frontend.
 *
 * A única função que o resto do servidor usa. As duas etapas são
 * inseparáveis aqui de propósito: não há caminho que entregue o
 * resultado de `converter` sem passar pelo sanitizador.
 */
export function renderReadme(markdown: string, origem: Origem): string {
    return sanitizar(converter(markdown, origem), origem);
}
