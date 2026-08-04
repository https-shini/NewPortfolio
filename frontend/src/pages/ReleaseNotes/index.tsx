import React, { useEffect } from "react";
import "./ReleaseNotesPage.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { ReleaseNotes } from "@/widgets/ReleaseNotes/ReleaseNotes";
import { useLang } from "@/shared/hooks/useLang";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { ROUTES } from "@/shared/config/routes";
import { PROFILE } from "@/shared/config/profile";

/**
 * Rola até a versão indicada na âncora (`/release-notes#v2-0-0`) e abre
 * o painel dela, quando for um item do histórico.
 *
 * Dois detalhes decidem a implementação:
 *
 * · o conteúdo chega em dois momentos — camada local no primeiro render,
 *   releases do GitHub depois —, então o alvo é perseguido por um
 *   `MutationObserver` em vez de uma tentativa única;
 * · trocar só a âncora é navegação *no mesmo documento*: a página não
 *   remonta e um efeito de montagem não rodaria. Daí o `hashchange`,
 *   que cobre o link de âncora clicado já dentro da página.
 */
function usePermalink(): void {
    useEffect(() => {
        /* Uma tentativa por âncora — cada uma com o próprio observer,
           para que a anterior não continue viva disputando o scroll. */
        const run = (): (() => void) => {
            const target = window.location.hash.slice(1);
            if (!target) return () => {};

            let done = false;

            const tryScroll = () => {
                const el = document.getElementById(target);
                if (!el || done) return;
                done = true;

                /* Item do histórico: abre o painel antes de rolar. */
                const trigger = el.querySelector<HTMLButtonElement>(
                    'button[aria-expanded="false"]',
                );
                trigger?.click();

                el.scrollIntoView({ behavior: "smooth", block: "start" });
                observer.disconnect();
            };

            const observer = new MutationObserver(tryScroll);
            observer.observe(document.body, { childList: true, subtree: true });
            tryScroll();

            /* Rede lenta não deixa o observer vivo para sempre. */
            const timer = window.setTimeout(() => observer.disconnect(), 8000);

            return () => {
                observer.disconnect();
                window.clearTimeout(timer);
            };
        };

        let cleanup = run();

        const onHashChange = () => {
            cleanup();
            cleanup = run();
        };

        window.addEventListener("hashchange", onHashChange);

        return () => {
            window.removeEventListener("hashchange", onHashChange);
            cleanup();
        };
    }, []);
}

export const ReleaseNotesPage: React.FC = () => {
    const { lang, t } = useLang();
    useReducedMotion();
    usePermalink();

    useDocumentMeta({
        title: `${t("releaseNotes.title")} — ${PROFILE.name}`,
        description: t("releaseNotes.meta.description"),
        path: ROUTES.RELEASE_NOTES,
    });

    return (
        <>
            <a href="#main-content" className="skip-link">
                {lang === "pt"
                    ? "Ir para o conteúdo principal"
                    : "Skip to main content"}
            </a>

            <ScrollUtils
                label={lang === "pt" ? "Voltar ao topo" : "Back to top"}
            />

            <Header />
            <main id="main-content" className="release-page">
                <div className="container">
                    {/* Aqui a timeline é a manchete da página, não uma
                        seção dentro dela — daí o h1. */}
                    <ReleaseNotes headingLevel={1} />
                </div>
            </main>
            <Footer />

            <div
                id="aria-live-region"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
        </>
    );
};
