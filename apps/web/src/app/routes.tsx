import React, { Suspense, lazy } from "react";
import { HomePage } from "@/pages/Home";
import { useRoute } from "@/shared/hooks/useRoute";
import { ROUTES } from "@/shared/config/constants";
import { RELEASE_NOTES_PAGE_SEGMENT } from "@/shared/config/routes";
import { AmbientBackground } from "@/shared/ui/AmbientBackground/AmbientBackground";

/**
 * Routes — mapeia pathname → página.
 *
 * A home é síncrona (destino da maioria das visitas e fallback de rota
 * desconhecida); páginas secundárias entram por lazy, como já se faz com os
 * modais. Para adicionar uma página: crie-a em `pages/`, registre o pathname
 * em ROUTES (shared/config/routes.ts), acrescente um caso aqui e o rewrite
 * correspondente no vercel.json da raiz.
 */
const LinksPage = lazy(() =>
    import("@/pages/Links").then((m) => ({ default: m.LinksPage })),
);

const ReleaseNotesPage = lazy(() =>
    import("@/pages/ReleaseNotes").then((m) => ({
        default: m.ReleaseNotesPage,
    })),
);

const ReleaseNotePage = lazy(() =>
    import("@/pages/ReleaseNote").then((m) => ({
        default: m.ReleaseNotePage,
    })),
);

const DownloadsPage = lazy(() =>
    import("@/pages/Downloads").then((m) => ({ default: m.DownloadsPage })),
);

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

export const Routes: React.FC = () => {
    const { path } = useRoute();

    const ehLinks = path === ROUTES.LINKS;
    const ehDownloads = path === ROUTES.DOWNLOADS;
    const releaseNotes =
        ehLinks || ehDownloads ? null : matchReleaseNotes(path);

    /* UMA instância para todas as rotas, montada aqui e não em cada
       página. É o que faz a atmosfera sobreviver à troca de rota: as
       partículas não reiniciam o ciclo a cada navegação.

       A /links trazia a sua própria, e o resultado era o oposto do que o
       comentário desta função prometia — sair do site para a /links, ou
       voltar, desmontava uma instância e montava outra, com o campo
       inteiro recomeçando do zero. A diferença entre as duas cabe na
       variante, que o CSS usa para adensar. */
    return (
        <>
            <AmbientBackground variant={ehLinks ? "links" : "site"} />
            {ehLinks ? (
                <Suspense fallback={null}>
                    <LinksPage />
                </Suspense>
            ) : ehDownloads ? (
                <Suspense fallback={null}>
                    <DownloadsPage />
                </Suspense>
            ) : releaseNotes ? (
                <Suspense fallback={null}>
                    {releaseNotes.kind === "index" ? (
                        <ReleaseNotesPage page={releaseNotes.page} />
                    ) : (
                        <ReleaseNotePage version={releaseNotes.version} />
                    )}
                </Suspense>
            ) : (
                /* Rota desconhecida cai na home — não há 404 própria. */
                <HomePage />
            )}
        </>
    );
};
