import { describe, it, expect } from "vitest";
import {
    availableLanguages,
    filterAndSort,
    hasActiveFilters,
    recentRepos,
    repoStats,
    siblingsOf,
} from "./selectors";
import { DEFAULT_FILTERS } from "./types";
import { repo } from "@/test/repoFixture";

const AGORA = Date.parse("2026-11-06T12:00:00Z");

describe("filterAndSort", () => {
    const lista = [
        repo({
            name: "antigo",
            pushedAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            stargazerCount: 9,
        }),
        repo({ name: "novo", pushedAt: "2026-10-01T00:00:00Z" }),
        repo({ name: "fork", isFork: true, pushedAt: "2026-11-01T00:00:00Z" }),
        repo({ name: "arquivado", isArchived: true }),
        repo({
            name: "python-api",
            primaryLanguage: { name: "Python", color: "#3572A5" },
            topics: ["fastapi"],
        }),
    ];

    it("visão padrão: ordem alfabética, sem forks nem arquivados", () => {
        expect(
            filterAndSort(lista, DEFAULT_FILTERS).map((r) => r.name),
        ).toEqual(["antigo", "novo", "python-api"]);
    });

    it("por atualização: mais recentes primeiro", () => {
        expect(
            filterAndSort(lista, { ...DEFAULT_FILTERS, sort: "updated" }).map(
                (r) => r.name,
            ),
        ).toEqual(["novo", "python-api", "antigo"]);
    });

    it("busca por nome, descrição e tópico, sem diferenciar caixa", () => {
        const f = { ...DEFAULT_FILTERS, search: "FASTAPI" };
        expect(filterAndSort(lista, f).map((r) => r.name)).toEqual([
            "python-api",
        ]);
    });

    it("filtra por linguagem primária", () => {
        const f = { ...DEFAULT_FILTERS, language: "Python" };
        expect(filterAndSort(lista, f).map((r) => r.name)).toEqual([
            "python-api",
        ]);
    });

    it("inclui forks e arquivados quando pedido", () => {
        const f = { ...DEFAULT_FILTERS, showForks: true, showArchived: true };
        expect(filterAndSort(lista, f)).toHaveLength(5);
    });

    it("ordena por estrelas com desempate por atividade", () => {
        const f = { ...DEFAULT_FILTERS, sort: "stars" as const };
        expect(filterAndSort(lista, f)[0]?.name).toBe("antigo");
    });

    it("não muta a lista de entrada", () => {
        const copia = [...lista];
        filterAndSort(lista, { ...DEFAULT_FILTERS, sort: "name" });
        expect(lista).toEqual(copia);
    });
});

describe("recentRepos", () => {
    it("devolve os N mais recentes, sem forks", () => {
        const lista = Array.from({ length: 10 }, (_, i) =>
            repo({
                name: `r${i}`,
                pushedAt: `2026-0${(i % 9) + 1}-01T00:00:00Z`,
            }),
        );
        lista.push(
            repo({
                name: "fork",
                isFork: true,
                pushedAt: "2026-12-01T00:00:00Z",
            }),
        );
        const r = recentRepos(lista, 3);
        expect(r.map((x) => x.name)).toEqual(["r8", "r7", "r6"]);
    });
});

describe("repoStats", () => {
    it("calcula tudo da mesma lista — repos inclui forks e arquivados", () => {
        const lista = [
            repo({
                name: "a",
                stargazerCount: 3,
                pushedAt: "2026-10-20T00:00:00Z",
            }),
            repo({
                name: "b",
                stargazerCount: 2,
                isFork: true,
                primaryLanguage: { name: "Python", color: null },
                languages: [
                    { name: "Python", color: null, size: 5 },
                    { name: "Shell", color: null, size: 1 },
                ],
                pushedAt: "2025-01-01T00:00:00Z",
            }),
            repo({ name: "c", isArchived: true, pushedAt: null }),
        ];
        expect(repoStats(lista, 12, AGORA)).toEqual({
            repos: 3,
            stars: 5,
            followers: 12,
            languages: 3,
            active: 1,
        });
    });

    it("seguidores ausentes ficam null, não zero", () => {
        expect(repoStats([], null, AGORA).followers).toBeNull();
    });
});

describe("demais seletores", () => {
    it("availableLanguages: únicas e em ordem alfabética", () => {
        const lista = [
            repo({ primaryLanguage: { name: "TypeScript", color: null } }),
            repo({ primaryLanguage: { name: "CSS", color: null } }),
            repo({ primaryLanguage: { name: "TypeScript", color: null } }),
            repo({ primaryLanguage: null }),
        ];
        expect(availableLanguages(lista)).toEqual(["CSS", "TypeScript"]);
    });

    it("hasActiveFilters ignora espaços na busca", () => {
        expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
        expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: "  " })).toBe(
            false,
        );
        expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: "updated" })).toBe(
            true,
        );
    });

    it("siblingsOf segue a ordem padrão (alfabética) e inclui forks", () => {
        const lista = [
            repo({ name: "a", pushedAt: "2026-03-01T00:00:00Z" }),
            repo({ name: "b", pushedAt: "2026-02-01T00:00:00Z", isFork: true }),
            repo({ name: "c", pushedAt: "2026-01-01T00:00:00Z" }),
        ];
        const s = siblingsOf(lista, "b");
        expect(s.previous?.name).toBe("a");
        expect(s.next?.name).toBe("c");
        expect(siblingsOf(lista, "nao-existe")).toEqual({
            previous: null,
            next: null,
        });
    });
});
