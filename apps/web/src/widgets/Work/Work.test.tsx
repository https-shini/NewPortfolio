import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { Work } from "./Work";
import { GITHUB_URL, LANG_KEY } from "@/shared/config/constants";
import { ROUTES, projectPath } from "@/shared/config/routes";
import { fetchPorOp, repo } from "@/test/repoFixture";

/* ─────────────────────────────────────────────────────────
   A vitrine da home vem do GitHub (`op=pinned`). O que se vigia:
   a ordem dos fixados é respeitada, cada card leva à página do
   projeto DENTRO do site, e a seção nunca fica sem saída — nem
   carregando, nem com erro.
───────────────────────────────────────────────────────── */

const FIXADOS = [
    repo({ name: "AuthService", homepageUrl: "https://auth.example" }),
    repo({ name: "web-chat", description: null }),
    repo({
        name: "NewPortfolio",
        languages: [
            { name: "TypeScript", color: "#3178c6", size: 9 },
            { name: "CSS", color: "#663399", size: 5 },
            { name: "JavaScript", color: "#f1e05a", size: 2 },
            { name: "HTML", color: "#e34c26", size: 1 },
        ],
    }),
];

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

const secao = () => screen.getByRole("region", { name: /projetos|projects/i });

afterEach(() => vi.unstubAllGlobals());

describe("Work — vitrine do GitHub", () => {
    it("mostra os fixados na ordem escolhida no GitHub", async () => {
        montar({
            pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
        });
        const cards = await within(secao()).findAllByRole("article");
        expect(
            cards.map((c) => within(c).getByRole("heading").textContent),
        ).toEqual(["AuthService", "web-chat", "NewPortfolio"]);
    });

    it("o botão Detalhes leva à página do projeto no próprio site", async () => {
        montar({
            pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
        });
        const link = await screen.findByRole("link", {
            name: /Detalhes — AuthService/,
        });
        expect(link).toHaveAttribute("href", projectPath("AuthService"));
        expect(link).not.toHaveAttribute("target");
    });

    it("com demo, o segundo botão abre a demo; sem demo, o repositório", async () => {
        montar({
            pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
        });
        expect(
            await screen.findByRole("link", {
                name: /Acessar projeto — AuthService/,
            }),
        ).toHaveAttribute("href", "https://auth.example");
        expect(
            screen.getByRole("link", { name: /Repositório — web-chat/ }),
        ).toHaveAttribute("href", "https://github.com/https-shini/web-chat");
    });

    it("no máximo três linguagens por card", async () => {
        montar({
            pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
        });
        const card = (await screen.findAllByRole("article"))[2]!;
        expect(
            within(card)
                .getAllByRole("listitem")
                .map((li) => li.textContent),
        ).toEqual(["TypeScript", "CSS", "JavaScript"]);
    });

    it("repositório sem descrição mostra o aviso, não um parágrafo vazio", async () => {
        montar({
            pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
        });
        const card = (await screen.findAllByRole("article"))[1]!;
        expect(
            within(card).getByText("Sem descrição no GitHub."),
        ).toBeInTheDocument();
    });

    it("todo link externo abre em nova aba com rel seguro", async () => {
        montar({
            pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
        });
        await screen.findAllByRole("article");
        within(secao())
            .getAllByRole("link")
            .filter((a) => a.getAttribute("target") === "_blank")
            .forEach((a) =>
                expect(a).toHaveAttribute("rel", "noopener noreferrer"),
            );
    });

    it("CTA: Ver todos os projetos → /projetos, e o GitHub continua acessível", async () => {
        montar({
            pinned: { repositories: FIXADOS, source: "pinned", fetchedAt: "x" },
        });
        expect(
            screen.getByRole("link", { name: /Ver todos os projetos/ }),
        ).toHaveAttribute("href", ROUTES.PROJECTS);
        expect(
            screen.getByRole("link", { name: /Ver todos no GitHub/ }),
        ).toHaveAttribute("href", GITHUB_URL);
    });

    it("com erro, avisa e mantém os dois caminhos de saída", async () => {
        montar({});
        expect(await screen.findByRole("status")).toHaveTextContent(/GitHub/);
        expect(within(secao()).queryAllByRole("article")).toHaveLength(0);
        expect(
            screen.getByRole("link", { name: /Ver todos os projetos/ }),
        ).toBeInTheDocument();
    });

    it("em inglês, os rótulos acompanham o idioma", async () => {
        montar(
            {
                pinned: {
                    repositories: FIXADOS,
                    source: "pinned",
                    fetchedAt: "x",
                },
            },
            "en",
        );
        expect(
            await screen.findByRole("link", { name: /Details — AuthService/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /View all projects/ }),
        ).toBeInTheDocument();
    });
});
