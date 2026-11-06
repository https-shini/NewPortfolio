import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
        const readme = screen.getByRole("article", { name: "README" });
        expect(
            within(readme).getByRole("heading", { name: "Instalação" }),
        ).toBeInTheDocument();
    });

    it("painel de atividade: status, estrelas, forks, licença e linguagens", async () => {
        montar({ project: AUTH, readme: { html: null } });
        const painel = await screen.findByRole("complementary", {
            name: "Atividade e manutenção",
        });
        expect(
            within(painel).getByText("Estrelas").nextElementSibling,
        ).toHaveTextContent("3");
        expect(
            within(painel).getByText("Forks").nextElementSibling,
        ).toHaveTextContent("1");
        expect(within(painel).getByText("MIT License")).toBeInTheDocument();
        expect(
            within(painel).getByRole("img", { name: /Python 75%/ }),
        ).toBeInTheDocument();
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
