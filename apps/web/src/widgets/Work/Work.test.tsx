import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LangProvider } from "@/app/LangContext";
import { Work } from "./Work";
import { PROJECT_URLS } from "@/shared/config/links";
import { GITHUB_URL, LANG_KEY } from "@/shared/config/constants";

/**
 * O array `PROJECTS` é privado do módulo, e as asserções aqui não tentam
 * alcançá-lo: elas comparam o DOM com `PROJECT_URLS`, que é a fonte única.
 * Um card que passasse a repetir a URL à mão continuaria renderizando igual,
 * mas deixaria de casar com a fonte — e é isso que se quer pegar.
 */
const montar = (lang: "pt" | "en" = "pt") => {
    localStorage.setItem(LANG_KEY, lang);
    return render(
        <LangProvider>
            <Work />
        </LangProvider>,
    );
};

/** A seção, para não varrer o documento inteiro nas asserções globais. */
const secao = () => screen.getByRole("region", { name: /projetos|projects/i });

describe("Work", () => {
    it("rende os três projetos como artigos com nome acessível", () => {
        montar();
        /* `aria-labelledby` aponta para o h3 de cada card, então o nome
           acessível do artigo é o título do projeto. */
        const cards = within(secao()).getAllByRole("article");
        expect(cards).toHaveLength(3);
        cards.forEach((card) =>
            expect(card).toHaveAccessibleName(expect.stringMatching(/\S/)),
        );
    });

    /* O que prova que os cards derivam da fonte única: os seis links
       apontam exatamente para o que `PROJECT_URLS` declara, e não para uma
       cópia que envelhece sozinha. */
    it.each([
        ["Web Chat", PROJECT_URLS.webChat],
        ["Auth Service", PROJECT_URLS.authService],
        ["Controle Financeiro", PROJECT_URLS.finances],
    ])("os links de %s vêm de PROJECT_URLS", (_, urls) => {
        montar();
        const links = within(secao())
            .getAllByRole("link")
            .map((a) => a.getAttribute("href"));

        expect(links).toContain(urls.live);
        expect(links).toContain(urls.repo);
    });

    /* Varrendo a seção inteira, e não card por card: assim a garantia
       continua valendo quando um projeto novo entrar, sem ninguém precisar
       lembrar de acrescentar um caso aqui. */
    it("todo link que abre em nova aba tem rel seguro", () => {
        montar();
        const externos = within(secao())
            .getAllByRole("link")
            .filter((a) => a.getAttribute("target") === "_blank");

        /* Se este número cair para zero a asserção abaixo passaria vazia. */
        expect(externos.length).toBeGreaterThanOrEqual(7);

        externos.forEach((a) => {
            const rel = a.getAttribute("rel") ?? "";
            expect(rel).toContain("noopener");
            expect(rel).toContain("noreferrer");
        });
    });

    it("o CTA final aponta para o perfil do GitHub", () => {
        montar();
        expect(
            within(secao()).getByRole("link", { name: /ver todos no github/i }),
        ).toHaveAttribute("href", GITHUB_URL);
    });

    /* Título e descrição de cada projeto são `Localized`, e os dois são
       conferidos SEPARADAMENTE de propósito.

       A primeira versão deste caso comparava o textContent inteiro do card, e
       medi que ela não pegava nada: fixando o título em `project.title.pt`,
       o texto do card continuava mudando de idioma por causa da descrição, e
       a asserção passava com o título congelado. Comparar o agregado esconde
       exatamente o que se quer vigiar. */
    const textosPorIdioma = (lang: "pt" | "en") => {
        const { unmount } = montar(lang);
        const cards = within(secao()).getAllByRole("article");
        const dados = cards.map((card) => ({
            /* O nome acessível vem do h3 via aria-labelledby: é o título. */
            titulo: card.getAttribute("aria-labelledby")
                ? (document.getElementById(
                      card.getAttribute("aria-labelledby")!,
                  )?.textContent ?? "")
                : "",
            descricao:
                card.querySelector(".work-card__desc")?.textContent ?? "",
        }));
        unmount();
        return dados;
    };

    /* Aqui NÃO se afirma que todo título muda de idioma, e a razão é o dado:
       "Web Chat" e "Auth Service" são nomes próprios e têm o mesmo valor em
       `pt` e `en`. Só "Controle Financeiro" / "Financial Control" difere.

       Tentei a asserção universal primeiro e ela reprovou contra o
       componente correto — o que mostra a regra, não o defeito. A asserção
       que vale é sobre o título que de fato tem duas formas: se alguém trocar
       o `title[lang]` por `title.pt`, este caso desmente. */
    it("o título que tem duas formas acompanha o idioma", () => {
        const titulos = (lang: "pt" | "en") =>
            textosPorIdioma(lang).map((c) => c.titulo);

        expect(titulos("pt")).toContain("Controle Financeiro");
        expect(titulos("en")).toContain("Financial Control");
    });

    it("todos os três cards têm título e nenhum vem vazio", () => {
        const pt = textosPorIdioma("pt");
        expect(pt).toHaveLength(3);
        pt.forEach((card) => expect(card.titulo).not.toBe(""));
    });

    it("a descrição de cada card acompanha o idioma", () => {
        const pt = textosPorIdioma("pt");
        const en = textosPorIdioma("en");

        pt.forEach((card, i) => {
            expect(card.descricao).not.toBe("");
            expect(en[i]!.descricao).not.toBe(card.descricao);
        });
    });
});
