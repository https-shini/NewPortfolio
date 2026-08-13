import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { LinksPage } from "./index";
import { PROFILE } from "@/shared/config/profile";
import { PRIMARY_LINKS } from "@/shared/config/links";
import { ROUTES } from "@/shared/config/routes";

/* ─────────────────────────────────────────────────────────
   Desde que a página monta o Header e o Footer do site, o
   documento tem mais de um link para GitHub, LinkedIn, e-mail e
   currículo — os do corpo e os do rodapé. `screen.getByRole` passou a
   achar dois de cada e a estourar. As asserções sobre o corpo escopam
   em <main>; as que falam da casca escopam nela.
───────────────────────────────────────────────────────── */

const setup = () => {
    localStorage.setItem("portfolio-lang", "pt");
    return render(
        <RouterProvider>
            <LangProvider>
                <LinksPage />
            </LangProvider>
        </RouterProvider>,
    );
};

/** O corpo da página, sem o Header nem o Footer. */
const corpo = () => within(screen.getByRole("main"));

describe("LinksPage — social tree", () => {
    beforeEach(() => window.history.replaceState({}, "", ROUTES.LINKS));
    afterEach(() => vi.unstubAllGlobals());

    it("apresenta o perfil com nome, handle e papéis", () => {
        setup();
        expect(
            screen.getByRole("heading", { level: 1, name: PROFILE.name }),
        ).toBeInTheDocument();
        expect(corpo().getByText(PROFILE.handle)).toBeInTheDocument();
        PROFILE.roles.forEach((role) => {
            expect(corpo().getByText(role)).toBeInTheDocument();
        });
    });

    /* A disponibilidade era um ponto verde com o rótulo num `title`, no
       mesmo elemento marcado `aria-hidden` — invisível para quem enxerga
       e mudo para leitor de tela. A tradução existia nos dois idiomas e
       não chegava a ninguém. */
    it("anuncia a disponibilidade como texto, e não como enfeite", () => {
        setup();
        const pill = corpo().getByText("Disponível");
        expect(pill).toBeVisible();
        expect(pill.closest("[aria-hidden='true']")).toBeNull();
    });

    /* A frase apresenta a lista, mas não faz parte dela: dentro do <nav>
       ela seria o primeiro conteúdo de uma landmark de navegação, que é
       o que um leitor de tela percorre procurando links. */
    it("a mensagem introdutória fica fora da landmark de navegação", () => {
        setup();
        const intro = corpo().getByText(
            "Conecte-se comigo pelas plataformas abaixo.",
        );
        expect(intro).toBeVisible();
        expect(intro.closest("nav")).toBeNull();
    });

    it("usa a mesma foto da seção Sobre (hero.webp)", () => {
        setup();
        const img = screen.getByAltText(PROFILE.name) as HTMLImageElement;
        expect(img.getAttribute("src")).toMatch(/hero/);
    });

    it("renderiza um cartão por link primário", () => {
        setup();
        PRIMARY_LINKS.forEach((link) => {
            expect(
                corpo().getByRole("link", {
                    name: new RegExp(`^${link.label.pt}`),
                }),
            ).toBeInTheDocument();
        });
    });

    it("abre links externos em nova aba com rel seguro", () => {
        setup();
        const github = corpo().getByRole("link", { name: /^GitHub/ });
        expect(github).toHaveAttribute("href", PROFILE.social.github.url);
        expect(github).toHaveAttribute("target", "_blank");
        expect(github).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("não abre nova aba no link de e-mail", () => {
        setup();
        const contato = corpo().getByRole("link", { name: "Contato" });
        expect(contato).toHaveAttribute("href", `mailto:${PROFILE.email}`);
        expect(contato).not.toHaveAttribute("target");
    });

    /* O cartão do portfólio apontava para PROFILE.siteUrl e abria uma aba
       nova — para o mesmo domínio em que o visitante já está, desde que a
       casca do site entrou nesta página. */
    it("o cartão do portfólio é rota interna, e não aba nova", () => {
        setup();
        const portfolio = corpo().getByRole("link", { name: "Portfólio" });
        expect(portfolio).toHaveAttribute("href", ROUTES.HOME);
        expect(portfolio).not.toHaveAttribute("target");
    });

    it("avisa no nome acessível quando o link abre em nova aba", () => {
        setup();
        expect(
            corpo().getByRole("link", { name: /GitHub \(abre em nova aba\)/ }),
        ).toBeInTheDocument();
    });

    it("o currículo aponta para o PDF do idioma corrente", () => {
        setup();
        const cv = corpo().getByRole("link", { name: /Currículo/ });
        expect(cv).toHaveAttribute("href", PROFILE.cv.pt);
    });

    it("copia a URL e sinaliza quando não há share nativo", async () => {
        /* userEvent.setup() instala o próprio stub de clipboard — criar o
           user antes garante que o mock abaixo é o que a página enxerga. */
        const user = userEvent.setup();

        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", {
            ...navigator,
            share: undefined,
            clipboard: { writeText },
        });

        setup();

        await user.click(screen.getByRole("button", { name: /Compartilhar/ }));

        expect(writeText).toHaveBeenCalledWith(
            `${PROFILE.siteUrl}${ROUTES.LINKS}`,
        );
        expect(await screen.findByText("Copiado!")).toBeInTheDocument();
    });

    it("cancelar o share nativo não acende o estado de copiado", async () => {
        const user = userEvent.setup();

        const share = vi.fn().mockRejectedValue(new Error("AbortError"));
        const writeText = vi.fn();
        vi.stubGlobal("navigator", {
            ...navigator,
            share,
            clipboard: { writeText },
        });

        setup();

        await user.click(screen.getByRole("button", { name: /Compartilhar/ }));

        expect(share).toHaveBeenCalled();
        expect(writeText).not.toHaveBeenCalled();
        expect(screen.queryByText("Copiado!")).not.toBeInTheDocument();
    });

    it("define título e canonical da rota", () => {
        setup();
        expect(document.title).toContain(PROFILE.name);
        expect(
            document.head
                .querySelector('link[rel="canonical"]')
                ?.getAttribute("href"),
        ).toBe(`${PROFILE.siteUrl}${ROUTES.LINKS}`);
    });
});

/* ─────────────────────────────────────────────────────────
   A casca do site — o que a mudança estrutural precisa garantir
───────────────────────────────────────────────────────── */

describe("LinksPage — Header e Footer do site", () => {
    beforeEach(() => window.history.replaceState({}, "", ROUTES.LINKS));

    it("monta o Header, com a navegação das seções da home", () => {
        setup();
        const header = screen.getByRole("banner");
        expect(header).toBeInTheDocument();
        expect(
            within(header).getByRole("link", { name: /Sobre/ }),
        ).toBeInTheDocument();
    });

    it("monta o Footer", () => {
        setup();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    /* Enquanto a página tinha rodapé próprio, ela e o Footer imprimiam
       cada um o seu copyright — dois na mesma tela. */
    it("o copyright aparece uma vez só", () => {
        setup();
        expect(screen.getAllByText(/Guilherme Cruz\./)).toHaveLength(1);
    });

    /* Idioma e tema saíram do canto da página e passaram a ser os do
       Header, os mesmos de todas as rotas. */
    it("idioma e tema são os controles do Header", () => {
        setup();
        const header = screen.getByRole("banner");
        expect(
            within(header).getByRole("button", { name: /Switch to English/ }),
        ).toBeInTheDocument();
        /* O rótulo mostra a AÇÃO, não o estado, então ele depende do tema
           corrente — a asserção fica no que não varia. */
        expect(
            within(header).getByRole("button", { name: /Alternar para modo/ }),
        ).toBeInTheDocument();
        expect(document.querySelector(".linktree__controls")).toBeNull();
    });
});
