import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { Work } from "./Work";
import { GITHUB_URL, LANG_KEY } from "@/shared/config/constants";
import { ROUTES } from "@/shared/config/routes";
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

describe("Work — carrossel dos fixados no GitHub", () => {
    it("todos os fixados no carrossel, na ordem do GitHub, numerados", async () => {
        montar(PINNED);
        const lista = await cards();
        expect(
            lista.map((c) => within(c).getByRole("heading").textContent),
        ).toEqual([
            "Auth Service",
            "Web Chat",
            "New Portfolio",
            "Portal Receitas",
            "Todolist Fullstack",
        ]);
        expect(lista[0]).toHaveTextContent("01 / Projeto");
        expect(lista[4]).toHaveTextContent("05 / Projeto");
        const slides = within(secao()).getAllByRole("group", { name: /de 5$/ });
        expect(slides).toHaveLength(5);
        expect(slides[3]).toHaveAttribute("aria-roledescription", "projeto");
    });

    it("barra: contagem real, intervalo visível e setas", async () => {
        montar(PINNED);
        await cards();
        const carrossel = within(secao()).getByRole("region", {
            name: "Projetos em destaque",
        });
        expect(carrossel).toHaveAttribute("aria-roledescription", "carrossel");
        expect(secao().querySelector(".work__count strong")).toHaveTextContent(
            "05",
        );
        expect(within(carrossel).getByText("01–03 de 05")).toBeInTheDocument();
        const ant = within(carrossel).getByRole("button", {
            name: "Projetos anteriores",
        });
        const prox = within(carrossel).getByRole("button", {
            name: "Próximos projetos",
        });
        expect(ant).toBeDisabled();
        fireEvent.click(prox);
        expect(within(carrossel).getByText("03–05 de 05")).toBeInTheDocument();
        expect(prox).toBeDisabled();
        expect(
            within(carrossel).getByText("Mostrando os projetos 3 a 5 de 5"),
        ).toBeInTheDocument();
    });

    it("dots: uma página por grupo de três, e o teclado navega", async () => {
        montar(PINNED);
        await cards();
        const carrossel = within(secao()).getByRole("region", {
            name: "Projetos em destaque",
        });
        const dots = within(carrossel).getAllByRole("button", {
            name: /Ir para a página/,
        });
        expect(dots).toHaveLength(2);
        expect(dots[0]).toHaveAttribute("aria-current", "true");
        fireEvent.click(dots[1]!);
        expect(dots[1]).toHaveAttribute("aria-current", "true");
        fireEvent.keyDown(carrossel.querySelector("a")!, { key: "ArrowLeft" });
        expect(dots[0]).toHaveAttribute("aria-current", "true");
    });

    it("ações: Acessar projeto (aplicação) e Acessar repositório (GitHub)", async () => {
        montar(PINNED);
        const [auth] = await cards();
        expect(
            within(auth!).getByRole("link", {
                name: "Acessar projeto: Auth Service (abre em nova aba)",
            }),
        ).toHaveAttribute("href", "https://auth.example");
        expect(
            within(auth!).getByRole("link", {
                name: "Acessar repositório: Auth Service (abre em nova aba)",
            }),
        ).toHaveAttribute("href", "https://github.com/https-shini/AuthService");
        expect(within(auth!).queryByText(/Aplicação disponível/)).toBeNull();
    });

    it("sem aplicação publicada: só Acessar repositório", async () => {
        montar(PINNED);
        const [, chat] = await cards();
        expect(
            within(chat!).queryByRole("link", { name: /^Acessar projeto/ }),
        ).toBeNull();
        expect(
            within(chat!).getByRole("link", {
                name: /^Acessar repositório: Web Chat/,
            }),
        ).toHaveAttribute("href", "https://github.com/https-shini/web-chat");
    });

    it("tecnologias: chips com o nome de cada linguagem", async () => {
        montar(PINNED);
        const lista = await cards();
        const stack = within(lista[2]!).getByRole("list", {
            name: "Tecnologias",
        });
        expect(
            within(stack)
                .getAllByRole("listitem")
                .map((li) => li.textContent),
        ).toEqual([
            "TypeScript",
            "CSS",
            "JavaScript",
            "HTML",
            "+1Mais 1 tecnologia",
        ]);
    });

    it("documentação do projeto: abre o modal, sem link para página interna", async () => {
        montar(PINNED);
        const [auth] = await cards();
        const docs = within(auth!).getByRole("button", {
            name: "Documentação do projeto: Auth Service",
        });
        expect(docs).toHaveAttribute("aria-haspopup", "dialog");
        expect(
            within(auth!).queryByRole("link", { name: /página do projeto/ }),
        ).toBeNull();
        fireEvent.click(docs);
        expect(
            await screen.findByRole("dialog", { name: "Auth Service" }),
        ).toBeInTheDocument();
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

    it("CTA final: explorar todos os projetos (catálogo) e perfil no GitHub", async () => {
        montar(PINNED);
        await cards();
        expect(
            within(secao()).getByRole("link", {
                name: /Explorar todos os projetos/,
            }),
        ).toHaveAttribute("href", ROUTES.PROJECTS);
        expect(
            within(secao()).getByRole("link", { name: /Perfil no GitHub/ }),
        ).toHaveAttribute("href", GITHUB_URL);
    });

    it("erro na API: aviso e o CTA do catálogo continua", async () => {
        montar({});
        expect(
            await screen.findByText(/não|couldn/i, {
                selector: ".work__state",
            }),
        ).toBeInTheDocument();
        expect(
            within(secao()).getByRole("link", {
                name: /Explorar todos os projetos/,
            }),
        ).toBeInTheDocument();
    });

    it("em inglês", async () => {
        montar(PINNED, "en");
        await screen.findByRole("heading", { level: 3, name: "Auth Service" });
        const sec = screen.getByRole("region", { name: "Projects" });
        expect(sec).toHaveTextContent("Featured projects");
        expect(sec).toHaveTextContent("Explore all projects");
    });
});
