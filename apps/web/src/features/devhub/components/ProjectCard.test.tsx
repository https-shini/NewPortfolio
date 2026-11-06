import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { ProjectCard } from "./ProjectCard";
import { RepoThumb } from "./RepoThumb";
import { LANG_KEY } from "@/shared/config/constants";
import { repo } from "@/test/repoFixture";
import type { Repository } from "@/features/devhub/types";

const montar = (r: Repository) => {
    localStorage.setItem(LANG_KEY, "pt");
    return render(
        <Providers>
            <ProjectCard repo={r} />
        </Providers>,
    );
};

afterEach(cleanup);

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
        const img = container.querySelector(".devhub-card__thumb img");
        expect(img).toHaveAttribute(
            "src",
            "https://raw.githubusercontent.com/a/b/main/s.png",
        );
        expect(img).toHaveAttribute("data-cover", "readme");
        expect(container.querySelector(".pcover")).toBeNull();
    });

    it("sem capa real: capa composta, nunca o card automático do GitHub", () => {
        const { container } = montar(
            repo({
                name: "meu-projeto_legal",
                openGraphImageUrl: "https://opengraph.githubassets.com/x",
                cover: null,
            }),
        );
        expect(container.querySelector(".devhub-card__thumb img")).toBeNull();
        const capa = container.querySelector(".pcover");
        expect(capa).toHaveAttribute("aria-hidden", "true");
        expect(capa).toHaveTextContent("Meu Projeto Legal");
        expect(capa).toHaveTextContent("~/meu-projeto_legal");
    });

    it("capa real que falha ao carregar cai na composta", () => {
        const { container } = montar(
            repo({
                name: "quebrada",
                cover: { kind: "custom", url: "https://x.invalid/a.png" },
            }),
        );
        fireEvent.error(
            container.querySelector(".devhub-card__thumb img") as Element,
        );
        expect(container.querySelector(".pcover")).not.toBeNull();
    });

    it("selos só para o que existe; Pages some quando já há demo", () => {
        montar(
            repo({
                name: "sel",
                homepageUrl: "https://x.dev",
                hasPages: true,
                hasDocs: true,
            }),
        );
        const lista = screen.getByRole("list", { name: "Recursos do projeto" });
        expect(lista).toHaveTextContent("Demo online");
        expect(lista).toHaveTextContent("Documentação");
        expect(lista).not.toHaveTextContent("GitHub Pages");
        cleanup();
        montar(repo({ name: "nada" }));
        expect(
            screen.queryByRole("list", { name: "Recursos do projeto" }),
        ).toBeNull();
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
