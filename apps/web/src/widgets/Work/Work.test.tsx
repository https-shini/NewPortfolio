import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { Work } from "./Work";
import { GITHUB_URL, LANG_KEY } from "@/shared/config/constants";
import { ROUTES, projectPath } from "@/shared/config/routes";
import { fetchPorOp, repo } from "@/test/repoFixture";

/* ─────────────────────────────────────────────────────────
   A vitrine da home é um carrossel dos fixados no GitHub
   (`op=pinned`). O que se vigia: a ordem dos fixados, todo
   projeto alcançável (setas, dots, teclado), só o slide atual no
   Tab, nenhum conteúdo inventado e a seção sempre com saída.

   `hidden: true` nas buscas por slides: os de fora de vista ficam
   `inert`, e a árvore de acessibilidade do jsdom os omite.
───────────────────────────────────────────────────────── */

const FIXADOS = [
    repo({
        name: "AuthService",
        homepageUrl: "https://auth.example",
        topics: ["jwt", "fastapi"],
    }),
    repo({ name: "web-chat", description: null }),
    repo({
        name: "NewPortfolio",
        languages: [
            { name: "TypeScript", color: "#3178c6", size: 9 },
            { name: "CSS", color: "#663399", size: 5 },
            { name: "JavaScript", color: "#f1e05a", size: 2 },
            { name: "HTML", color: "#e34c26", size: 1 },
            { name: "Shell", color: "#89e051", size: 1 },
        ],
    }),
];

const PINNED = {
    pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
};

const montar = (
    respostas: Record<string, unknown>,
    lang: "pt" | "en" = "pt",
) => {
    vi.stubGlobal("fetch", vi.fn(fetchPorOp(respostas)));
    localStorage.setItem(LANG_KEY, lang);
    return render(
        <Providers>
            <Work />
        </Providers>,
    );
};

const secao = () =>
    screen.getByRole("region", { name: /^(Projetos|Projects)$/ });

const carrossel = () =>
    screen.findByRole("region", {
        name: /Projetos em destaque|Featured projects/,
    });

async function slides(): Promise<HTMLElement[]> {
    const c = await carrossel();
    return within(c)
        .getAllByRole("group", { hidden: true })
        .filter((g) => g.getAttribute("aria-roledescription") === "slide");
}

afterEach(() => vi.unstubAllGlobals());

describe("Work — carrossel dos fixados no GitHub", () => {
    it("um slide por fixado, na ordem do GitHub, rotulado com nome e posição", async () => {
        montar(PINNED);
        expect(
            (await slides()).map((s) => s.getAttribute("aria-label")),
        ).toEqual([
            "AuthService — 1 de 3",
            "web-chat — 2 de 3",
            "NewPortfolio — 3 de 3",
        ]);
    });

    it("é um carrossel acessível: roledescription, contador e dots", async () => {
        montar(PINNED);
        const c = await carrossel();
        expect(c).toHaveAttribute("aria-roledescription", "carousel");
        expect(c).toHaveTextContent("01/03");
        const dots = within(c).getAllByRole("button", {
            name: /Ir para o projeto/,
        });
        expect(dots).toHaveLength(3);
        expect(dots[0]).toHaveAttribute("aria-current", "true");
        expect(dots[1]).not.toHaveAttribute("aria-current");
    });

    it("só o slide atual entra no Tab (os outros ficam inert)", async () => {
        montar(PINNED);
        const [s1, s2, s3] = (await slides()).map((s) => s.parentElement!);
        expect(s1).not.toHaveAttribute("inert");
        expect(s2).toHaveAttribute("inert");
        expect(s3).toHaveAttribute("inert");
    });

    it("setas, dots e teclado navegam; nos extremos a seta desabilita", async () => {
        montar(PINNED);
        const c = await carrossel();
        const anterior = within(c).getByRole("button", {
            name: "Projeto anterior",
        });
        const proximo = within(c).getByRole("button", {
            name: "Próximo projeto",
        });
        expect(anterior).toBeDisabled();

        fireEvent.click(proximo);
        expect(c).toHaveTextContent("02/03");
        const [s1, s2] = (await slides()).map((s) => s.parentElement!);
        expect(s1).toHaveAttribute("inert");
        expect(s2).not.toHaveAttribute("inert");

        fireEvent.keyDown(c, { key: "End" });
        expect(c).toHaveTextContent("03/03");
        expect(proximo).toBeDisabled();

        fireEvent.keyDown(c, { key: "ArrowLeft" });
        expect(c).toHaveTextContent("02/03");

        fireEvent.keyDown(c, { key: "Home" });
        expect(c).toHaveTextContent("01/03");

        fireEvent.click(
            within(c).getByRole("button", { name: /Ir para o projeto 3/ }),
        );
        expect(c).toHaveTextContent("03/03");
    });

    it("anuncia a troca só depois de uma ação — nada ao carregar", async () => {
        montar(PINNED);
        const c = await carrossel();
        expect(screen.queryByText(/Projeto 1 de 3/)).toBeNull();
        fireEvent.click(
            within(c).getByRole("button", { name: "Próximo projeto" }),
        );
        expect(
            screen.getByText("Projeto 2 de 3: web-chat"),
        ).toBeInTheDocument();
    });

    it("com demo: Acessar projeto é o principal, e Detalhes continua presente", async () => {
        montar(PINNED);
        const [auth] = await slides();
        const demo = within(auth!).getByRole("link", {
            name: /Acessar projeto — AuthService/,
        });
        expect(demo).toHaveAttribute("href", "https://auth.example");
        expect(demo).toHaveClass("work-btn--primary");
        const detalhes = within(auth!).getByRole("link", {
            name: /Detalhes — AuthService/,
        });
        expect(detalhes).toHaveAttribute("href", projectPath("AuthService"));
        expect(detalhes).not.toHaveAttribute("target");
    });

    it("sem demo, Detalhes é o principal", async () => {
        montar(PINNED);
        const [, chat] = await slides();
        expect(
            within(chat!).getByRole("link", {
                name: /Detalhes — web-chat/,
                hidden: true,
            }),
        ).toHaveClass("work-btn--primary");
        expect(
            within(chat!).queryByRole("link", {
                name: /Acessar projeto/,
                hidden: true,
            }),
        ).toBeNull();
    });

    it("todo slide tem o botão de código-fonte para o repositório", async () => {
        montar(PINNED);
        for (const s of await slides()) {
            const nome = s.getAttribute("aria-label")!.split(" — ")[0]!;
            expect(
                within(s).getByRole("link", {
                    name: new RegExp(`Código-fonte — ${nome}`),
                    hidden: true,
                }),
            ).toHaveAttribute("href", `https://github.com/https-shini/${nome}`);
        }
    });

    it("stack: até quatro linguagens, com a porcentagem medida", async () => {
        montar(PINNED);
        const s = (await slides())[2]!;
        const stack = within(s).getByRole("list", {
            name: "Stack",
            hidden: true,
        });
        const itens = within(stack).getAllByRole("listitem", { hidden: true });
        expect(
            itens.map(
                (li) => li.querySelector(".work-card__tech-name")?.textContent,
            ),
        ).toEqual(["TypeScript", "CSS", "JavaScript", "HTML"]);
        /* Com bytes medidos, a barra soletra a divisão para o leitor de
           tela e cada item mostra a sua fatia. */
        if (s.querySelector(".work-card__stackbar")) {
            expect(itens[0]).toHaveTextContent(/%$/);
        }
    });

    it("números rotulados: estrelas, forks e atualização", async () => {
        montar(PINNED);
        const s = (await slides())[0]!;
        const fatos = s.querySelector(
            'dl[aria-label="Dados do repositório"]',
        ) as HTMLElement;
        const rotulos = [...fatos.querySelectorAll("dt")].map((dt) =>
            dt.textContent?.trim(),
        );
        expect(rotulos.slice(0, 3)).toEqual([
            "Estrelas",
            "Forks",
            "Atualizado",
        ]);
    });

    it("destaques são os tópicos do GitHub; sem tópicos, a lista não aparece", async () => {
        montar(PINNED);
        const [auth, chat] = await slides();
        expect(within(auth!).getByText("Destaques")).toBeInTheDocument();
        expect(within(auth!).getByText("#jwt")).toBeInTheDocument();
        expect(within(chat!).queryByText("Destaques")).toBeNull();
    });

    it("sem descrição no GitHub, mostra o aviso — não inventa texto", async () => {
        montar(PINNED);
        const [, chat] = await slides();
        expect(
            within(chat!).getByText("Sem descrição no GitHub."),
        ).toBeInTheDocument();
    });

    it("todo link externo abre em nova aba com rel seguro", async () => {
        montar(PINNED);
        await slides();
        within(secao())
            .getAllByRole("link", { hidden: true })
            .filter((a) => a.getAttribute("target") === "_blank")
            .forEach((a) =>
                expect(a).toHaveAttribute("rel", "noopener noreferrer"),
            );
    });

    it("CTA: Ver todos os projetos → /projetos, e o GitHub continua acessível", async () => {
        montar(PINNED);
        expect(
            screen.getByRole("link", { name: /Ver todos os projetos/ }),
        ).toHaveAttribute("href", ROUTES.PROJECTS);
        expect(
            screen.getByRole("link", { name: /Ver todos no GitHub/ }),
        ).toHaveAttribute("href", GITHUB_URL);
    });

    it("com erro, avisa e mantém os caminhos de saída", async () => {
        montar({});
        expect(
            await screen.findByText(
                /Não foi possível carregar os projetos agora/,
            ),
        ).toHaveAttribute("role", "status");
        expect(
            screen.queryByRole("region", { name: "Projetos em destaque" }),
        ).toBeNull();
        expect(
            screen.getByRole("link", { name: /Ver todos os projetos/ }),
        ).toBeInTheDocument();
    });

    it("em inglês, rótulos e posição acompanham o idioma", async () => {
        montar(PINNED, "en");
        expect((await slides())[0]).toHaveAttribute(
            "aria-label",
            "AuthService — 1 of 3",
        );
        expect(
            screen.getByRole("button", { name: "Next project" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /View all projects/ }),
        ).toBeInTheDocument();
    });
});
