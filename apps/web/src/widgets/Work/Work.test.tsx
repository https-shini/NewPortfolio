import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { Work } from "./Work";
import { GITHUB_URL, LANG_KEY } from "@/shared/config/constants";
import { ROUTES, projectPath } from "@/shared/config/routes";
import { fetchPorOp, repo } from "@/test/repoFixture";

/* ─────────────────────────────────────────────────────────
   A vitrine da home mostra os fixados do GitHub (`op=pinned`):
   os três primeiros em cartões de destaque (o ProjectCard único do
   site) e os demais em "Outras implementações". O que se vigia: a
   ordem dos fixados, todos alcançáveis, as ações de cada cartão,
   nenhum conteúdo inventado e a saída para o catálogo.
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
    repo({ name: "Portal-Receitas" }),
    repo({ name: "todolist-fullstack" }),
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

const cards = async () => {
    await screen.findByRole("heading", { level: 3, name: "Auth Service" });
    return within(secao()).getAllByRole("article");
};

afterEach(() => vi.unstubAllGlobals());

describe("Work — vitrine dos fixados no GitHub", () => {
    it("três destaques na ordem do GitHub, numerados", async () => {
        montar(PINNED);
        const lista = await cards();
        expect(
            lista.map((c) => within(c).getByRole("heading").textContent),
        ).toEqual(["Auth Service", "Web Chat", "New Portfolio"]);
        expect(lista[0]).toHaveTextContent("01 / Projeto");
        expect(lista[2]).toHaveTextContent("03 / Projeto");
    });

    it("barra com a contagem real e atalho para o GitHub", async () => {
        montar(PINNED);
        await cards();
        expect(secao().querySelector(".work__count strong")).toHaveTextContent(
            "05",
        );
        expect(
            within(secao()).getByRole("link", { name: /No GitHub/ }),
        ).toHaveAttribute("href", GITHUB_URL);
    });

    it("outras implementações: os demais fixados, levando à página", async () => {
        montar(PINNED);
        await cards();
        const outras = within(secao()).getByRole("region", {
            name: "Outras implementações",
        });
        const links = within(outras).getAllByRole("link");
        expect(links.map((a) => a.getAttribute("href"))).toEqual([
            projectPath("Portal-Receitas"),
            projectPath("todolist-fullstack"),
        ]);
        expect(links[0]).toHaveTextContent("04");
        expect(links[0]).toHaveTextContent("Portal Receitas");
    });

    it("com demo: 'Acessar projeto' e selo 'Aplicação disponível'", async () => {
        montar(PINNED);
        const [auth] = await cards();
        expect(
            within(auth!).getByRole("link", {
                name: /Acessar projeto — Auth Service/,
            }),
        ).toHaveAttribute("href", "https://auth.example");
        expect(
            within(auth!).getByRole("link", {
                name: /Aplicação disponível — Auth Service/,
            }),
        ).toHaveAttribute("href", "https://auth.example");
        expect(
            within(auth!).getByRole("link", { name: /Código — Auth Service/ }),
        ).toHaveAttribute("href", "https://github.com/https-shini/AuthService");
    });

    it("sem demo: a ação principal leva à página do projeto", async () => {
        montar(PINNED);
        const [, chat] = await cards();
        expect(
            within(chat!).getByRole("link", {
                name: /Conhecer projeto — Web Chat/,
            }),
        ).toHaveAttribute("href", projectPath("web-chat"));
        expect(within(chat!).queryByText("Aplicação disponível")).toBeNull();
    });

    it("tecnologias: até três linguagens", async () => {
        montar(PINNED);
        const lista = await cards();
        const stack = within(lista[2]!).getByRole("list", { name: "Stack" });
        expect(
            within(stack)
                .getAllByRole("listitem")
                .map((li) => li.textContent),
        ).toEqual(["TypeScript", "CSS", "JavaScript"]);
    });

    it("documentação do projeto: painel nativo com tópicos e links", async () => {
        montar(PINNED);
        const [auth] = await cards();
        const resumo = within(auth!).getByText("Documentação do projeto");
        const detalhes = resumo.closest("details")!;
        expect(detalhes).not.toHaveAttribute("open");
        fireEvent.click(resumo);
        expect(within(detalhes).getByText("#jwt")).toBeInTheDocument();
        expect(
            within(detalhes).getByRole("link", {
                name: /Ver página do projeto/,
            }),
        ).toHaveAttribute("href", projectPath("AuthService"));
    });

    it("sem descrição no GitHub, mostra um convite neutro — não inventa", async () => {
        montar(PINNED);
        const [, chat] = await cards();
        expect(
            within(chat!).getByText(/Explore os arquivos e a documentação/),
        ).toBeInTheDocument();
    });

    it("todo link externo abre em nova aba com rel seguro", async () => {
        montar(PINNED);
        await cards();
        for (const a of within(secao())
            .getAllByRole("link")
            .filter((a) => a.getAttribute("target") === "_blank")) {
            expect(a).toHaveAttribute("rel", "noopener noreferrer");
        }
    });

    it("rodapé leva ao catálogo e ao GitHub", async () => {
        montar(PINNED);
        await cards();
        expect(
            within(secao()).getByRole("link", {
                name: /Ver todos os projetos/,
            }),
        ).toHaveAttribute("href", ROUTES.PROJECTS);
        expect(
            within(secao()).getByRole("link", { name: /Ver todos no GitHub/ }),
        ).toHaveAttribute("href", GITHUB_URL);
    });

    it("erro na API: aviso e a saída para o catálogo continua", async () => {
        montar({});
        expect(
            await screen.findByText(/não|couldn/i, {
                selector: ".work__state",
            }),
        ).toBeInTheDocument();
        expect(
            within(secao()).getByRole("link", {
                name: /Ver todos os projetos/,
            }),
        ).toBeInTheDocument();
    });

    it("em inglês", async () => {
        montar(PINNED, "en");
        await screen.findByRole("heading", { level: 3, name: "Auth Service" });
        expect(
            screen.getByRole("region", { name: "Projects" }),
        ).toHaveTextContent("Pinned projects");
    });
});
