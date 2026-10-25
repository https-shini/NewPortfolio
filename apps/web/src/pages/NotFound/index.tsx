import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { NOT_FOUND_COPY } from "@/shared/config/notFound";
import { PROFILE } from "@/shared/config/profile";
import { ROUTES, withLang } from "@/shared/config/routes";
import {
    IconArrowRight,
    IconArrowLeft,
    IconEmail,
    IconGitBranch,
} from "@/shared/ui/Icons";
import "./NotFound.css";

export function NotFoundPage() {
    const { lang } = useLang();
    const { path } = useRoute();
    const copy = NOT_FOUND_COPY[lang];
    const home = useLinkProps(ROUTES.HOME);
    const links = useLinkProps(ROUTES.LINKS);
    const releases = useLinkProps(ROUTES.RELEASE_NOTES);
    useReducedMotion();
    useDocumentMeta({
        title: `404 — ${copy.title} | ${PROFILE.name}`,
        description: copy.description,
        path,
        robots: "noindex, follow",
    });

    return (
        <>
            <a href="#main-content" className="skip-link">
                {copy.skip}
            </a>
            <Header />
            <main id="main-content" className="not-found">
                <div className="container not-found__layout">
                    <div className="not-found__content">
                        <p className="not-found__eyebrow">
                            <span aria-hidden="true" />
                            {copy.eyebrow}
                        </p>
                        <h1 className="not-found__title">
                            {copy.title}
                            <span className="sr-only"> — 404</span>
                        </h1>
                        <p className="not-found__description">
                            {copy.description}
                        </p>
                        <div className="not-found__actions">
                            <a
                                {...home.anchorProps}
                                href={withLang(ROUTES.HOME, lang)}
                                className="btn btn--primary"
                            >
                                <IconArrowLeft aria-hidden="true" />
                                {copy.home}
                            </a>
                            <a
                                {...links.anchorProps}
                                href={withLang(ROUTES.LINKS, lang)}
                                className="btn btn--outline"
                            >
                                {copy.links}
                                <IconArrowRight aria-hidden="true" />
                            </a>
                        </div>
                        <nav
                            className="not-found__suggestions"
                            aria-label={copy.suggestions}
                        >
                            <a
                                {...releases.anchorProps}
                                href={withLang(ROUTES.RELEASE_NOTES, lang)}
                                className="not-found__suggestion"
                            >
                                <IconGitBranch aria-hidden="true" />
                                <span>
                                    <strong>{copy.releases}</strong>
                                    <span>{copy.releasesDescription}</span>
                                </span>
                                <IconArrowRight aria-hidden="true" />
                            </a>
                            <a
                                href={`mailto:${PROFILE.email}`}
                                className="not-found__suggestion"
                            >
                                <IconEmail aria-hidden="true" />
                                <span>
                                    <strong>{copy.contact}</strong>
                                    <span>{copy.contactDescription}</span>
                                </span>
                                <IconArrowRight aria-hidden="true" />
                            </a>
                        </nav>
                    </div>
                    <div className="not-found__art" aria-hidden="true">
                        <div className="not-found__orbit not-found__orbit--outer" />
                        <div className="not-found__orbit not-found__orbit--inner" />
                        <span className="not-found__coordinate">
                            {PROFILE.handle}
                        </span>
                        <span className="not-found__number">
                            4<span>0</span>4
                        </span>
                        <span className="not-found__art-label">
                            {copy.illustration}
                        </span>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
