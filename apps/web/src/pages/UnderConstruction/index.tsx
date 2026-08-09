import React from "react";
import "./UnderConstruction.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { ROUTES } from "@/shared/config/routes";
import { PROFILE } from "@/shared/config/profile";
import { IconArrowLeft, IconPackage } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   UnderConstruction — a página provisória de /downloads
   ─────────────────────────────────────────────────────────
   Ela existe antes do conteúdo por um motivo prático: o QR
   code do rodapé aponta para este endereço, e um QR já
   compartilhado não pode esperar a página ficar pronta. Com
   a rota no ar desde já, o dia em que o conteúdo chegar não
   invalida nenhum código impresso ou enviado.

   Duas decisões que vêm daí:

   · `noindex, follow` — página provisória indexada é conteúdo
     raso apontando para o domínio, e o custo disso não fica
     contido nela. O `follow` é o outro lado: os buscadores
     seguem daqui para o que de fato tem conteúdo.
   · Ela não é um beco. Levar alguém a uma porta fechada e
     deixá-lo lá é o defeito clássico desse tipo de página, e
     por isso os dois atalhos abaixo do botão principal.
───────────────────────────────────────────────────────── */

export const UnderConstructionPage: React.FC = () => {
    const { lang, t } = useLang();
    const { navigate } = useRoute();
    useReducedMotion();

    useDocumentMeta({
        title: `${t("underConstruction.title")} — ${PROFILE.name}`,
        description: t("underConstruction.meta.description"),
        path: ROUTES.DOWNLOADS,
        robots: "noindex, follow",
    });

    /* Clique com modificador continua sendo do navegador: nova aba e menu
       de contexto seguem funcionando, como nos demais links de rota. */
    const irPara = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        navigate(to);
    };

    return (
        <>
            <a href="#main-content" className="skip-link">
                {lang === "pt"
                    ? "Ir para o conteúdo principal"
                    : "Skip to main content"}
            </a>

            <Header />

            <main id="main-content" className="soon">
                <div className="container">
                    <div className="soon__inner">
                        <span className="soon__mark" aria-hidden="true">
                            <IconPackage width={22} height={22} />
                        </span>

                        <h1 className="soon__title">
                            {t("underConstruction.title")}
                        </h1>

                        <p className="soon__lead">
                            {t("underConstruction.lead")}
                        </p>

                        <a
                            href={ROUTES.HOME}
                            className="btn btn--primary soon__cta"
                            onClick={(e) => irPara(e, ROUTES.HOME)}
                        >
                            <IconArrowLeft
                                width={16}
                                height={16}
                                aria-hidden="true"
                            />
                            <span>{t("underConstruction.back")}</span>
                        </a>

                        <nav
                            className="soon__aside"
                            aria-label={
                                lang === "pt"
                                    ? "Outras páginas do site"
                                    : "Other pages on this site"
                            }
                        >
                            <a
                                href={ROUTES.LINKS}
                                className="soon__aside-link"
                                onClick={(e) => irPara(e, ROUTES.LINKS)}
                            >
                                {t("nav.links")}
                            </a>
                            <span aria-hidden="true">·</span>
                            <a
                                href={ROUTES.RELEASE_NOTES}
                                className="soon__aside-link"
                                onClick={(e) => irPara(e, ROUTES.RELEASE_NOTES)}
                            >
                                {t("releaseNotes.title")}
                            </a>
                        </nav>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default UnderConstructionPage;
