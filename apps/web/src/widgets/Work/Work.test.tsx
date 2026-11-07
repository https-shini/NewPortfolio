import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { Work } from "./Work";
import { GITHUB_URL, LANG_KEY } from "@/shared/config/constants";
import { ROUTES, projectPath } from "@/shared/config/routes";
import { fetchPorOp, repo } from "@/test/repoFixture";

/* ─────────────────────────────────────────────────────────
   A vitrine da home é uma grade com os fixados do GitHub
   (`op=pinned`). O que se vigia: a ordem dos fixados, todos
   visíveis de uma vez, o 1º como líder, o card inteiro levando à
   página do projeto, atalhos de demo/código, nenhum conteúdo
   inventado e a seção sempre com saída para o catálogo.
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

const cards = async () => {
    await screen.findByRole("heading", { level: 3, name: "AuthService" });
    return within(secao()).getAllByRole("article");
};

afterEach(() => vi.unstubAllGlobals());

describe("Work — grade dos fixados no GitHub", () => {
    it("todos os fixados de uma vez, na ordem do GitHub; o 1º é o líder", async () => {
        montar(PINNED);
        const lista = await cards();
        expect(
            lista.map((c) => within(c).getByRole("heading").textContent),
        ).toEqual(["AuthService", "web-chat", "NewPortfolio"]);
        expect(lista[0]).toHaveAttribute("data-lead", "true");
        expect(lista[1]).not.toHaveAttribute("data-lead");
    });

    it("o título leva à página do projeto (e cobre o card)", async () => {
        montar(PINNED);
        const [auth] = await cards();
        expect(
            within(auth!).getByRole("link", { name: "AuthService" }),
        ).toHaveAttribute("href", projectPath("AuthService"));
    });

    it("líder: botões com texto para demo e código", async () => {
        montar(PINNED);
        const [auth] = await cards();
        expect(
            within(auth!).getByRole("link", {
                name: /Acessar projeto — AuthService/,
            }),
        ).toHaveAttribute("href", "https://auth.example");
        expect(
            within(auth!).getByRole("link", {
                name: /Código-fonte — AuthService/,
            }),
        ).toHaveAttribute("href", "https://github.com/https-shini/AuthService");
        expect(within(auth!).getByText("Demo online")).toBeInTheDocument();
    });

    it("compactos: atalho de código sempre; de demo só quando existe", async () => {
        montar(PINNED);
        const [, chat] = await cards();
        expect(
            within(chat!).getByRole("link", {
                name: /Código-fonte — web-chat/,
            }),
        ).toBeInTheDocument();
        expect(
            within(chat!).queryByRole("link", { name: /Acessar projeto/ }),
        ).toBeNull();
        expect(within(chat!).queryByText("Demo online")).toBeNull();
    });

    it("stack: líder com barra e %, compacto com até três nomes", async () => {
        montar(PINNED);
        const lista = await cards();
        const novo = lista[2]!;
        const stack = within(novo).getByRole("list", { name: "Stack" });
        expect(
            within(stack)
                .getAllByRole("listitem")
                .map((li) => li.textContent),
        ).toEqual(["TypeScript", "CSS", "JavaScript"]);
        expect(novo.querySelector(".ptile__bar")).toBeNull();
    });

    it("destaques = tópicos do GitHub, só no líder", async () => {
        montar(PINNED);
        const [auth] = await cards();
        const topicos = within(auth!).getByRole("list", { name: "Destaques" });
        expect(topicos).toHaveTextContent("#jwt");
        expect(topicos).toHaveTextContent("#fastapi");
    });

    it("sem descrição no GitHub, mostra o aviso — não inventa texto", async () => {
        montar(PINNED);
        const [, chat] = await cards();
        expect(
            within(chat!).getByText("Sem descrição no GitHub."),
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

    it("faixa final leva ao catálogo e ao GitHub", async () => {
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
        await screen.findByRole("heading", { level: 3, name: "AuthService" });
        expect(
            screen.getByRole("region", { name: "Projects" }),
        ).toHaveTextContent("Pinned on GitHub");
    });
});
