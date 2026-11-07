import { describe, it, expect } from "vitest";
import { extractReadme, isGalleryImage } from "./readme";

const HTML = `
<h1>Projeto</h1>
<p><img src="https://capsule-render.vercel.app/api?type=waving" alt="faixa"></p>
<p><img src="https://img.shields.io/badge/React-18-blue" alt="React"></p>
<h2>📌 O que é este projeto?</h2>
<p>Um painel de <strong>finanças</strong> pessoais.</p>
<p>Roda inteiro no navegador.</p>
<h2>✨ Funcionalidades</h2>
<ul><li>Gráfico mensal</li><li>Tema escuro</li><li>Exportar PDF</li><li>Importar CSV</li><li>Filtros</li><li>Busca</li><li>Atalhos</li></ul>
<h2>🖼️ Prévia</h2>
<p><img src="https://raw.githubusercontent.com/u/r/main/img/1.png" alt="Tela inicial"></p>
<p><img src="https://raw.githubusercontent.com/u/r/main/img/1.png" alt="repetida"></p>
<p><img src="https://raw.githubusercontent.com/u/r/main/img/logo.svg" alt="logo"></p>
<p><img src="https://github.com/user-attachments/assets/abc" alt=""></p>
<h2>🛠️ Tecnologias utilizadas</h2>
<h3>Frontend</h3>
<ul><li><strong>React</strong> — interface</li><li><strong>HTML5 / CSS3</strong> — base</li></ul>
<h3>Backend</h3>
<ul><li>Docker + Docker Compose: contêineres</li></ul>
<h2>Licença</h2><p>MIT</p>`;

describe("readme — leitura do README sanitizado", () => {
    it("galeria: só imagens do GitHub, sem SVG, sem repetidas", () => {
        const { images } = extractReadme(HTML);
        expect(images).toEqual([
            {
                src: "https://raw.githubusercontent.com/u/r/main/img/1.png",
                alt: "Tela inicial",
            },
            { src: "https://github.com/user-attachments/assets/abc", alt: "" },
        ]);
    });

    it('lead: os parágrafos de "O que é" (emoji e acento não atrapalham)', () => {
        expect(extractReadme(HTML).lead).toBe(
            "Um painel de finanças pessoais. Roda inteiro no navegador.",
        );
    });

    it("funcionalidades: os itens da lista, no máximo seis", () => {
        expect(extractReadme(HTML).features).toEqual([
            "Gráfico mensal",
            "Tema escuro",
            "Exportar PDF",
            "Importar CSV",
            "Filtros",
            "Busca",
        ]);
    });

    it("tecnologias: nome em negrito ou antes do traço, separando / e +", () => {
        expect(extractReadme(HTML).techs).toEqual([
            "React",
            "HTML5",
            "CSS3",
            "Docker",
            "Docker Compose",
        ]);
    });

    it("sem README → tudo vazio", () => {
        expect(extractReadme(null)).toEqual({
            images: [],
            lead: null,
            features: [],
            techs: [],
        });
    });

    it("isGalleryImage recusa http, outros hosts e URL inválida", () => {
        expect(isGalleryImage("http://raw.githubusercontent.com/a.png")).toBe(
            false,
        );
        expect(isGalleryImage("https://example.com/a.png")).toBe(false);
        expect(isGalleryImage("nada")).toBe(false);
        expect(
            isGalleryImage("https://user-images.githubusercontent.com/1/a.gif"),
        ).toBe(true);
    });
});
