import React, { useEffect, useRef, useCallback, useState } from "react";
import "./FeaturedLightbox.css";
import { useLang } from "@/shared/hooks/useLang";
import { Modal } from "@/shared/ui/Modal/Modal";
import {
    IconClose,
    IconChevronLeft,
    IconChevronRight,
    IconExternalLink,
    IconGitHub,
} from "@/shared/ui/Icons";
import type { ProjectSlide } from "../Featured.data";

interface FeaturedLightboxProps {
    slides: ProjectSlide[];
    initialIndex: number;
    projectName: string;
    liveUrl?: string;
    repoUrl?: string;
    onClose: () => void;
}

/** Direção da última navegação — usada para animar entrada/saída do conteúdo */
type Direction = "next" | "prev" | "none";

/**
 * FeaturedLightbox — galeria detalhada dos slides do projeto em destaque.
 * Portal, scroll-lock, focus-trap, Esc e overlay são do Modal base
 * (shared/ui/Modal); aqui vivem a navegação entre slides (setas/Home/End,
 * swipe, thumbnails) e o layout interno.
 */
export const FeaturedLightbox: React.FC<FeaturedLightboxProps> = ({
    slides,
    initialIndex,
    projectName,
    liveUrl,
    repoUrl,
    onClose,
}) => {
    const { lang, t } = useLang();
    const [index, setIndex] = useState(initialIndex);
    const [direction, setDirection] = useState<Direction>("none");
    const [imageLoaded, setImageLoaded] = useState(false);
    const touchX = useRef(0);
    const touchY = useRef(0);

    const total = slides.length;
    const slide = slides[index]!;

    /* ── Navigation ─────────────────────────────────────────────── */
    const goTo = useCallback(
        (target: number, dir: Direction = "none") => {
            const safe = ((target % total) + total) % total;
            if (safe === index) return;
            setDirection(dir);
            setImageLoaded(false);
            setIndex(safe);
        },
        [index, total],
    );

    const goPrev = useCallback(() => goTo(index - 1, "prev"), [goTo, index]);
    const goNext = useCallback(() => goTo(index + 1, "next"), [goTo, index]);

    /* ── Keyboard — navegação entre slides (Esc é do Modal base) ── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                goPrev();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                goNext();
            } else if (e.key === "Home") {
                e.preventDefault();
                goTo(0);
            } else if (e.key === "End") {
                e.preventDefault();
                goTo(total - 1);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [goNext, goPrev, goTo, total]);

    /* ── Preload adjacent images for smoother carousel ─────────── */
    useEffect(() => {
        const prev = slides[(index - 1 + total) % total];
        const next = slides[(index + 1) % total];
        [prev, next].forEach((s) => {
            if (!s) return;
            const img = new Image();
            img.src = s.src;
        });
    }, [index, slides, total]);

    /* ── Touch swipe (na área da imagem) ───────────────────────── */
    const onTouchStart = (e: React.TouchEvent) => {
        touchX.current = e.touches[0]!.clientX;
        touchY.current = e.touches[0]!.clientY;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        const dx = touchX.current - e.changedTouches[0]!.clientX;
        const dy = touchY.current - e.changedTouches[0]!.clientY;
        // Swipe horizontal — ignorar se for predominantemente vertical (scroll)
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) goNext();
            else goPrev();
        }
    };

    const directionClass =
        direction === "next"
            ? " is-from-right"
            : direction === "prev"
              ? " is-from-left"
              : "";

    return (
        <Modal
            isOpen
            onClose={onClose}
            label={`${projectName} — ${slide.label[lang]}`}
            className="fl-dialog"
        >
            {/* Top bar — counter + close */}
            <header className="fl-topbar">
                <div className="fl-meta">
                    <span className="fl-project">{projectName}</span>
                    <span className="fl-meta-sep" aria-hidden="true">
                        ·
                    </span>
                    <span className="fl-counter" aria-live="polite">
                        <span className="fl-counter-current">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="fl-counter-sep"> / </span>
                        <span className="fl-counter-total">
                            {String(total).padStart(2, "0")}
                        </span>
                    </span>
                </div>

                <button
                    type="button"
                    className="fl-close"
                    onClick={onClose}
                    aria-label={t("featured.lightbox.close")}
                >
                    <IconClose width={18} height={18} aria-hidden="true" />
                </button>
            </header>

            {/* Main area — image + sidebar */}
            <div
                className="fl-main"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div className={`fl-stage${directionClass}`} key={index}>
                    {/* Backdrop blur of the image */}
                    <div
                        className="fl-stage-backdrop"
                        style={{ backgroundImage: `url(${slide.src})` }}
                        aria-hidden="true"
                    />

                    {/* Actual image */}
                    <figure className="fl-figure">
                        <img
                            key={slide.src}
                            src={slide.src}
                            alt={`${projectName} — ${slide.label[lang]}`}
                            className={`fl-image${imageLoaded ? " is-loaded" : ""}`}
                            onLoad={() => setImageLoaded(true)}
                        />
                        <figcaption className="sr-only">
                            {slide.label[lang]}
                        </figcaption>
                    </figure>

                    {/* Arrows (overlay on stage) */}
                    {total > 1 && (
                        <>
                            <button
                                type="button"
                                className="fl-arrow fl-arrow--prev"
                                onClick={goPrev}
                                aria-label={t("featured.arrow.prev")}
                            >
                                <IconChevronLeft
                                    width={20}
                                    height={20}
                                    aria-hidden="true"
                                />
                            </button>
                            <button
                                type="button"
                                className="fl-arrow fl-arrow--next"
                                onClick={goNext}
                                aria-label={t("featured.arrow.next")}
                            >
                                <IconChevronRight
                                    width={20}
                                    height={20}
                                    aria-hidden="true"
                                />
                            </button>
                        </>
                    )}
                </div>

                {/* Sidebar — description */}
                <aside className="fl-sidebar">
                    <span className="fl-tag">
                        <span className="fl-tag-num">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        {slide.sub[lang]}
                    </span>

                    <h3 className="fl-title">{slide.label[lang]}</h3>

                    {slide.description && (
                        <p className="fl-description">
                            {slide.description[lang]}
                        </p>
                    )}

                    {(liveUrl || repoUrl) && (
                        <div className="fl-actions">
                            {liveUrl && (
                                <a
                                    href={liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn--primary btn--sm fl-cta"
                                >
                                    {t("featured.btn.live")}
                                    <IconExternalLink
                                        width={13}
                                        height={13}
                                        aria-hidden="true"
                                    />
                                </a>
                            )}
                            {repoUrl && (
                                <a
                                    href={repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn--outline btn--sm fl-cta"
                                >
                                    <IconGitHub
                                        width={14}
                                        height={14}
                                        aria-hidden="true"
                                    />
                                    {t("featured.btn.repo")}
                                </a>
                            )}
                        </div>
                    )}
                </aside>
            </div>

            {/* Bottom bar — thumbnails */}
            {total > 1 && (
                <nav
                    className="fl-thumbs"
                    aria-label={t("featured.lightbox.thumbnails")}
                >
                    {slides.map((s, i) => (
                        <button
                            key={s.src}
                            type="button"
                            className={`fl-thumb${i === index ? " is-active" : ""}`}
                            onClick={() => goTo(i, i > index ? "next" : "prev")}
                            aria-label={`${i + 1} — ${s.label[lang]}`}
                            aria-current={i === index}
                        >
                            <img
                                src={s.src}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                width={96}
                                height={60}
                            />
                            <span
                                className="fl-thumb-overlay"
                                aria-hidden="true"
                            />
                        </button>
                    ))}
                </nav>
            )}
        </Modal>
    );
};
