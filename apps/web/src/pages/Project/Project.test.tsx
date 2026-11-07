import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { ProjectPage } from "./index";
import { LANG_KEY } from "@/shared/config/constants";
import { fetchPorOp, repo } from "@/test/repoFixture";

const AUTH = repo({
    name: "AuthService",
    description: "Serviço de autenticação",
    homepageUrl: "https://auth.example",
    stargazerCount: 3,
    forkCount: 1,
    topics: ["jwt", "fastapi"],
    languages: [
        { name: "Python", color: "#3572A5", size: 75 },
        { name: "CSS", color: "#663399", size: 25 },
    ],
});

const STATS = {
    openIssues: 2,
    totalIssues: 5,
    openPullRequests: 0,
    totalPullRequests: 3,
    branches: 2,
    tags: 1,
    releases: {
        total: 1,
        latest: [
            {
                name: "v1.0",
                tag: "v1.0.0",
                publishedAt: "2026-01-01T00:00:00Z",
                url: "https://github.com/r/1",
                prerelease: false,
            },
        ],
    },
    commits: {
        total: 42,
        lastYear: 7,
        lastYearDates: [new Date().toISOString()],
        recent: [
            {
                sha: "abcdef1234567",
                message: "feat: login",
                date: "2026-10-01T00:00:00Z",
                url: "https://github.com/c/1",
                author: "Guilherme",
                authorLogin: "https-shini",
            },
        ],
    },
    tree: [
        { name: "README.md", type: "blob" },
        { name: "src", type: "tree" },
    ],
    contributors: {
        total: 1,
        top: [
            {
                login: "https-shini",
                contributions: 42,
                url: "https://github.com/https-shini",
                avatarUrl: null,
            },
        ],
    },
};

const montar = (respostas: Record<string, unknown>, nome = "AuthService") => {
    vi.stubGlobal("fetch", vi.fn(fetchPorOp(respostas)));
    localStorage.setItem(LANG_KEY, "pt");
    window.history.replaceState({}, "", `/projetos/${nome}`);
    return render(
        <Providers>
            <ProjectPage name={nome} />
        </Providers>,
    );
};

afterEach(() => vi.unstubAllGlobals());

describe("/projetos/:nome", () => {
    it("mostra o projeto, os links e o README já sanitizado do servidor", async () => {
        montar({
            project: AUTH,
            readme: { html: "<h2>Instalação</h2><p>npm i</p>" },
            index: { repositories: [AUTH], followers: 1, fetchedAt: "x" },
        });
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: "AuthService",
            }),
        ).toBeInTheDocument();
        expect(screen.getByText("Serviço de autenticação")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Ver no GitHub/ }),
        ).toHaveAttribute("href", "https://github.com/https-shini/AuthService");
        expect(
            screen.getByRole("link", { name: /Acessar projeto/ }),
        ).toHaveAttribute("href", "https://auth.example");
        const readme = screen.getByRole("tabpanel", { name: "README" });
        expect(
            within(readme).getByRole("heading", { name: "Instalação" }),
        ).toBeInTheDocument();
    });

    it("painel lateral: status, licença e linguagens", async () => {
        montar({ project: AUTH, readme: { html: null } });
        const painel = await screen.findByRole("complementary", {
            name: "Atividade e manutenção",
        });
        expect(within(painel).getByText("MIT License")).toBeInTheDocument();
        expect(
            within(painel).getByRole("img", { name: /Python 75%/ }),
        ).toBeInTheDocument();
    });

    const valor = (rotulo: string) =>
        within(
            screen.getByRole("region", { name: "Números do repositório" }),
        ).getByText(rotulo).parentElement as HTMLElement;

    it("números: reais quando há stats; indisponível (não zero) quando não há", async () => {
        montar({ project: AUTH, readme: { html: null }, stats: STATS });
        await screen.findByRole("heading", { level: 1, name: "AuthService" });
        expect(
            await within(valor("Commits")).findByText("42"),
        ).toBeInTheDocument();
        expect(valor("Commits")).toHaveTextContent("7 no último ano");
        expect(valor("Issues abertas")).toHaveTextContent("2de 5 no total");
        expect(valor("Estrelas")).toHaveTextContent("3");
        expect(valor("Contribuidores")).toHaveTextContent("1");
    });

    it("sem stats: 'Indisponível' e aviso, e estrelas do índice continuam", async () => {
        montar({ project: AUTH, readme: { html: null }, stats: null });
        await screen.findByText(
            /estatísticas detalhadas não estão disponíveis/,
        );
        expect(valor("Commits")).toHaveTextContent("Indisponível");
        expect(valor("Issues abertas")).toHaveTextContent("Indisponível");
        expect(valor("Commits")).not.toHaveTextContent("0");
        expect(valor("Estrelas")).toHaveTextContent("3");
    });

    it("abas com teclado: atividade, estrutura e releases", async () => {
        montar({ project: AUTH, readme: { html: null }, stats: STATS });
        await screen.findByText("42");
        const readmeTab = screen.getByRole("tab", { name: "README" });
        expect(readmeTab).toHaveAttribute("aria-selected", "true");
        fireEvent.keyDown(readmeTab, { key: "ArrowRight" });
        const atividade = screen.getByRole("tab", { name: "Atividade" });
        expect(atividade).toHaveAttribute("aria-selected", "true");
        expect(atividade).toHaveFocus();
        const painel = screen.getByRole("tabpanel", { name: "Atividade" });
        expect(
            within(painel).getByRole("link", { name: "feat: login" }),
        ).toHaveAttribute("href", "https://github.com/c/1");
        expect(
            within(painel).getByText("7 commits nas últimas 52 semanas"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("tab", { name: "Estrutura" }));
        const estrutura = screen.getByRole("tabpanel", { name: "Estrutura" });
        const itens = within(estrutura).getAllByRole("link");
        expect(itens[0]).toHaveTextContent("src/");
        expect(itens[0]).toHaveAttribute(
            "href",
            "https://github.com/https-shini/AuthService/tree/main/src",
        );
        expect(itens[1]).toHaveAttribute(
            "href",
            "https://github.com/https-shini/AuthService/blob/main/README.md",
        );

        fireEvent.keyDown(screen.getByRole("tab", { name: "Estrutura" }), {
            key: "End",
        });
        const releases = screen.getByRole("tabpanel", { name: /Releases/ });
        expect(
            within(releases).getByRole("link", { name: "v1.0" }),
        ).toBeInTheDocument();
    });

    it("relacionados: só quem tem tecnologia em comum", async () => {
        const PARECIDO = repo({
            name: "outro-python",
            languages: [{ name: "Python", color: null, size: 1 }],
            primaryLanguage: { name: "Python", color: null },
        });
        const NADA = repo({
            name: "sem-relacao",
            languages: [{ name: "Go", color: null, size: 1 }],
            primaryLanguage: { name: "Go", color: null },
        });
        montar({
            project: AUTH,
            readme: { html: null },
            index: {
                repositories: [AUTH, PARECIDO, NADA],
                followers: 1,
                fetchedAt: "x",
            },
        });
        const sec = await screen.findByRole("region", {
            name: "Projetos relacionados",
        });
        expect(
            within(sec).getByRole("link", { name: "outro-python" }),
        ).toBeInTheDocument();
        expect(
            within(sec).queryByRole("link", { name: "sem-relacao" }),
        ).toBeNull();
    });

    it("ações condicionais: documentação e GitHub Pages", async () => {
        montar({
            project: {
                ...AUTH,
                homepageUrl: null,
                hasDocs: true,
                hasPages: true,
            },
            readme: { html: null },
        });
        expect(
            await screen.findByRole("link", { name: /Documentação/ }),
        ).toHaveAttribute(
            "href",
            "https://github.com/https-shini/AuthService/tree/main/docs",
        );
        expect(
            screen.getByRole("link", { name: /GitHub Pages/ }),
        ).toHaveAttribute("href", "https://https-shini.github.io/AuthService/");
    });

    it("sem README: estado próprio com link para o repositório", async () => {
        montar({ project: AUTH, readme: { html: null } });
        expect(
            await screen.findByRole("heading", {
                name: "Este projeto não tem README",
            }),
        ).toBeInTheDocument();
    });

    it("repositório inexistente: não encontrado, noindex e volta para /projetos", async () => {
        montar({ project: null, readme: { html: null } }, "nao-existe");
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: "Projeto não encontrado",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Ver todos os projetos" }),
        ).toHaveAttribute("href", "/projetos");
        expect(
            document
                .querySelector('meta[name="robots"]')
                ?.getAttribute("content"),
        ).toBe("noindex, follow");
    });

    it("erro de rede é distinto de não encontrado", async () => {
        montar({});
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Não foi possível falar com o GitHub",
        );
    });
});
