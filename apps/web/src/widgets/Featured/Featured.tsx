import React, { lazy, Suspense, useId, useRef, useState } from "react";
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
   (TechList) e a janela de navegador do panorama do GitHub, em que
   cada captura é uma ABA.

   Abas no lugar do carrossel automático: o visitante escolhe o que
   ver (WCAG 2.2.2, nada se move sozinho), a navegação existe uma vez
   só (abas + setas na legenda) e o padrão é o mesmo do panorama —
   ←/→/Home/End nas abas, foco itinerante.
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
    const abas = useRef<(HTMLButtonElement | null)[]>([]);
    const toque = useRef<{ x: number; y: number } | null>(null);
    const base = useId();
    const slides = project.slides;
    const slide = slides[atual]!;
    const total = slides.length;
    const detailsUrl =
        lang === "en" ? `${project.detailsUrl}?lang=en` : project.detailsUrl;

    const ir = (indice: number, focar = false) => {
        const alvo = (indice + total) % total;
        setAtual(alvo);
        if (focar) abas.current[alvo]?.focus();
    };

    const aoTeclarAba = (e: React.KeyboardEvent, i: number) => {
        const destino =
            e.key === "ArrowRight"
                ? i + 1
                : e.key === "ArrowLeft"
                  ? i - 1
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? total - 1
                      : null;
        if (destino === null) return;
        e.preventDefault();
        ir(destino, true);
    };

    const fatos: [string, string][] = [
        [t("featured.fact.context"), t("featured.fact.contextValue")],
        [t("featured.fact.approach"), t("featured.fact.approachValue")],
        [t("featured.fact.languages"), t("featured.fact.languagesValue")],
        [t("featured.fact.score"), t("featured.fact.scoreValue")],
    ];

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

                <dl className="featured__facts">
                    {fatos.map(([rotulo, valor]) => (
                        <div key={rotulo} className="featured__fact">
                            <dt>{rotulo}</dt>
                            <dd>{valor}</dd>
                        </div>
                    ))}
                </dl>

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
                            <a href={detailsUrl} className="btn btn--primary">
                                {t("featured.cta.details")}
                                <IconArrowRight
                                    width={16}
                                    height={16}
                                    aria-hidden="true"
                                />
                            </a>
                            <a
                                href={project.liveUrl}
                                className="btn btn--outline"
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
                                <div
                                    className="featured__tabs"
                                    role="tablist"
                                    aria-label={t("featured.gallery.label")}
                                >
                                    {slides.map((item, i) => (
                                        <button
                                            key={item.src}
                                            ref={(el) => {
                                                abas.current[i] = el;
                                            }}
                                            type="button"
                                            role="tab"
                                            id={`${base}-tab-${i}`}
                                            className="featured__tab"
                                            aria-selected={atual === i}
                                            aria-controls={`${base}-panel`}
                                            tabIndex={atual === i ? 0 : -1}
                                            onClick={() => ir(i)}
                                            onKeyDown={(e) => aoTeclarAba(e, i)}
                                        >
                                            <span
                                                className="featured__tab-index"
                                                aria-hidden="true"
                                            >
                                                {dois(i + 1)}
                                            </span>
                                            <span
                                                className="featured__tab-label"
                                                title={item.label[lang]}
                                            >
                                                {item.label[lang]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
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
                                role="tabpanel"
                                id={`${base}-panel`}
                                aria-labelledby={`${base}-tab-${atual}`}
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
                                    <div className="featured__caption-text">
                                        <span className="featured__counter">
                                            {dois(atual + 1)} / {dois(total)}
                                        </span>
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
                                <h3>{item.title[lang]}</h3>
                                <p>{item.text[lang]}</p>
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
