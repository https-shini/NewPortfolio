import React, { Suspense } from "react";
import { HomePage } from "@/pages/Home";
import { useRoute } from "@/shared/hooks/useRoute";
import { ROUTES } from "@/shared/config/constants";
import { matchReleaseNotes } from "./releaseNotesRoute";
import { matchProjects } from "./projectsRoute";
import { AmbientBackground } from "@/shared/ui/AmbientBackground/AmbientBackground";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary/ErrorBoundary";
import { RouteFallback } from "@/shared/ui/RouteFallback/RouteFallback";
import { lazyComRetry } from "./lazyComRetry";

/**
 * Routes — mapeia pathname → página.
 *
 * A home é síncrona (destino da maioria das visitas); páginas secundárias
 * e a página 404 entram por lazy, como já se faz com os
 * modais. Para adicionar uma página: crie-a em `pages/`, registre o pathname
 * em ROUTES (shared/config/routes.ts), acrescente um caso aqui e o rewrite
 * correspondente no vercel.json da raiz.
 */
const LinksPage = lazyComRetry(() =>
    import("@/pages/Links").then((m) => ({ default: m.LinksPage })),
);
const CodexPage = lazyComRetry(() =>
    import("@/pages/Codex").then((m) => ({ default: m.CodexPage })),
);

const ReleaseNotesPage = lazyComRetry(() =>
    import("@/pages/ReleaseNotes").then((m) => ({
        default: m.ReleaseNotesPage,
    })),
);

const ReleaseNotePage = lazyComRetry(() =>
    import("@/pages/ReleaseNote").then((m) => ({
        default: m.ReleaseNotePage,
    })),
);

const NotFoundPage = lazyComRetry(() =>
    import("@/pages/NotFound").then((m) => ({ default: m.NotFoundPage })),
);

const LinkedInNoticePage = lazyComRetry(() =>
    import("@/pages/LinkedInNotice").then((m) => ({
        default: m.LinkedInNoticePage,
    })),
);

const ProjectsPage = lazyComRetry(() =>
    import("@/pages/Projects").then((m) => ({ default: m.ProjectsPage })),
);

const ProjectPage = lazyComRetry(() =>
    import("@/pages/Project").then((m) => ({ default: m.ProjectPage })),
);

const ContactPage = lazyComRetry(() =>
    import("@/pages/Contact").then((m) => ({ default: m.ContactPage })),
);

export const Routes: React.FC = () => {
    const { path } = useRoute();

    const ehLinks = path === ROUTES.LINKS;
    const releaseNotes = ehLinks ? null : matchReleaseNotes(path);
    const projetos = ehLinks || releaseNotes ? null : matchProjects(path);

    let pagina: React.ReactNode;
    if (ehLinks) {
        pagina = <LinksPage />;
    } else if (releaseNotes) {
        pagina =
            releaseNotes.kind === "index" ? (
                <ReleaseNotesPage page={releaseNotes.page} />
            ) : (
                <ReleaseNotePage version={releaseNotes.version} />
            );
    } else if (projetos) {
        pagina =
            projetos.kind === "index" ? (
                <ProjectsPage />
            ) : (
                /* `key`: trocar de projeto remonta a página, e o estado
                   remoto nasce de novo em "carregando". */
                <ProjectPage key={projetos.name} name={projetos.name} />
            );
    } else if (
        path === ROUTES.CODEX ||
        path === "/projects/codex" ||
        path === "/projects/codex/index.html"
    ) {
        pagina = <CodexPage />;
    } else if (path === ROUTES.LINKEDIN_NOTICE) {
        pagina = <LinkedInNoticePage />;
    } else if (path === ROUTES.CONTACT) {
        pagina = <ContactPage />;
    } else if (path === ROUTES.HOME) {
        pagina = <HomePage />;
    } else {
        pagina = <NotFoundPage />;
    }

    /* UMA instância de AmbientBackground para todas as rotas, montada aqui
       e não em cada página: a atmosfera sobrevive à troca de rota, sem as
       partículas reiniciarem o ciclo a cada navegação. A diferença entre a
       /links e o resto cabe na variante, que o CSS usa para adensar.

       Um só Suspense e um só ErrorBoundary para todas as páginas — eram
       oito blocos `<Suspense fallback={null}>` repetidos. A `key` pelo
       caminho faz um erro numa rota não "grudar" ao navegar para outra. */
    return (
        <>
            <AmbientBackground variant={ehLinks ? "links" : "site"} />
            <ErrorBoundary key={path}>
                <Suspense fallback={<RouteFallback />}>{pagina}</Suspense>
            </ErrorBoundary>
        </>
    );
};
