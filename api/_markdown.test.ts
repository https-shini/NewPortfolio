import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./_markdown.js";

describe("renderMarkdown — segurança", () => {
    it("não deixa nenhuma tag escrita pelo autor sobreviver", () => {
        const html = renderMarkdown("<script>alert(1)</script>");
        expect(html).not.toContain("<script");
        expect(html).toContain("&lt;script&gt;");
    });

    it("neutraliza atributos de evento em HTML embutido", () => {
        const html = renderMarkdown('<img src=x onerror="alert(1)">');
        expect(html).not.toContain("<img");
        expect(html).toContain("&lt;img");
    });

    it("descarta href com javascript:", () => {
        const html = renderMarkdown("[clique](javascript:alert(1))");
        expect(html).not.toContain("javascript:");
        expect(html).not.toContain("<a ");
        /* O rótulo continua legível como texto. */
        expect(html).toContain("clique");
    });

    it("descarta href com data:", () => {
        const html = renderMarkdown("[x](data:text/html;base64,PHNjcmlwdD4=)");
        expect(html).not.toContain("<a ");
    });

    it("escapa aspas, evitando quebra de atributo", () => {
        const html = renderMarkdown('texto com "aspas"');
        expect(html).toContain("&quot;");
    });

    it("não interpreta markdown dentro de bloco de código", () => {
        const html = renderMarkdown("```\n**não é negrito**\n```");
        expect(html).toContain("<pre><code>");
        expect(html).not.toContain("<strong>");
    });
});

describe("renderMarkdown — conversão", () => {
    it("converte parágrafos separados por linha em branco", () => {
        expect(renderMarkdown("um\n\ndois")).toBe("<p>um</p>\n<p>dois</p>");
    });

    it("junta linhas soltas no mesmo parágrafo", () => {
        expect(renderMarkdown("um\ndois")).toBe("<p>um dois</p>");
    });

    it("converte títulos, rebaixando # para h2", () => {
        expect(renderMarkdown("## Título")).toBe("<h2>Título</h2>");
        expect(renderMarkdown("#### Sub")).toBe("<h4>Sub</h4>");
        /* Não emite h1: a página já tem o seu. */
        expect(renderMarkdown("# Topo")).toBe("<h2>Topo</h2>");
    });

    it("converte lista sem ordem", () => {
        const html = renderMarkdown("- um\n- dois");
        expect(html).toContain("<ul>");
        expect(html).toContain("<li>um</li>");
        expect(html).toContain("<li>dois</li>");
        expect(html).toContain("</ul>");
    });

    it("converte lista ordenada", () => {
        const html = renderMarkdown("1. um\n2. dois");
        expect(html).toContain("<ol>");
        expect(html).toContain("<li>dois</li>");
    });

    it("fecha uma lista ao trocar de tipo", () => {
        const html = renderMarkdown("- um\n1. dois");
        expect(html).toContain("</ul>");
        expect(html).toContain("<ol>");
    });

    it("converte ênfase e código inline", () => {
        expect(renderMarkdown("**forte**")).toContain("<strong>forte</strong>");
        expect(renderMarkdown("um _itálico_ aqui")).toContain(
            "<em>itálico</em>",
        );
        expect(renderMarkdown("`cod`")).toContain("<code>cod</code>");
    });

    it("não trata underscore no meio de palavra como ênfase", () => {
        expect(renderMarkdown("nome_de_variavel")).not.toContain("<em>");
    });

    it("converte link externo com rel seguro", () => {
        const html = renderMarkdown("[site](https://exemplo.com)");
        expect(html).toContain('href="https://exemplo.com"');
        expect(html).toContain('target="_blank"');
        expect(html).toContain('rel="noopener noreferrer"');
    });

    it("converte link interno sem abrir nova aba", () => {
        const html = renderMarkdown("[links](/links)");
        expect(html).toContain('href="/links"');
        expect(html).not.toContain("target");
    });

    it("converte citação e linha horizontal", () => {
        expect(renderMarkdown("> nota")).toBe("<blockquote>nota</blockquote>");
        expect(renderMarkdown("---")).toBe("<hr />");
    });

    it("fecha bloco de código não terminado", () => {
        const html = renderMarkdown("```\nsem fim");
        expect(html).toContain("<pre><code>sem fim</code></pre>");
    });

    it("devolve vazio para entrada vazia", () => {
        expect(renderMarkdown("")).toBe("");
        expect(renderMarkdown("   \n  ")).toBe("");
    });

    it("converte um corpo de release realista", () => {
        const html = renderMarkdown(
            "## Novidades\n\n- Página `/links`\n- Roteamento próprio\n\nVeja o [repositório](https://github.com/x/y).",
        );

        expect(html).toContain("<h2>Novidades</h2>");
        expect(html).toContain("<code>/links</code>");
        expect(html).toContain("<li>Roteamento próprio</li>");
        expect(html).toContain('href="https://github.com/x/y"');
    });
});
