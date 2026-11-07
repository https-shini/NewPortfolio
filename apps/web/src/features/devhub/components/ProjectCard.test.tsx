import type React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
    within,
} from "@testing-library/react";
import { Providers } from "@/app/providers";
import { ProjectCard } from "./ProjectCard";
import { RepoThumb } from "./RepoThumb";
import { LANG_KEY } from "@/shared/config/constants";
import { fetchPorOp, repo } from "@/test/repoFixture";
import type { Repository } from "@/features/devhub/types";

const montar = (
    r: Repository,
    props: Partial<React.ComponentProps<typeof ProjectCard>> = {},
) => {
    localStorage.setItem(LANG_KEY, "pt");
    return render(
        <Providers>
            <ProjectCard repo={r} {...props} />
        </Providers>,
    );
};

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

const README = `
<h2>O que é?</h2><p>Painel de finanças pessoais.</p>
<p><img src="https://img.shields.io/badge/x" alt="selo"></p>
<p><img src="https://raw.githubusercontent.com/a/doc/main/1.png" alt="Tela inicial"></p>
<p><img src="https://raw.githubusercontent.com/a/doc/main/2.png" alt="Gráficos"></p>
<h2>Funcionalidades</h2><ul><li>Exportação em PDF</li><li>Tema escuro</li></ul>
<h2>Tecnologias utilizadas</h2><ul><li><strong>React</strong> — interface</li><li><strong>Styled Components</strong> — estilos</li></ul>`;

describe("ProjectCard", () => {
    it("usa a capa real quando a API encontrou uma", () => {
        const { container } = montar(
            repo({
                name: "com-capa",
                openGraphImageUrl: "https://opengraph.githubassets.com/x",
                cover: {
                    kind: "readme",
                    url: "https://raw.githubusercontent.com/a/b/main/s.png",
                },
            }),
        );
        const img = container.querySelector(".pcard__media img");
        expect(img).toHaveAttribute(
            "src",
            "https://raw.githubusercontent.com/a/b/main/s.png",
        );
        expect(img).toHaveAttribute("data-cover", "readme");
        expect(container.querySelector(".pcover")).toBeNull();
    });

    it("catálogo sem capa real: prompt do terminal, nunca o card automático", () => {
        const { container } = montar(
            repo({
                name: "meu-projeto_legal",
                openGraphImageUrl: "https://opengraph.githubassets.com/x",
                cover: null,
            }),
        );
        expect(container.querySelector(".pcard__media img")).toBeNull();
        const capa = container.querySelector(".pcover--terminal");
        expect(capa).toHaveAttribute("aria-hidden", "true");
        expect(capa).toHaveTextContent("$ cd ~/meu-projeto_legal");
    });

    it("vitrine sem capa real: usa o social card do GitHub", () => {
        const { container } = montar(
            repo({
                name: "vitrine",
                openGraphImageUrl: "https://opengraph.githubassets.com/x",
                cover: null,
            }),
            { variant: "featured" },
        );
        const img = container.querySelector(".pcard__media img");
        expect(img).toHaveAttribute(
            "src",
            "https://opengraph.githubassets.com/x",
        );
        expect(img).toHaveAttribute("data-cover", "social");
    });

    it("capa real que falha ao carregar cai na composta", () => {
        const { container } = montar(
            repo({
                name: "quebrada",
                cover: { kind: "custom", url: "https://x.invalid/a.png" },
            }),
        );
        fireEvent.error(
            container.querySelector(".pcard__media img") as Element,
        );
        expect(container.querySelector(".pcover")).not.toBeNull();
    });

    it("título com nome de exibição abre o modal do projeto", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(fetchPorOp({ project: repo({ name: "web-chat" }) })),
        );
        montar(repo({ name: "web-chat" }));
        const titulo = screen.getByRole("button", { name: "Web Chat" });
        expect(titulo).toHaveAttribute("aria-haspopup", "dialog");
        expect(screen.queryByRole("link", { name: "Web Chat" })).toBeNull();
        fireEvent.click(titulo);
        expect(
            await screen.findByRole("dialog", { name: "Web Chat" }),
        ).toBeInTheDocument();
    });

    it('selo Fixado só quando fixado; nada de "Aplicação disponível"', () => {
        montar(repo({ name: "a", homepageUrl: "https://a.dev" }), {
            pinned: true,
        });
        expect(screen.getByText("Fixado")).toBeInTheDocument();
        expect(screen.queryByText(/Aplicação disponível/)).toBeNull();
        cleanup();
        montar(repo({ name: "b" }));
        expect(screen.queryByText("Fixado")).toBeNull();
    });

    it("ações: Acessar projeto só com aplicação publicada; Acessar repositório sempre", () => {
        montar(repo({ name: "a", homepageUrl: "https://a.dev" }));
        const app = screen.getByRole("link", {
            name: "Acessar projeto: A (abre em nova aba)",
        });
        expect(app).toHaveAttribute("href", "https://a.dev");
        expect(app).toHaveAttribute("target", "_blank");
        expect(app).toHaveAttribute("rel", "noopener noreferrer");
        expect(
            screen.getByRole("link", {
                name: "Acessar repositório: A (abre em nova aba)",
            }),
        ).toHaveAttribute("href", "https://github.com/https-shini/a");
        cleanup();
        montar(repo({ name: "b" }));
        expect(
            screen.queryByRole("link", { name: /^Acessar projeto/ }),
        ).toBeNull();
        expect(
            screen.getByRole("link", { name: /^Acessar repositório: B/ }),
        ).toBeInTheDocument();
    });

    it("tecnologias: ícone oficial quando existe, genérico quando não, e +N", () => {
        const { container } = montar(
            repo({
                name: "stack",
                languages: [
                    { name: "JavaScript", color: "#f1e05a", size: 50 },
                    { name: "HTML", color: "#e34c26", size: 30 },
                    { name: "Elixir", color: "#6e4a7e", size: 20 },
                ],
                topics: ["react", "styled-components", "vite", "backend"],
            }),
        );
        const lista = screen.getByRole("list", { name: "Tecnologias" });
        const itens = within(lista).getAllByRole("listitem");
        expect(itens.map((li) => li.textContent)).toEqual([
            "JavaScript",
            "HTML",
            "Elixir",
            expect.stringMatching(/^\+3/),
        ]);
        /* Oficial → <img> do Skill Icons; fora do catálogo → genérico. */
        expect(itens[0].querySelector("img")).not.toBeNull();
        expect(itens[2].querySelector(".tech__generic")).not.toBeNull();
        expect(container.textContent).toContain("Mais 3 tecnologias");
    });

    it("documentação do projeto abre o modal (sem link para a página interna)", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(
                fetchPorOp({
                    project: repo({
                        name: "doc",
                        homepageUrl: "https://doc.dev",
                    }),
                    readme: { html: README },
                }),
            ),
        );
        montar(repo({ name: "doc", homepageUrl: "https://doc.dev" }));
        fireEvent.click(
            screen.getByRole("button", {
                name: "Documentação do projeto: Doc",
            }),
        );
        const dialogo = await screen.findByRole("dialog", { name: "Doc" });
        expect(
            await within(dialogo).findByText("Painel de finanças pessoais."),
        ).toBeInTheDocument();
        expect(
            within(dialogo).getByText("Exportação em PDF"),
        ).toBeInTheDocument();
        const tecnologias = within(dialogo).getByRole("list", {
            name: "Tecnologias",
        });
        expect(tecnologias).toHaveTextContent("React");
        expect(tecnologias).toHaveTextContent("Styled Components");
        expect(
            within(dialogo).getByRole("img", { name: "Tela inicial" }),
        ).toHaveAttribute(
            "src",
            "https://raw.githubusercontent.com/a/doc/main/1.png",
        );
        expect(within(dialogo).getByText("Imagem 1 de 2")).toBeInTheDocument();
        fireEvent.click(
            within(dialogo).getByRole("button", { name: "Próxima imagem" }),
        );
        expect(within(dialogo).getByText("Imagem 2 de 2")).toBeInTheDocument();
        expect(
            within(dialogo).queryByRole("link", { name: /página/i }),
        ).toBeNull();
        expect(
            within(dialogo).getByRole("link", {
                name: /^Acessar projeto: Doc/,
            }),
        ).toHaveAttribute("href", "https://doc.dev");
        expect(
            within(dialogo).getByRole("link", {
                name: /^Acessar repositório: Doc/,
            }),
        ).toBeInTheDocument();
        fireEvent.keyDown(document, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("modal sem detalhe disponível ainda mostra o que o cartão sabia", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("rede"))),
        );
        montar(repo({ name: "offline", description: "Descrição curta" }));
        fireEvent.click(screen.getByRole("button", { name: "Offline" }));
        const dialogo = await screen.findByRole("dialog", { name: "Offline" });
        expect(
            within(dialogo).getByText("Descrição curta"),
        ).toBeInTheDocument();
        expect(
            await within(dialogo).findByText(/Não foi possível carregar/),
        ).toBeInTheDocument();
    });
});

describe("RepoThumb (vitrine da home)", () => {
    it("mantém o social card do GitHub por padrão", () => {
        const { container } = render(
            <RepoThumb
                repo={repo({
                    openGraphImageUrl: "https://opengraph.githubassets.com/x",
                })}
            />,
        );
        expect(container.querySelector("img")).toHaveAttribute(
            "src",
            "https://opengraph.githubassets.com/x",
        );
    });
});
