import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import "./FeaturedLightbox.css";
import { useLang } from "@/shared/hooks/useLang";
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

type Direction = "next" | "prev" | "none";

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
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const touchX = useRef(0);
    const touchY = useRef(0);

    const total = slides.length;
    const slide = slides[index]!;

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

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape")           { e.preventDefault(); onClose(); }
            else if (e.key === "ArrowLeft")   { e.preventDefault(); goPrev(); }
            else if (e.key === "ArrowRight")  { e.preventDefault(); goNext(); }
            else if (e.key === "Home")        { e.preventDefault(); goTo(0); }
            else if (e.key === "End")         { e.preventDefault(); goTo(total - 1); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [goNext, goPrev, goTo, onClose, total]);

    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => closeBtnRef.current?.focus({ preventScroll: true }));
        return () => {
            document.body.style.overflow = original;
        };
    }, []);

    useEffect(() => {
        const prev = slides[(index - 1 + total) % total];
        const next = slides[(index + 1) % total];
        [prev, next].forEach(s => {
            if (!s) return;
            const img = new Image();
            img.src = s.src;
        });
    }, [index, slides, total]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchX.current = e.touches[0]!.clientX;
        touchY.current = e.touches[0]!.clientY;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        const dx = touchX.current - e.changedTouches[0]!.clientX;
        const dy = touchY.current - e.changedTouches[0]!.clientY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            dx > 0 ? goNext() : goPrev();
        }
    };

    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const onDialogKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== "Tab" || !dialogRef.current) return;
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    };

    const directionClass = direction === "next"
        ? " is-from-right"
        : direction === "prev"
            ? " is-from-left"
            : "";

    const lightbox = (
        <div
            className="fl-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`${projectName} — ${slide.label[lang]}`}
            onClick={onBackdropClick}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div
                ref={dialogRef}
                className="fl-dialog"
                onKeyDown={onDialogKeyDown}
                onClick={e => e.stopPropagation()}
            >
                <header className="fl-topbar">
                    <div className="fl-meta">
                        <span className="fl-project">{projectName}</span>
                        <span className="fl-meta-sep" aria-hidden="true">·</span>
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
                        ref={closeBtnRef}
                        type="button"
                        className="fl-close"
                        onClick={onClose}
                        aria-label={t("featured.lightbox.close")}
                    >
                        <IconClose width={18} height={18} aria-hidden="true" />
                    </button>
                </header>

                <div className="fl-main">
                    <div className={`fl-stage${directionClass}`} key={index}>
                        <div
                            className="fl-stage-backdrop"
                            style={{ backgroundImage: `url(${slide.src})` }}
                            aria-hidden="true"
                        />

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

                        {total > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="fl-arrow fl-arrow--prev"
                                    onClick={goPrev}
                                    aria-label={t("featured.arrow.prev")}
                                >
                                    <IconChevronLeft width={20} height={20} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className="fl-arrow fl-arrow--next"
                                    onClick={goNext}
                                    aria-label={t("featured.arrow.next")}
                                >
                                    <IconChevronRight width={20} height={20} aria-hidden="true" />
                                </button>
                            </>
                        )}
                    </div>

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
                                        <IconExternalLink width={13} height={13} aria-hidden="true" />
                                    </a>
                                )}
                                {repoUrl && (
                                    <a
                                        href={repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn--outline btn--sm fl-cta"
                                    >
                                        <IconGitHub width={14} height={14} aria-hidden="true" />
                                        {t("featured.btn.repo")}
                                    </a>
                                )}
                            </div>
                        )}
                    </aside>
                </div>

                {total > 1 && (
                    <nav className="fl-thumbs" aria-label={t("featured.lightbox.thumbnails")}>
                        {slides.map((s, i) => (
                            <button
                                key={s.src}
                                type="button"
                                className={`fl-thumb${i === index ? " is-active" : ""}`}
                                onClick={() => goTo(i, i > index ? "next" : "prev")}
                                aria-label={`${i + 1} — ${s.label[lang]}`}
                                aria-current={i === index}
                            >
                                <img src={s.src} alt="" loading="lazy" decoding="async" width={96} height={60} />
                                <span className="fl-thumb-overlay" aria-hidden="true" />
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </div>
    );

    return createPortal(lightbox, document.body);
};
