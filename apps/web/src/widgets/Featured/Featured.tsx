import React, { lazy, Suspense, useRef, useState } from "react";
import "./Featured.css";
import { useLang } from "@/shared/hooks/useLang";
import {
    IconArrowRight,
    IconChevronLeft,
    IconChevronRight,
    IconExternalLink,
    IconLayers,
    IconLock,
    IconPackage,
    IconSearch,
    IconShield,
} from "@/shared/ui/Icons";
import { TechList } from "@/features/devhub/components/TechList";
import { lookupTech, type Tech } from "@/features/devhub/tech";
import { NEUTRAL_LANGUAGE_COLOR } from "@/features/devhub/types";
import { FEATURED_PROJECT as project } from "./Featured.data";

/* ─────────────────────────────────────────────────────────
   Featured — o projeto em destaque (#destaque)
   ─────────────────────────────────────────────────────────
   Mesma linguagem de /projetos: painel com a linha de terminal do
   cartão (`$ cd ~/codex`), chips de tecnologia com ícone oficial
   (TechList) e a janela de navegador do panorama do GitHub, com uma
   aba única do projeto e um carrossel MANUAL das capturas.

   Nada se move sozinho (WCAG 2.2.2): setas anterior/próxima
   circulares, ←/→ com o carrossel em foco, gesto horizontal no toque
   e legenda anunciada com aria-live="polite".
───────────────────────────────────────────────────────── */

const FeaturedLightbox = lazy(() =>
    import("./components/FeaturedLightbox").then((m) => ({
        default: m.FeaturedLightbox,
    })),
);

const ICONES = {
    layers: IconLayers,
    shield: IconShield,
    package: IconPackage,
} as const;

/** Chip do catálogo; tecnologia fora dele ganha o ícone genérico. */
const TECHS: Tech[] = project.tech.map(
    (item) =>
        lookupTech(item.label) ?? {
            key: item.key,
            name: item.label,
            color: NEUTRAL_LANGUAGE_COLOR,
            generic: "code",
        },
);

const dois = (n: number) => String(n).padStart(2, "0");

export function Featured() {
    const { lang, t } = useLang();
    const [atual, setAtual] = useState(0);
    const [ampliada, setAmpliada] = useState<number | null>(null);
    const toque = useRef<{ x: number; y: number } | null>(null);
    const slides = project.slides;
    const slide = slides[atual]!;
    const total = slides.length;
    const detailsUrl =
        lang === "en" ? `${project.detailsUrl}?lang=en` : project.detailsUrl;

    const ir = (indice: number) => setAtual((indice + total) % total);

    /* ←/→ com o carrossel (ou um controle dele) em foco. */
    const aoTeclar = (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        ir(atual + (e.key === "ArrowLeft" ? -1 : 1));
    };

    return (
        <section
            id="destaque"
            className="featured section"
            aria-labelledby="featured-title"
            data-reveal
        >
            <div className="container">
                <header className="featured__head">
                    <div className="featured__head-text">
                        <p className="section-eyebrow">
                            {t("featured.kicker")}
                        </p>
                        <h2 className="featured__title" id="featured-title">
                            Codex{" "}
                            <span className="featured__title-detail">
                                Code Validator
                            </span>
                        </h2>
                        <p className="featured__subtitle">
                            {t("featured.subtitle")}
                        </p>
                    </div>
                    <ul
                        className="featured__badges"
                        aria-label={t("featured.badges")}
                    >
                        <li className="featured__badge">
                            {t("featured.badge.tcc")}
                        </li>
                        <li className="featured__badge featured__badge--live">
                            <span aria-hidden="true" />
                            {t("featured.badge.live")}
                        </li>
                    </ul>
                </header>

                <div className="featured__layout">
                    <article
                        className="featured__story"
                        aria-labelledby="featured-lead"
                    >
                        <p className="featured__prompt" aria-hidden="true">
                            <span className="featured__prompt-icon">〈/〉</span>
                            <span>
                                <span className="featured__prompt-sign">$</span>{" "}
                                cd ~/codex
                            </span>
                        </p>
                        <h3 className="featured__lead" id="featured-lead">
                            {t("featured.lead")}
                        </h3>
                        <p className="featured__desc">{t("featured.body")}</p>

                        <div className="featured__summary">
                            <p className="featured__label">
                                {t("featured.summary.label")}
                            </p>
                            <p className="featured__score">
                                <strong>0–1000</strong>
                                <span>{t("featured.summary.scoreText")}</span>
                            </p>
                            <p className="featured__langs">
                                <span>{t("featured.summary.languages")}</span>{" "}
                                {t("featured.summary.languagesValue")}
                            </p>
                        </div>

                        <div className="featured__stack">
                            <p className="featured__label" aria-hidden="true">
                                {t("featured.stack")}
                            </p>
                            <TechList
                                techs={TECHS}
                                label={t("featured.stack")}
                            />
                        </div>

                        <div className="featured__actions">
                            <a
                                href={project.liveUrl}
                                className="btn btn--primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t("featured.cta.live")}
                                <IconExternalLink
                                    width={16}
                                    height={16}
                                    aria-hidden="true"
                                />
                                <span className="sr-only">
                                    {t("featured.newTab")}
                                </span>
                            </a>
                            <a href={detailsUrl} className="btn btn--outline">
                                {t("featured.cta.details")}
                                <IconArrowRight
                                    width={16}
                                    height={16}
                                    aria-hidden="true"
                                />
                            </a>
                        </div>
                    </article>

                    <div className="featured__showcase">
                        <div className="featured__window">
                            <div className="featured__bar">
                                <span
                                    className="featured__dots"
                                    aria-hidden="true"
                                >
                                    <span />
                                    <span />
                                    <span />
                                </span>
                                <span className="featured__tab">
                                    {project.name.replace(" — ", " ")}
                                </span>
                            </div>

                            <div className="featured__toolbar">
                                <a
                                    className="featured__address"
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={t("featured.address").replace(
                                        "{host}",
                                        project.repoHost,
                                    )}
                                >
                                    <IconLock
                                        width={12}
                                        height={12}
                                        aria-hidden="true"
                                    />
                                    <span className="featured__host">
                                        {project.repoHost}
                                    </span>
                                    <IconExternalLink
                                        width={12}
                                        height={12}
                                        aria-hidden="true"
                                    />
                                </a>
                            </div>

                            <div
                                className="featured__panel"
                                role="region"
                                aria-roledescription={t("featured.carousel")}
                                aria-label={t("featured.gallery.label")}
                                tabIndex={0}
                                onKeyDown={aoTeclar}
                            >
                                <button
                                    key={slide.src}
                                    type="button"
                                    className="featured__shot"
                                    onClick={() => setAmpliada(atual)}
                                    aria-label={`${t("featured.lightbox.open")}: ${slide.label[lang]}`}
                                    onTouchStart={(e) => {
                                        const p = e.touches[0];
                                        if (p)
                                            toque.current = {
                                                x: p.clientX,
                                                y: p.clientY,
                                            };
                                    }}
                                    onTouchEnd={(e) => {
                                        const p = e.changedTouches[0];
                                        const inicio = toque.current;
                                        toque.current = null;
                                        if (!p || !inicio) return;
                                        const dx = inicio.x - p.clientX;
                                        if (
                                            Math.abs(dx) > 48 &&
                                            Math.abs(dx) >
                                                Math.abs(inicio.y - p.clientY)
                                        )
                                            ir(atual + (dx > 0 ? 1 : -1));
                                    }}
                                >
                                    <img
                                        src={slide.src}
                                        alt={`${project.name} — ${slide.label[lang]}`}
                                        width={1920}
                                        height={1080}
                                        decoding="async"
                                    />
                                    <span
                                        className="featured__zoom"
                                        aria-hidden="true"
                                    >
                                        <IconSearch width={14} height={14} />
                                        {t("featured.zoom")}
                                    </span>
                                </button>

                                <div className="featured__caption">
                                    <div
                                        className="featured__caption-text"
                                        aria-live="polite"
                                        aria-atomic="true"
                                    >
                                        <span className="featured__counter">
                                            {dois(atual + 1)} / {dois(total)}
                                        </span>
                                        <strong>{slide.label[lang]}</strong>
                                        <p>
                                            {slide.description?.[lang] ??
                                                slide.sub[lang]}
                                        </p>
                                    </div>
                                    <div className="featured__arrows">
                                        <button
                                            type="button"
                                            className="featured__arrow"
                                            onClick={() => ir(atual - 1)}
                                            aria-label={t(
                                                "featured.arrow.prev",
                                            )}
                                        >
                                            <IconChevronLeft
                                                width={18}
                                                height={18}
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="featured__arrow"
                                            onClick={() => ir(atual + 1)}
                                            aria-label={t(
                                                "featured.arrow.next",
                                            )}
                                        >
                                            <IconChevronRight
                                                width={18}
                                                height={18}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="featured__note">{t("featured.note")}</p>
                    </div>
                </div>

                <div className="featured__features-head">
                    <p className="section-eyebrow">
                        {t("featured.features.eyebrow")}
                    </p>
                    <h3 className="featured__features-title">
                        {t("featured.features.title")}
                    </h3>
                </div>
                <ul
                    className="featured__capabilities"
                    aria-label={t("featured.capabilities")}
                >
                    {project.architecture.map((item, i) => {
                        const Icone = ICONES[item.icon];
                        return (
                            <li
                                className="featured__capability"
                                key={item.icon}
                            >
                                <div className="featured__capability-head">
                                    <span
                                        className="featured__capability-icon"
                                        aria-hidden="true"
                                    >
                                        <Icone width={18} height={18} />
                                    </span>
                                    <span
                                        className="featured__capability-index"
                                        aria-hidden="true"
                                    >
                                        {dois(i + 1)}
                                    </span>
                                </div>
                                <h4>{item.title[lang]}</h4>
                                <p>{item.summary[lang]}</p>
                                <ul className="featured__capability-list">
                                    {item.details.map((d) => (
                                        <li key={d.pt}>{d[lang]}</li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {ampliada !== null && (
                <Suspense fallback={null}>
                    <FeaturedLightbox
                        slides={slides}
                        initialIndex={ampliada}
                        projectName={project.name}
                        liveUrl={project.liveUrl}
                        detailsUrl={detailsUrl}
                        onClose={() => setAmpliada(null)}
                    />
                </Suspense>
            )}
        </section>
    );
}
