import React, { Suspense, lazy } from "react";
import { HomePage } from "@/pages/Home";
import { useRoute } from "@/shared/hooks/useRoute";
import { ROUTES } from "@/shared/config/constants";
import { matchReleaseNotes } from "./releaseNotesRoute";
import { AmbientBackground } from "@/shared/ui/AmbientBackground/AmbientBackground";

/**
 * Routes — mapeia pathname → página.
 *
 * A home é síncrona (destino da maioria das visitas); páginas secundárias
 * e a página 404 entram por lazy, como já se faz com os
 * modais. Para adicionar uma página: crie-a em `pages/`, registre o pathname
 * em ROUTES (shared/config/routes.ts), acrescente um caso aqui e o rewrite
 * correspondente no vercel.json da raiz.
 */
const LinksPage = lazy(() =>
    import("@/pages/Links").then((m) => ({ default: m.LinksPage })),
);
const CodexPage = lazy(() =>
    import("@/pages/Codex").then((m) => ({ default: m.CodexPage })),
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

const NotFoundPage = lazy(() =>
    import("@/pages/NotFound").then((m) => ({ default: m.NotFoundPage })),
);

const LinkedInNoticePage = lazy(() =>
    import("@/pages/LinkedInNotice").then((m) => ({
        default: m.LinkedInNoticePage,
    })),
);

export const Routes: React.FC = () => {
    const { path } = useRoute();

    const ehLinks = path === ROUTES.LINKS;
    const releaseNotes = ehLinks ? null : matchReleaseNotes(path);

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
            ) : releaseNotes ? (
                <Suspense fallback={null}>
                    {releaseNotes.kind === "index" ? (
                        <ReleaseNotesPage page={releaseNotes.page} />
                    ) : (
                        <ReleaseNotePage version={releaseNotes.version} />
                    )}
                </Suspense>
            ) : path === ROUTES.CODEX ||
              path === "/projects/codex" ||
              path === "/projects/codex/index.html" ? (
                <Suspense fallback={null}>
                    <CodexPage />
                </Suspense>
            ) : path === ROUTES.LINKEDIN_NOTICE ? (
                <Suspense fallback={null}>
                    <LinkedInNoticePage />
                </Suspense>
            ) : path === ROUTES.HOME ? (
                <HomePage />
            ) : (
                <Suspense fallback={null}>
                    <NotFoundPage />
                </Suspense>
            )}
        </>
    );
};
