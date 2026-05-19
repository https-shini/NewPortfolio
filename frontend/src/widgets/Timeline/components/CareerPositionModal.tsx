import React, { useEffect, useMemo, useRef, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import "./CareerPositionModal.css";

import type { CareerCompany, CareerPosition } from "../Timeline.types";

import {
    IconBriefcase,
    IconLocation,
    IconExternalLink,
    IconClose,
    IconArrowRight,
} from "@/shared/ui/Icons";

import { useLang } from "@/shared/hooks/useLang";
import { getInitials } from "@/shared/lib/text";
import { announce } from "@/shared/lib/announce";

import {
    resolvePeriod,
    resolveDuration,
    resolveTotalDuration,
} from "../careerDates";

/* ═══════════════════════════════════════════════════════════
   CareerPositionModal
   ───────────────────
   Layout (modal aberto):

   ┌────────────────────────────────────────────────────────┐
   │ [×]                                                    │
   │ ┌── HERO ─────────────────────────────────────────────┐│
   │ │ [LOGO] WISE SYSTEM ↗ · São Paulo · 1 ano 1 mês      ││
   │ │                                                     ││
   │ │ Analista de Suporte Técnico — N1     [● ATUAL]      ││
   │ │ CLT · jan 2026 — agora · 4 meses · Presencial       ││
   │ └─────────────────────────────────────────────────────┘│
   │                                                        │
   │ ┌── LEFT (2fr) ───────────┐ ┌── RIGHT (1fr) ────────┐ │
   │ │ Resumo                  │ │ Sobre a empresa       │ │
   │ │ ...                     │ │ Wise System ↗          │ │
   │ │                         │ │ ⏱ 1 ano 1 mês          │ │
   │ │ ─── Destaques ───       │ │ 📍 São Paulo           │ │
   │ │ ▸ Bullet de impacto     │ │                       │ │
   │ │                         │ │ ─── Competências ───  │ │
   │ │ ─── Atividades ───      │ │ [TAG] [TAG] [TAG]     │ │
   │ │ ▪ Bullet 1              │ │                       │ │
   │ │ ▪ Bullet 2              │ │                       │ │
   │ │ ...                     │ │                       │ │
   │ └─────────────────────────┘ └───────────────────────┘ │
   └────────────────────────────────────────────────────────┘

   • Hero ocupa largura total (ancora visual + contexto)
   • Close button é absoluto/sticky-feel (sempre visível)
   • Sidebar mais densa (sem facts duplicados que já estão no hero)
   • <780px: sidebar empilha acima do conteúdo
═══════════════════════════════════════════════════════════ */

interface Props {
    company: CareerCompany;
    position: CareerPosition;
    onClose: () => void;
}

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export const CareerPositionModal: React.FC<Props> = ({
    company,
    position,
    onClose,
}) => {
    const { lang, t } = useLang();

    const dialogRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    const titleId = useId();
    const descId = useId();

    /* ── Derived data ────────────────────────────────────── */
    const presentLabel = t("career.present");

    const period = useMemo(
        () => resolvePeriod(position, lang, presentLabel),
        [position, lang, presentLabel],
    );

    const duration = useMemo(
        () => resolveDuration(position, lang),
        [position, lang],
    );

    const totalDuration = useMemo(
        () => resolveTotalDuration(company, lang),
        [company, lang],
    );

    const employmentLabel = t(`career.employment.${position.employmentType}`);
    const modalityLabel = position.modality
        ? t(`career.modality.${position.modality}`)
        : null;

    /** Bullets em destaque (para a seção "Destaques" no topo). */
    const highlights = useMemo(
        () => position.bullets.filter((b) => b.highlight),
        [position.bullets],
    );

    /* ── Close handlers ──────────────────────────────────── */
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleBackdropMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) handleClose();
        },
        [handleClose],
    );

    /* ── Effects (scroll lock + focus trap + ESC) ────────── */
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        announce(`${t("career.modalOpened")}: ${position.title}`);

        const focusTimeout = window.setTimeout(() => {
            closeBtnRef.current?.focus();
        }, 40);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
                return;
            }
            if (e.key !== "Tab" || !dialogRef.current) return;

            const focusable = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
            ).filter((el) => !el.hasAttribute("disabled"));

            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.clearTimeout(focusTimeout);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [handleClose, position.title, t]);

    /* ── Render guard ────────────────────────────────────── */
    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="career-modal-backdrop"
            onMouseDown={handleBackdropMouseDown}
        >
            <div
                ref={dialogRef}
                className="career-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
            >
                {/* Close (sticky-feel, sempre acessível no canto) */}
                <button
                    ref={closeBtnRef}
                    type="button"
                    className="career-modal__close"
                    onClick={handleClose}
                    aria-label={t("career.close")}
                >
                    <IconClose width={18} height={18} aria-hidden />
                </button>

                {/* ═══ HERO ════════════════════════════════════════ */}
                <header className="career-modal__hero">
                    <div className="career-modal__hero-company">
                        <div className="career-modal__logo">
                            {company.logo ? (
                                <img
                                    src={company.logo}
                                    alt=""
                                    className="career-modal__logo-img"
                                />
                            ) : (
                                <span
                                    className="career-modal__logo-fallback"
                                    aria-hidden="true"
                                >
                                    {getInitials(company.name)}
                                </span>
                            )}
                        </div>

                        <p className="career-modal__hero-companyline">
                            {company.url ? (
                                <a
                                    href={company.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="career-modal__hero-companylink"
                                >
                                    <span>{company.name}</span>
                                    <IconExternalLink
                                        width={11}
                                        height={11}
                                        aria-hidden
                                    />
                                </a>
                            ) : (
                                <span>{company.name}</span>
                            )}

                            <span
                                className="career-modal__hero-dot"
                                aria-hidden="true"
                            />
                            <span className="career-modal__hero-loc">
                                <IconLocation
                                    width={11}
                                    height={11}
                                    aria-hidden
                                />
                                {company.location}
                            </span>

                            <span
                                className="career-modal__hero-dot"
                                aria-hidden="true"
                            />
                            <span className="career-modal__hero-loc">
                                <IconBriefcase
                                    width={11}
                                    height={11}
                                    aria-hidden
                                />
                                {totalDuration}
                            </span>
                        </p>
                    </div>

                    <div className="career-modal__hero-title-row">
                        <h2 id={titleId} className="career-modal__title">
                            {position.title}
                        </h2>
                        <span
                            className={`career-modal__status career-modal__status--${position.statusType}`}
                        >
                            <span
                                className="career-modal__status-dot"
                                aria-hidden="true"
                            />
                            {position.status}
                        </span>
                    </div>

                    <p className="career-modal__hero-meta">
                        <span className="career-modal__hero-employment">
                            {employmentLabel}
                        </span>
                        <span
                            className="career-modal__meta-sep"
                            aria-hidden="true"
                        >
                            ·
                        </span>
                        <time dateTime={position.startDate}>{period}</time>
                        <span
                            className="career-modal__meta-sep"
                            aria-hidden="true"
                        >
                            ·
                        </span>
                        <span>{duration}</span>
                        {modalityLabel && (
                            <>
                                <span
                                    className="career-modal__meta-sep"
                                    aria-hidden="true"
                                >
                                    ·
                                </span>
                                <span>{modalityLabel}</span>
                            </>
                        )}
                    </p>
                </header>

                {/* ═══ BODY (two-column) ═══════════════════════════ */}
                <div className="career-modal__body">
                    {/* ── LEFT — content ────────────────────────── */}
                    <div
                        id={descId}
                        className="career-modal__content"
                        tabIndex={0}
                    >
                        {position.summary && (
                            <section className="career-modal__section career-modal__section--summary">
                                <h3 className="career-modal__subhead">
                                    {t("career.summary")}
                                </h3>
                                <p className="career-modal__summary">
                                    {position.summary}
                                </p>
                            </section>
                        )}

                        {!!highlights.length && (
                            <section className="career-modal__section">
                                <h3 className="career-modal__subhead">
                                    {t("career.highlights")}
                                </h3>
                                <ul className="career-modal__highlights">
                                    {highlights.map((h, i) => (
                                        <li
                                            key={i}
                                            className="career-modal__highlight"
                                        >
                                            <span
                                                className="career-modal__highlight-icon"
                                                aria-hidden="true"
                                            >
                                                <IconArrowRight
                                                    width={12}
                                                    height={12}
                                                />
                                            </span>
                                            <span className="career-modal__highlight-text">
                                                {h.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {!!position.bullets.length && (
                            <section className="career-modal__section">
                                <h3 className="career-modal__subhead">
                                    {t("career.activities")}
                                </h3>
                                <ul className="career-modal__bullets">
                                    {position.bullets.map((b, i) => (
                                        <li
                                            key={i}
                                            className="career-modal__bullet"
                                        >
                                            {b.text}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* ── RIGHT — sidebar ────────────────────────── */}
                    <aside className="career-modal__sidebar">
                        <section className="career-modal__sidebar-section">
                            <h3 className="career-modal__subhead">
                                {t("career.about")}
                            </h3>
                            <div className="career-modal__company">
                                <div
                                    className="career-modal__company-logo"
                                    aria-hidden="true"
                                >
                                    {company.logo ? (
                                        <img
                                            src={company.logo}
                                            alt=""
                                            className="career-modal__company-logo-img"
                                        />
                                    ) : (
                                        <span className="career-modal__company-logo-fallback">
                                            {getInitials(company.name)}
                                        </span>
                                    )}
                                </div>

                                <div className="career-modal__company-identity">
                                    <h4 className="career-modal__company-name">
                                        {company.url ? (
                                            <a
                                                href={company.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="career-modal__company-link"
                                            >
                                                <span>{company.name}</span>
                                                <IconExternalLink
                                                    width={12}
                                                    height={12}
                                                    aria-hidden
                                                />
                                            </a>
                                        ) : (
                                            company.name
                                        )}
                                    </h4>

                                    <p className="career-modal__company-meta">
                                        <span className="career-modal__company-line">
                                            <IconBriefcase
                                                width={12}
                                                height={12}
                                                aria-hidden
                                            />
                                            {totalDuration}
                                        </span>
                                        <span className="career-modal__company-line">
                                            <IconLocation
                                                width={12}
                                                height={12}
                                                aria-hidden
                                            />
                                            {company.location}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {!!position.tags.length && (
                            <section className="career-modal__sidebar-section">
                                <h3 className="career-modal__subhead">
                                    {t("career.skills")}
                                </h3>
                                <ul className="career-modal__tags">
                                    {position.tags.map((tag) => (
                                        <li
                                            key={tag}
                                            className="career-modal__tag"
                                        >
                                            {tag}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </div>,
        document.body,
    );
};
