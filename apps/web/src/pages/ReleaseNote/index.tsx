import React, { useMemo } from "react";
import "@/widgets/ReleaseNotes/ReleaseNotes.css";
import "./ReleaseNotePage.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { ReleaseCard } from "@/widgets/ReleaseNotes/components/ReleaseCard";
import { ReleaseAside } from "@/widgets/ReleaseNotes/components/ReleaseAside";
import { SyncBadge } from "@/widgets/ReleaseNotes/components/SyncBadge";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReleaseNotes } from "@/shared/hooks/useReleaseNotes";
import { RELEASE_NOTES } from "@/shared/config/releaseNotes";
import { mergeReleaseNotes } from "@/shared/lib/mergeReleaseNotes";
import { ROUTES, releaseNotePath } from "@/shared/config/routes";
import { PROFILE } from "@/shared/config/profile";
import { IconArrowRight, IconChevronLeft } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   ReleaseNotePage — uma versão, um endereço
   ─────────────────────────────────────────────────────────
   Usa a mesma casca do resto do site: header, rodapé, tema e
   idioma correntes. O conteúdo é o mesmo ReleaseCard do topo da
   timeline, agora como manchete da página.

   A versão é resolvida pelo mesmo merge do índice, e não por uma
   busca só na camada local: é isso que mantém a promessa de que
   publicar uma release no GitHub cria a página sem tocar em código.
───────────────────────────────────────────────────────── */

/** Compara versões ignorando um eventual "v" e espaços. */
function sameVersion(a: string, b: string): boolean {
    const clean = (v: string) => v.trim().replace(/^v/i, "").toLowerCase();
    return clean(a) === clean(b);
}

interface ReleaseNotePageProps {
    /** Versão pedida na URL, já sem o prefixo "v". */
    version: string;
}

export const ReleaseNotePage: React.FC<ReleaseNotePageProps> = ({
    version,
}) => {
    const { lang, t } = useLang();
    const { navigate } = useRoute();
    useReducedMotion();

    const { releases, status } = useReleaseNotes();

    const entries = useMemo(
        () => mergeReleaseNotes(RELEASE_NOTES, releases),
        [releases],
    );

    const index = entries.findIndex((e) => sameVersion(e.version, version));
    const entry = index >= 0 ? entries[index] : undefined;

    /* A lista vem ordenada da mais recente para a mais antiga. */
    const newer = index > 0 ? entries[index - 1] : undefined;
    const older = index >= 0 ? entries[index + 1] : undefined;

    /* Uma versão que só existe no GitHub ainda não está na lista
       enquanto a busca corre — declarar "não encontrada" aí seria
       errado. */
    const loading = !entry && status === "loading";

    useDocumentMeta({
        title: entry
            ? `v${entry.version} — ${entry.title[lang]} | ${PROFILE.name}`
            : `${t("releaseNotes.notFound.title")} | ${PROFILE.name}`,
        description:
            entry?.summary?.[lang] ?? t("releaseNotes.meta.description"),
        path: releaseNotePath(version),
    });

    const goTo = (to: string) => (e: React.MouseEvent) => {
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

            <ScrollUtils
                label={lang === "pt" ? "Voltar ao topo" : "Back to top"}
            />

            <Header />

            <main id="main-content" className="release-page">
                <div className="container">
                    <div className="release-page__content">
                        <div className="release-note__topbar">
                            <a
                                className="release-note__back"
                                href={ROUTES.RELEASE_NOTES}
                                onClick={goTo(ROUTES.RELEASE_NOTES)}
                            >
                                <IconChevronLeft
                                    width={14}
                                    height={14}
                                    aria-hidden="true"
                                />
                                {t("releaseNotes.backToIndex")}
                            </a>

                            {/* O caminho até aqui. O botão ao lado é a ação;
                                isto é a posição — duas perguntas diferentes. */}
                            <nav
                                className="release-note__crumbs"
                                aria-label={t("releaseNotes.breadcrumb")}
                            >
                                <ol className="release-note__crumb-list">
                                    <li>
                                        <a
                                            href={ROUTES.HOME}
                                            onClick={goTo(ROUTES.HOME)}
                                        >
                                            {t("nav.home")}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={ROUTES.RELEASE_NOTES}
                                            onClick={goTo(ROUTES.RELEASE_NOTES)}
                                        >
                                            {t("releaseNotes.title")}
                                        </a>
                                    </li>
                                    <li aria-current="page">
                                        v{entry?.version ?? version}
                                    </li>
                                </ol>
                            </nav>
                        </div>

                        {entry ? (
                            <>
                                {/* Cabeçalho em duas colunas: à esquerda a
                                    procedência do dado, à direita a manchete.
                                    O h1 é a versão — é ela que identifica a
                                    página —, e o título vem logo abaixo. */}
                                <header className="release-note__header">
                                    <div className="release-note__header-side">
                                        <span className="release-note__kicker">
                                            {index === 0
                                                ? t("releaseNotes.latest")
                                                : t("releaseNotes.past")}
                                        </span>
                                        <SyncBadge
                                            status={status}
                                            count={releases.length}
                                        />
                                    </div>

                                    <div className="release-note__header-main">
                                        <h1 className="release-note__version">
                                            v{entry.version}
                                        </h1>
                                        <h2 className="release-note__title">
                                            {entry.title[lang]}
                                        </h2>
                                        {entry.summary && (
                                            <p className="release-note__summary">
                                                {entry.summary[lang]}
                                            </p>
                                        )}
                                    </div>
                                </header>

                                {/* Duas colunas: a ficha à esquerda acompanha
                                    a rolagem, o artigo à direita corre.
                                    Empilha abaixo de --bp-xl (ver o CSS). */}
                                <div className="release-note__layout">
                                    <ReleaseAside entry={entry} />
                                    <ReleaseCard
                                        entry={entry}
                                        headingLevel={2}
                                        changesVariant="editorial"
                                        hideHeading
                                    />
                                </div>
                            </>
                        ) : loading ? (
                            <p
                                className="release-note__status"
                                role="status"
                                aria-live="polite"
                            >
                                {t("releaseNotes.loading")}
                            </p>
                        ) : (
                            <div className="release-note__status" role="status">
                                <h1 className="release-note__status-title">
                                    {t("releaseNotes.notFound.title")}
                                </h1>
                                <p>{t("releaseNotes.notFound.body")}</p>
                            </div>
                        )}

                        {(newer || older) && (
                            <nav
                                className="release-note__nav"
                                aria-label={t("releaseNotes.title")}
                            >
                                {older && (
                                    <a
                                        className="release-note__nav-link release-note__nav-link--prev"
                                        href={releaseNotePath(older.version)}
                                        onClick={goTo(
                                            releaseNotePath(older.version),
                                        )}
                                    >
                                        <span className="release-note__nav-label">
                                            {t("releaseNotes.olderVersion")}
                                        </span>
                                        <span className="release-note__nav-title">
                                            v{older.version} —{" "}
                                            {older.title[lang]}
                                        </span>
                                    </a>
                                )}

                                {newer && (
                                    <a
                                        className="release-note__nav-link release-note__nav-link--next"
                                        href={releaseNotePath(newer.version)}
                                        onClick={goTo(
                                            releaseNotePath(newer.version),
                                        )}
                                    >
                                        <span className="release-note__nav-label">
                                            {t("releaseNotes.newerVersion")}
                                            <IconArrowRight
                                                width={13}
                                                height={13}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="release-note__nav-title">
                                            v{newer.version} —{" "}
                                            {newer.title[lang]}
                                        </span>
                                    </a>
                                )}
                            </nav>
                        )}
                    </div>
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
