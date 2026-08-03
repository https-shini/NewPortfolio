import React, { Suspense, lazy } from "react";
import { HomePage } from "@/pages/Home";
import { useRoute } from "@/shared/hooks/useRoute";
import { ROUTES } from "@/shared/config/constants";

/**
 * Routes — mapeia pathname → página.
 *
 * A home é síncrona (destino da maioria das visitas e fallback de rota
 * desconhecida); páginas secundárias entram por lazy, como já se faz com os
 * modais. Para adicionar uma página: crie-a em `pages/`, registre o pathname
 * em ROUTES (shared/config/constants.ts) e acrescente um caso aqui.
 */
const LinksPage = lazy(() =>
    import("@/pages/Links").then((m) => ({ default: m.LinksPage })),
);

export const Routes: React.FC = () => {
    const { path } = useRoute();

    if (path === ROUTES.LINKS) {
        return (
            <Suspense fallback={null}>
                <LinksPage />
            </Suspense>
        );
    }

    /* Rota desconhecida cai na home — o site não tem página 404 própria. */
    return <HomePage />;
};
