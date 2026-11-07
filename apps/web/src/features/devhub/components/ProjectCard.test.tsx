import type React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { ProjectCard } from "./ProjectCard";
import { RepoThumb } from "./RepoThumb";
import { LANG_KEY } from "@/shared/config/constants";
import { repo } from "@/test/repoFixture";
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

    it("título com nome de exibição e link para a página do projeto", () => {
        montar(repo({ name: "web-chat" }));
        expect(screen.getByRole("link", { name: "Web Chat" })).toHaveAttribute(
            "href",
            "/projetos/web-chat",
        );
    });

    it("selo Fixado só quando fixado; Demo só quando há endereço", () => {
        montar(repo({ name: "a", homepageUrl: "https://a.dev" }), {
            pinned: true,
        });
        expect(screen.getByText("Fixado")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /^Ver demo: A/ }),
        ).toHaveAttribute("href", "https://a.dev");
        cleanup();
        montar(repo({ name: "b" }));
        expect(screen.queryByText("Fixado")).toBeNull();
        expect(
            screen.getByRole("link", { name: /Ver código: B/ }),
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
