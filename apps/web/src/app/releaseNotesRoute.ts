import { ROUTES } from "@/shared/config/constants";
import { RELEASE_NOTES_PAGE_SEGMENT } from "@/shared/config/routes";

/* ─────────────────────────────────────────────────────────
   releaseNotesRoute.ts — o casamento de `/release-notes/*`
   ─────────────────────────────────────────────────────────
   Mora em módulo próprio, e não em `routes.tsx`, por um motivo
   mecânico: `routes.tsx` exporta um componente, e um arquivo que
   exporta componente MAIS função perde o Fast Refresh inteiro —
   é o que a regra `react-refresh/only-export-components` avisa.

   Aqui não há React nenhum. É uma função de string, testada em
   `routes.test.ts`, e o `routes.tsx` a consome como consome
   qualquer outro utilitário.
───────────────────────────────────────────────────────── */

/** O que vem depois de `/release-notes`, quando vem alguma coisa. */
export type ReleaseNotesMatch =
    { kind: "index"; page: number } | { kind: "entry"; version: string } | null;

/**
 * Interpreta o segmento sob `/release-notes`.
 *
 * · `/release-notes`            → índice, página 1
 * · `/release-notes/page/2`     → índice, página 2
 * · `/release-notes/v2.0.0`     → a versão 2.0.0
 *
 * O segmento `page` nunca colide com uma versão, porque toda versão é
 * prefixada por `v` — daí a desambiguação ser só uma comparação.
 * Página inválida (`page/abc`, `page/0`) volta para a primeira, em vez
 * de cair na home: o usuário pediu o índice.
 */
export function matchReleaseNotes(path: string): ReleaseNotesMatch {
    if (path === ROUTES.RELEASE_NOTES) return { kind: "index", page: 1 };
    if (!path.startsWith(`${ROUTES.RELEASE_NOTES}/`)) return null;

    const rest = path.slice(ROUTES.RELEASE_NOTES.length + 1);
    const segments = rest.split("/");

    if (segments[0] === RELEASE_NOTES_PAGE_SEGMENT) {
        const page = Number(segments[1]);
        return {
            kind: "index",
            page: Number.isInteger(page) && page > 0 ? page : 1,
        };
    }

    /* Uma versão e nada mais: `/release-notes/v2.0.0/qualquer-coisa` não
       é rota nossa. */
    if (segments.length > 1) return null;

    const version = decodeURIComponent(segments[0] ?? "").replace(/^v/i, "");
    return version ? { kind: "entry", version } : null;
}
