import { describe, it, expect } from "vitest";
import {
    RELEASE_NOTES_PAGE_SIZE,
    releaseNotesPagePath,
    releaseNotesTotalPages,
} from "./routes";

/* A regra que estas asserções guardam: o índice das notas de versão mostra a
   mais recente no topo, fora da paginação, e pagina só o histórico abaixo
   dela. A conta viveu duplicada — o widget sobre o histórico, o gerador de
   sitemap sobre o total — e as duas divergiam em silêncio. */

describe("releaseNotesTotalPages", () => {
    it("um histórico que cabe numa página dá uma página", () => {
        expect(releaseNotesTotalPages(RELEASE_NOTES_PAGE_SIZE)).toBe(1);
    });

    it("passar de uma página abre a seguinte", () => {
        expect(releaseNotesTotalPages(RELEASE_NOTES_PAGE_SIZE + 1)).toBe(2);
    });

    /* O caso exato do defeito: com PAGE_SIZE + 1 VERSÕES o histórico tem
       PAGE_SIZE entradas e cabe numa página. A conta antiga do sitemap,
       feita sobre o total, dizia 2 e anunciava /release-notes/page/2 — que
       o widget devolve como página 1, conteúdo duplicado no índice. */
    it("a mais recente não empurra o histórico para uma página nova", () => {
        const versoes = RELEASE_NOTES_PAGE_SIZE + 1;
        expect(releaseNotesTotalPages(versoes - 1)).toBe(1);
    });

    it("nunca devolve zero — o índice sempre tem uma página", () => {
        expect(releaseNotesTotalPages(0)).toBe(1);
        expect(releaseNotesTotalPages(-3)).toBe(1);
    });

    /* Cada página anunciada precisa ter conteúdo próprio. Se a última
       página começasse além do fim do histórico, ela renderizaria vazia — e
       é assim que uma URL de sitemap vira conteúdo duplicado. */
    it("toda página anunciada tem pelo menos uma entrada", () => {
        for (let historico = 0; historico <= 20; historico++) {
            const paginas = releaseNotesTotalPages(historico);
            const inicioDaUltima = (paginas - 1) * RELEASE_NOTES_PAGE_SIZE;
            if (historico === 0) continue;
            expect(inicioDaUltima).toBeLessThan(historico);
        }
    });
});

describe("releaseNotesPagePath", () => {
    it("a página 1 é o próprio índice, sem sufixo", () => {
        expect(releaseNotesPagePath(1)).toBe("/release-notes");
        expect(releaseNotesPagePath(0)).toBe("/release-notes");
    });

    it("as demais ganham o segmento numerado", () => {
        expect(releaseNotesPagePath(2)).toBe("/release-notes/page/2");
    });
});
