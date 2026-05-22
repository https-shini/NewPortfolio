import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Featured.css";
import { useLang } from "@/shared/hooks/useLang";
import {
    IconStar,
    IconChevronLeft,
    IconChevronRight,
    IconExternalLink,
    IconGitHub,
    IconLayers,
    IconShield,
    IconPackage,
    IconLock,
    IconSearch,
    type IconProps,
} from "@/shared/ui/Icons";
import { FEATURED_PROJECT, METHOD_COLOR, type HttpMethod } from "./Featured.data";
import { FeaturedLightbox } from "./components/FeaturedLightbox";

const INTERVAL = 7000;

const ARCH_ICON: Record<"layers" | "shield" | "package", React.ComponentType<IconProps>> = {
    layers:  IconLayers,
    shield:  IconShield,
    package: IconPackage,
};

const SKILLICONS_BASE = "https://skillicons.dev/icons?i=";

export const Featured: React.FC = () => {
    const { lang, t } = useLang();
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchX = useRef(0);
    const galleryRef = useRef<HTMLDivElement>(null);
    const filmstripRef = useRef<HTMLDivElement>(null);
    const noMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const slides = FEATURED_PROJECT.slides;
    const hasMultiple = slides.length > 1;
    const isScrollableStrip = slides.length > 4;

    const goTo = useCallback(
        (index: number) => {
            if (animating) return;
            const next = ((index % slides.length) + slides.length) % slides.length;
            if (next === current) return;
            setAnimating(true);
            setCurrent(next);
            setTimeout(() => setAnimating(false), 700);
        },
        [animating, current, slides.length],
    );

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    const startAuto = useCallback(() => {
        if (noMotion || !autoPlay || slides.length < 2) return;
        timerRef.current = setInterval(next, INTERVAL);
    }, [autoPlay, next, noMotion, slides.length]);

    const stopAuto = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const resetAuto = useCallback(() => {
        stopAuto();
        startAuto();
    }, [startAuto, stopAuto]);

    useEffect(() => {
        startAuto();
        return stopAuto;
    }, [startAuto, stopAuto]);

    useEffect(() => {
        const handler = () => (document.hidden ? stopAuto() : startAuto());
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    }, [startAuto, stopAuto]);

    // Mantém a miniatura ativa centralizada no strip (carrossel de thumbnails)
    useEffect(() => {
        const strip = filmstripRef.current;
        if (!strip) return;
        const active = strip.querySelector<HTMLElement>(".featured__thumb.is-active");
        if (!active) return;
        const stripRect = strip.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        const delta = activeRect.left - stripRect.left - (stripRect.width - activeRect.width) / 2;
        if (Math.abs(delta) < 1) return;
        strip.scrollBy({ left: delta, behavior: noMotion ? "auto" : "smooth" });
    }, [current, noMotion]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            prev();
            resetAuto();
        }
        if (e.key === "ArrowRight") {
            next();
            resetAuto();
        }
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchX.current = e.touches[0]!.clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        const delta = touchX.current - e.changedTouches[0]!.clientX;
        if (Math.abs(delta) > 48) {
            delta > 0 ? next() : prev();
            resetAuto();
        }
    };

    const toggleAutoPlay = () => {
        const nextState = !autoPlay;
        setAutoPlay(nextState);
        if (nextState) startAuto();
        else stopAuto();
    };

    const project = FEATURED_PROJECT;
    const currentSlide = slides[current]!;

    return (
        <section
            id="destaque"
            className="featured section"
            aria-labelledby="featured-title"
            data-reveal
        >
            <div className="container">
                {/* ─── Header ─── */}
                <header className="section-header">
                    <span className="section-eyebrow">{t("featured.eyebrow")}</span>
                    <span className="featured__badge">
                        <IconStar width={14} height={14} aria-hidden="true" />
                        {t("featured.badge")}
                    </span>
                    <h2 className="section-title" id="featured-title">
                        {project.name}
                    </h2>
                    <p className="section-subtitle">{project.tagline[lang]}</p>
                </header>

                {/* ─── Main grid: gallery (browser mockup) + tech profile ─── */}
                <div className="featured__main">
                    {/* Left column: browser mockup + thumbnail filmstrip */}
                    <div
                        className="featured__media"
                        onMouseEnter={stopAuto}
                        onMouseLeave={() => autoPlay && startAuto()}
                    >
                    {/* Gallery — Browser mockup */}
                    <div
                        ref={galleryRef}
                        className="featured__gallery"
                        role="region"
                        aria-label={t("featured.gallery.label")}
                        aria-roledescription="carrossel"
                        onKeyDown={handleKeyDown}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                        tabIndex={0}
                    >
                        {/* Browser chrome */}
                        <div className="featured__browser-chrome" aria-hidden="true">
                            <div className="featured__browser-dots">
                                <span className="featured__browser-dot featured__browser-dot--red"   />
                                <span className="featured__browser-dot featured__browser-dot--amber" />
                                <span className="featured__browser-dot featured__browser-dot--green" />
                            </div>
                            <div className="featured__browser-url">
                                <span className="featured__browser-url-protocol">https://</span>
                                <span>authservice-mbul.onrender.com</span>
                            </div>
                            <button
                                type="button"
                                className={`featured__autoplay${autoPlay ? " is-playing" : ""}`}
                                onClick={toggleAutoPlay}
                                aria-label={autoPlay ? t("featured.autoplay.pause") : t("featured.autoplay.play")}
                                title={autoPlay ? t("featured.autoplay.pause") : t("featured.autoplay.play")}
                            >
                                {autoPlay ? (
                                    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                                        <rect x="3" y="2" width="2" height="8" rx="0.5" fill="currentColor" />
                                        <rect x="7" y="2" width="2" height="8" rx="0.5" fill="currentColor" />
                                    </svg>
                                ) : (
                                    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                                        <path d="M3.5 2L9.5 6L3.5 10V2Z" fill="currentColor" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Slides */}
                        <div className="featured__slides">
                            {slides.map((slide, i) => (
                                <div
                                    key={slide.src}
                                    className={`featured__slide${i === current ? " is-active" : ""}`}
                                    aria-hidden={i !== current}
                                >
                                    <button
                                        type="button"
                                        className="featured__slide-trigger"
                                        onClick={() => setLightboxIndex(i)}
                                        tabIndex={i === current ? 0 : -1}
                                        aria-label={`${t("featured.lightbox.open")}: ${slide.label[lang]}`}
                                    >
                                        <img
                                            src={slide.src}
                                            alt={`${project.name} — ${slide.label[lang]}`}
                                            className="featured__slide-img"
                                            loading={i === 0 ? "eager" : "lazy"}
                                        />
                                        <span className="featured__slide-zoom" aria-hidden="true">
                                            <IconSearch width={16} height={16} aria-hidden="true" />
                                            <span>{t("featured.lightbox.open")}</span>
                                        </span>
                                    </button>

                                    <div className="featured__slide-caption">
                                        <span className="featured__slide-label">{slide.label[lang]}</span>
                                        <span className="featured__slide-sub">{slide.sub[lang]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Counter + progress (escala para qualquer quantidade) */}
                        {hasMultiple && (
                            <div className="featured__dots-row">
                                <span className="featured__counter" aria-hidden="true">
                                    {String(current + 1).padStart(2, "0")}
                                    <span className="featured__counter-sep"> / </span>
                                    <span className="featured__counter-total">
                                        {String(slides.length).padStart(2, "0")}
                                    </span>
                                </span>
                                <div
                                    className="featured__progress"
                                    role="progressbar"
                                    aria-valuemin={1}
                                    aria-valuemax={slides.length}
                                    aria-valuenow={current + 1}
                                >
                                    <span
                                        className="featured__progress-fill"
                                        style={{ width: `${((current + 1) / slides.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Arrows */}
                        {hasMultiple && (
                            <>
                                <button
                                    type="button"
                                    className="featured__arrow featured__arrow--prev"
                                    onClick={() => {
                                        prev();
                                        resetAuto();
                                    }}
                                    aria-label={t("featured.arrow.prev")}
                                    tabIndex={-1}
                                >
                                    <IconChevronLeft width={16} height={16} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className="featured__arrow featured__arrow--next"
                                    onClick={() => {
                                        next();
                                        resetAuto();
                                    }}
                                    aria-label={t("featured.arrow.next")}
                                    tabIndex={-1}
                                >
                                    <IconChevronRight width={16} height={16} aria-hidden="true" />
                                </button>
                            </>
                        )}

                        {/* Slide name caption (bottom-left subtle) */}
                        <div className="featured__slide-name" aria-live="polite">
                            <span className="featured__slide-name-text">{currentSlide.label[lang]}</span>
                        </div>
                    </div>

                    {/* Thumbnail filmstrip — dinâmico (vira carrossel scrollável quando > 4) */}
                    {hasMultiple && (
                        <div
                            ref={filmstripRef}
                            className={`featured__filmstrip${isScrollableStrip ? " featured__filmstrip--scroll" : ""}`}
                            role="group"
                            aria-label={t("featured.thumbs.label")}
                        >
                        {slides.map((slide, i) => (
                            <button
                                key={slide.src}
                                type="button"
                                className={`featured__thumb${i === current ? " is-active" : ""}`}
                                onClick={() => {
                                    goTo(i);
                                    resetAuto();
                                }}
                                aria-label={slide.label[lang]}
                                aria-current={i === current}
                            >
                                <img
                                    src={slide.src}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    aria-hidden="true"
                                    className="featured__thumb-img"
                                />
                                <span className="featured__thumb-index" aria-hidden="true">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </button>
                        ))}
                        </div>
                    )}
                    </div>
                    {/* /featured__media */}

                    {/* ─── Tech Profile ─── */}
                    <aside className="featured__profile" aria-labelledby="featured-profile-title">
                        {/* Repo path */}
                        <div className="featured__repo-path">
                            <IconGitHub width={14} height={14} aria-hidden="true" />
                            <span>{project.repoHost}</span>
                        </div>

                        {/* Badges */}
                        <div className="featured__badges" role="list">
                            {project.badges.map(b => (
                                <span
                                    key={b.label}
                                    role="listitem"
                                    className={`featured__pill featured__pill--${b.variant}`}
                                >
                                    {b.variant === "live" && <span className="featured__pill-dot" aria-hidden="true" />}
                                    {b.label}
                                </span>
                            ))}
                        </div>

                        {/* Description */}
                        <p className="featured__description" id="featured-profile-title">
                            {project.description[lang]}
                        </p>

                        {/* Tech stack */}
                        <section className="featured__block">
                            <h3 className="featured__block-title">{t("featured.block.tech")}</h3>
                            <ul className="featured__tech" aria-label={t("featured.block.tech")}>
                                {project.tech.map(item => (
                                    <li
                                        key={item.key}
                                        className={`featured__tech-chip featured__tech-chip--${item.variant}`}
                                    >
                                        <img
                                            src={`${SKILLICONS_BASE}${item.key}`}
                                            alt=""
                                            width={18}
                                            height={18}
                                            loading="lazy"
                                            decoding="async"
                                            aria-hidden="true"
                                        />
                                        <span>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Endpoints — terminal style */}
                        <section className="featured__block">
                            <h3 className="featured__block-title">
                                {t("featured.block.endpoints")}
                            </h3>
                            <ul className="featured__endpoints" aria-label="API endpoints">
                                {project.endpoints.map(ep => {
                                    const color = METHOD_COLOR[ep.method as HttpMethod];
                                    return (
                                        <li key={ep.path} className="featured__endpoint">
                                            <span
                                                className="featured__method"
                                                style={{
                                                    color: color.fg,
                                                    background: color.bg,
                                                    borderColor: color.border,
                                                }}
                                            >
                                                {ep.method}
                                            </span>
                                            <code className="featured__path">{ep.path}</code>
                                            {ep.protected && (
                                                <span
                                                    className="featured__protected"
                                                    title={t("featured.endpoint.protected")}
                                                    aria-label={t("featured.endpoint.protected")}
                                                >
                                                    <IconLock width={11} height={11} aria-hidden="true" />
                                                </span>
                                            )}
                                            <span className="featured__endpoint-desc">
                                                {ep.description[lang]}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        {/* CTAs */}
                        <div className="featured__actions">
                            <a
                                href={project.liveUrl}
                                className="btn btn--primary btn--sm featured__cta"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t("featured.btn.live")}
                                <IconExternalLink width={13} height={13} aria-hidden="true" />
                            </a>
                            <a
                                href={project.repoUrl}
                                className="btn btn--outline btn--sm featured__cta"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <IconGitHub width={14} height={14} aria-hidden="true" />
                                {t("featured.btn.repo")}
                            </a>
                            <a
                                href={project.docsUrl}
                                className="featured__docs-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t("featured.btn.docs")}
                                <IconExternalLink width={11} height={11} aria-hidden="true" />
                            </a>
                        </div>
                    </aside>
                </div>

                {/* ─── Architecture cards ─── */}
                <div className="featured__architecture" role="list">
                    {project.architecture.map((card, i) => {
                        const Icon = ARCH_ICON[card.icon];
                        return (
                            <article
                                key={card.icon}
                                role="listitem"
                                className="arch-card"
                                style={{ ["--stagger-index" as string]: i }}
                            >
                                <span className="arch-card__icon" aria-hidden="true">
                                    <Icon width={20} height={20} />
                                </span>
                                <h3 className="arch-card__title">{card.title[lang]}</h3>
                                <p className="arch-card__text">{card.text[lang]}</p>
                            </article>
                        );
                    })}
                </div>
            </div>

            {lightboxIndex !== null && (
                <FeaturedLightbox
                    slides={slides}
                    initialIndex={lightboxIndex}
                    projectName={project.name}
                    liveUrl={project.liveUrl}
                    repoUrl={project.repoUrl}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </section>
    );
};
