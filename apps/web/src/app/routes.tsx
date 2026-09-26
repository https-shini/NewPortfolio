import React, { Suspense, lazy } from "react";
import { useRoute } from "@/shared/hooks/useRoute";
import { ROUTES } from "@/shared/config/constants";
import { matchReleaseNotes } from "@/app/releaseNotesRoute";
import { AmbientBackground } from "@/shared/ui/AmbientBackground/AmbientBackground";

/**
 * Routes — mapeia pathname → página.
 *
 * As quatro entram por `lazy`, como já se faz com os modais. Isso não
 * significa uma ida à rede a mais: cada rota é servida por um documento
 * próprio cuja entrada importa a sua página de forma estática (ver
 * `src/entradas/comum.tsx`), então o módulo já está no registro quando o
 * `lazy` o pede, e o pedaço e a folha da rota vêm ligados no HTML.
 *
 * Para adicionar uma página: crie-a em `pages/`, registre o pathname em
 * ROUTES (shared/config/routes.ts), acrescente um caso aqui, uma entrada
 * em `src/entradas/`, a rota em `ROTAS_HTML` (vite.config.ts) e o rewrite
 * correspondente no vercel.json da raiz.
 */
const HomePage = lazy(() =>
    import("@/pages/Home").then((m) => ({ default: m.HomePage })),
);

const LinksPage = lazy(() =>
    import("@/pages/Links").then((m) => ({ default: m.LinksPage })),
);

const ReleaseNotesPage = lazy(() =>
    import("@/pages/ReleaseNotes").then((m) => ({
        default: m.ReleaseNotesPage,
    })),
);

const ContactPage = lazy(() =>
    import("@/pages/Contact").then((m) => ({ default: m.ContactPage })),
);

const ReleaseNotePage = lazy(() =>
    import("@/pages/ReleaseNote").then((m) => ({
        default: m.ReleaseNotePage,
    })),
);

export const Routes: React.FC = () => {
    const { path } = useRoute();

    const ehLinks = path === ROUTES.LINKS;
    const ehContato = path === ROUTES.CONTACT;
    const releaseNotes = ehLinks || ehContato ? null : matchReleaseNotes(path);

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
            ) : ehContato ? (
                <Suspense fallback={null}>
                    <ContactPage />
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
                <Suspense fallback={null}>
                    <HomePage />
                </Suspense>
            )}
        </>
    );
};
