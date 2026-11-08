import { describe, it, expect } from "vitest";
import {
    DEFAULT_CATALOG,
    activeFilterCount,
    buildFacets,
    displayName,
    fromSearch,
    matchesQuery,
    pageList,
    popularityScore,
    runCatalog,
    toSearch,
    type CatalogState,
} from "./catalog";
import { repo } from "@/test/repoFixture";

const AGORA = Date.parse("2026-11-06T12:00:00Z");
const s = (over: Partial<CatalogState> = {}): CatalogState => ({
    ...DEFAULT_CATALOG,
    ...over,
});

const ACERVO = [
    repo({
        name: "financas-reactjs",
        description: "Controle de finanças pessoais",
        createdAt: "2026-02-08T00:00:00Z",
        pushedAt: "2026-02-21T00:00:00Z",
        updatedAt: "2026-02-21T00:00:00Z",
        primaryLanguage: { name: "JavaScript", color: null },
        languages: [
            { name: "JavaScript", color: null, size: 9 },
            { name: "HTML", color: null, size: 1 },
        ],
        homepageUrl: "https://financas.example",
    }),
    repo({
        name: "AuthService",
        description: "Autenticação com JWT",
        createdAt: "2026-02-19T00:00:00Z",
        pushedAt: "2026-02-21T00:00:00Z",
        updatedAt: "2026-02-21T00:00:00Z",
        topics: ["fastapi", "jwt"],
        primaryLanguage: { name: "HTML", color: null },
        languages: [
            { name: "HTML", color: null, size: 6 },
            { name: "Python", color: null, size: 1 },
        ],
        licenseName: null,
        hasPages: true,
    }),
    repo({
        name: "NewPortfolio",
        createdAt: "2026-03-29T00:00:00Z",
        pushedAt: "2026-11-06T00:00:00Z",
        updatedAt: "2026-10-29T00:00:00Z",
        stargazerCount: 1,
        watcherCount: 2,
        hasDocs: true,
    }),
    repo({
        name: "antigo",
        createdAt: "2022-04-29T00:00:00Z",
        pushedAt: "2022-05-01T00:00:00Z",
        updatedAt: "2022-05-01T00:00:00Z",
        isArchived: true,
    }),
    repo({
        name: "um-fork",
        createdAt: "2025-01-01T00:00:00Z",
        isFork: true,
        forkCount: 3,
    }),
];

const nomes = (st: CatalogState) =>
    runCatalog(ACERVO, st, AGORA).items.map((r) => r.name);

describe("busca", () => {
    it("acha por nome de exibição, descrição sem acento, linguagem e tópico", () => {
        expect(matchesQuery(ACERVO[0]!, "Financas")).toBe(true);
        expect(matchesQuery(ACERVO[0]!, "financas pessoais")).toBe(true);
        expect(matchesQuery(ACERVO[1]!, "python")).toBe(true);
        expect(matchesQuery(ACERVO[1]!, "FASTAPI")).toBe(true);
        expect(matchesQuery(ACERVO[2]!, "new portfolio")).toBe(true);
    });
    it("todos os termos precisam aparecer", () => {
        expect(matchesQuery(ACERVO[1]!, "jwt react")).toBe(false);
    });
    it("ignora espaço, hífen e sublinhado entre as palavras", () => {
        expect(matchesQuery(ACERVO[2]!, "newportfolio")).toBe(true);
        expect(matchesQuery(ACERVO[2]!, "new-portfolio")).toBe(true);
        expect(matchesQuery(ACERVO[0]!, "financasreactjs")).toBe(true);
        expect(matchesQuery(ACERVO[2]!, "newportfolioxyz")).toBe(false);
    });
    it("displayName separa hífen e camelCase", () => {
        expect(displayName("financas-reactjs")).toBe("Financas Reactjs");
        expect(displayName("NewPortfolio")).toBe("New Portfolio");
        expect(displayName("Atletismo_Java")).toBe("Atletismo Java");
    });
});

describe("ordenação", () => {
    it("padrão: mais recentes por CRIAÇÃO, sem arquivados e forks", () => {
        expect(nomes(s())).toEqual([
            "NewPortfolio",
            "AuthService",
            "financas-reactjs",
        ]);
    });
    it("última atualização usa o push", () => {
        expect(nomes(s({ sort: "updated" }))[0]).toBe("NewPortfolio");
    });
    it("estrelas, forks, populares e alfabética", () => {
        expect(nomes(s({ sort: "stars" }))[0]).toBe("NewPortfolio");
        expect(nomes(s({ sort: "forks", includeForks: true }))[0]).toBe(
            "um-fork",
        );
        expect(nomes(s({ sort: "name" }))).toEqual([
            "AuthService",
            "financas-reactjs",
            "NewPortfolio",
        ]);
        expect(popularityScore(ACERVO[2]!)).toBe(4);
    });
});

describe("filtros combinados", () => {
    it("dentro da faceta é OU; entre facetas é E", () => {
        expect(nomes(s({ languages: ["Python", "JavaScript"] }))).toEqual([
            "AuthService",
            "financas-reactjs",
        ]);
        expect(
            nomes(
                s({ languages: ["Python", "JavaScript"], features: ["demo"] }),
            ),
        ).toEqual(["financas-reactjs"]);
    });
    it("linguagem considera todas as linguagens do repositório, não só a principal", () => {
        expect(nomes(s({ languages: ["Python"] }))).toEqual(["AuthService"]);
    });
    it("atividade, ano de criação, popularidade e características", () => {
        expect(nomes(s({ updatedWithin: 30 }))).toEqual(["NewPortfolio"]);
        expect(nomes(s({ createdYears: [2026], status: "all" }))).toHaveLength(
            3,
        );
        expect(nomes(s({ popularity: ["watchers"] }))).toEqual([
            "NewPortfolio",
        ]);
        expect(nomes(s({ features: ["license"] }))).not.toContain(
            "AuthService",
        );
        expect(nomes(s({ features: ["docs", "pages"] }))).toEqual([]);
    });
    it("status e forks", () => {
        expect(nomes(s({ status: "archived" }))).toEqual(["antigo"]);
        expect(nomes(s({ status: "all", includeForks: true }))).toHaveLength(5);
    });
    it("característica não medida (null) não passa no filtro", () => {
        const semMedida = repo({ name: "rest", hasReadme: null });
        expect(
            runCatalog([semMedida], s({ features: ["readme"] }), AGORA).total,
        ).toBe(0);
    });
});

describe("facetas", () => {
    it("contador ignora a própria faceta e respeita as outras", () => {
        const f = buildFacets(ACERVO, s({ features: ["demo"] }), AGORA);
        const js = f.languages.find((o) => o.value === "JavaScript")!;
        const py = f.languages.find((o) => o.value === "Python")!;
        expect(js.count).toBe(1);
        expect(py.count).toBe(0);
        const demo = f.features.find((o) => o.value === "demo")!;
        expect(demo).toMatchObject({ active: true, count: 1 });
    });
    it("opção sem nenhum repositório no acervo não aparece", () => {
        const f = buildFacets(ACERVO.slice(0, 2), s(), AGORA);
        expect(f.popularity).toEqual([]);
        expect(f.features.map((o) => o.value)).not.toContain("docs");
    });
    it("tópicos só aparecem se existirem", () => {
        expect(
            buildFacets(ACERVO, s(), AGORA)
                .topics.map((o) => o.value)
                .sort(),
        ).toEqual(["fastapi", "jwt"]);
        expect(buildFacets([ACERVO[0]!], s(), AGORA).topics).toEqual([]);
    });
    it("anos em ordem decrescente", () => {
        expect(
            buildFacets(ACERVO, s(), AGORA).createdYears.map((o) => o.value),
        ).toEqual([2026, 2025, 2022]);
    });
});

describe("paginação", () => {
    const muitos = Array.from({ length: 30 }, (_, i) =>
        repo({
            name: `r${i}`,
            createdAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
        }),
    );
    it("9 por página (3 × 3), com intervalo e página fora do limite corrigida", () => {
        const r = runCatalog(muitos, s({ page: 4 }), AGORA);
        expect(r).toMatchObject({
            total: 30,
            pageCount: 4,
            page: 4,
            from: 28,
            to: 30,
        });
        expect(runCatalog(muitos, s({ page: 99 }), AGORA).page).toBe(4);
    });
    it("3 primeiras e 3 últimas sempre; o meio vira reticências", () => {
        expect(pageList(1, 3)).toEqual([1, 2, 3]);
        expect(pageList(1, 6)).toEqual([1, 2, 3, 4, 5, 6]);
        /* lacuna de uma página mostra o número */
        expect(pageList(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(pageList(1, 8)).toEqual([1, 2, 3, null, 6, 7, 8]);
        expect(pageList(8, 8)).toEqual([1, 2, 3, null, 6, 7, 8]);
        expect(pageList(1, 10)).toEqual([1, 2, 3, null, 8, 9, 10]);
        /* a atual no meio aparece entre reticências */
        expect(pageList(6, 12)).toEqual([1, 2, 3, null, 6, null, 10, 11, 12]);
        expect(pageList(5, 10)).toEqual([1, 2, 3, 4, 5, null, 8, 9, 10]);
        expect(pageList(4, 10)).toEqual([1, 2, 3, 4, null, 8, 9, 10]);
        expect(pageList(5, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});

describe("URL", () => {
    it("ida e volta preservam os critérios e o idioma do site", () => {
        const estado = s({
            query: "jwt",
            languages: ["Python", "HTML"],
            updatedWithin: 90,
            createdYears: [2026],
            popularity: ["stars"],
            features: ["demo", "pages"],
            status: "all",
            includeForks: true,
            sort: "stars",
            page: 2,
        });
        const url = toSearch(estado, "?lang=en");
        expect(url).toContain("lang=en");
        expect(url).not.toMatch(/[?&]lang=Python/);
        expect(fromSearch(url)).toEqual(estado);
    });
    it("visão padrão não suja a URL", () => {
        expect(toSearch(DEFAULT_CATALOG, "")).toBe("");
        expect(toSearch(DEFAULT_CATALOG, "?lang=en")).toBe("?lang=en");
    });
    it("valores inválidos voltam ao padrão", () => {
        expect(
            fromSearch(
                "?ordem=hack&status=x&atualizado=7&pagina=-3&criado=1999,abc&pop=evil",
            ),
        ).toEqual(DEFAULT_CATALOG);
    });
    it("contagem de filtros ativos", () => {
        expect(activeFilterCount(DEFAULT_CATALOG)).toBe(0);
        expect(
            activeFilterCount(s({ languages: ["a", "b"], status: "all" })),
        ).toBe(3);
    });
});

describe("catálogo — só fixados", () => {
    it("pinnedOnly filtra pelo conjunto de fixados e vai/volta da URL", () => {
        const repos = [
            repo({ name: "a" }),
            repo({ name: "b" }),
            repo({ name: "c" }),
        ];
        const fixados = new Set(["b"]);
        const s = { ...DEFAULT_CATALOG, pinnedOnly: true };
        expect(
            runCatalog(repos, s, undefined, fixados).items.map((r) => r.name),
        ).toEqual(["b"]);
        expect(activeFilterCount(s)).toBe(1);
        const url = toSearch(s, "?lang=en");
        expect(url).toContain("fixados=1");
        expect(url).toContain("lang=en");
        expect(fromSearch(url).pinnedOnly).toBe(true);
    });
});
