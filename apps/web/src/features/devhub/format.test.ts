import { describe, it, expect, vi, afterEach } from "vitest";
import {
    formatCount,
    formatDate,
    formatNumber,
    formatRelativeDate,
    languageShares,
} from "@/features/devhub/format";

afterEach(() => {
    vi.useRealTimers();
});

/** Fixa o relógio para que as datas relativas não dependam de quando o teste roda. */
function congelar(iso: string) {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
}

describe("formatRelativeDate", () => {
    it("traduz — era este o defeito: 'today' e '3d ago' apareciam em PT", () => {
        congelar("2026-06-10T12:00:00Z");

        const tresDiasAtras = "2026-06-07T12:00:00Z";
        expect(formatRelativeDate(tresDiasAtras, "pt")).toBe("há 3 dias");
        expect(formatRelativeDate(tresDiasAtras, "en")).toBe("3 days ago");
    });

    it("usa a forma natural para hoje e ontem", () => {
        congelar("2026-06-10T12:00:00Z");

        expect(formatRelativeDate("2026-06-10T09:00:00Z", "pt")).toBe("hoje");
        expect(formatRelativeDate("2026-06-09T09:00:00Z", "pt")).toBe("ontem");
        expect(formatRelativeDate("2026-06-09T09:00:00Z", "en")).toBe(
            "yesterday",
        );
    });

    it("sobe para meses e anos quando o número de dias deixa de informar", () => {
        congelar("2026-06-10T12:00:00Z");

        expect(formatRelativeDate("2026-04-10T12:00:00Z", "pt")).toMatch(
            /mes(es)?/,
        );
        expect(formatRelativeDate("2024-06-10T12:00:00Z", "pt")).toMatch(/ano/);
        expect(formatRelativeDate("2024-06-10T12:00:00Z", "en")).toMatch(
            /year/,
        );
    });

    it("devolve travessão para ausente ou inválido", () => {
        expect(formatRelativeDate(null, "pt")).toBe("—");
        expect(formatRelativeDate("não é data", "pt")).toBe("—");
    });
});

describe("formatDate", () => {
    it("formata no idioma pedido", () => {
        expect(formatDate("2026-02-18T00:00:00Z", "en")).toMatch(/Feb/);
        expect(formatDate("2026-02-18T00:00:00Z", "pt")).toMatch(/fev/);
    });

    it("não quebra em data inválida", () => {
        expect(formatDate("xx", "pt")).toBe("—");
    });
});

describe("formatNumber e formatCount", () => {
    it("formatNumber usa o separador do idioma", () => {
        expect(formatNumber(1234, "en")).toBe("1,234");
        /* pt-BR usa espaço estreito ou ponto conforme a plataforma —
           o que importa é não ser a vírgula do inglês. */
        expect(formatNumber(1234, "pt")).not.toBe("1,234");
    });

    it("formatCount compacta", () => {
        expect(formatCount(1200, "en")).toBe("1.2K");
    });
});

describe("languageShares", () => {
    it("converte bytes em porcentagem", () => {
        const out = languageShares([
            { name: "TypeScript", color: null, size: 750 },
            { name: "CSS", color: null, size: 250 },
        ]);
        expect(out.map((l) => l.pct)).toEqual([75, 25]);
    });

    it("ignora linguagens sem tamanho em vez de inventar proporção", () => {
        /* O REST de listagem só informa a linguagem primária, sem bytes.
           Mostrar 100% a partir disso sugeriria uma precisão inexistente. */
        expect(languageShares([{ name: "TypeScript", color: null }])).toEqual(
            [],
        );
    });

    it("lista vazia devolve lista vazia", () => {
        expect(languageShares([])).toEqual([]);
    });
});
